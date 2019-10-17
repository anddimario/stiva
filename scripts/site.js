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
        message: 'Do you want specify a dynamo endpoint (for example for localhost: http://localhost:4569) (y/n)?'
      },
      {
        type: prev => prev === 'y' ? 'text' : null,
        name: 'endpoint',
        message: 'The endpoint url:',
        initial: 'http://localhost:4569'
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
    const choice = process.argv[2];

    if (choice === 'create') {
      const tablesParams = [];
      tablesParams.push({
        AttributeDefinitions: [
          {
            AttributeName: 'email',
            AttributeType: 'S'
          },
          {
            AttributeName: 'passwordRecoveryToken',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH'
          }
        ],
        GlobalSecondaryIndexes: [{
          IndexName: 'TokenIndex',
          KeySchema: [
            {
              AttributeName: 'passwordRecoveryToken',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY'
          }
        }],
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
          BillingMode: 'PAY_PER_REQUEST',
          TableName: `${siteConfig['dbPrefix']}${tableName}`
        };
        tablesParams.push(params);
      }
      await Promise.map(tablesParams, (params) => {
        return dynamodb.createTable(params).promise();
      });
      /*eslint-disable */
      console.log('Site created');
      /*eslint-enable */
    } else if (choice === 'delete') {
      const tables = [`${siteConfig['dbPrefix']}users`];

      for (const contentType in siteConfig.contents) {
        const tableName = siteConfig.contents[contentType].table;
        tables.push(`${siteConfig['dbPrefix']}${tableName}`);
      }
      await Promise.map(tables, (table) => {
        return dynamodb.deleteTable({
          TableName: table
        }).promise();
      });

      /*eslint-disable */
      console.log('Site Deleted, remove the config');
      /*eslint-enable */
    } else {
      /*eslint-disable */
      console.log('Wrong option');
      /*eslint-enable */
    }


    process.exit();
  } catch (e) {
    /*eslint-disable */
    console.log(e);
    /*eslint-enable */
    process.exit(1);
  }
}
main();
