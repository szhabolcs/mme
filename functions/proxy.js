const { env } = require('yargs');

exports.handler = async (event, context) => {
    const {identity, user} = context.clientContext;
    const axios = require('axios').default;

    let userRole;
    let response = {data: "not logged in"};

    const MASTERPASS = process.env.MASTERPASS;
    
    if(typeof(user) === "undefined"){
        //Guest logged in
        userRole = "guest";
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in
        userRole = "admin";

        await axios.get("http://localhost/school/mme/api/telepulesek").then((e)=>{
            response = e;
        })
        .catch((error)=>{
            response = error;
        });

        console.log(response);
    }

    return { statusCode: 200, body: JSON.stringify(response.data) }
}