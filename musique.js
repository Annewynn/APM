class Musique
{
    constructor(nom, auteur, source, duree, album, tags, couleurs, nb_jouee)
    {
        this.nom = nom;
        this.auteur = auteur;
        this.source = source;
        this.duree = duree;
        this.album = album;
        this.tags = tags;
        this.couleurs = couleurs;
        this.nb_jouee = nb_jouee;
    };

    set_auteur()
    {
        //trouver tout le texte sans espace à la fin avant le tiret
        this.auteur = "Unknown";
        var valeur = this.nom.match("^([^-]+)-");
        if(valeur != null) this.auteur = valeur[1].trim();
    }

    async play(liste, i)
    {
        var audio_elem = document.createElement('audio');
        audio_elem.controls = true;
        audio_elem.autoplay = true;
        audio_elem.src = this.source;
        var conteneur = document.querySelector("#audio_contener");
        conteneur.innerHTML = "";
        var titre = document.createElement('div');
        titre.innerHTML = this.enleve_extension() + "<br>";
        titre.classList.add("affichage_audio_titre");
        audio_elem.classList.add("affichage_audio_titre");
        audio_elem.classList.add("affichage_audio");
        conteneur.appendChild(titre);
        conteneur.appendChild(audio_elem);
        //with promises
        //https://stackoverflow.com/questions/19018859/wait-until-sound-finishes-to-use-a-web-page
        await attente(audio_elem);
        if (liste.length+1 > i+1) audio_elem.addEventListener("ended", joue_playlist(i+1), false);
    }

    enleve_extension()
    {
        var extension = new RegExp(/^(.*)\.[^\.]+$/);
        var sans_extension = this.nom.match(extension);
        return sans_extension[1];
    }

}