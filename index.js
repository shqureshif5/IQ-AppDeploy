const express = require('express');
const fetch = require('node-fetch');
const Datastore = require('nedb');
const fs = require('fs');
const { exec } = require("child_process");
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
var ActiveToken;
var RefreshToken;

const database = new Datastore('database.db');
database.loadDatabase();
database.persistence.setAutocompactionInterval(10000);

//##Next two lines simply test insert data into DB
//database.insert({RouteDomain:'RD2410',Virtual:'10.103.12.10',targetBIGIP:'172.30.107.15',AppName:'blank'});
//database.insert({RouteDomain:'RD2411',Virtual:'10.103.12.11',targetBIGIP:'172.30.107.15',AppName:'blank'});

//##This will re-initialise the database, recommend clearing the DB before uncommenting and running
//Initialise the database - can be commented, once run
//var i;
//for (i = 0; i < 200; i++) {
//  const RD1 = 2400 + i;
//  const RD2 = 2600 + i;
//  const IP = 10 +i;
//  database.insert({RouteDomain:`RD${RD1}`,Virtual:`10.103.12.${IP}`,targetBIGIP:'172.30.107.15',AppName:'blank'});
//  database.insert({RouteDomain:`RD${RD2}`,Virtual:`10.103.14.${IP}`,targetBIGIP:'172.30.107.14',AppName:'blank'});
//  //console.log(i,RD,IP);
//}

async function refreshToken () {
//  try {
    //const testJSON = JSON.parse({ 'refreshToken': { 'token': `${currentToken}`} });
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ 'refreshToken': { 'token': `${RefreshToken}` } })
    }
    console.log("FRom refresh=",JSON.stringify(requestOptions));
    const api_url = 'https://172.30.108.110/mgmt/shared/authn/exchange'
    const gotToken = await fetch(api_url,requestOptions);
//    if (gotToken.status == 200) {
      const json = await gotToken.json();
      //newToken = await json.token.token;
      console.log("newToken=",json.token.token);
      return await json.token.token;
//    } else {
      //throw "error";
//      console.log("Thrown an error 56",gotToken.status);
//      throw new Error("Bad login");
//    }
//  } catch {
    //console.log(err);
//    const prob = "Failed"
//   return prob;
//  }
}

//Get token from IQ, basd on your user credentials - this should be parsed in at sign in to App, but for now is hard-coded.
app.get('/getToken', async (request, response ) => {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 'username': 'admin', 'password': 'Br0ken-Arr0w', 'loginProviderName': 'tmos' })
    };
    console.log("FRom refresh=",JSON.stringify(requestOptions)); 
    // Simple POST request with a JSON body using fetch
  
    //console.log(requestOptions)
    const api_url = 'https://172.30.108.110/mgmt/shared/authn/login';
    //Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
    //before you run node
    const gotToken = await fetch(api_url,requestOptions);
    
    if (gotToken.status == 200) {
      const json = await gotToken.json();
      ActiveToken = json.token.token;
      RefreshToken = json.refreshToken.token;
      const data = {
        token: ActiveToken
      }
      //console.log(data);
      response.json(data);
    } else {
      //throw "error";
      throw new Error("Bad login");
    }
  } catch (err) {
    //console.log(err);
    const prob = { token: "Failed" }
    response.json(prob);
  }
});

//This will delete the first entry it finds
app.post('/deleteOne', (request ,response ) => {
  console.log(request.body.data);
  const BIGIP = request.body.data.targetDC;
  const RecToken = refreshToken();
  if (RecToken == "Failed") {
    //throw error
    throw new Error("Bad login");
  } else {
    console.log("ActiveToken=",ActiveToken,"ReckToken=",RecToken);
    ActiveToken = RecToken;
    console.log("ActiveToken=",ActiveToken,"ReckToken=",RecToken);
  }
  //const RecToken=request.body.data.token;


  database.findOne({ targetBIGIP: `${BIGIP}`, AppName: {$ne: "blank"} }, async function (err, docs) {
    console.log("DBresult=",docs);
    if (docs = null) {
    NewTenantName = await docs.RouteDomain;
    AppName = await docs.AppName;
    targetBIGIP = await docs.targetBIGIP;
    ID = await docs._id;
    fs.readFile(('./deleteTemplate.json'), async (err, ImportTemplate) => {
      const deleteTemplate = JSON.parse(ImportTemplate);
      deleteTemplate.applicationName=`${AppName}`;
      deleteTemplate.appSvcsDeclaration.declaration.target={"address": `${targetBIGIP}`};
      deleteTemplate.appSvcsDeclaration.declaration[NewTenantName]=deleteTemplate.appSvcsDeclaration.declaration.TenantID_val;
      delete deleteTemplate.appSvcsDeclaration.declaration.TenantID_val;
      exec(`./remEntryOnDNS.sh ${AppName}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            //return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            //return;
        }
        console.log(`stdout: ${stdout}`);
      })
      
      let RecToken = refreshToken(RefreshToken);
      ActiveToken = await (RecToken);
      //const TestToken = "test";
      console.log("ActiveToken=",ActiveToken,"ReckToken=",RecToken)

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-F5-Auth-Token': `${ActiveToken}`},
        body: JSON.stringify(deleteTemplate)
      };
//      console.log(requestOptions)
      const api_url = 'https://172.30.108.110/mgmt/cm/global/tasks/deploy-to-application';
      //  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
      //  before you run node
      const gotIQresponse = await fetch(api_url,requestOptions);
      const json =await gotIQresponse.json();
      console.log(json)
      //response.json(json);
    });
    database.update({ _id: `${ID}`},{ $set: { AppName: "blank"}});
    console.log(docs);
    response.json(docs);
    } else {
      response.json({AppName:"Empty",Virtual:"Empty"});
    }
  });
});

//This will build the AS3 template and execute on IQ to deploy the WAF template
app.post('/buildJSON', (request, response ) => {
  //    Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
  //    before you run node

  // Simple POST request with a JSON body using fetch
  fs.readFile(('./appTemplate.json'), (err, ImportTemplate) => {
    const AppTemplate = JSON.parse(ImportTemplate);
    console.log(request.body);
    const NewApp=request.body.data.DomainName;
    const BIGIP=request.body.data.targetDC;


//    if (RecToken == "Failed") {
      //throw error
//      throw new Error("Bad login");
//    } else {
//      console.log("ActiveToken=",ActiveToken,"ReckToken=",RecToken)
//      ActiveToken = RecToken;
//    }
    //const RecToken=request.body.data.token;
  
    //Find first available entry to use 
    database.findOne({ targetBIGIP: `${BIGIP}`, AppName: 'blank' }, async function (err, docs) {
//      console.log("database=",docs);
      NewTenantName= await docs.RouteDomain;
//      console.log("NewTenantName=",NewTenantName);
      VIP = await docs.Virtual;
//      console.log("VIP=",VIP);
      RouteDomain= await docs.RouteDomain;
      ID = await docs._id;
//      console.log("ID=",ID);

      let RecToken = refreshToken(RefreshToken);
      ActiveToken = await (RecToken);
      //const TestToken = "test";
      console.log("ActiveToken=",ActiveToken,"ReckToken=",RecToken)


      const LogView=AppTemplate;
//      console.log("OriginalTemplate",JSON.stringify(LogView,null,4));

      //Modify default AS3 template
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

//      console.log("Compare with original Template",JSON.stringify(LogView,null,4));
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-F5-Auth-Token': `${ActiveToken}`},
        body: JSON.stringify(AppTemplate)
      };
//      console.log(requestOptions)
      const api_url = 'https://172.30.108.110/mgmt/cm/global/tasks/deploy-to-application';
      //  Make sure at the bash shell you run 'export NODE_TLS_REJECT_UNAUTHORIZED=0'
      //  before you run node
      const gotIQresponse = await fetch(api_url,requestOptions);
      const json =await gotIQresponse.json();
      if (json.status == "STARTED") {
        exec(`./addEntryToDNS.sh ${NewApp} ${VIP}`, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              //return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              //return;
          }
          console.log(`stdout: ${stdout}`);
        })
        database.update({ _id: `${ID}`},{ $set: { AppName: `${NewApp}`}});
      }
      console.log(json)
      response.json(json);
    });
  });  
});

//Just used for testing code
app.get('/TestTool', async ( request, response ) => {
  exec("ls -la", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
})

//  fs.readFile(('./appTemplate.json'), (err, ImportTemplate) => {
//    const ReadTemplate = JSON.parse(ImportTemplate);
//    // Simple POST request with a JSON body using fetch
//    console.log("OriginalReadTemplate",ReadTemplate);    
//    const NewApp="NewApp";
//    const BIGIP="172.30.107.15";
//    const VIP="10.103.12.5";
//    const NewAppName="TEST-READ";
//    const NewTenantName=`RD2406`;
//    const ServerList=[ '10.101.200.11%2405','10.101.200.12%2403','10.101.200.13%2403'];
//    ReadTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.Pool.members[0].serverAddresses=ServerList;
//    ReadTemplate.applicationName="TEST_READ_APP_NAME";
//    ReadTemplate.appSvcsDeclaration.declaration.target={"address": "TEST_READ_BIGIP"};
//    ReadTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val.serviceMain.virtualAddresses=["TEST_READ_BIGIP"];
//    ReadTemplate.appSvcsDeclaration.declaration.TenantID_val[NewAppName]=ReadTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
//    delete ReadTemplate.appSvcsDeclaration.declaration.TenantID_val.NewAppService_val;
//    ReadTemplate.appSvcsDeclaration.declaration[NewTenantName]=ReadTemplate.appSvcsDeclaration.declaration.TenantID_val;
//    delete ReadTemplate.appSvcsDeclaration.declaration.TenantID_val;
//    console.log("From read file",JSON.stringify(ReadTemplate,null,4));
//    response.json(ReadTemplate);
//  })
});
