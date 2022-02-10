import * as cdk from "aws-cdk-lib";
import { ValidationResult } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as ApiGwApp from "../lib/apigw-settings-stack";
import * as IamApp from "../lib/iam-stack";
import * as StorageApp from "../lib/storage-stack";
import * as CognitoApp from "../lib/cognito-stack";

const modelName = "Settings";

describe("Api Gateway Roles", () => {
  const app = new cdk.App();

  const storageStack = new StorageApp.StorageStack(app, "StorageTestStack");
  const iamStack = new IamApp.IamStack(app, "IamTestStack", {
      settingTable: storageStack.settingTable,
  });
  const cognitoStack = new CognitoApp.CognitoStack(app, "CognitoTestStack", {
    cognitoUserGroupRoleArn: iamStack.cognitoUserGroupRoleArn,
    subDomainCognito: null
  });
  const stack = new ApiGwApp.ApiGatewaySettingsStack(app, "ApiGwTestStack", {
    getSettingsRole: iamStack.rolesList['settings']['getItem'],
    deleteSettingsRole: iamStack.rolesList['settings']['deleteItem'],
    scanSettingsRole: iamStack.rolesList['settings']['putItem'],
    putSettingsRole: iamStack.rolesList['settings']['scan'],
    cognitoUserPool: cognitoStack.cognitoUserPool,
    stageName: 'testing'
  });
  const template = Template.fromStack(stack);

  test("Create Gateway", () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: `${modelName} Service`,
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
    ${modelName.toLowerCase()}
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
    ${"PUT"}     | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"createOrUpdateSettingValidator"}
    ${"GET"}     | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"NONE"}
    ${"POST"}    | ${"COGNITO_USER_POOLS"} | ${"AWS"}  | ${"createOrUpdateSettingValidator"}
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