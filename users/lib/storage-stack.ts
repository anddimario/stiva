import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

export class StorageStack extends Stack {
  public readonly roleTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DYNAMODB
    this.roleTable = new Table(this, "UserRoles", {
      tableName: "UserRoles",
      partitionKey: { name: "UserRolesId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
