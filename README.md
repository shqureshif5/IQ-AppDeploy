# IQ-AppDeploy
This PoC was to showcase that a Generic Automation tool could be used to send REST-API calls to the BIG-IP estate for application deployments via BIG-IQ.

A number of assumptions were made

. A simple Web Tool was created in javascript to allow an App to be deployed in one of two Data-Centres

. Declarative Onboarding was out of scope - it was assumed that all the BIG-IPs have been provisioned

. All communication was initiated using the Web-Tool towards BIG-IQ using REST-API & AS3, which would then provision services on the BIG-IPs

. Applications were deployed on BIG-IPs configured in HA

. The AS3 declarations encompassed GSLB/LTM/WAF

The json templates that are used by BIG-IQ have been modified to highlight the fields to be replaced by the 'source of truth'. Every 'X_val' within the json templates needs to be replaced with the correct information for BIG-IQ to deploy the App on the target BIG-IP.

You can initiate the deployment of an application by one of two ways.

 --------     ----------     --------     --------
| Script |-->|API Portal|-->| BIG-IQ |-->| BIG-IP |
 --------     ----------     --------     --------
Or
 ---------     ----------     --------     --------
| Browser |-->|Web Portal|-->| BIG-IQ |-->| BIG-IP |
 ---------     ----------     --------     --------

The above example script could then be run as recursively to create a number of Applications
i.e 
 for i in {1..99}; do ./<ScriptName>.sh 172.30.107.14 dcaTestApp$i; ./<ScriptName.sh> 172.30.107.16 dcbTestApp$i; sleep 25; done




 
