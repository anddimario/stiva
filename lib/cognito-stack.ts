import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";
import { StackProps } from "aws-cdk-lib";

interface CognitoStackProps extends StackProps {
  subDomainCognito: string | null;
}

export class CognitoStack extends cdk.Stack {
  public readonly cognitoUserPool: cognito.UserPool;
  public readonly cognitoUserPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.App, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { subDomainCognito } = props;

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
    });

    if (subDomainCognito) {
      userPool.addDomain("CognitoDomain", {
        cognitoDomain: {
          domainPrefix: subDomainCognito,
        },
      });
    }
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
        userPassword: true
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    this.cognitoUserPool = userPool;
    this.cognitoUserPoolClient = userPoolClient;

    // Groups
    // https://docs.aws.amazon.com/cdk/api/v2//docs/aws-cdk-lib.aws_cognito.CfnUserPoolGroup.html
    new cognito.CfnUserPoolGroup(this, 'adminUserPoolGroup', {
      userPoolId: userPool.userPoolId,
      description: 'Admin group',
      groupName: 'admin',
      precedence: 0,
    });
    new cognito.CfnUserPoolGroup(this, "userUserPoolGroup", {
      userPoolId: userPool.userPoolId,
      description: "User group",
      groupName: "user",
      precedence: 100,
    });

    // Outputs
    new cdk.CfnOutput(this, "userPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "userPoolCognitoDomain", {
      value: `https://${subDomainCognito}.auth.${props?.env?.region}.amazoncognito.com`,
    });
  }
}
