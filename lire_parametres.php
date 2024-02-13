<?php
//on récuppère les infos du json

$data = array();
$data[] = file_get_contents("parametres.json");

echo(json_encode($data));
?>