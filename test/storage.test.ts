import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as StorageApp from "../lib/storage-stack";

describe("DynamoDB Table Settings", () => {
  const app = new cdk.App();

  const stack = new StorageApp.StorageStack(app, "StorageTestStack");
  const template = Template.fromStack(stack);

  test("Create table", () => {
    template.hasResource("AWS::DynamoDB::Table", {
      Properties: {
        KeySchema: [
          {
            AttributeName: `SettingsId`,
            KeyType: "HASH",
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: `SettingsId`,
            AttributeType: "S",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
        TableName: "Settings",
      },
    });
  });
});
