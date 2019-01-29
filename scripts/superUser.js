'use strict';

const crypto = require('crypto');
const AWS = require('aws-sdk');
const { promisify } = require('util');
const config = require('../config');

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

const dynamodb = new AWS.DynamoDB.DocumentClient(config.DYNAMO);

async function main () {
  try {
    const dbPrefix = config.sites[process.argv[2]].dbPrefix;
    const TableName = `${dbPrefix}users`;
    const user = await dynamodb.get({
      TableName,
      Key: { email: process.argv[3] },
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

      const derivedKey = await pbkdf2(process.argv[4], salt, iterations, len, 'sha512');
      const hash = derivedKey.toString('base64');
      const value = {
        email: process.argv[3],
        userRole: 'admin',
        salt: salt,
        password: hash,
      };
      await dynamodb.put({
        TableName,
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
