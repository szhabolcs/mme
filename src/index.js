$(document).ready(function(){
    /**
     * Fetch proxy 
     */
    $("#button").click(()=>{
        let token;

        if(netlifyIdentity.currentUser() != null){
            token = netlifyIdentity.currentUser().token.access_token; 
        }
        else token = "";

        $.ajax({
            type: "delete",
            url: "/.netlify/functions/proxy/telepules/332",
            headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            complete: (response) =>{
                let data = JSON.parse(response.responseText);
                console.log(data);
            }
        });
    });
});