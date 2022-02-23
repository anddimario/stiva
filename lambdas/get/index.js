"use strict";
const utils = require("/opt/nodejs/utils.js");

exports.handler = async function (event) {
  try {
    console.log(event);
    console.log("request:", JSON.stringify(event, undefined, 2));
    await utils.check(event.requestContext.authorizer);
    const model = await utils.getModel("Content"); // allow multiple modelName based on request

    const result = await model.get({
      id: event.pathParameters.id,
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
