const express = require('express');
const fetch = require('node-fetch');
const Datastore = require('nedb');
//const atastore = require('nedb-async')
//const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

var NewTenantName;
var VIP;
var ID;
var RouteDomain;

const database = new Datastore('database.db');
database.loadDatabase();
database.persistence.setAutocompactionInterval(10000);
//database.insert({RouteDomain:'RD2410',Virtual:'10.103.12.10',targetBIGIP:'172.30.107.15',AppName:'blank'});
//database.insert({RouteDomain:'RD2411',Virtual:'10.103.12.11',targetBIGIP:'172.30.107.15',AppName:'blank'});

//const database = new atastore({filename: 'database.db',autoload: true})
//Initialise the database - can be commented, once run
//var i;
//for (i = 0; i < 200; i++) {
//  const RD1 = 2400 + i;
//  const RD2 = 2600 + i;
//  const IP = 10 +i;
//  //text += iu + "<br>";
//  database.insert({RouteDomain:`RD${RD1}`,Virtual:`10.103.12.${IP}`,targetBIGIP:'172.30.107.15',AppName:'blank'});
//  database.insert({RouteDomain:`RD${RD2}`,Virtual:`10.103.14.${IP}`,targetBIGIP:'172.30.107.14',AppName:'blank'});
  //console.log(i,RD,IP);
//}
//app.use(bodyParser.urlencoded({
//  extended: true
//}))
//app.use(bodyParser.json());


app.get('/getToken', async (request, response ) => {
    // Simple POST request with a JSON body using fetch
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 'username': 'admin', 'password': 'Br0ken-Arr0w', 'loginProviderName': 'tmos' })
    };
    console.log(requestOptions)
    const api_url = 'https://172.30.108.110/mgmt/shared/authn/login';
//    Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//    before you run node
    const gotToken = await fetch(api_url,requestOptions);
    const json =await gotToken.json();
    const tokeninfo=json.token.token;
//    console.log(tokeninfo);
    const data = {
        token: tokeninfo
    }
//    console.log(data);
    response.json(data);
//    console.log(json);
});

app.get('/DeployApp/:UseToken', async (request, response ) => {
    // Simple POST request with a JSON body using fetch
    const AppTemplate = {
      "applicationName":"NewApp_val",
      "appSvcsDeclaration": {
        "class": "AS3",
        "action": "deploy",
        "persist": true,
            "declaration": {
              "class": "ADC",
              "schemaVersion": "3.12.0",
              "target": {
                "address": "1.1.1.1_val"
              },
              "TenantID_val": {
                "class": "Tenant",
                "NewAppService_val": {
                  "class": "Application",
                  "schemaOverlay": "SimpleHTTPSwithWAF",
                  "template": "https",
                  "serviceMain": {
                    "virtualAddresses": [
                      "2.2.2.2_val"
                    ],
                    "class": "Service_HTTPS"
                  },
                  "Pool": {
                    "members": [
                      {
                        "servicePort": 80,
                        "serverAddresses": [
                          "3.3.3.3%RD_val"
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
        }
      };
      const LogView=AppTemplate;
      console.log("OriginalTemplate",LogView);
    
      const NewApp="NewApp";
      const BIGIP="172.30.107.15";
      const VIP="10.103.12.5";
      const NewAppName=`${NewApp}service`;
      const NewTenantName=`RD2406`;
      const ServerList=[ '10.101.200.11%2403','10.101.200.12%2403','10.101.200.13%2403'];
      AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.Pool.members[0].serverAddresses=ServerList;
      AppTemplate.applicationName=`${NewApp}`;
      AppTemplate.appSvcsDeclaration.declaration.target={"address": `${BIGIP}`};
      AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.serviceMain.virtualAddresses=[`${VIP}`];
      AppTemplate.appSvcsDeclaration.declaration.TenantID_val[NewAppName]=AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
      delete AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
      AppTemplate.appSvcsDeclaration.declaration[NewTenantName]=AppTemplate.appSvcsDeclaration.declaration.TenantID_val;
      delete AppTemplate.appSvcsDeclaration.declaration.TenantID_val;
    
      console.log("Compare with original Template",JSON.stringify(LogView,null,4));
        console.log(AppTemplate);
   
    const IQtoken = request.params.UseToken;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-F5-Auth-Token':IQtoken},
        body: AppTemplate
    };
    console.log(requestOptions)
    const api_url = 'https://172.30.108.110/mgmt/cm/global/tasks/deploy-to-application';
    //const api_url = 'https://172.30.108.110/mgmt/shared/appsvcs/declare';
//  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//  before you run node
    const gotToken = await fetch(api_url,requestOptions);
    const json =await gotToken.json();
    response.json(json);
    console.log(json);
});

app.post('/buildJSON', (request, response ) => {
  // Simple POST request with a JSON body using fetch
//  const requestOptions = {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json'},
//      body: JSON.stringify({ 'username': 'admin', 'password': 'Br0ken-Arr0w', 'loginProviderName': 'tmos' })
//  };
//  console.log(requestOptions)
//  const api_url = 'https://172.30.108.110/mgmt/shared/authn/login';
  console.log("Inserted Parameters",request.body);
  const NewApp=request.body.data.DomainName;
  const BIGIP=request.body.data.targetDC;
  const RecToken=request.body.data.token;

  database.findOne({ targetBIGIP: `${BIGIP}`, AppName: 'blank' }, async function (err, docs) {
    //console.log("database=",docs);
    NewTenantName= await docs.RouteDomain;
    //console.log("NewTenantName=",NewTenantName);
    VIP= await docs.Virtual;
    console.log("VIP=",VIP);
    RouteDomain= await docs.RouteDomain;
    ID=await docs._id;
    console.log("ID=",ID);
    database.update({ _id: `${ID}`},{ $set: { AppName: `${NewApp}`}});
//    Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//    before you run node
//  const gotToken = await fetch(api_url,requestOptions);
//  const json =await gotToken.json();
const AppTemplate = {
  "applicationName":"NewApp_val",
  "appSvcsDeclaration": {
    "class": "AS3",
    "action": "deploy",
    "persist": true,
        "declaration": {
          "class": "ADC",
          "schemaVersion": "3.12.0",
          "target": {
            "address": "1.1.1.1_val"
          },
          "TenantID_val": {
            "class": "Tenant",
            "NewAppService_val": {
              "class": "Application",
              "schemaOverlay": "SimpleHTTPSwithWAF",
              "template": "https",
              "serviceMain": {
                "virtualAddresses": [
                  "2.2.2.2_val"
                ],
                "class": "Service_HTTPS"
              },
              "Pool": {
                "members": [
                  {
                    "servicePort": 80,
                    "serverAddresses": [
                      "3.3.3.3%RD_val"
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
    }
  };
  const LogView=AppTemplate;
//  console.log("OriginalTemplate",LogView);


  console.log("VIP=",VIP);
  const NewAppName=`${NewApp}service`;
  const RD = RouteDomain.split("RD")
  const ServerList=[ `10.101.200.11%${RD[1]}`,`10.101.200.12%${RD[1]}`,`10.101.200.13%${RD[1]}`];
  AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.Pool.members[0].serverAddresses=ServerList;
  AppTemplate.applicationName=`${NewApp}`;
  AppTemplate.appSvcsDeclaration.declaration.target={"address": `${BIGIP}`};
  AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.serviceMain.virtualAddresses=[`${VIP}`];
  AppTemplate.appSvcsDeclaration.declaration.TenantID_val[NewAppName]=AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
  delete AppTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
  AppTemplate.appSvcsDeclaration.declaration[NewTenantName]=AppTemplate.appSvcsDeclaration.declaration.TenantID_val;
  delete AppTemplate.appSvcsDeclaration.declaration.TenantID_val;

//  console.log("Compare with original Template",JSON.stringify(LogView,null,4));

//  const data = {
//      applicationName: tokeninfo
//  }
//  console.log(data);
const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-F5-Auth-Token': `${RecToken}`},
  body: JSON.stringify(AppTemplate)
};
//console.log(requestOptions)
const api_url = 'https://172.30.108.110/mgmt/cm/global/tasks/deploy-to-application';
//const api_url = 'https://172.30.108.110/mgmt/shared/appsvcs/declare';
//  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
//  before you run node
const gotToken = await fetch(api_url,requestOptions);
const json =await gotToken.json();
console.log(json)
response.json(AppTemplate);
});


  
});
