<?php
//Naelle Guillon 12/02/2024
//telecharger en zip les fichiers apm de playlist/

$tabglob = glob("playlists/*.apm");

//https://stackoverflow.com/a/10569065
$date = new DateTime();
$date_result = $date->format('YmdHis');

$zip = new ZipArchive;
$tmp_file = "apm_$date_result.zip";
    if ($zip->open($tmp_file,  ZipArchive::CREATE)) 
    {
        foreach($tabglob as $fichier)
        {
            $zip->addFile('playlists/'. pathinfo($fichier, PATHINFO_FILENAME) . '.apm', pathinfo($fichier, PATHINFO_FILENAME) . '.apm');
        }
        $zip->close();
        
        header("Content-type: application/zip"); 
        header("Content-Disposition: attachment; filename=$tmp_file");
        header("Content-length: " . filesize($tmp_file));
        header("Pragma: no-cache"); 
        header("Expires: 0"); 
        echo "$tmp_file";
   }
   else 
    {
    echo 'fail';
    }
?>