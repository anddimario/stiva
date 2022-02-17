"use strict";
const utils = require("/opt/nodejs/utils.js");

exports.handler = async function (event) {
  try {
    console.log(event);
    console.log("request:", JSON.stringify(event, undefined, 2));
    console.log(event.body);
    // const canAccess = false;
    // TODO authorize
    await utils.check(event.requestContext.authorizer);
    const model = utils.getModel("Content"); // TODO allow multiple modelName based on request

    const payload =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const result = await model.create(payload, { log: true });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result), // Needs JSON stringify to avoid error 500
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(error),
    };
  }
};
