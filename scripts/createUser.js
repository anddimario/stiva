'use strict';

const prompts = require('prompts');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const { promisify } = require('util');

const sites = require('../sites');

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

async function main () {
  try {

    const questions = [
      {
        type: 'text',
        name: 'dynamo',
        message: 'Do you want specify a dynamo endpoint (for example for localhost: http://localhost:8000) (y/n)?'
      },
      {
        type: prev => prev === 'y' ? 'text' : null,
        name: 'endpoint',
        message: 'The endpoint url:',
        initial: 'http://localhost:8000'
      },
      {
        type: 'text',
        name: 'region',
        message: 'You region (localhost for local development):'
      },
      {
        type: 'text',
        name: 'site',
        message: 'Your site name:'
      },
      {
        type: 'text',
        name: 'email',
        message: 'User email:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'User password:'
      },
      {
        type: 'text',
        name: 'role',
        message: 'User role:'
      },
    ];

    const response = await prompts(questions);

    const dynamoOptions = response.endpoint ? { endpoint: response.endpoint } : {};
    dynamoOptions.region = response.region;
    const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoOptions);

    const dbPrefix = sites[response.site].dbPrefix;
    const TableName = `${dbPrefix}users`;
    const user = await dynamodb.get({
      TableName,
      Key: { email: response.email },
      AttributesToGet: ['email']
    }).promise();
    if (user.Item) {
      throw 'Already exists';
    } else {
      // Bytesize
      const len = 128;
      const iterations = 4096;
      let salt = await randomBytes(len);
      salt = salt.toString('base64');

      const derivedKey = await pbkdf2(response.password, salt, iterations, len, 'sha512');
      const hash = derivedKey.toString('base64');
      const value = {
        email: response.email,
        userRole: response.role,
        salt: salt,
        password: hash,
      };
      await dynamodb.put({
        TableName,
        Item: value
      }).promise();
      console.log('User added.');
      process.exit();
    }
  } catch (e) {
    console.log(e);
    process.exit(1);

  }
}

main();
