'use strict';
const AWS = require('aws-sdk');
const sites = require('./sites');
const uuidv4 = require('uuid/v4');

const filters = require('./libs/filters')
const authorize = require('./libs/authorize');
const validation = require('./libs/validation');

const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_OPTIONS));

module.exports.post = async (event, context) => {
  try {
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];

    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    const body = JSON.parse(event.body);

    const dbPrefix = siteConfig.dbPrefix;
    const TableName = `${dbPrefix}${siteConfig.contents[body.contentType].table}`;

    switch (body.type) {
      case 'add':
        // Check if content type exists and if the user role could create them
        if (siteConfig.contents[body.contentType] && (siteConfig.contents[body.contentType].creators.includes(authorized.user.userRole))) {
          validation(siteConfig.validators['content-add'], body);
          const Item = {
            id: uuidv4(),
            creator: authorized.user.email,
            contentType: body.contentType,
            createdAt: Date.now()
          };
          for (const field of siteConfig.contents[body.contentType].fields) {
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
        if (siteConfig.contents[body.contentType]) {
          validation(siteConfig.validators['content-update'], body);
          // if not admin, check if it's creator
          if (!siteConfig.contents[body.contentType].creators.includes(authorized.user.userRole)) {
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
          for (const field of siteConfig.contents[body.contentType].fields) {
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
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
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
    const TableName = `${dbPrefix}${siteConfig.contents[body.contentType].table}`;

    let params;
    switch (body.type) {
      case 'get':
        if (siteConfig.contents[body.contentType] && siteConfig.contents[body.contentType].viewers.includes(userRole)) {
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
        if (siteConfig.contents[body.contentType] && siteConfig.contents[body.contentType].viewers.includes(userRole)) {
          params = {
            TableName,
            ProjectionExpression: 'id, createdAt, creator',
          };
          // allow paginated scan
          if (body.next) {
            params.ExclusiveStartKey = next;
          }
          // add filter expression
          if (siteConfig.contents[body.contentType].allowFilters && body.filters) {
            const expression = filters(body.filters, siteConfig.contents[body.contentType].allowFilters);
            params.FilterExpression = expression.FilterExpression;
            params.ExpressionAttributeValues = expression.ExpressionAttributeValues;
          }
          if (siteConfig.contents[body.contentType].projection) {
            params.ProjectionExpression += siteConfig.contents[body.contentType].projection;
          }
          const contents = await dynamodb.scan(params).promise();
          response.body = JSON.stringify(contents);
        } else {
          throw 'Not authorized';
        }
        break;
      case 'delete':
        // disallow guest
        if (userRole === 'guest') {
          throw 'Not authorized';
        }
        if (siteConfig.contents[body.contentType] && (siteConfig.contents[body.contentType].creators.includes(userRole))) {
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
            message: true,
            id: body.id
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

