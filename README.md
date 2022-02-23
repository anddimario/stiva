# Stiva

These stacks create a cognito user pool with two defined group (user and admin) and a `Stiva` DynamoDB table configured as one table, accessible via Api Gateway endpoint

## Requirements

* AWS CDK v2
* NodeJS > 14

## Installation

* Install layer npm packages: `npm install --prefix lambdas/layers/onetable`

## Useful commands

* `npm run build`   compile typescript to js
* `npm run clean`   clean builded js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## CDK commands env Variables

Env variables to use in cdk commands:

* `STAGE_NAME`: define stage name for Api Gateway (**optional** default `dev`)
* `TABLE_NAME`: define DynamoDB table name (**optional** default `Stiva`)
* `APP_NAME`: define app name (**optional** default `Stiva`)
* `COGNITO_SUBDOMAIN`: cognito domain prefix (subdomain) (**optional**)
* `AWS_REGION`
* `CDK_DEFAULT_ACCOUNT`
* `CDK_DEFAULT_REGION`

## TEST

To run rest api test (canary test to use only after deployed stack on aws): `TEST_REST=true npm test rest`

**IMP** Need a rebuild before every test
**Note** Based on your OS config you should add aws environment variables

## Thanks

* [Borislav Hadzhiev](https://bobbyhadz.com/) for useful informations and reading
