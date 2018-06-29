'use strict';
const AWS = require('aws-sdk');
const authorize = require('./libs/authorize');
const config = require('./config');
const uuidv4 = require('uuid/v4');

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports.post = async (event, context) => {
  try {
    console.log(event)
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };
    const body = JSON.parse(event.body);
    switch (body.type) {
      case 'add':
        // Check if content type exists and if the user role could create them
        if (config.CONTENTS[body.contentType] && (config.CONTENTS[body.contentType].creators.includes(authorized.user.userRole))) {
          const Item = {
            id: uuidv4(),
            creator: authorized.user.userRole,
            contentType: body.contentType,
            createdAt: Date.now()
          };
          for (const field of config.CONTENTS[body.contentType].fields) {
            Item[field] = body[field];
          }

          await dynamodb.put({
            TableName: config.CONTENTS[body.contentType].table,
            Item
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

module.exports.get = async (event, context) => {
  try {
    console.log(event)
    const authorized = await authorize(event);
    console.log(authorized)
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };
    switch (event.queryStringParameters.type) {
      case 'get':
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

