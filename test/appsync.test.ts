import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as AppSyncApp from '../lib/appsync-stack';
import * as StorageApp from '../lib/storage-stack';
import * as CognitoApp from '../lib/cognito-stack';

describe('AppSync', () => {
  const app = new cdk.App();

  const storageStack = new StorageApp.StorageStack(app, 'StorageTestStack', {
    tableName: `Stiva`,
  });
  const cognitoStack = new CognitoApp.CognitoStack(app, 'CognitoTestStack', {
    subDomainCognito: null,
  });
  const stack = new AppSyncApp.AppSyncStack(app, 'AppSyncTestStack', {
    stivaTable: storageStack.stivaTable,
    userPool: cognitoStack.cognitoUserPool,
  });
  const template = Template.fromStack(stack);

  test('Create GraphQL Api', () => {
    template.hasResourceProperties('AWS::AppSync::GraphQLApi', {});
  });

  test('Query Resolvers', () => {
    template.hasResourceProperties('AWS::AppSync::Resolver', {
      TypeName: 'Query',
      FieldName: 'getContents',
    });
    template.hasResourceProperties('AWS::AppSync::Resolver', {
      TypeName: 'Query',
      FieldName: 'getContentsByType',
    });
  });

  test('Mutatation Resolvers', () => {
    template.hasResourceProperties('AWS::AppSync::Resolver', {
      TypeName: 'Mutation',
      FieldName: 'addContent',
    });
  });
});
