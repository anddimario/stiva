import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as CognitoApp from "../lib/cognito-stack";

describe("Cognito", () => {
  const app = new cdk.App();
  const stack = new CognitoApp.CognitoStack(app, "CognitoTestStack");
  const template = Template.fromStack(stack);

  test("default setup", () => {
    // https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-cognito/test/user-pool.test.ts
    template.hasResource("AWS::Cognito::UserPool", {
      SmsAuthenticationMessage: Match.absent(),
      SmsConfiguration: Match.absent(),
      lambdaTriggers: Match.absent(),
    });

    template.hasResource("AWS::Cognito::UserPool", {
      DeletionPolicy: "Retain",
    });
  });
});
