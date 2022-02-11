#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiGatewayStack } from "../lib/apigw-stack";
import { IamStack } from "../lib/iam-stack";
import { StorageStack } from "../lib/storage-stack";
import { CognitoStack } from "../lib/cognito-stack";

const app = new cdk.App();

const basicProps = {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
};

const storageStack = new StorageStack(app, "StorageStack", {
  ...basicProps,
  tableName: process.env.TABLE_NAME ? process.env.TABLE_NAME : 'Stiva',
  stackName: "storage-stack",
});

const iamStack = new IamStack(app, "IamStack", {
  ...basicProps,
  stivaTable: storageStack.stivaTable,
  stackName: "iam-stack",
});

const cognitoStack = new CognitoStack(app, "CognitoStack", {
  ...basicProps,
  subDomainCognito: process.env.COGNITO_SUBDOMAIN ? process.env.COGNITO_SUBDOMAIN : null,
  stackName: "cognito-stack",
});

new ApiGatewayStack(app, "ApiGatewayStack", {
  ...basicProps,
  getDynamoRole: iamStack.rolesList["getItem"],
  deleteDynamoRole: iamStack.rolesList["deleteItem"],
  putDynamoRole: iamStack.rolesList["putItem"],
  scanDynamoRole: iamStack.rolesList["scan"],
  cognitoUserPool: cognitoStack.cognitoUserPool,
  stackName: "apigateway-stack",
  appName: process.env.APP_NAME ? process.env.APP_NAME : 'Stiva',
  stageName: process.env.STAGE_NAME ? process.env.STAGE_NAME : 'dev',
});
