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
