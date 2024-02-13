<?php
//on transforme le json reçu en php
$tfile_names = json_decode($_POST["title"], true);
$tdata = json_decode($_POST["param"], true);
//on transforme chaque cellule du tableau en chaine
for ($i=0;$i<count($tdata); $i++)
{
    file_put_contents("playlists/".$tfile_names[$i].".apm", $tdata[$i]);
}

echo('ok');
?>