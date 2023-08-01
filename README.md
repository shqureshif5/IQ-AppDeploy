# IQ-AppDeploy
This PoC was to showcase that a Generic Automation tool could be used to send REST-API calls to the BIG-IP estate for application deployments via BIG-IQ.

A number of assumptions were made

. A simple Web Tool was created in javascript to allow an App to be deployed in one of two Data-Centres

. Declarative Onboarding was out of scope - it was assumed that all the BIG-IPs have been provisioned

. All communication was initiated using the Web-Tool towards BIG-IQ using REST-API & AS3, which would then provision services on the BIG-IPs

. Applications were deployed on BIG-IPs configured in HA

. The AS3 declarations encompassed GSLB/LTM/WAF


