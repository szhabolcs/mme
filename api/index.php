<?php

    /**
     * Checking if the environment is local or server
     * because the server doesn't support .env files.
     */
    if (file_exists('.env')) {
        require_once("vendor/autoload.php");
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->load();
    }
    
    $requestParts = explode("/", $_GET["url"]);
    $host = $_ENV["HOST"];
    $user = $_ENV["USER"];
    $pass = $_ENV["PASSWORD"];
    $db = $_ENV["DATABASE"];

    $conn = mysqli_connect($host, $user, $pass, $db);


    //Initiating the response
    $response;
    header('Content-type: application/json');

    /**
     * POST /telepules
     * params: telepulesID, telepulesNev, megyeID, MASTERPASS (all are required)
     * Inserts new settlement.
     */

    if($_SERVER["REQUEST_METHOD"] == "POST" && $requestParts[0] == "telepules" && $_ENV["MASTERPASS"] == $_GET["MASTERPASS"]){
        $telepulesID = $_GET["telepulesID"];
        $telepulesNev = $_GET["telepulesNev"];
        $megyeID = $_GET["megyeID"];

        $query = "INSERT INTO telepulesek (telepulesID, telepulesNev, megyeID) VALUES ($telepulesID,'$telepulesNev','$megyeID')";

        $data = mysqli_query($conn, $query);

        if(mysqli_affected_rows($conn) > 0){
            $response->state = "success";
        }
        else{
            $response->state = "fail";
            $response->error = mysqli_error($conn);
        }
    }
    /**
     * PUT /telepules/:telepulesID
     * params: telepulesID, telepulesNev, megyeID (all are optional), MASTERPASS (required)
     * Edits settlement identified by id.
     */
    else if($_SERVER["REQUEST_METHOD"] == "PUT" && $requestParts[0] == "telepules" && $_ENV["MASTERPASS"] == $_GET["MASTERPASS"]){
        $fields;
        if(isset($_GET["telepulesID"])) $fields = "telepulesID = ".$_GET["telepulesID"];
        if ($fields == null && isset($_GET["telepulesNev"])) $fields = "telepulesNev = '".$_GET["telepulesNev"]."'";
        else if (isset($_GET["telepulesNev"])) $fields .= ", telepulesNev = '".$_GET["telepulesNev"]."'";
        if ($fields == null && isset($_GET["megyeID"])) $fields = "megyeID = '".$_GET["megyeID"]."'";
        else if (isset($_GET["megyeID"])) $fields .= ", megyeID = '".$_GET["megyeID"]."'";

        $query = 
        "UPDATE telepulesek SET $fields WHERE telepulesID = $requestParts[1]";

        if($fields != null){
            $data = mysqli_query($conn, $query);

            if(mysqli_affected_rows($conn) > 0){
                $response->state = "success";
            }
            else{
                $response->state = "fail";
                $response->error = "No id found or data is unchanged.";
            }
        }
        else{
            $response->state = "success";
            $response->error = "No attribute changed, because no parameters were set.";
        }
    }
    /**
     * DELETE /telepules/:telepulesID
     * params: MASTERPASS (required)
     * Deletes settlement identified by id.
     */
    else if($_SERVER["REQUEST_METHOD"] == "DELETE" && $requestParts[0] == "telepules" && $_ENV["MASTERPASS"] == $_GET["MASTERPASS"]){
        $query = "DELETE FROM telepulesek WHERE telepulesID = $requestParts[1]";

        $data = mysqli_query($conn, $query);

        if(mysqli_affected_rows($conn) > 0){
            $response->state = "success";
        }
        else{
            $response->state = "fail";
            $response->error = "No id found.";
        }
    }
    else if(!isset($_GET["MASTERPASS"]) && ($_SERVER["REQUEST_METHOD"] == "DELETE" || $_SERVER["REQUEST_METHOD"] == "PUT" || $_SERVER["REQUEST_METHOD"] == "POST")){
        $response->state = "fail";
        $response->error = "Access not granted.";
    }
    /**
     * GET /telepulesek
     * params: with-column (entries are separated by semicolons), megyeNev, order (only applies for settlement names) (all are optional)
     * Returns settlements with given columns.
     */
    else if($requestParts[0] == "telepulesek"){
        $columns = "telepulesek.telepulesNev";
        $withColumn = explode(";", $_GET["with-column"]);

        if(isset($_GET["with-column"]))
            foreach($withColumn as $column){
                $columns .=", $column";
            }

        $query = 
        "SELECT DISTINCT $columns
        FROM telepulesek, megyek, teruletek, tipusok
        WHERE telepulesek.megyeID = megyek.megyeID
        AND telepulesek.telepulesID = teruletek.telepulesID
        AND teruletek.tipusID = tipusok.tipusID";

        if(isset($_GET["megyeNev"]))
            $query .= " AND megyek.megyeID = (SELECT megyeID FROM megyek WHERE megyeNev = '$_GET[megyeNev]')";

        if(isset($_GET["order"]))
            $query .= " ORDER BY telepulesek.telepulesNev $_GET[order]";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /telepules/:telepulesID
     * params: with-column (entries are separated by semicolons) (optional)
     * Returns settlement with given id and columns.
     */
    else if($requestParts[0] == "telepules" && $requestParts[2] == null){
        $columns = "telepulesek.*";
        $withColumn = explode(";", $_GET["with-column"]);

        if(isset($_GET["with-column"]))
            foreach($withColumn as $column){
                $columns .=", $column";
            }

        $query = 
        "SELECT DISTINCT $columns
        FROM telepulesek, megyek, teruletek, tipusok
        WHERE telepulesek.megyeID = megyek.megyeID
        AND telepulesek.telepulesID = teruletek.telepulesID
        AND teruletek.tipusID = tipusok.tipusID
        AND telepulesek.telepulesID = $requestParts[1]";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = "No id found.";
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /telepules/:telepulesID/teruletek
     * params: with-column (entries are separated by semicolons), tipusNev (entries are separated by semicolons), order (only applies for settlement names) (all are optional)
     * Returns areas within settlements with given columns.
     */
    else if($requestParts[0] == "telepules" && $requestParts[2] == "teruletek"){
        $columns = "teruletek.*";
        $types;
        $withColumn = explode(";", $_GET["with-column"]);

        if(isset($_GET["with-column"]))
            foreach($withColumn as $column){
                $columns .=", $column";
            }

        $query = 
        "SELECT $columns
        FROM telepulesek, megyek, teruletek, tipusok
        WHERE telepulesek.megyeID = megyek.megyeID
        AND telepulesek.telepulesID = teruletek.telepulesID
        AND teruletek.tipusID = tipusok.tipusID
        AND teruletek.telepulesID = $requestParts[1]";

        if(isset($_GET["tipusNev"])){
            $withTypes = explode(";", $_GET["tipusNev"]);

            foreach($withTypes as $type){
                $types .= " OR tipusNev = '$type'";
            }

            $types = substr($types, 4);
            $query .= " AND teruletek.tipusID IN (SELECT tipusID FROM tipusok WHERE $types)";
        }

        if(isset($_GET["order"]))   
            $query .= " ORDER BY teruletek.teruletNeve $_GET[order]";
        
        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /statisztika/max-megye
     * params: none
     * Returns the county name with most settlements.
     */
    else if ($requestParts[0] == "statisztika" && $requestParts[1] == "max-megye"){
        $query = "SELECT COUNT(telepulesID) AS telepulesSzam, megyeID FROM telepulesek GROUP BY megyeID ORDER BY telepulesSzam DESC LIMIT 1";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /statisztika/telepulesek-szama
     * params: none
     * Returns the number of settlements.
     */
    else if($requestParts[0] == "statisztika" && $requestParts[1] == "telepulesek-szama"){
        $query = "SELECT COUNT(telepulesID) AS telepulesSzam FROM telepulesek";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /statisztika/avg-terulet-nagysag
     * params: none
     * Visszateriti a teruletek atlagos nagysagat.
     */
    else if($requestParts[0] == "statisztika" && $requestParts[1] == "avg-terulet-nagysag"){
        $query = "SELECT AVG(teruletHa) AS avgTerulet FROM teruletek";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /statisztika/teruletek-tipusonkent
     * params: min, max, equal (all are optional)
     * Visszateriti hogy tipusonkent hany terulet van.
     */
    else if($requestParts[0] == "statisztika" && $requestParts[1] == "teruletek-tipusonkent"){
        $query = "SELECT tipusok.tipusNev, COUNT(teruletek.teruletID) AS teruletSzam
        FROM tipusok, teruletek
        WHERE tipusok.tipusID = teruletek.tipusID
        GROUP BY teruletek.tipusID";

        if(isset($_GET["min"])) $query .= " HAVING teruletSzam > $_GET[min]";
        else if(isset($_GET["max"])) $query .= " HAVING teruletSzam < $_GET[max]";
        else if(isset($_GET["equal"])) $query .= " HAVING teruletSzam = $_GET[equal]";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    /**
     * GET /megyek
     * params: none
     * Visszateriti a megyek tabla adatait
     */
    else if($requestParts[0] == "megyek"){
        $query = "SELECT megyeNev, megyeID FROM megyek";

        $data = mysqli_query($conn, $query);

        $response = array();

        if(mysqli_affected_rows($conn) > 0){
            $response[0]->state = "success";
            $response[0]->rows = mysqli_affected_rows($conn);
        }
        else {
            $response[0]->state = "fail";
            $response[0]->error = mysqli_error($conn);
        }

        while($row = mysqli_fetch_assoc($data)) {
            $response[] = $row;
        }
    }
    echo json_encode($response);
?>