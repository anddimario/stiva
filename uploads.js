const AWS = require('aws-sdk');
const authorize = require('./libs/authorize');
const sites = require('./sites');

const s3 = new AWS.S3(process.env.S3_OPTIONS);

exports.handler = async (event, context) => {
  try {
    console.log(event);
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const body = JSON.parse(event.body);
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    if (!body.hasOwnProperty('contentType')) {
      throw 'Missing contentType';
    }

    if (!body.hasOwnProperty('filePath')) {
      throw 'Missing filePath';
    }

    var params = {
      Bucket: siteConfig.bucketName,
      Key: body.filePath,
      Expires: 3600,
      ContentType: body.contentType
    };

    const url = await s3.getSignedUrl('putObject', params);
    const response = {
      statusCode: 200,
    };
    response.body = JSON.stringify({
      url
    });
    return response;

  } catch (e) {
    console.log(e);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};
