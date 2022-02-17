"use strict";
const authorize = require("/opt/nodejs/utils/authorize.js");
const onetable = require("/opt/nodejs/utils/onetable.js");

exports.handler = async function (event) {
  console.log(event);
  console.log("request:", JSON.stringify(event, undefined, 2));
  // const canAccess = false;
  // TODO authorize
  await authorize.check()
  const model = await onetable.getModel('content') // allow multiple modelName based on request

  const result = await model.get({
    id: event.params.id
  })
  // const username = event.params.username;
  // const user = dynamo
  //   .get({
  //     TableName: "Users", // TODO get from environment variable based on app name
  //     Key: {
  //       username,
  //     },
  //   })
  //   .promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: result,
  };
};
