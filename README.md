Multisite and multicontent serverless cms with dynamodb, lambda, s3

### Features
- serverless (aws lambda, dynamodb, s3)
- multiple site backend
- optional registration and password recovery
- login
- manage users, contents and images
- dynamic content based on configuration
- optional write transaction for contents
- uploads on s3

### Requirements
- nodejs > 8
- [serverless](https://serverless.com/) > 1
- an aws account
- (only for devs) [localstack](https://github.com/localstack/localstack) and docker

### Installation
- install nodejs and npm
- clone the repository
- install serverless: `npm i -g serverless`
- (optional) install webpack for frontend: `npm install -g webpack-dev-server`
- configure aws account for serverless: https://serverless.com/framework/docs/providers/aws/guide/credentials/
- rename sites.example.js in sites.js
- create the site: node scripts/site create
- (Optional) create an user: node scripts/createUser

**NOTE** serverless docs: https://serverless.com/framework/docs/providers/aws/guide/intro/

### Deploy
```
sls deploy --site-header X-SLSMU-SITE --dynamo-options '{}' --s3-options '{}' --ses-options '{}' --aws-region YOUR_REGION
```

### Delete site resources
```
node script/site delete
```

### Endpoint Docs
- Create endpoint api docs: `npm run doc`

### Informations
#### Contents
You can add contents in different table. `viewers` is an array of roles that specified the roles that can read the content, if `guest` role is specified, this allow not authenticated users. 
`creators` if an array of roles that can write the content. `editors` is used to define which group can edit the contents, if the group is not defined, only creator can edit it.
In the example above it's defined a post content that use the table `contents` in dynamodb. It allow in the request the extra fields: 'contentText', 'title'. Only some group can edit the contents, but all can see them. 
You can add private content or role based content, and get them from list, with the field `private`, see endpoint docs for examples.

#### List filters and projection
- `allowFilters`: if true, you can pass in request params a `filters_expression` and a `filters_values` based on [dynamodb filters](https://docs.aws.amazon.com/en_us/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html), an example:
```
curl -H "Authorization: Bearer MY_TOKEN" -H "X-SLSMU-SITE: localhost" "http://localhost:3000/contents?type=list&contentType=post&filters=title%20%3D%20test"
```
**NOTE** You must encode your filter using encodeURIComponent
- `projection`: by default only id, createdAt and creator are returned from contents list, you can add here a list of fields that must be returned

#### Validation
Validations use [ajv](https://github.com/epoberezkin/ajv), you can add validators on sites.js, then add in your code: 
```
...
validation(ref, data)
...
```
Where ref is the object key and data is body or params.
For each contents, in definitions there's a `fields` value, an array with the fields in body that must insert in dynamo.
For example, above there's the validation for registration, login and contents POST api

#### Share a table
You can add multiple contents in one table and use filters to get the right content based on a type.

#### Email templates and subjects
Send emails is optional and you must add: `sendEmail: true,` in your site config. This feature is allowed by another project: [postino](https://github.com/anddimario/postino).
The email function use for each site in config the objects:
- `emailTemplates`: a mapping from a reference (object key) and the template name in the directory (object value)
- `emailSubjects`: a mapping from a reference (object key) and a text used for the email subject (object value)

#### Transaction
Transaction endpoint `/contents` use DynamoDB write transactions. You must activate it on site's configuration (`transaction: true`) and then define transaction rules, in `availableTransaction`, for example:
```
  availableTransaction: {
    // 'table': {condition: '..', update: ''}
    'contents': { condition: 'title = :title', update: 'SET contentText = :contentText' }
  },
```
`availableTransaction` is an object that use `condition` and `update` to limit the api usage. The payload in POST request is something like:
```
{
  "type": "transaction",
  "items": {
    "contents": {
      "id": {"S":"128300c0-7340-4286-a72c-44dd770642b3"},
      "values": {":title":{"S":"new form x"},":contentText":{"S":"updated"}}
    }
  }
}
```

#### Example for an ecommerce
- on contents config add:
```
      products: {
        table: 'products',
        creators: ['admin'],
        fields: ['name', 'description', 'price', 'quantity'], // field to get in body
        viewers: ['guest', 'buyer', 'admin'], // allowed viewers
        allowFilters: ['<', '>', '='], // allowed filters in contents list
        projection: ', name, description, price, quantity' // projection fields for contents list
      },
      orders: {
        table: 'orders',
        creators: ['buyer', 'admin'],
        fields: ['items', 'total', 'address'], // field to get in body
        viewers: ['owner', 'admin'], // allowed viewers
        allowFilters: ['<', '>', '='], // allowed filters in contents list
        projection: ', items, total, address' // projection fields for contents list
      },
```
- for transaction in config add:
```
    transaction: true,
    availableTransaction: {
      'products': { condition: 'quantity > :min_qty', update: 'SET quantity = :new_quantity' }
    },
```
- then run site init script

### Local development
#### Run localstack
```
export SERVICES=dynamodb,s3
docker-compose up
```

#### Run tests
```
export AWS_REGION=localhost
export DB_PREFIX='localhost_'
export SITE='localhost'
export DYNAMO_OPTIONS='{"endpoint":"http://localhost:4569"}'
export SES_OPTIONS='{}'
export SITE_HEADER=X-SLSMU-SITE
node scripts/initSite.js
node scripts/createUser.js
# Create an admin with username `admin@example.com` and password `password`
npm run test
```

#### Create a module
- create a file like `myModule.js` on project root, based on this template:
```
'use strict';
const sites = require('./sites');
const authorize = require('./libs/authorize');

module.exports.post = async (event, context) => {
  try {
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    const body = JSON.parse(event.body);

    const authorized = await authorize(event, siteConfig);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    switch (body.type) {
      case '..':
        ...
        ...
      default:
        throw 'Undefined method'
    }

    return response;

  } catch (e) {
    console.log(e)
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};

module.exports.get = async (event, context) => {
  try {
    const siteConfig = sites[event.headers[process.env.SITE_HEADER]];
    const authorized = await authorize(event, siteConfig);
    if (!authorized.auth) {
      throw 'Not authorized';
    }

    const response = {
      statusCode: 200,
    };

    switch (event.queryStringParameters.type) {
      case '...':
        ...
      default:
        throw 'Undefined method'
    }
    return response;

  } catch (e) {
    console.log(e)
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: e.toString()
      }),
    };

    return response;

  }
};
```
- in `serverless.yaml` under functions's section add:
```
....
  myModuleGet:
    handler: myModule.get
    events:
      - http:
          path: /my_module
          method: get
  myModulePost:
    handler: my_module.post
    events:
      - http:
          path: /my_module
          method: post
....
```

### Related projects
- [basic frontend](https://github.com/anddimario/stiva-basic-fe) basic Vue.js frontend for single site example
- [postino](https://github.com/anddimario/postino) send email in a serverless way

### License
**MIT**
