import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const primary_apprunner = new aws.apprunner.Service("primary-apprunner", {
    autoScalingConfigurationArn: "arn:aws:apprunner:us-east-1:179190112265:autoscalingconfiguration/DefaultConfiguration/1/00000000000000000000000000000001",
    healthCheckConfiguration: {
        interval: 10,
        protocol: "TCP",
        timeout: 5,
    },
    networkConfiguration: {
        egressConfiguration: {
            egressType: "DEFAULT",
        },
        ingressConfiguration: {
            isPubliclyAccessible: true,
        },
        ipAddressType: "IPV4",
    },
    observabilityConfiguration: {
        observabilityEnabled: false,
    },
    region: "us-east-1",
    serviceName: "multi-region-app-east",
    sourceConfiguration: {
        authenticationConfiguration: {
            connectionArn: "arn:aws:apprunner:us-east-1:179190112265:connection/github-connection-east/8d02d1204f654b9daf297c6bf6d4f1ac",
        },
        codeRepository: {
            codeConfiguration: {
                codeConfigurationValues: {
                    buildCommand: "npm install",
                    runtime: "NODEJS_22",
                    startCommand: "npm start",
                },
                configurationSource: "API",
            },
            repositoryUrl: "https://github.com/purip586/multi-region-app",
            sourceCodeVersion: {
                type: "BRANCH",
                value: "main",
            },
            sourceDirectory: "/",
        },
    },
}, {
    protect: true,
});


const secondary_apprunner = new aws.apprunner.Service("secondary-apprunner", {
    autoScalingConfigurationArn: "arn:aws:apprunner:us-west-2:179190112265:autoscalingconfiguration/DefaultConfiguration/1/00000000000000000000000000000001",
    healthCheckConfiguration: {
        interval: 10,
        protocol: "TCP",
        timeout: 5,
    },
    networkConfiguration: {
        egressConfiguration: {
            egressType: "DEFAULT",
        },
        ingressConfiguration: {
            isPubliclyAccessible: true,
        },
        ipAddressType: "IPV4",
    },
    observabilityConfiguration: {
        observabilityEnabled: false,
    },
    region: "us-west-2",
    serviceName: "multi-region-app-west",
    sourceConfiguration: {
        authenticationConfiguration: {
            connectionArn: "arn:aws:apprunner:us-west-2:179190112265:connection/github-connection-west/a7bc3f855faa4a86a8489ea9fa01c503",
        },
        codeRepository: {
            codeConfiguration: {
                codeConfigurationValues: {
                    buildCommand: "npm install",
                    runtime: "NODEJS_22",
                    startCommand: "npm start",
                },
                configurationSource: "API",
            },
            repositoryUrl: "https://github.com/purip586/multi-region-app",
            sourceCodeVersion: {
                type: "BRANCH",
                value: "main",
            },
            sourceDirectory: "/",
        },
    },
}, {
    protect: true,
});


const main_cdn = new aws.cloudfront.Distribution("main-cdn", {
    defaultCacheBehavior: {
        allowedMethods: [
            "GET",
            "HEAD",
            "OPTIONS",
        ],
        cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        cachedMethods: [
            "GET",
            "HEAD",
        ],
        compress: true,
        originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac",
        responseHeadersPolicyId: "60669652-455b-4ae9-85a4-c4c02393f86c",
        targetOriginId: "failover-group",
        viewerProtocolPolicy: "https-only",
    },
    enabled: true,
    httpVersion: "http2",
    isIpv6Enabled: true,
    originGroups: [{
        failoverCriteria: {
            statusCodes: [
                404,
                500,
                502,
                503,
                504,
            ],
        },
        members: [
            {
                originId: "4znmf7vdki.us-east-1.awsapprunner.com-mkym6calkzg",
            },
            {
                originId: "secondary-us-west-2",
            },
        ],
        originId: "failover-group",
    }],
    origins: [
        {
            customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                ipAddressType: "ipv4",
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"],
            },
            domainName: "4znmf7vdki.us-east-1.awsapprunner.com",
            originId: "4znmf7vdki.us-east-1.awsapprunner.com-mkym6calkzg",
        },
        {
            customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                ipAddressType: "ipv4",
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"],
            },
            domainName: "ntjur29q8m.us-west-2.awsapprunner.com",
            originId: "secondary-us-west-2",
        },
    ],
    priceClass: "PriceClass_All",
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    tags: {
        Name: "primary-us-east-1",
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
        minimumProtocolVersion: "TLSv1",
    },
    webAclId: "arn:aws:wafv2:us-east-1:179190112265:global/webacl/CreatedByCloudFront-c5c7dcaf/a2b785cd-ea9e-4157-8ae6-97bb7654418b",
}, {
    protect: true,
});

import * as gcp from "@pulumi/gcp";

const gcp_cloudrun = new gcp.cloudrun.Service("gcp-cloudrun", {
    location: "us-central1",
    metadata: {
        namespace: "multi-cloud-dr-485812",
    },
    name: "multi-region-app",
    project: "multi-cloud-dr-485812",
    template: {
        metadata: {
            annotations: {
                "autoscaling.knative.dev/maxScale": "3",
                "run.googleapis.com/client-name": "gcloud",
                "run.googleapis.com/client-version": "554.0.0",
                "run.googleapis.com/startup-cpu-boost": "true",
            },
            labels: {
                "client.knative.dev/nonce": "hcuinsevnw",
                "run.googleapis.com/startupProbeType": "Default",
            },
        },
        spec: {
            containerConcurrency: 80,
            containers: [{
                image: "us-central1-docker.pkg.dev/multi-cloud-dr-485812/cloud-run-source-deploy/multi-region-app@sha256:b700f5a85c6775f8a8b0b3e6ae0103bfdd03fc219b1b8bf43752e793cf1694fa",
                ports: [{
                    containerPort: 8080,
                    name: "http1",
                }],
                resources: {
                    limits: {
                        cpu: "1000m",
                        memory: "512Mi",
                    },
                },
                startupProbe: {
                    failureThreshold: 1,
                    periodSeconds: 240,
                    tcpSocket: {
                        port: 8080,
                    },
                    timeoutSeconds: 240,
                },
            }],
            serviceAccountName: "713062702643-compute@developer.gserviceaccount.com",
            timeoutSeconds: 300,
        },
    },
    traffics: [{
        latestRevision: true,
        percent: 100,
    }],
}, {
    protect: true,
});