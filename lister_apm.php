<?php
//on liste tous les fichiers apm de playlist/ et lit leur contenu pour les envoyer à js

$tabglob = glob("playlists/*.apm");

$data = array();

foreach($tabglob as $fichier)
{
    $data['filename'][] = pathinfo($fichier, PATHINFO_FILENAME);
    $data['content'][] = file_get_contents($fichier);
}

echo(json_encode($data));
?>