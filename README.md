Multisite serverless cms with dynamodb, lambda and s3

### Features
- serverless (aws lambda, dynamodb and s3)
- multiple site backend
- manage users, contents and images
- dynamic content based on configuration
- basic vue fe as example for a site
- uploads on s3

### Requirements
- nodejs > 8
- [serverless](https://serverless.com/) > 1
- For fe: `npm install -g webpack-dev-server`

### Run be on localhost
```
npm i
cp sites.example.js sites.js
node script/initSite
sls offline start --site-header X-SLSMU-SITE --dynamo-options '{"endpoint":"http://localhost:8000"}' --s3-options '{"endpoint":"http://localhost:4572"}' --aws-region localhost
```

### Run fe on localhost
```
cd client
npm i
npm run dev
```

### Build fe
This command build in `dist/`
```
cd client
npm run build
```

### Create endpoints API docs
```
npm run doc
```

### Create an admin
- `node scripts/superUser`

### Contents
You can add contents in different table (default is `contents` that it's defined in `serverless.yaml`). In `config.example.js` there's an example of contents definition. `viewers` is an array of roles that specified the roles that can read the content, if `guest` role is specified, this allow not authenticated users.

### Validation
Validations use `ajv`, you can add validators on config.js, then add in your code as: `validation(ref, data)`. For each contents, in definitions there's a `fields` value, an array with the fields in body that must insert in dynamo.

### Tests
**Before**: create a site with an admin (admin@example.com with password: `password`)
```
export AWS_REGION=localhost
export DB_PREFIX='localhost_'
export SITE='localhost'
export DYNAMO_OPTIONS='{"endpoint":"http://localhost:8000"}'
export SITE_HEADER=X-SLSMU-SITE
sls dynamodb start &
npm run test
```

### Todo
- password recovery
- improve basic fe
- test deploy on aws and docs about it

### Thanks
- FE login/registration: http://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example
- Upload: https://github.com/kfei/vue-s3-dropzone
