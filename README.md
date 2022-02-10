# WIP

These stacks create a cognito user pool with two defined group (user and admin) and a `Settings` section with a dynamodb table integrated with apigatway

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## CDK env Variables

Env variables to use in cdk commands:

* `STAGE_NAME`: define stage name for Api Gateway (**required**)
* `COGNITO_SUBDOMAIN`: cognito domain prefix (subdomain) (**optional**)
* `AWS_REGION`
* `CDK_DEFAULT_ACCOUNT`
* `CDK_DEFAULT_REGION`

## Thanks

* Matt Morgan for [DynamoDB Integration](https://dev.to/elthrasher/aws-cdk-api-gateway-service-integration-with-dynamodb-2ek0) with [this tutorial](https://github.com/elthrasher/cdk-apigateway-dynamodb)
* [Borislav Hadzhiev](https://bobbyhadz.com/) for useful informations and reading
