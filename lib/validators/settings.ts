import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Stack, StackProps } from "aws-cdk-lib";
import { JsonSchemaType } from "aws-cdk-lib/aws-apigateway";

export class SettingApiGatewayValidation {

  /**
   * createSettingModel
   */
  public createOrUpdateSettingValidator(stack: Stack, restApi: apigateway.RestApi, requestType: string) {
    const modelName = requestType === 'update' ? 'updateSettingModelValidator' : 'createSettingModelValidator'
    return new apigateway.Model(stack, modelName, {
      restApi: restApi,
      contentType: "application/json",
      description: "Validate crete Setting body request",
      modelName,
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ["name", "policies"],
        properties: {
          name: { type: apigateway.JsonSchemaType.STRING },
          policies: { type: apigateway.JsonSchemaType.STRING },
          description: { type: apigateway.JsonSchemaType.STRING },
        //   department: {
        //     type: apigateway.JsonSchemaType.OBJECT,
        //     properties: {
        //       departmentName: { type: apigateway.JsonSchemaType.STRING },
        //     },
        //   },
        },
      },
    });
  }
}
