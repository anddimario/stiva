import { Stack, StackProps } from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { UserPool } from 'aws-cdk-lib/aws-cognito';

interface AppSyncStackProps extends StackProps {
  stivaTable: Table;
  userPool: UserPool;
}

export class AppSyncStack extends Stack {
  constructor(scope: cdk.App, id: string, props: AppSyncStackProps) {
    super(scope, id, props);

    const { stivaTable, userPool } = props;

    const api = new appsync.GraphqlApi(this, 'StivaApi', {
      name: 'StivaApi',
      schema: appsync.Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool
          }
        },
      },
      xrayEnabled: false,
    });

    const stivaDS = api.addDynamoDbDataSource('StivaApiDataSource', stivaTable);

    const vtlPath = path.join(`${__dirname}/vtl/`);
    stivaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getContents',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
    stivaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getContentsByType',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(`${vtlPath}getContentsByTypeRequest.vtl`),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(`${vtlPath}getContentsByTypeResponse.vtl`),
    });
    stivaDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'addContent',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(`${vtlPath}addContentRequest.vtl`),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(`${vtlPath}addContentResponse.vtl`),
    });

    // Resolver for the Query "getDemos" that scans the DynamoDb table and returns the entire list.
    // Resolver Mapping Template Reference:
    // https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html
    // demoDS.createResolver({
    //   typeName: 'Query',
    //   fieldName: 'getDemos',
    //   requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
    //   responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    // });

    // // Resolver for the Mutation "addDemo" that puts the item into the DynamoDb table.
    // demoDS.createResolver({
    //   typeName: 'Mutation',
    //   fieldName: 'addDemo',
    //   requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
    //     appsync.PrimaryKey.partition('id').auto(),
    //     appsync.Values.projecting('input')
    //   ),
    //   responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    // });

    // //To enable DynamoDB read consistency with the `MappingTemplate`:
    // demoDS.createResolver({
    //   typeName: 'Query',
    //   fieldName: 'getDemosConsistent',
    //   requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(true),
    //   responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    // });
  }
}
