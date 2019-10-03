'use strict';
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

const sites = require('./sites');
const validation = require('./libs/validation');
const authorize = require('./libs/authorize');
const utils = require('./libs/utils');

const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_OPTIONS));

module.exports.post = async (event, context) => {
  try {
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    const body = JSON.parse(event.body);

    const authorized = await authorize(event, siteConfig);
    // Only if type is login, unauthorized users can pass
    const publicTypes = ['login', 'registration', 'recovery-token', 'recovery-password'];
    if (!authorized.auth && !publicTypes.includes(body.type)) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    const dbPrefix = siteConfig.dbPrefix;
    const TableName = `${dbPrefix}users`;

    let email, set, checkResults;
    const values = {};
    switch (body.type) {
      case 'registration':
        if (siteConfig.registration) { // Check if registration is allowed in config
          validation(siteConfig.validators['registration'], body);
          const passwordInfo = await utils.createPassword(body.password);

          for (const field of siteConfig.users.fields) {
            values[field] = body[field];
            set += `${field} = :${field},`;
          }

          values.email = body.email;
          values.userRole = 'user';
          values.salt = passwordInfo.salt;
          values.password = passwordInfo.hash;

          await dynamodb.put({
            TableName,
            Item: values
          }).promise();
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'add':
        if (authorized.user.userRole === 'admin') {
          validation(siteConfig.validators['registration'], body);

          // create a password
          const passwordInfo = await utils.createPassword(body.password);

          for (const field of siteConfig.users.fields) {
            values[field] = body[field];
            set += `${field} = :${field},`;
          }

          values.email = body.email;
          values.userRole = body.userRole;
          values.salt = passwordInfo.salt;
          values.password = passwordInfo.hash;

          await dynamodb.put({
            TableName,
            Item: values
          }).promise();
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'update':
        if (authorized.user.userRole === 'admin') {
          validation(siteConfig.validators['registration'], body);
        }
        checkResults = await utils.updateUserInfoChecks(body, authorized, dbPrefix);

        if (checkResults.error) {
          throw checkResults.error;
        }

        email = checkResults.email;

        set = 'SET ';
        if (authorized.user.userRole === 'admin') {
          set += 'userRole = :userRole, ';
          values[':userRole'] = body.userRole;
        }

        for (const field of siteConfig.users.fields) {
          values[`:${field}`] = body[field];
          set += `${field} = :${field},`;
        }
        set = set.slice(0, -1); // remove last char

        await dynamodb.update({
          TableName,
          Key: {
            email
          },
          UpdateExpression: set,
          ExpressionAttributeValues: values
        }).promise();
        response.body = JSON.stringify({
          message: true
        });
        break;
      case 'update-password':
        checkResults = await utils.updateUserInfoChecks(body, authorized, dbPrefix);

        if (checkResults.error) {
          throw checkResults.error;
        }

        email = checkResults.email;

        // create a password
        const passwordInfo = await utils.createPassword(body.new);

        values[':password'] = passwordInfo.hash;
        values[':salt'] = passwordInfo.salt;
        set = 'SET password = :password, salt = :salt';

        await dynamodb.update({
          TableName,
          Key: {
            email
          },
          UpdateExpression: set,
          ExpressionAttributeValues: values
        }).promise();
        response.body = JSON.stringify({
          message: true
        });
        break;
      case 'login':
        validation(siteConfig.validators['login'], body);

        const secret = siteConfig.tokenSecret;
        const user = await dynamodb.get({
          TableName,
          Key: {
            email: body.email
          }
        }).promise();
        if (!user.Item) {
          throw 'Not authorized';
        }

        const comparePassword = await utils.comparePassword({
          requested: body.password,
          salt: user.Item.salt,
          stored: user.Item.password
        });
        if (comparePassword) {
          const token = jwt.sign({ email: user.Item.email }, secret, { expiresIn: 60 * 24 * 365 * 60 });
          response.body = JSON.stringify({
            token
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'recovery-token':
        if (siteConfig.passwordRecovery) { // Check if password recovery is allowed in config
          validation(siteConfig.validators['recoveryToken'], body);

          checkResults = await utils.updateUserInfoChecks(body, authorized, dbPrefix);
          if (checkResults.error) {
            throw checkResults.error;
          }
          email = checkResults.email;

          const token = await utils.generateToken();

          // store token on db
          await dynamodb.update({
            TableName,
            Key: {
              email
            },
            UpdateExpression: 'SET passwordRecoveryToken = :token',
            ExpressionAttributeValues: {
              ':token': token
            }
          }).promise();

          // send email
          if (siteConfig.sendEmail) {
            await dynamodb.put({
              TableName: 'postino_mails',
              Item: {
                id: uuidv4(),
                to: [email],
                locals: {
                  url: siteConfig.frontendUrl,
                  token,
                },
                from: siteConfig.fromAddress,
                subject: siteConfig.emailSubjects.passwordRecovery
              }
            });
          }
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'recovery-password':
        if (siteConfig.passwordRecovery) { // Check if password recovery is allowed in config
          validation(siteConfig.validators['passwordRecovery'], body);

          // get user with token
          const users = await dynamodb.query({
            TableName,
            IndexName: 'TokenIndex',
            KeyConditionExpression: 'passwordRecoveryToken = :token',
            ExpressionAttributeValues: {
              ':token': body.token
            }
          }).promise();

          // if user exists
          if (users.Count === 1) {
            email = users.Items[0].email;
            // change password with the new one and remove token
            const passwordInfo = await utils.createPassword(body.password);

            values[':password'] = passwordInfo.hash;
            values[':salt'] = passwordInfo.salt;
            set = 'SET password = :password, salt = :salt REMOVE passwordRecoveryToken';
            await dynamodb.update({
              TableName,
              Key: {
                email
              },
              UpdateExpression: set,
              ExpressionAttributeValues: values
            }).promise();
            response.body = JSON.stringify({
              message: true
            });
          } else {
            throw 'Not authorized';
          }
        } else {
          throw 'Not authorized';
        }
        break;
      default:
        throw 'Undefined method';
    }

    return response;

  } catch (e) {
    console.log(e);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};

module.exports.get = async (event, context) => {
  try {
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    const authorized = await authorize(event, siteConfig);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    const dbPrefix = siteConfig.dbPrefix;
    const TableName = `${dbPrefix}users`;

    switch (event.queryStringParameters.type) {
      case 'get':
        if (authorized.user.userRole === 'admin') {
          const user = await dynamodb.get({
            TableName,
            Key: {
              email: event.queryStringParameters.email
            }
          }).promise();
          delete user.Item.password;
          delete user.Item.salt;
          response.body = JSON.stringify(user.Item);
        } else {
          throw 'Not authorized';
        }
        break;
      case 'me':
        const user = await dynamodb.get({
          TableName,
          Key: {
            email: authorized.user.email
          }
        }).promise();
        delete user.Item.password;
        delete user.Item.salt;
        response.body = JSON.stringify(user.Item);
        break;
      case 'list':
        if (authorized.user.userRole === 'admin') {
          const users = await dynamodb.scan({
            TableName,
            ProjectionExpression: 'email, userRole'
          }).promise();
          response.body = JSON.stringify(users.Items);
        } else {
          throw 'Not authorized';
        }
        break;
      case 'delete':
        if (authorized.user.userRole === 'admin') {
          await dynamodb.delete({
            TableName,
            Key: {
              email: event.queryStringParameters.email
            }
          }).promise();
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }
        break;
      default:
        throw 'Undefined method';
    }
    return response;

  } catch (e) {
    console.log(e);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};
