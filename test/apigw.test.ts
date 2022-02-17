import * as cdk from "aws-cdk-lib";
import { ValidationResult } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as ApiGwApp from "../lib/apigw-stack";
import * as StorageApp from "../lib/storage-stack";
import * as CognitoApp from "../lib/cognito-stack";


describe("Api Gateway Roles", () => {
  const app = new cdk.App();

  const storageStack = new StorageApp.StorageStack(app, "StorageTestStack", {
    tableName: `Stiva`
  });
  const cognitoStack = new CognitoApp.CognitoStack(app, "CognitoTestStack", {
    subDomainCognito: null
  });
  const stack = new ApiGwApp.ApiGatewayStack(app, "ApiGwTestStack", {
    stivaTable: storageStack.stivaTable,
    cognitoUserPool: cognitoStack.cognitoUserPool,
    cognitoUserPoolClient: cognitoStack.cognitoUserPoolClient,
    appName: 'Stiva',
    stageName: 'testing'
  });
  const template = Template.fromStack(stack);

  test("Create Gateway", () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: `Stiva Service`,
    });
  });

  test("Deployment", () => {
    template.resourceCountIs("AWS::ApiGateway::Account", 1);
    template.resourceCountIs("AWS::ApiGateway::Deployment", 1);
    template.resourceCountIs("AWS::ApiGateway::Stage", 1);
  });

  test("Count methods", () => {
    template.resourceCountIs("AWS::ApiGateway::Method", 8);
  });

  test("Count resources", () => {
    template.resourceCountIs("AWS::ApiGateway::Resource", 2);
  });

  test.each`
    part
    stiva
    ${"{id}"}
  `("Maps $part to a resource", ({ part }) => {
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: part,
    });
  });

  test.each`
    httpMethod   | authorizationType       | type      | validatorId
    ${"OPTIONS"} | ${"NONE"}               | ${"MOCK"} | ${"NONE"}
    ${"DELETE"}  | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
    ${"GET"}     | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
    ${"PUT"}     | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
    ${"GET"}     | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
    ${"POST"}    | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
  `(
    "Adds $httpMethod with authorization: $authorizationType to $type endpoint",
    ({ httpMethod, authorizationType, type }) => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: httpMethod,
        AuthorizationType: authorizationType,
        Integration: { Type: type },
      });
    }
  );

  test.each`
    httpMethod   | validatorId
    ${"POST"}    | ${"createSettingValidator"}
  `(
    "Adds validator: $validatorId to $httpMethod",
    ({ httpMethod, validatorId }) => {
      const validatorResourceId = stack.getLogicalId(
        stack.node.findChild(validatorId).node.findChild("Resource") as cdk.CfnElement
      );
      
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: httpMethod,
        RequestValidatorId: {
          Ref: validatorResourceId
        }
      });
    }
  );
});
