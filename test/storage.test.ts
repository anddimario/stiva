import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as StorageApp from "../lib/storage-stack";

describe("DynamoDB Table Stiva", () => {
  const app = new cdk.App();

  const stack = new StorageApp.StorageStack(app, "StorageTestStack", {
    tableName: 'Stiva'
  });
  const template = Template.fromStack(stack);

  test("Create table", () => {
    template.hasResource("AWS::DynamoDB::Table", {
      Properties: {
        KeySchema: [
          {
            AttributeName: `pk`,
            KeyType: "HASH",
          },
          {
            AttributeName: `sk`,
            KeyType: "RANGE",
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: `pk`,
            AttributeType: "S",
          },
          {
            AttributeName: `sk`,
            AttributeType: "S",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
        TableName: "Stiva",
      },
    });
  });
});
