const { DynamoDB } = require("aws-sdk");

const dynamo = new DynamoDB.DocumentClient();

exports.handler = async function (event) {
  console.log(event);
  console.log("request:", JSON.stringify(event, undefined, 2));
  // const canAccess = false;
// TODO authorize

    const username = event.params.username;
    const user = dynamo.get({
      TableName: "Users", // TODO get from environment variable based on app name
      Key: {
        username,
      },
    }).promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: user,
  };
};
