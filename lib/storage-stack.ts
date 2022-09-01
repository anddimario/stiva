import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';

interface StorageStackProps extends StackProps {
  tableName: string;
}

export class StorageStack extends Stack {
  public readonly stivaTable: Table;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const { tableName } = props;

    // DYNAMODB
    this.stivaTable = new Table(this, tableName, {
      tableName,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    // add a secondary index to id table
    this.stivaTable.addGlobalSecondaryIndex({
      indexName: 'contentId-index',
      partitionKey: {
        name: 'contentId',
        type: AttributeType.STRING,
      },
      // nonKeyAttributes: ['contentName', 'contentType', 'contentValue', 'contentOwner'],
      // projectionType: ProjectionType.INCLUDE,
    });
  }
}
