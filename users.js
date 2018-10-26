'use strict';
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const config = require('./config');
const validation = require('./libs/validation');
const authorize = require('./libs/authorize');
const utils = require('./libs/utils');

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports.post = async (event, context) => {
  try {
    const body = JSON.parse(event.body);

    const authorized = await authorize(event);
    // Only if type is login, unauthorized users can pass
    const publicTypes = ['login', 'registration']
    if (!authorized.auth && !publicTypes.includes(body.type)) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };
    let email, set;
    const values = {};
    switch (body.type) {
      case 'registration':
        if (config.registration) { // Check if registration is allowed in config
          validation('registration', body);
          const passwordInfo = await utils.createPassword(body.password);

          for (const field of config.users.fields) {
            values[field] = body[field];
            set += `${field} = :${field},`;
          }

          values.email = body.email;
          values.userRole = 'user';
          values.salt = passwordInfo.salt;
          values.password = passwordInfo.hash;

          await dynamodb.put({
            TableName: 'users',
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
          // create a password
          const passwordInfo = await utils.createPassword(body.password);

          await dynamodb.put({
            TableName: 'users',
            Item: {
              email: body.email,
              userRole: 'user',
              salt: passwordInfo.salt,
              password: passwordInfo.hash
            }
          }).promise();
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'update':
        // if not admin, check if it's user
        if (authorized.user.userRole !== 'admin') {
          const user = await dynamodb.get({
            TableName: 'users',
            Key: {
              email: authorized.user.email
            }
          }).promise();
          if (!user.Item) {
            throw 'Not authorized';
          }
          email = authorized.user.email;
        } else {
          email = body.email;
          delete body.email;
        }

        set = 'SET ';
        for (const field of config.users.fields) {
          values[`:${field}`] = body[field];
          set += `${field} = :${field},`;
        }
        set = set.slice(0, -1); // remove last char

        await dynamodb.update({
          TableName: 'users',
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
        // if not admin, check if it's user
        if (authorized.user.userRole !== 'admin') {
          const user = await dynamodb.get({
            TableName: 'users',
            Key: {
              email: authorized.user.email
            }
          }).promise();
          if (!user.Item) {
            throw 'Not authorized';
          }
          email = authorized.user.email;
        } else {
          email = body.email;
          delete body.email;
        }
        // create a password          
        const passwordInfo = await utils.createPassword(body.password);

        values[':password'] = passwordInfo.hash;
        values[':salt'] = passwordInfo.salt;
        set = 'SET password = :password, salt = :salt';

        await dynamodb.update({
          TableName: 'users',
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
        validation('login', body);

        const secret = config.TOKEN_SECRET;
        const user = await dynamodb.get({
          TableName: 'users',
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
        const token = await utils.generateToken();
        break;
      case 'recovery-password':
        break;
      default:
        throw 'Undefined method'
    }

    return response;

  } catch (e) {
    console.log(e)
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
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };
    switch (event.queryStringParameters.type) {
      case 'get':
        if (authorized.user.userRole === 'admin') {
          const user = await dynamodb.get({
            TableName: 'users',
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
          TableName: 'users',
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
            TableName: 'users',
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
            TableName: 'users',
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
        throw 'Undefined method'
    }
    return response;

  } catch (e) {
    console.log(e)
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};
