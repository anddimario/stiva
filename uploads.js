const AWS = require('aws-sdk');
const authorize = require('./libs/authorize');
const sites = require('./sites');

const s3 = new AWS.S3(JSON.parse(process.env.S3_OPTIONS));

exports.post = async (event, context) => {
  try {
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const body = JSON.parse(event.body);
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];

    // Check permissions
    if (!siteConfig.uploadsPermissions.creators.includes(authorized.user.userRole)) {
      throw 'Not authorized';
    }


    if (!body.hasOwnProperty('contentType')) {
      throw 'Missing contentType';
    }

    if (!body.hasOwnProperty('key')) {
      throw 'Missing file name';
    }

    if (!body.hasOwnProperty('file')) {
      throw 'Missing file';
    }

    const buffer = Buffer.from(body.file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const params = {
      Bucket: siteConfig.bucketName,
      Key: body.key,
      Body: buffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: body.contentType,
    };
    await s3.putObject(params).promise();

    const response = {
      statusCode: 200,
    };
    response.body = JSON.stringify({
      message: true
    });
    return response;

  } catch (e) {
    console.log(e.message);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message.toString()
      }),
    };

    return response;

  }
};

exports.get = async (event, context) => {
  try {
    const authorized = await authorize(event);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const body = event.queryStringParameters;
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    const Bucket = siteConfig.bucketName;

    // Check permissions
    if (!siteConfig.uploadsPermissions.viewers.includes(authorized.user.userRole)) {
      throw 'Not authorized';
    }

    const params = {
      Bucket,
    };
    const response = {
      statusCode: 200,
    };
    switch (body.type) {
      case 'list':
        const files = await s3.listObjects(params).promise();
        response.body = JSON.stringify({
          files
        });
        break;
      case 'delete':
        params.Key = body.key;
        await s3.deleteObject(params).promise();
        response.body = JSON.stringify({
          message: true,
          key: body.key
        });
        break;
      default:
        throw 'Undefined method';
    }
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
