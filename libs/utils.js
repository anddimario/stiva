'use strict';
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');
const handlebars = require('handlebars');
const fs = require('fs');

const dynamodb = new AWS.DynamoDB.DocumentClient(JSON.parse(process.env.DYNAMO_OPTIONS));
const ses = new AWS.SES(JSON.parse(process.env.SES_OPTIONS));

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);
const readFile = promisify(fs.readFile);

// Return a password hash and salt
async function createPassword(password) {
  // create a password
  const len = 128;
  const iterations = 4096;
  let salt = await randomBytes(len);
  salt = salt.toString('base64');

  const derivedKey = await pbkdf2(password, salt, iterations, len, 'sha512');
  const hash = derivedKey.toString('base64');

  return { hash, salt };
}

// Compare password's hashes
async function comparePassword(info) {
  // Bytesize
  const len = 128;
  const iterations = 4096;
  const hash = await pbkdf2(info.requested, info.salt, iterations, len, 'sha512');
  // Check the hash with the password
  if (hash.toString('base64') === info.stored) {
    return true;
  }
  return false;
}

// Generate a random hash token
async function generateToken() {
  const salt = await randomBytes(20);
  const token = salt.toString('hex');
  return token;
}

// Check if user exists
async function updateUserInfoChecks(body, authorized, dbPrefix) {
  let email;
  const TableName = `${dbPrefix}users`;
  // if not admin, check if it's user
  if (authorized && (authorized.user.userRole !== 'admin')) {
    const user = await dynamodb.get({
      TableName,
      Key: {
        email: authorized.user.email
      }
    }).promise();
    if (!user.Item) {
      return { error: 'Not authorized' };
    }
    email = authorized.user.email;
  } else {
    email = body.email;
    delete body.email;
  }

  const checkUser = await dynamodb.get({
    TableName,
    Key: {
      email: email
    }
  }).promise();
  // Check if user exists
  if (!checkUser.Item) {
    return { error: 'Not exists' };
  }

  return { email };
}

async function getTemplateHtml(file, params) {
  try {
    const template = await readFile(`./emailTemplates/${file}.html`, 'utf8');
    const compiled = handlebars.compile(template);
    const emailHtml = compiled(params);
    return emailHtml;
  } catch (e) {
    throw e;
  }
}

// send email https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
async function sendEmail(ToAddresses, Source, subject, emailHtml) {
  try {
    const params = {
      Destination: {
        ToAddresses
      },
      Source,
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailHtml
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    };
    await ses.sendEmail(params).promise();
    return;
  } catch (e) {
    throw e;
  }
}

module.exports = {
  comparePassword,
  createPassword,
  generateToken,
  updateUserInfoChecks,
  getTemplateHtml,
  sendEmail
};
