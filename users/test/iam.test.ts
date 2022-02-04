import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as IamApp from "../lib/iam-stack";
import * as StorageApp from "../lib/storage-stack";

describe("Roles", () => {
  const app = new cdk.App();

  const storageStack = new StorageApp.StorageStack(app, "StorageTestStack");
  const stack = new IamApp.IamStack(app, "IamTestStack", {
    roleTable: storageStack.roleTable,
  });
  const template = Template.fromStack(stack);

  // Get the reference for user table in stack to use in policy
  const roleTableId = storageStack.getLogicalId(
    storageStack.node
      .findChild("UserRoles")
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
    action          | roleTable
    ${"GetItem"}    | ${roleTableId}
    ${"PutItem"}    | ${roleTableId}
    ${"DeleteItem"} | ${roleTableId}
    ${"Scan"}       | ${roleTableId}
  `(
    "Generates a policy with $action for tables",
    ({ action, roleTable }) => {
      if (roleTable) {
        template.hasResourceProperties("AWS::IAM::Policy", {
          PolicyDocument: {
            Statement: [
              {
                Action: `dynamodb:${action}`,
                Effect: "Allow",
                Resource: {
                  "Fn::ImportValue": Match.stringLikeRegexp(`${roleTable}`),
                },
              },
            ],
          },
        });
      }
    }
  );
});
