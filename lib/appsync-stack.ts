import { Stack, StackProps } from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
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
            userPool,
          },
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
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}listContentsResponse.vtl`
      ),
    });
    stivaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getContent',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}getContentRequest.vtl`
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}getContentResponse.vtl`
      ),
    });
    stivaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getContentsByType',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}getContentsByTypeRequest.vtl`
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}listContentsResponse.vtl`
      ),
    });
    stivaDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'addContent',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}addContentRequest.vtl`
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        `${vtlPath}addContentResponse.vtl`
      ),
    });
  }
}
