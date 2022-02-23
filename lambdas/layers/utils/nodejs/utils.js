"use strict";

const { DynamoDB } = require("aws-sdk");
const { Table } = require("dynamodb-onetable");

// const client = new DynamoDB.DocumentClient({
//   region: "us-east-1", // TODO set with env
// });

const client = new DynamoDB.DocumentClient();

const table = new Table({
  name: process.env.TABLE_NAME,
  client: client,
  schema: {
    format: "onetable:1.1.0",
    version: "0.0.1",
    indexes: {
      primary: { hash: "pk", sort: "sk" },
    },
    models: {
      Content: {
        pk: { type: String, value: "content" },
        sk: { type: String, value: "${id}" },
        id: { type: String, generate: "ulid" },
        name: { type: String, required: true },
        value: { type: String },
        status: { type: String, default: "active" },
      },
      Policy: {
        pk: { type: String, value: "policy" },
        sk: { type: String, value: "${group}" },
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

exports.getModel = function (modelName) {

  return table.getModel(modelName);
};

exports.check = async function (authorizerInfo) {
  const canAccess = false;
  // TODO get groups from cognito
  // groups is a string like: [admin]
  console.log(authorizerInfo.jwt.claims["cognito:groups"]);
  console.log(typeof authorizerInfo.jwt.claims["cognito:groups"]);
  const groups = authorizerInfo.jwt.claims["cognito:groups"]
    .slice(1, -1)
    .split(",");
  console.log(groups);
  for (const group of groups) {
    const policy = await table.queryItems({ pk: "policy", sk: group });
    if (policy) {
      // TODO check if allowed
    }
  }
  // if (!canAccess) { // TODO renable after implementation
  //   throw "Not authorized";
  // }
  return;
};
