const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));

app.get('/getToken', async (request, response ) => {
    // Simple POST request with a JSON body using fetch
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        //body: {"username":"admin", "password":"Br0ken-Arr0w","loginProviderName": "tmos"},
        //requestCert: true,
        //rejectUnauthorized: false,
        body: JSON.stringify({ 'username': 'admin', 'password': 'Br0ken-Arr0w', 'loginProviderName': 'tmos' })
    };
    console.log(requestOptions)
    const api_url = 'https://172.30.108.110/mgmt/shared/authn/login';
//  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//  before you run node
    const gotToken = await fetch(api_url,requestOptions);
    const json =await gotToken.json();
    const tokeninfo=json.token.token;
//    console.log(tokeninfo);
    const data = {
        token: tokeninfo
    }
//    console.log(data);
    response.json(data);
    //console.log(json);
});

app.get('/DeployApp/:UseToken', async (request, response ) => {
    // Simple POST request with a JSON body using fetch
    const AppTemplate = JSON.stringify({
        "class": "AS3",
        "action": "deploy",
        "persist": true,
            "declaration": {
              "class": "ADC",
              "schemaVersion": "3.12.0",
              "target": {
                "address": "172.30.107.15"
              },
              "RS2403": {
                "class": "Tenant",
                "App2service": {
                  "class": "Application",
                  "schemaOverlay": "SimpleHTTPSwithWAF",
                  "template": "https",
                  "serviceMain": {
                    "virtualAddresses": [
                      "10.103.12.14"
                    ],
                    "class": "Service_HTTPS"
                  },
                  "Pool": {
                    "members": [
                      {
                        "servicePort": 80,
                        "serverAddresses": [
                          "10.101.200.11%2403"
                        ]
                      }
                    ],
                    "class": "Pool"
                  },
                  "TLS_Server": {
                    "certificates": [
                      {
                        "certificate": "Certificate"
                      }
                    ],
                    "class": "TLS_Server"
                  },
                  "WAF_Policy": {
                    "class": "WAF_Policy"
                  },
                  "Certificate": {
                    "class": "Certificate"
                  },
                  "Analytics_Profile": {
                    "class": "Analytics_Profile"
                  }
                }
              }
          }
      });
    console.log(AppTemplate);
    const IQtoken = request.params.UseToken;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-F5-Auth-Token':IQtoken},
        //body: {"username":"admin", "password":"Br0ken-Arr0w","loginProviderName": "tmos"},
        //requestCert: true,
        //rejectUnauthorized: false,
        body: AppTemplate
    };
    console.log(requestOptions)
    const api_url = 'https://172.30.108.110/mgmt/shared/appsvcs/declare';
//  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//  before you run node
    const gotToken = await fetch(api_url,requestOptions);
    const json =await gotToken.json();
    //const tokeninfo=json.token.token;
//    console.log(tokeninfo);
    //const data = {
    //    token: tokeninfo
    //}
//    console.log(data);
    response.json(json);
    console.log(json);
});


