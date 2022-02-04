#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiGatewayUserRolesStack } from "../lib/apigw-userRoles-stack";
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

const cognitoStack = new CognitoStack(app, "CognitoStack", {
  ...basicProps,
  stackName: "cognito-stack",
});

const iamStack = new IamStack(app, "IamStack", {
  ...basicProps,
  roleTable: storageStack.roleTable,
  stackName: "iam-stack",
});

new ApiGatewayUserRolesStack(app, "ApiGatewayUserRolesStack", {
  ...basicProps,
  getUserRolesRole: iamStack.rolesList['roles']['getItem'],
  deleteUserRolesRole: iamStack.rolesList['roles']['deleteItem'],
  putUserRolesRole: iamStack.rolesList['roles']['putItem'],
  scanUserRolesRole: iamStack.rolesList['roles']['scan'],
  cognitoUserPool: cognitoStack.cognitoUserPool,
  stackName: "apigateway-stack",
});

