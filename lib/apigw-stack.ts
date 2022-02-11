import {
  aws_cognito,
  aws_iam,
  CfnOutput,
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
import { HttpLambdaIntegration, HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';


import { Runtime, Function, Code, Architecture } from "aws-cdk-lib/aws-lambda";
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
  constructor(
    scope: Construct,
    id: string,
    props: ApiGatewayStackProps
  ) {
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

    const cognitoAuth = new CognitoUserPoolsAuthorizer(
      this,
      "SettingAuthorizer",
      {
        cognitoUserPools: [cognitoUserPool],
      }
    );

    // 👇 create our HTTP Api
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
      deployOptions: {
        stageName: stageName,
      },
      defaultAuthorizer: cognitoAuth
    });

    // Lambdas
    const getLambda = new Function(this, "getLambda", {
      runtime: Runtime.NODEJS_14_X,
      architecture: Architecture.ARM_64,
      handler: "get.handler",
      code: Code.fromAsset(path.join(__dirname, "/../lambdas")),
      role: getDynamoRole
    });
    const deleteLambda = new Function(this, "deleteLambda", {
      runtime: Runtime.NODEJS_14_X,
      architecture: Architecture.ARM_64,
      handler: "delete.handler",
      code: Code.fromAsset(path.join(__dirname, "/../lambdas")),
      role: deleteDynamoRole
    });

    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "getIntegration",
        getLambda
      ),
    });
    httpApi.addRoutes({
      path: `/${appName.toLowerCase()}/{id}`,
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration(
        "deleteIntegration",
        deleteLambda
      ),
    });

    // const allResources = restApi.root.addResource(
    //   appName.toLocaleLowerCase()
    // );
    // const oneResource = allResources.addResource("{id}");

    // const errorResponses = [
    //   {
    //     selectionPattern: "400",
    //     statusCode: "400",
    //     responseTemplates: {
    //       "application/json": `{
    //         "error": "Bad input!"
    //       }`,
    //     },
    //   },
    //   {
    //     selectionPattern: "5\\d{2}",
    //     statusCode: "500",
    //     responseTemplates: {
    //       "application/json": `{
    //         "error": "Internal Service Error!"
    //       }`,
    //     },
    //   },
    // ];
    // const integrationResponses = [
    //   {
    //     statusCode: "200",
    //   },
    //   ...errorResponses,
    // ];

    // const cognitoAuth = new CognitoUserPoolsAuthorizer(
    //   this,
    //   "SettingAuthorizer",
    //   {
    //     cognitoUserPools: [cognitoUserPool],
    //   }
    // );

    // const methodOptions = {
    //   methodResponses: [
    //     { statusCode: "200" },
    //     { statusCode: "400" },
    //     { statusCode: "500" },
    //   ],
    //   authorizer: cognitoAuth,
    //   authorizationType: AuthorizationType.COGNITO,
    // };

    // allResources.addMethod("POST", createIntegration, {
    //   ...methodOptions,
    // });
    // oneResource.addMethod("GET", getIntegration, methodOptions);
    // oneResource.addMethod("DELETE", deleteIntegration, methodOptions);
    // allResources.addMethod("GET", getAllIntegration, methodOptions);
    // oneResource.addMethod("PUT", updateIntegration, {
    //   ...methodOptions,
    // });

    // output
    new CfnOutput(this, "apiUrl", {
      value: httpApi.url,
    });
  }
}
