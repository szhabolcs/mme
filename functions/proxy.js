exports.handler = async (event, context) => {
    const {identity, user} = context.clientContext;

    let userRole;

    if(typeof(user) === 'undefined'){
        //Guest logged in
        userRole = "guest";
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in
        userRole = "admin";
    }

    return { statusCode: 200, body: JSON.stringify({ msg: `Hello ${userRole}`,data:context.clientContex }) }
}