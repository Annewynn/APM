<?php
//on met la string json recu dans parametres.json (écraser)
file_put_contents("parametres.json", $_POST['data']);
echo('ok');
?>