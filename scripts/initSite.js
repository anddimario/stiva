'use strict';
const prompts = require('prompts');
const AWS = require('aws-sdk');
const Promise = require('bluebird');

const sites = require('../sites');

async function main() {
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
        message: 'The endpoint url:'
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
        name: 'configurated',
        message: 'Have you created config for site in config.js? (y/n)'
      },
    ];

    const response = await prompts(questions);

    if (response.configurated !== 'y') {
      throw 'You must configurate the site in config.js';
    }
    const dynamoOptions = response.endpoint ? { endpoint: response.endpoint } : {};
    dynamoOptions.region = response.region;
    const dynamodb = new AWS.DynamoDB(dynamoOptions);

    // get config
    const siteConfig = sites[response.site];

    const tablesParams = [];
    tablesParams.push({
      AttributeDefinitions: [
        {
          AttributeName: 'email',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'email',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
      BillingMode: 'PAY_PER_REQUEST',
      TableName: `${siteConfig['dbPrefix']}users`
    });

    for (const contentType in siteConfig.contents) {
      const tableName = siteConfig.contents[contentType].table;
      const params = {
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        },
        BillingMode: 'PAY_PER_REQUEST',
        TableName: `${siteConfig['dbPrefix']}${tableName}`
      };
      tablesParams.push(params);
    }
    await Promise.map(tablesParams, (params) => {
      return dynamodb.createTable(params).promise();
    });
    console.log('Site Created');
    process.exit();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}
main();
