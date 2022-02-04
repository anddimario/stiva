import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";

export class CognitoStack extends cdk.Stack {
  public readonly cognitoUserPool: cognito.UserPool;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Post auth lambda trigger
    // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-lambda-readme.html
    const postAuthLambda = new Function(this, "postAuthLambda", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambdas'),
      handler: "authorize.handler",
    });

    // User Pool
    // https://bobbyhadz.com/blog/aws-cdk-cognito-user-pool-example
    const userPool = new cognito.UserPool(this, "userpool", {
      userPoolName: "user-pool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        userRole: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lambdaTriggers: {
        postAuthentication: postAuthLambda
      }
    });
    // OPTIONALLY update Email sender for Cognito Emails
    // const cfnUserPool = userPool.node.defaultChild as cognito.CfnUserPool;
    // cfnUserPool.emailConfiguration = {
    //   emailSendingAccount: "DEVELOPER",
    //   replyToEmailAddress: "YOUR_EMAIL@example.com",
    //   sourceArn: `arn:aws:ses:YOUR_COGNITO_SES_REGION:${
    //     cdk.Stack.of(this).account
    //   }:identity/YOUR_EMAIL@example.com`,
    // };

    // User Pool Client attributes
    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...["country", "city", "userRole"]);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...["country", "city"]);

    // User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, "userpoolClient", {
      userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    this.cognitoUserPool = userPool;

    // Outputs
    new cdk.CfnOutput(this, "userPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
