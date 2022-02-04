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
import { UserRoleApiGatewayValidation } from "./validators/user-roles";

interface ApiGatewayUserRolesStackProps extends StackProps {
  putUserRolesRole: aws_iam.Role;
  getUserRolesRole: aws_iam.Role;
  deleteUserRolesRole: aws_iam.Role;
  scanUserRolesRole: aws_iam.Role;
  cognitoUserPool: aws_cognito.UserPool;
}

export class ApiGatewayUserRolesStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ApiGatewayUserRolesStackProps
  ) {
    super(scope, id, props);

    const modelName = "UserRoles";

    const {
      putUserRolesRole,
      getUserRolesRole,
      deleteUserRolesRole,
      scanUserRolesRole,
      cognitoUserPool,
    } = props;

    const restApi = new RestApi(this, `${modelName}Api`, {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      restApiName: `${modelName} Service`,
    });
    const allResources = restApi.root.addResource(
      modelName.toLocaleLowerCase()
    );
    const oneResource = allResources.addResource("{id}");

    const errorResponses = [
      {
        selectionPattern: "400",
        statusCode: "400",
        responseTemplates: {
          "application/json": `{
            "error": "Bad input!"
          }`,
        },
      },
      {
        selectionPattern: "5\\d{2}",
        statusCode: "500",
        responseTemplates: {
          "application/json": `{
            "error": "Internal Service Error!"
          }`,
        },
      },
    ];
    const integrationResponses = [
      {
        statusCode: "200",
      },
      ...errorResponses,
    ];

    const getIntegration = new AwsIntegration({
      action: "GetItem",
      options: {
        credentialsRole: getUserRolesRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "Key": {
                "${modelName}Id": {
                  "S": "$method.request.path.id"
                }
              },
              "TableName": "${modelName}"
            }`,
        },
      },
      service: "dynamodb",
    });
    const createIntegration = new AwsIntegration({
      action: "PutItem",
      options: {
        credentialsRole: putUserRolesRole,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `{
                "requestId": "$context.requestId"
              }`,
            },
          },
          ...errorResponses,
        ],
        requestTemplates: {
          "application/json": `{
              "Item": {
                "${modelName}Id": {
                  "S": "$context.requestId"
                },
                "Name": {
                  "S": "$input.path('$.name')"
                },
                "Description": {
                  "S": "$input.path('$.description')"
                },
                "Policies": {
                  "S": "$input.path('$.policies')"
                }
              },
              "TableName": "${modelName}"
            }`,
        },
      },
      service: "dynamodb",
    });
    const deleteIntegration = new AwsIntegration({
      action: "DeleteItem",
      options: {
        credentialsRole: deleteUserRolesRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "Key": {
                "${modelName}Id": {
                  "S": "$method.request.path.id"
                }
              },
              "TableName": "${modelName}"
            }`,
        },
      },
      service: "dynamodb",
    });
    const getAllIntegration = new AwsIntegration({
      action: "Scan",
      options: {
        credentialsRole: scanUserRolesRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "TableName": "${modelName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const updateIntegration = new AwsIntegration({
      action: "PutItem",
      options: {
        credentialsRole: putUserRolesRole,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `{
                "requestId": "$context.requestId"
              }`,
            },
          },
          ...errorResponses,
        ],
        requestTemplates: {
          "application/json": `{
              "Item": {
                "${modelName}Id": {
                  "S": "$method.request.path.id"
                },
                "Name": {
                  "S": "$input.path('$.name')"
                },
                "Description": {
                  "S": "$input.path('$.description')"
                },
                "Policies": {
                  "S": "$input.path('$.policies')"
                }
              },
              "TableName": "${modelName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const validators = new UserRoleApiGatewayValidation();
    const cognitoAuth = new CognitoUserPoolsAuthorizer(
      this,
      "userRoleAuthorizer",
      {
        cognitoUserPools: [cognitoUserPool],
      }
    );

    const methodOptions = {
      methodResponses: [
        { statusCode: "200" },
        { statusCode: "400" },
        { statusCode: "500" },
      ],
      authorizer: cognitoAuth,
      authorizationType: AuthorizationType.COGNITO,
    };

    allResources.addMethod("POST", createIntegration, {
      ...methodOptions,
      requestValidator: new RequestValidator(this, "createUserRoleValidator", {
        restApi: restApi,
        requestValidatorName: "createUserRoleModelValidator",
        validateRequestBody: true,
      }),
      requestModels: {
        "application/json": validators.createOrUpdateUserRoleValidator(this, restApi, 'create'),
      },
    });
    oneResource.addMethod("GET", getIntegration, methodOptions);
    oneResource.addMethod("DELETE", deleteIntegration, methodOptions);
    allResources.addMethod("GET", getAllIntegration, methodOptions);
    oneResource.addMethod("PUT", updateIntegration, {
      ...methodOptions,
      requestValidator: new RequestValidator(this, "updateUserRoleValidator", {
        restApi: restApi,
        requestValidatorName: "updateUserRoleModelValidator",
        validateRequestBody: true,
      }),
      requestModels: {
        "application/json": validators.createOrUpdateUserRoleValidator(this, restApi, 'update'),
      },
    });

    // output
    new CfnOutput(this, "userRolesApiUrl", {
      value: restApi.url,
    });
  }
}
