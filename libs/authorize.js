const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('../config');

const verify = promisify(jwt.verify);

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports = async (event) => {
  try {
    // Check headers
    if (!event.headers[config.siteHeader]) {
      return false;
    }

    if (!event.headers.Authorization) {
      return false;
    }

    const siteConfig = config.sites[event.headers[config.siteHeader]];

    // remove the 'Bearer ' prefix from the auth token
    const token = event.headers.Authorization.replace(/Bearer /g, '');

    const secret = siteConfig.TOKEN_SECRET;

    // verify the token with publicKey and config and return proper AWS policy document
    const authorized = await verify(token, secret);

    const dbPrefix = siteConfig.dbPrefix;
    const user = await dynamodb.get({
      TableName: `${dbPrefix}users`,
      Key: {
        email: authorized.email
      },
      AttributesToGet: ['email', 'userRole']
    }).promise();
    return { auth: true, user: user.Item };
  } catch (error) {
    return { error, auth: false };
  }
};
