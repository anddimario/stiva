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
  RestApi,
  Cors,
  AwsIntegration,
  RequestValidator,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
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

interface ApiGatewayStackProps extends StackProps {
  putDynamoRole: aws_iam.Role;
  getDynamoRole: aws_iam.Role;
  deleteDynamoRole: aws_iam.Role;
  scanDynamoRole: aws_iam.Role;
  cognitoUserPool: aws_cognito.UserPool;
  stageName: string;
  appName: string;
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const {
      putDynamoRole,
      getDynamoRole,
      deleteDynamoRole,
      scanDynamoRole,
      cognitoUserPool,
      appName,
      stageName,
    } = props;

    const authorizer = new HttpUserPoolAuthorizer(
      "userPoolAuthorizer",
      cognitoUserPool
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
      defaultAuthorizer: authorizer
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
      description: `Authorize utils for ${appName}`,
    });
    // 3rd party library layer
    const oneTableLayer = new LayerVersion(this, "onetableLayer", {
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      code: Code.fromAsset(`${lambdasPath}/layers/onetable`),
      description: `Npm module onetable for ${appName}`,
    });
    // Lambdas
    const lambdasBasicConfig = {
      memorySize: 1024,
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_14_X,
      architecture: Architecture.ARM_64,
      code: Code.fromAsset(lambdasPath),
      layers: [utilsLayer, oneTableLayer],
      logRetention: 30,
    };

    const getLambda = new Function(this, "getLambda", {
      ...lambdasBasicConfig,
      handler: "get.handler",
      role: getDynamoRole,
    });
    const deleteLambda = new Function(this, "deleteLambda", {
      ...lambdasBasicConfig,
      handler: "delete.handler",
      role: deleteDynamoRole,
    });
    const createLambda = new Function(this, "createLambda", {
      ...lambdasBasicConfig,
      handler: "create.handler",
      role: putDynamoRole,
    });
    const updateLambda = new Function(this, "updateLambda", {
      ...lambdasBasicConfig,
      handler: "update.handler",
      role: putDynamoRole,
    });
    const findLambda = new Function(this, "findLambda", {
      ...lambdasBasicConfig,
      handler: "find.handler",
      role: scanDynamoRole,
    });

    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("getIntegration", getLambda),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration("updateIntegration", updateLambda),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}`,
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("createIntegration", createLambda),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}`,
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("findIntegration", findLambda),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration("deleteIntegration", deleteLambda),
    });

    // output
    new CfnOutput(this, "apiUrl", {
      value: httpApi.url || ''
    });
  }
}
