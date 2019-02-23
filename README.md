Multisite cms on aws lambda, dynamodb and s3

### Features
- serverless
- multiple site backend
- manage users, contents and images
- basic vue fe as example for a site
- uploads on s3

### Requirements
- nodejs > 8
- [serverless](https://serverless.com/) > 1
- For fe: `npm install -g webpack-dev-server`

### Run on localhost
```
npm i
export AWS_REGION='localhost'
export DB_PREFIX='localhost_'
export SITE='localhost'
cp config.example.js config.js
sls offline start
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

### Endpoint API docs
```
npm run doc
```

### Create an admin
- `node scripts/superUser SITE ADMIN_EMAIL ADMIN_PASSWORD`
**NOTE** You need env variables, based on region


### Contents
You can add contents in different table (default is `contents` that it's defined in `serverless.yaml`). In `config.example.js` there's an example of contents definition. `viewers` is an array of roles that specified the roles that can read the content, if `guest` role is specified, this allow not authenticated users.

### Validation
Validations use `ajv`, you can add validators on config.js, then add in your code as: `validation(ref, data)`. For each contents, in definitions there's a `fields` value, an array with the fields in body that must insert in dynamo.

### Tests
```
export AWS_REGION='localhost'
export DB_PREFIX='localhost_'
export SITE='localhost'
sls dynamodb start --migrate &
node scripts/superUser localhost admin@example.com password
npm run test
```
**NOTE** Tests assume that use dynamodb inmemory, so there's no after hooks to remove data

### Todo
- password recovery
- improve basic fe
- test deploy on aws and docs about it

### Thanks
- FE login/registration: http://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example
- Upload: https://github.com/kfei/vue-s3-dropzone
