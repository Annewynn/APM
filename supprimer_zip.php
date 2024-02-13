<?php
//Naelle Guillon 13/02/2024
//supprimer le zip qui vient d'être créé puis téléchargé par le client

$filename = json_decode($_POST['file'], true);
unlink("$filename");
echo 'ok';
?>