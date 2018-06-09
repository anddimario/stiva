'use strict';

const crypto = require('crypto');
const AWS = require('aws-sdk');
const { promisify } = require('util');

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_ENDPOINT));

async function main () {
  try {
    const user = await dynamodb.get({
      TableName: 'users',
      Key: { email: process.argv[2] },
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

      const derivedKey = await pbkdf2(process.argv[3], salt, iterations, len, 'sha512');
      const hash = derivedKey.toString('base64');
      const value = {
        email: process.argv[2],
        userRole: 'admin',
        salt: salt,
        password: hash,
      };
      await dynamodb.put({
        TableName: 'users',
        Item: value
      }).promise();
      console.log('Super user added.');
      process.exit();
    }
  } catch (e) {
    console.log(e)
    process.exit(1);

  }
}

main();