import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as IamApp from "../lib/iam-stack";
import * as StorageApp from "../lib/storage-stack";

describe("Roles", () => {
  const app = new cdk.App();

  const storageStack = new StorageApp.StorageStack(app, "StorageTestStack", {
    tableName: 'Stiva'
  });
  const stack = new IamApp.IamStack(app, "IamTestStack", {
    stivaTable: storageStack.stivaTable,
  });
  const template = Template.fromStack(stack);

  // Get the reference for user table in stack to use in policy
  const stivaTableId = storageStack.getLogicalId(
    storageStack.node
      .findChild("Stiva")
      .node.findChild("Resource") as cdk.CfnElement
  );
  // const tableArn = cdk.Fn.getAtt(userTableId, "Arn");
  // console.log(cdk.Fn.importValue(userTableId));
  // console.log(tableArn.toString());

  test("Count policies and roles", () => {
    template.resourceCountIs("AWS::IAM::Policy", 4);
    template.resourceCountIs("AWS::IAM::Role", 4);
  });

  test.each`
    action          | stivaTable
    ${"GetItem"}    | ${stivaTableId}
    ${"PutItem"}    | ${stivaTableId}
    ${"DeleteItem"} | ${stivaTableId}
    ${"Scan"}       | ${stivaTableId}
  `(
    "Generates a policy with $action for tables",
    ({ action, stivaTable }) => {
      if (stivaTable) {
        template.hasResourceProperties("AWS::IAM::Policy", {
          PolicyDocument: {
            Statement: [
              {
                Action: `dynamodb:${action}`,
                Effect: "Allow",
                Resource: {
                  "Fn::ImportValue": Match.stringLikeRegexp(`${stivaTable}`),
                },
              },
            ],
          },
        });
      }
    }
  );

});
