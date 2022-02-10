#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiGatewaySettingsStack } from "../lib/apigw-settings-stack";
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
  stackName: "storage-stack",
});

const iamStack = new IamStack(app, "IamStack", {
  ...basicProps,
  settingTable: storageStack.settingTable,
  stackName: "iam-stack",
});

const cognitoStack = new CognitoStack(app, "CognitoStack", {
  ...basicProps,
  cognitoUserGroupRoleArn: iamStack.cognitoUserGroupRoleArn,
  subDomainCognito: process.env.COGNITO_SUBDOMAIN ? process.env.COGNITO_SUBDOMAIN : null,
  stackName: "cognito-stack",
});

new ApiGatewaySettingsStack(app, "ApiGatewaySettingsStack", {
  ...basicProps,
  getSettingsRole: iamStack.rolesList["settings"]["getItem"],
  deleteSettingsRole: iamStack.rolesList["settings"]["deleteItem"],
  putSettingsRole: iamStack.rolesList["settings"]["putItem"],
  scanSettingsRole: iamStack.rolesList["settings"]["scan"],
  cognitoUserPool: cognitoStack.cognitoUserPool,
  stackName: "apigateway-stack",
  stageName: process.env.STAGE_NAME ? process.env.STAGE_NAME : 'dev',
});