#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StorageStack } from "../lib/storage-stack";
import { CognitoStack } from "../lib/cognito-stack";
import { AppSyncStack } from "../lib/appsync-stack";

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

const cognitoStack = new CognitoStack(app, "CognitoStack", {
  ...basicProps,
  subDomainCognito: process.env.COGNITO_SUBDOMAIN ? process.env.COGNITO_SUBDOMAIN : null,
  stackName: "cognito-stack",
});


new AppSyncStack(app, "AppSyncStack", {
  ...basicProps,
  stivaTable: storageStack.stivaTable,
  userPool: cognitoStack.cognitoUserPool,
  stackName: "appsync-stack",
});
