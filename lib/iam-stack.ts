import { Fn, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import {
  CfnRole,
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface IamStackProps extends StackProps {
  settingTable: dynamodb.Table;
}

export class IamStack extends Stack {
  public readonly rolesList: any;
  public readonly cognitoUserGroupRoleArn: string;

  private createDynamoPolicyAndRole(
    table: Table,
    action: string,
    idPrefix: string
  ): Role {
    const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);
    const policy = new Policy(this, `${idPrefix}Policy`, {
      statements: [
        new PolicyStatement({
          actions: [`dynamodb:${actionCapitalized}`],
          effect: Effect.ALLOW,
          resources: [table.tableArn],
        }),
      ],
    });
    const role = new Role(this, `${idPrefix}Role`, {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });
    role.attachInlinePolicy(policy);
    return role;
  }

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    const { settingTable } = props;

    const dynamodbBasicAction = ["putItem", "getItem", "scan", "deleteItem"];
    const tablesList = ["settings"];
    this.rolesList = {};

    // IAM POLICIES DYNAMODB
    for (const action of dynamodbBasicAction) {
      for (const table of tablesList) {
        if (!this.rolesList[table]) {
          this.rolesList[table] = {};
        }
        let tableResource = settingTable;
        // if (table === "") {
        //   tableResource = ...;
        // }
        const idPrefix = `${action}${table}`;
        const role = this.createDynamoPolicyAndRole(
          tableResource,
          action,
          idPrefix
        );
        this.rolesList[table][action] = role;
      }
    }

    // COGNITO GROUPS aApi gateway policies
    // https://docs.aws.amazon.com/apigateway/latest/developerguide/security_iam_service-with-iam.html
    const adminGroupPolicy = new Policy(this, "adminGroupPolicy", {
      statements: [
        new PolicyStatement({
          actions: ["*"],
          effect: Effect.ALLOW,
          resources: ["*"],
        }),
      ],
    });
    const adminGroupRole = new Role(this, "adminGroupRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });
    adminGroupRole.attachInlinePolicy(adminGroupPolicy);
    const userGroupPolicy = new Policy(this, "userGroupPolicy", {
      statements: [
        new PolicyStatement({
          actions: ["apigateway:GET"],
          effect: Effect.ALLOW,
          resources: [`arn:aws:apigateway:${props.env?.region}::/userroles/*`],
        }),
      ],
    });
    const cognitoUserGroupRole = new Role(this, "userGroupRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });
    cognitoUserGroupRole.attachInlinePolicy(userGroupPolicy);
    this.cognitoUserGroupRoleArn = cognitoUserGroupRole.roleArn;
  }
}
