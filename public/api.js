const button1 = document.getElementById('NeedToken');
button1.addEventListener('click', async fetchtoken => {
	const api_tok_url='getToken';
	const response_tok = await fetch(api_tok_url);
	const json_tok = await response_tok.json();
	//			console.log(json_tok.token);
	if (json_tok.token == "Failed") {
		document.getElementById("messages").innerHTML = `Failed to get token - check Credentials`;
	} else {
		document.getElementById("messages").innerHTML = `Got Token`;
		//UseToken = json_tok.token;
	} 			
})
			
const button2 = document.getElementById('DeleteOne');
button2.addEventListener('click', async getlist => {
	const targetBIGIP=document.getElementById("SelectDC").value;
	//if( typeof UseToken == 'undefined' ) {
	//	UseToken = "empty";
	//}
	//const data={"targetDC":`${targetBIGIP}`,"token":`${UseToken}`};
	const data={"targetDC":`${targetBIGIP}`};
	const api_app_url='deleteOne';
	const requestOptions = {
		method: 'POST',
		headers: {
   	    	'Content-Type': 'application/json'
    	},
    	body: JSON.stringify({data})
	};
	const response_app = await fetch(api_app_url,requestOptions);
	const json_app = await response_app.json();
	document.getElementById("messages").innerHTML = `Deleting service ${json_app.AppName} VIP address ${json_app.Virtual}`;
	console.log(json_app);
})

const button3 = document.getElementById('buildJSON');			
button3.addEventListener('click', async build => {
	const DomainName=document.getElementById("myName").value;
	const targetBIGIP=document.getElementById("SelectDC").value;
			
	if(DomainName == '') {
		document.getElementById("messages").innerHTML = `Enter Service Name`;
	} 
	else 
	{
		//if( typeof UseToken == 'undefined' ) {
		//	UseToken = "empty";
		//}
		//const data={"DomainName":`${DomainName}`,"targetDC":`${targetBIGIP}`,"token":`${UseToken}`};
		const data={"DomainName":`${DomainName}`,"targetDC":`${targetBIGIP}`};
		const api_app_url='buildJSON';
		const requestOptions = {
			method: 'POST',
			headers: {
            'Content-Type': 'application/json'
        	},
            body: JSON.stringify({data})
        };
        const response_app = await fetch(api_app_url,requestOptions);
        const json_app = await response_app.json();
		console.log(json_app);
		document.getElementById("messages").innerHTML = `Service status ${json_app.status} `;
	}
})

const button4 = document.getElementById('DeleteApp');
button4.addEventListener('click', async getlist => {
	const DomainName=document.getElementById("myName").value;
	const targetBIGIP=document.getElementById("SelectDC").value;
	//if( typeof UseToken == 'undefined' ) {
	//	UseToken = "empty";
	//}
	//const data={"targetDC":`${targetBIGIP}`,"token":`${UseToken}`};
	const data={"targetDC":`${targetBIGIP}`, "AppName":`${DomainName}`};
	const api_app_url='deleteApp';
	const requestOptions = {
		method: 'POST',
		headers: {
   	    	'Content-Type': 'application/json'
    	},
    	body: JSON.stringify({data})
	};
	const response_app = await fetch(api_app_url,requestOptions);
	const json_app = await response_app.json();
	document.getElementById("messages").innerHTML = `Deleting service ${json_app.AppName} VIP address ${json_app.Virtual}`;
	console.log(json_app);
})

const button5 = document.getElementById('TestTool');
button4.addEventListener('click', async fetchtest => {
	const api_tok_url='TestTool';
	const response_fetchtest = await fetch(api_tok_url);
	const json_test = await response_fetchtest.json();
	console.log(json_test);
    //UseToken = json_test.token;
})