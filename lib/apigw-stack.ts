import {
  aws_cognito,
  aws_iam,
  CfnOutput,
  Duration,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  HttpApi,
  CorsHttpMethod,
  HttpMethod,
  HttpStage,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import {
  Runtime,
  Function,
  Code,
  Architecture,
  LayerVersion,
} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface ApiGatewayStackProps extends StackProps {
  stivaTable: Table;

  cognitoUserPool: aws_cognito.UserPool;
  cognitoUserPoolClient: aws_cognito.UserPoolClient;
  stageName: string;
  appName: string;
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const {
      cognitoUserPool,
      cognitoUserPoolClient,
      appName,
      stageName,
      stivaTable
    } = props;

    const authorizer = new HttpUserPoolAuthorizer(
      "userPoolAuthorizer",
      cognitoUserPool, {
        userPoolClients: [cognitoUserPoolClient]
      }
    );

    const httpApi = new HttpApi(this, "http-api-example", {
      description: `${appName} HTTP Api`,
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        // allowOrigins: ['http://localhost:3000'],
      },
      apiName: `${appName} Service`,
      defaultAuthorizer: authorizer,
    });

    new HttpStage(this, "HttpApiStage", {
      httpApi,
      stageName: stageName,
    });

    // Lambdas layer
    const lambdasPath = path.join(__dirname, "/../lambdas");
    const utilsLayer = new LayerVersion(this, "utilsLayer", {
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      code: Code.fromAsset(`${lambdasPath}/layers/utils`),
      description: `Set of utils functions for ${appName}`,
    });
    // 3rd party library layer
    const oneTableLayer = new LayerVersion(this, "modulesLayer", {
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      code: Code.fromAsset(`${lambdasPath}/layers/modules`),
      description: `Npm modules for ${appName}`,
    });
    // Lambdas
    const lambdasBasicConfig = {
      memorySize: 1024,
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_14_X,
      architecture: Architecture.ARM_64,
      layers: [utilsLayer, oneTableLayer],
      logRetention: 30,
      environment: {
        TABLE_NAME: stivaTable.tableName
      }
    };

    const createLambda = new Function(this, "createLambda", {
      ...lambdasBasicConfig,
      code: Code.fromAsset(`${lambdasPath}/create`),
      handler: "index.handler"
    });
    createLambda.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:Query'],
      effect: Effect.ALLOW,
      resources: [stivaTable.tableArn],
    }),)
    const getLambda = new Function(this, "getLambda", {
      ...lambdasBasicConfig,
      code: Code.fromAsset(`${lambdasPath}/get`),
      handler: "index.handler",
    });
    getLambda.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:GetItem', 'dynamodb:Query'],
      effect: Effect.ALLOW,
      resources: [stivaTable.tableArn],
    }),)
    // const deleteLambda = new Function(this, "deleteLambda", {
    //   ...lambdasBasicConfig,
    //   code: Code.fromAsset(`${lambdasPath}/delete`),
    //   handler: "index.handler",
    // });
    // deleteLambda.addToRolePolicy(new PolicyStatement({
    //   actions: [`dynamodb:DeleteItem`],
    //   effect: Effect.ALLOW,
    //   resources: [stivaTable.tableArn],
    // }),)
    // const updateLambda = new Function(this, "updateLambda", {
    //   ...lambdasBasicConfig,
    //   code: Code.fromAsset(lambdasPath),
    //   handler: "update.handler",
    // });
    // updateLambda.addToRolePolicy(new PolicyStatement({
    //   actions: [`dynamodb:UpdateItem`],
    //   effect: Effect.ALLOW,
    //   resources: [stivaTable.tableArn],
    // }),)
    // const findLambda = new Function(this, "findLambda", {
    //   ...lambdasBasicConfig,
    //   code: Code.fromAsset(lambdasPath),
    //   handler: "find.handler",
    // });
    // findLambda.addToRolePolicy(new PolicyStatement({
    //   actions: [`dynamodb:Query`],
    //   effect: Effect.ALLOW,
    //   resources: [stivaTable.tableArn],
    // }),)

    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}`,
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("createIntegration", createLambda),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("getIntegration", getLambda),
    });
    // httpApi.addRoutes({
    //   path: `/${appName.toLowerCase()}/{id}`,
    //   methods: [HttpMethod.PUT],
    //   integration: new HttpLambdaIntegration("updateIntegration", updateLambda),
    // });
    // httpApi.addRoutes({
    //   path: `/${appName.toLowerCase()}`,
    //   methods: [HttpMethod.GET],
    //   integration: new HttpLambdaIntegration("findIntegration", findLambda),
    // });
    // httpApi.addRoutes({
    //   path: `/${appName.toLowerCase()}/{id}`,
    //   methods: [HttpMethod.DELETE],
    //   integration: new HttpLambdaIntegration("deleteIntegration", deleteLambda),
    // });

    // output
    new CfnOutput(this, "apiUrl", {
      value: httpApi.url || ''
    });
  }
}
