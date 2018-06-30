'use strict';
const AWS = require('aws-sdk');
const authorize = require('./libs/authorize');
const config = require('./config');
const uuidv4 = require('uuid/v4');

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports.post = async (event, context) => {
  try {
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
            creator: authorized.user.email,
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
    let userRole = 'guest';
    let authorized;
    // allow not registred users
    if (event.headers && event.headers.Authorization) {
      authorized = await authorize(event);
      if (!authorized.auth) {
        throw 'Not authorized';
      }
      userRole = authorized.user.userRole;
    }

    const response = {
      statusCode: 200,
    };
    const body = event.queryStringParameters;
    switch (body.type) {
      case 'get':
        if (config.CONTENTS[body.contentType] && config.CONTENTS[body.contentType].viewers.includes(userRole)) {
          const content = await dynamodb.get({
            TableName: config.CONTENTS[body.contentType].table,
            Key: {
              id: body.id
            }
          }).promise();
          response.body = JSON.stringify(content.Item);
        } else {
          throw 'Not authorized';
        }
        break;
      case 'list':
        if (config.CONTENTS[body.contentType] && config.CONTENTS[body.contentType].viewers.includes(userRole)) {
          const contents = await dynamodb.scan({
            TableName: config.CONTENTS[body.contentType].table,
            ProjectionExpression: 'id, title, createdAt, creator',
            FilterExpression: "contentType = :contentType",
            ExpressionAttributeValues: {
              ":contentType": body.contentType
            }
          }).promise();
          response.body = JSON.stringify(contents.Items);
        } else {
          throw 'Not authorized';
        }
        break;
      case 'delete':
        // disallow guest
        if (userRole === 'guest') {
          throw 'Not authorized';
        }
        if (config.CONTENTS[body.contentType] && (config.CONTENTS[body.contentType].creators.includes(userRole))) {
          // if not admin, check if it's creator
          if (userRole !== 'admin') {
            const content = await dynamodb.get({
              TableName: config.CONTENTS[body.contentType].table,
              Key: {
                id: body.id
              }
            }).promise();
            if (content.Item.creator !== authorized.user.email) {
              throw 'Not authorized';
            }
          }
          await dynamodb.delete({
            TableName: config.CONTENTS[body.contentType].table,
            Key: {
              id: body.id
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

