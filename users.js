'use strict';
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const config = require('./config');
const validation = require('./libs/validation');
const authorize = require('./libs/authorize');

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

module.exports.post = async (event, context) => {
  try {
    const body = JSON.parse(event.body);

    const authorized = await authorize(event);
    // Only if type is login, unauthorized users can pass
    if (!authorized.auth && (body.type !== 'login')) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };
    let email, set;
    const values = {};
    switch (body.type) {
      case 'add':
        if (authorized.user.userRole === 'admin') {
          // create a password
          const len = 128;
          const iterations = 4096;
          let salt = await randomBytes(len);
          salt = salt.toString('base64');

          const derivedKey = await pbkdf2(body.password, salt, iterations, len, 'sha512');
          const hash = derivedKey.toString('base64');

          await dynamodb.put({
            TableName: 'users',
            Item: {
              email: body.email,
              userRole: 'user',
              salt,
              password: hash
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
        const lenpw = 128;
        const iterationspw = 4096;
        let saltpw = await randomBytes(lenpw);
        saltpw = saltpw.toString('base64');

        const derivedKey = await pbkdf2(body.password, saltpw, iterationspw, lenpw, 'sha512');
        const hashpw = derivedKey.toString('base64');

        values[':password'] = hashpw;
        values[':salt'] = saltpw;
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
        // Bytesize
        const len = 128;
        const iterations = 4096;
        const hash = await pbkdf2(body.password, user.Item.salt, iterations, len, 'sha512');
        // Check the hash with the password
        if (hash.toString('base64') === user.Item.password) {
          const token = jwt.sign({ email: user.Item.email }, secret, { expiresIn: 60 * 24 * 365 * 60 });
          response.body = JSON.stringify({
            token
          });
        } else {
          throw 'Not authorized';
        }
        break;
      case 'recovery-token':
        const salt = await randomBytes(20);
        const token = salt.toString('hex');
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
