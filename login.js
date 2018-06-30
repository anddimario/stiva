'use strict';
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const config = require('./config');

const pbkdf2 = promisify(crypto.pbkdf2);

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

module.exports.run = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const secret = config.TOKEN_SECRET;

    const response = {
      statusCode: 200,
    };
    
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

