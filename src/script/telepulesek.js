const CARDHTML = '<div class="row telepules-card"> <div class="col-4" style="height: 190px;padding-left: 0px;"> <iframe frameborder="0" style="border:0" allowfullscreen></iframe> </div><div class="col-8"> <h2 class="telepules-card-nev">Aba</h2> <p>Megye:</p><span class="telepules-card-megye">Fejér</span> <p style="margin-top: 5px;">Területek:</p><div class="telepules-card-teruletek"></div><div class="telepules-card-edit" style="cursor: pointer; color: white;height: 47px;width: 47px;position: absolute;bottom: 5px;padding: 10px;right: 5px;background: #28767e;border-radius: 100%;"> <svg style="height: 24px;transform: translate(2px, 0px);" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pencil-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-pencil-alt fa-w-16 fa-3x"><path fill="currentColor" d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z" class=""></path></svg> </div></div></div>';

$(document).ready(function(){
    var pageStart = 1, pageEnd = 5, pageMax, order;
    var searchTerms = [];

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
     * Autocomplete tipusok az input szureshez
     */
    async function initTipusok(){
        var response;
        var src = {};

        await getData(`/telepulesek?with-column=megyeNev;telepulesek.telepulesID&order=${order}${megye}`).done((e)=>{
            response = e;
        });

        response.shift();

        for(let i = 0; i < response.length; i++){
            nev = response[i]["telepulesNev"];
            src[nev] = nev;
        }

        $("#search").autocomplete({
            source: src,
            onSelectItem: onSelectItem,
            highlightClass: 'text-danger',
            treshold: 0,
            maximumItems: 10
        });
    }
    function onSelectItem(item, element) {
        if($(`#${item.value}`).length === 0)
            $('#search-output').append(`<span class="search-pill" id="${item.value}">${item.value}</span>`);
        
        searchTerms.push(item.value);

        makeCards(pageStart, pageEnd);
    }
    $("#search-output").delegate(".search-pill","click",(e)=>{
        $(e.target).remove();

        const index = searchTerms.indexOf(e.target.id);
        if (index > -1) {
            searchTerms.splice(index, 1);
        }

        makeCards(pageStart, pageEnd);
    });


    /**
     * Megyek lekerese a select szureshez
     */
    getData("/megyek").done((response)=>{
        response.shift();
        for (const megye of response) {
            $("#megye").append(`<option value="${megye["megyeNev"]}">${megye["megyeNev"]}</option>`);
        }
    });
    
    /**
     * Telepulesek kartya generalasa
     */
    function makeCard(nev, megye){
        var src = `https://www.google.com/maps/embed/v1/search?q=${nev}%2C%20Hungary&key=AIzaSyB6btLkafvHWbSOQwL8c-awc3ajYgkmzhE`;
        var card = $(CARDHTML);
        var teruletek = [];

        card.find(".telepules-card-nev").text(nev);
        card.find(".telepules-card-megye").text(megye);
        card.find("iframe").attr("src",src);

        return card;
    }

    /**
     * Telepulesek kartyak listazasa
     * @param {int} start megjelenites kezdete
     * @param {int} end megjelenites vege
     */
    async function makeCards(start = 1, end = 5){
        var response;
        order = $("#rendezes").find("option:selected").attr("value");
        megye = $("#megye").find("option:selected").attr("value");

        if(megye == "osszes"){
            megye = "";
        }
        else{
            megye = "&megyeNev=" + megye;
        }

        $("#card-box").empty();

        await getData(`/telepulesek?with-column=megyeNev;telepulesek.telepulesID&order=${order}${megye}`).done((e)=>{
            response = e;
            pageMax = e[0]["rows"];
        });

        i = start;

        if(searchTerms.length == 0)
            for (i; i <= end; i++) {
                var card = makeCard(response[i]["telepulesNev"], response[i]["megyeNev"]);

                await getData(`/telepules/${response[i]["telepulesID"]}/teruletek`).done((response)=>{
                    
                    for (let i = 1; (i <= response.length - 1) && (i <= 3); i++) {
                        card.find(".telepules-card-teruletek").append(`<span class="telepules-card-terulet">${response[i]["teruletNeve"]}</span>`);
                    }

                    if(response.length - 1 > 3)
                        card.find(".telepules-card-teruletek").append(`<span class="telepules-card-terulet">És még ${response.length-4} más.</span>`);
                });

                $("#card-box").append(card).hide().fadeIn(500);
            }
        else
        for (i = 1; i <= pageMax; i++) {
            if(searchTerms.includes(response[i]["telepulesNev"])){
                var card = makeCard(response[i]["telepulesNev"], response[i]["megyeNev"]);

                await getData(`/telepules/${response[i]["telepulesID"]}/teruletek`).done((response)=>{
                    
                    for (let i = 1; (i <= response.length - 1) && (i <= 3); i++) {
                        card.find(".telepules-card-teruletek").append(`<span class="telepules-card-terulet">${response[i]["teruletNeve"]}</span>`);
                    }

                    if(response.length - 1 > 3)
                        card.find(".telepules-card-teruletek").append(`<span class="telepules-card-terulet">És még ${response.length-4} más.</span>`);
                });

                $("#card-box").append(card).hide().fadeIn(500);
            }
        }
    }


    // Inicializalasi meghivasok
    makeCards();
    initTipusok();


    // Event listenerek
    $("#rendezes").on("change", (e) => {
        pageStart = 1;
        pageEnd = 5;

        makeCards(pageStart, pageEnd);
    });

    $("#megye").on("change", (e) => {
        pageStart = 1;
        pageEnd = 5;

        makeCards(pageStart, pageEnd);
    });

    $("#next-btn").click(()=>{
        if(pageEnd + 5 <= pageMax + 5){
            pageStart += 5;
            pageEnd += 5;

            makeCards(pageStart, pageEnd);
        }
        else{
            alert("Nincs tobb oldal!");
        }
    });

    $("#prev-btn").click(()=>{
        if(0 <= pageStart - 5){
            pageStart -= 5;
            pageEnd -= 5;

            makeCards(pageStart, pageEnd);
        }
        else{
            alert("Nincs elöző oldal!");
        }
    });
});