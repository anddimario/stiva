// const { DynamoDB } = require("aws-sdk");

// const dynamo = new DynamoDB.DocumentClient();

// exports.handler = async function (event) {
//   console.log("request:", JSON.stringify(event, undefined, 2));
//   const canAccess = false;
//   //   const username = event.params.username;
//   //   const user = dynamo.get({
//   //     TableName: "Users",
//   //     Key: {
//   //       username,
//   //     },
//   //   }).promise();
//     return {
//       statusCode: 200,
//       headers: { "Content-Type": "application/json" },
//       body: user,
//     };
//   // if (canAccess) {
//   //   return {
//   //     isAuthorized: true,
//   //     context: {},
//   //   };
//   // }
//   // return {
//   //   isAuthorized: false,
//   // };
// };

exports.handler = (event, context, callback) => {
  console.log(event);
  console.log(JSON.stringify(event));

  // // Send post authentication data to Cloudwatch logs
  // console.log ("Authentication successful");
  // console.log ("Trigger function =", event.triggerSource);
  // console.log ("User pool = ", event.userPoolId);
  // console.log ("App client ID = ", event.callerContext.clientId);
  // console.log ("User ID = ", event.userName);

  // Return to Amazon Cognito
  callback(null, event);
};