"use strict";

const { DynamoDB } = require("aws-sdk");
const { Table } = require("dynamodb-onetable");

const client = new DynamoDB.DocumentClient({
  region: 'us-east-1' // TODO set with env
});

exports.getModel = function (modelName) {
  const table = new Table({
    name: "Stiva", // TODO get from env var
    client: client,
    schema: {
      format: "onetable:1.1.0",
      version: "0.0.1",
      indexes: {
        primary: { hash: "pk", sort: "sk" },
      },
      models: {
        Content: {
          pk: { type: String, value: "content#${id}" },
          sk: { type: String, value: "content#${id}" },
          id: { type: String, generate: "ulid" },
          name: { type: String, required: true },
          value: { type: String },
          status: { type: String, default: "active" },
        },
        Policy: {
          pk: { type: String, value: "policy#${id}" },
          sk: { type: String, value: "policy#${id}" },
          id: { type: String, generate: "ulid" },
          group: { type: String, required: true },
          value: { type: String, required: true },
          description: { type: String },
          status: { type: String, default: "active" },
        },
      },
      params: {
        isoDates: true,
        timestamps: true,
      },
    },
  });

  return table.getModel(modelName);
};

exports.check = async function (authorizerInfo) {
  // groups is a string like: [admin]
  console.log(authorizerInfo.jwt.claims['cognito:groups']);
  console.log(typeof authorizerInfo.jwt.claims['cognito:groups']);
  // console.log(event);
  // console.log("request:", JSON.stringify(event, undefined, 2));
  // const canAccess = false;
  // // TODO
  // //   const username = event.params.username;
  // //   const user = dynamo.get({
  // //     TableName: "Users",
  // //     Key: {
  // //       username,
  // //     },
  // //   }).promise();
  // return {
  //   statusCode: 200,
  //   headers: { "Content-Type": "application/json" },
  //   body: user,
  // };
  // // if (canAccess) {
  // //   return {
  // //     isAuthorized: true,
  // //     context: {},
  // //   };
  // // }
  // // return {
  // //   isAuthorized: false,
  // // };
  return;
};
