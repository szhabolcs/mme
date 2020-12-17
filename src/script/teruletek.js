$(document).ready(function(){

    /**
     * Visszaterity a proxy-tol a lekert adatot
     * @param {String} path proxy endpoint
     */
    function getData(path){
        let token;
        let response;

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
     * Checkbox-ok elkeszitese initkor
     */
    getData("/statisztika/teruletek-tipusonkent").done((response)=>{
        response.shift();
        for (let row of response) {
            $("#checkboxes").append(`
                <input name="tipus" class="form-check-input" type="checkbox" value="${row["tipusNev"]}" id="${row["tipusNev"]}">
                <label class="form-check-label" for="${row["tipusNev"]}">
                    ${row["tipusNev"]}
                </label>
                <br>
            `);
        }
    });

    function getTypes(){
        var tipusok = {};
        let muvelet = $('input[name="exampleRadios"]:checked').val();
        let ertek = $("#szam").val();

        return new Promise(resolve => { 
            getData(`/statisztika/teruletek-tipusonkent?${muvelet}=${ertek}`).done((response)=>{
                response.shift();
                tipusok = response;
                resolve(tipusok);
            });
        });
    }

    async function makeTable(){
        $("tbody").empty();

        var tipusokQuery = [];
        $('input[name="tipus"]:checked').each(function() {
            tipusokQuery.push(this.value);
        });

        getTypes().then((tipusok)=>{
            let i = 1;
            for (const row of tipusok) {
                if(tipusokQuery.includes(row["tipusNev"])){
                    $("tbody").append(`
                        <tr>
                            <th scope="row">${i++}</th>
                            <td>${row["tipusNev"]}</td>
                            <td>${row["teruletSzam"]}</td>
                        </tr>
                    `);
                }
            }
        });
    }

    makeTable();

    $(document).on("change", "input[type='checkbox'], input[type='radio'], input[type='text']", function() {
        makeTable();
    });
});