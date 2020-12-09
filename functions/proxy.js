exports.handler = async (event, context) => {
    const {identity, user} = context.clientContext;
    const axios = require('axios').default;

    let userRole;
    let response = {data: "not logged in"};

    const MASTERPASS = process.env.MASTERPASS;
    const APIENDPOINT = process.env.APIENDPOINT;
    
    if(typeof(user) === "undefined"){
        //Guest logged in
        userRole = "guest";
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in
        userRole = "admin";
        
        await axios.get(APIENDPOINT+"/telepulesek",{
            params: {
                MASTERPASS: MASTERPASS
            }
        }).then((e)=>{
            response = e;
        })
        .catch((error)=>{
            response = error;
        });
    }

    return { statusCode: 200, body: JSON.stringify(response.data) }
}