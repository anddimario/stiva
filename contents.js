'use strict';
const AWS = require('aws-sdk');
const config = require('./config');
const uuidv4 = require('uuid/v4');

const authorize = require('./libs/authorize');
const validation = require('./libs/validation');

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports.post = async (event, context) => {
  try {
    const siteConfig = config.sites[event.headers[config.siteHeader]];
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    const body = JSON.parse(event.body);

    const dbPrefix = siteConfig.dbPrefix;
    const TableName = `${dbPrefix}${siteConfig.CONTENTS[body.contentType].table}`;

    switch (body.type) {
      case 'add':
        // Check if content type exists and if the user role could create them
        if (siteConfig.CONTENTS[body.contentType] && (siteConfig.CONTENTS[body.contentType].creators.includes(authorized.user.userRole))) {
          validation(siteConfig.validators['content-add'], body);
          const Item = {
            id: uuidv4(),
            creator: authorized.user.email,
            contentType: body.contentType,
            createdAt: Date.now()
          };
          for (const field of siteConfig.CONTENTS[body.contentType].fields) {
            Item[field] = body[field];
          }

          await dynamodb.put({
            TableName,
            Item
          }).promise();
          response.body = JSON.stringify({
            message: true
          });
        } else {
          throw 'Not authorized';
        }

        break;
      case 'update':
        if (siteConfig.CONTENTS[body.contentType]) {
          validation(siteConfig.validators['content-update'], body);
          // if not admin, check if it's creator
          if (authorized.user.userRole !== 'admin') {
            const content = await dynamodb.get({
              TableName,
              Key: {
                id: body.id
              }
            }).promise();
            if (content.Item.creator !== authorized.user.email) {
              throw 'Not authorized';
            }
          }
          const id = body.id;
          delete body.id;

          const values = {
            ':modifiedAt': Date.now()
          };
          let set = 'SET modifiedAt = :modifiedAt,';
          for (const field of siteConfig.CONTENTS[body.contentType].fields) {
            values[`:${field}`] = body[field];
            set += `${field} = :${field},`;
          }
          set = set.slice(0, -1); // remove last char

          await dynamodb.update({
            TableName,
            Key: {
              id
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
    const siteConfig = config.sites[event.headers[config.siteHeader]];
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
    const dbPrefix = siteConfig.dbPrefix;
    const TableName = `${dbPrefix}${siteConfig.CONTENTS[body.contentType].table}`;

    switch (body.type) {
      case 'get':
        if (siteConfig.CONTENTS[body.contentType] && siteConfig.CONTENTS[body.contentType].viewers.includes(userRole)) {
          const content = await dynamodb.get({
            TableName,
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
        if (siteConfig.CONTENTS[body.contentType] && siteConfig.CONTENTS[body.contentType].viewers.includes(userRole)) {
          // todo: see if a paginated scan is better
          const contents = await dynamodb.scan({
            TableName,
            ProjectionExpression: 'id, title, createdAt, creator',
            FilterExpression: 'contentType = :contentType',
            ExpressionAttributeValues: {
              ':contentType': body.contentType
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
        if (siteConfig.CONTENTS[body.contentType] && (siteConfig.CONTENTS[body.contentType].creators.includes(userRole))) {
          // if not admin, check if it's creator
          if (userRole !== 'admin') {
            const content = await dynamodb.get({
              TableName,
              Key: {
                id: body.id
              }
            }).promise();
            if (content.Item.creator !== authorized.user.email) {
              throw 'Not authorized';
            }
          }
          await dynamodb.delete({
            TableName,
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

