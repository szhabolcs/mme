$(document).ready(function(){
    netlifyIdentity.setLocale('hu');

    /**
     * Visszaterity a proxy-tol a lekert adatot
     * @param {String} path proxy endpoint
     */
    function getData(path){
        let token;
        let response

        if(netlifyIdentity.currentUser() != null){
            token = netlifyIdentity.currentUser().token.access_token; 
        }
        else token = "";

        return $.ajax({
            type: "get",
            url: "/.netlify/functions/proxy"+path,
            headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            complete: (e) =>{
                response = JSON.parse(e.responseText);
            }
        });
    }

    /**
     * Megyek szamanak lekerese
     */
    getData("/megyek").done((response)=>{
        $("#megye").text(response[0]["rows"]);
    });
    
    /**
     * Telepulesek szamanak lekerese
     */
    getData("/statisztika/telepulesek-szama").done((response)=>{
        $("#telepules").text(response[1]["telepulesSzam"]);
    });

    /**
     * Teruletek szamanak lekerese
     * Es elso harom terulet kilistazasa
     */
    getData("/statisztika/teruletek-tipusonkent").done((response)=>{
        let teruletOssz = 0;
        response.shift();
        for (let row of response) {
            teruletOssz += parseInt(row["teruletSzam"]);
        }

        $("#terulet").text(teruletOssz);
        
        $("#mennyiseg-1").text(response[0]["teruletSzam"]);
        $("#mennyiseg-nev-1").text(response[0]["tipusNev"]);

        $("#mennyiseg-2").text(response[1]["teruletSzam"]);
        $("#mennyiseg-nev-2").text(response[1]["tipusNev"]);

        $("#mennyiseg-3").text(response[2]["teruletSzam"]);
        $("#mennyiseg-nev-3").text(response[2]["tipusNev"]);
    });
});