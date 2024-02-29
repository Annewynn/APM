
//biblio contient l'ensemble des musiques chargées depuis le lancement
var biblio = [];
//actual biblio contient les musiques affichées dans la bibliothèque à un temps t
var actual_biblio = [];

//stocke tous les rng crées pour ne pas créer deux fois le même
var table_rng = [];

//playlists, tags et albums contiennent l'ensemble des p, t et a crées depuis le lancement
var playlists = [];
var tags = [];
var albums = [];

//actively_played_playlist sert à savoir quelle playlist est actuellement jouée
var actively_played_playlist;
//__code sert à savoir quel est le code actuellement affiché
var actively_displayed_code;

//si en ligne, les icones de up et download sont fonctionnelles
//sinon elles sont grisées
var internet_connection = window.navigator.onLine;
//si la fenetre est en ligne mais que l'url ne contient pas localhost, on est pas en ligne (on utilise le fichier en local)
if (internet_connection)
{
    if (!window.location.origin.includes("http")) internet_connection = false;
    else if (!window.location.origin.includes("localhost")) internet_connection = false;
}

//init() lancé au chargement de la page
//si en ligne, charge les playlists/tags/albums depuis le serveur
//sinon, ne fait rien
//dans tous les cas, charge le fichier json de paramètres
function init()
{
    if (internet_connection)
    {
        var data = [];
        var xhr_np = new XMLHttpRequest();
        xhr_np.open("GET", "lister_apm.php");
        xhr_np.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr_np.addEventListener("load", function () 
        {
            data = JSON.parse(xhr_np.response);
            //trier les data, d'abord interpréter les albums, puis les tags, puis les playlists
            data = trie_data(data);
            for (var i =0; i<data['filename'].length; i++)
            {
                main_creer_interpreter_code(data['filename'][i], data['content'][i], false);
            }
        }, false); 
        xhr_np.send();
    }
    else 
    {
        document.querySelector("#download").classList.add("icon-rien-save");
    }

    charge_params();
}

//renvoie un array de content et filename trié par album, puis tag, puis playlist
function trie_data(data)
{
    data_trie = new Array();
    data_trie['filename'] = new Array();
    data_trie['content'] = new Array();
    data_order = ['ALBUM', 'TAG', 'PLAYLIST'];
    for (var j =0; j<data_order.length; j++)
    {
        for (var i =0; i<data['content'].length; i++)
        {
            if (data['content'][i].startsWith(data_order[j]) || data['content'][i].startsWith('FREEZE : ' + data_order[j]))
            {
                data_trie['content'].push(data['content'][i]);
                data_trie['filename'].push(data['filename'][i]);
            }
        }
    }
    return data_trie;
}

function charge_params()
{
    var dict = {'chargement_temps_musiques_au_lancement' : ["charger les temps des musiques au lancement (réduit les performances)", "checkbox", true], 
                'color_theme' : ["thème", "colorbox", "cadetblue"]};
    
    if (internet_connection)
    {
        var data = [];
        var xhr_np = new XMLHttpRequest();
        xhr_np.open("GET", "lire_parametres.php");
        xhr_np.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr_np.addEventListener("load", function () 
        {
            data = JSON.parse(xhr_np.response);
            construit_parametres(data);
        }, false); 
        xhr_np.send();
    }
    else console.log("Pas de connection internet : les paramètres n'ont pas pu être chargés.")
    
}


function construit_parametres(data)
{
    parameters = JSON.parse(data);
    console.log(parameters);
    var conteneur = document.querySelector("#conteneur_parametres");
    //créer un panneau affiché par dessus le reste
    var div = document.createElement('div');
    div.classList.add("invisible");
    div.classList.add("div_parametres");
    var titre = document.createElement('h2');
    titre.innerHTML = "Paramètres";
    titre.id = "titre_parametres";
    //bouton fermer
    var div_fermer = document.createElement('div');
    div_fermer.id = "div_bouton_fermer_parametres";

    var bouton_fermer = document.createElement("button");
    bouton_fermer.innerHTML = "X";
    bouton_fermer.classList.add("bouton_fermer");
    bouton_fermer.addEventListener("click", ferme_parametres);

    var options = [];
    for (var key in parameters)
    {
        if (parameters[key][1] == "checkbox")
        {
            //<input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
            //<label for="vehicle1"> I have a bike</label><br></br>
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.id = "parameters_" + key;
            if (parameters[key][2]) checkbox.setAttribute("checked", true);
            var label = document.createElement('label');
            label.for = "parameters_" + key;
            label.innerHTML = parameters[key][0] + "<br>";

            options.push(checkbox);
            options.push(label);
        }
        else if (parameters[key][1] == "colorbox")
        {
            //<label for="favcolor">Select your favorite color:</label>
            //<input type="color" id="favcolor" name="favcolor" value="#ff0000"><br><br>
            var colorbox = document.createElement('input');
            colorbox.type = "color";
            colorbox.id = "parameters_" + key;
            if (parameters[key][2]) colorbox.setAttribute("value", parameters[key][2]);
            colorbox.addEventListener("input", background_color_change_realtime, false);
            var label = document.createElement('label');
            label.for = "parameters_" + key;
            label.innerHTML = parameters[key][0] + "<br>";

            options.push(colorbox);
            options.push(label);
        }
    }
    console.log(options);
    //bouton appliquer : grisé tant que rien n'a changé
    //permet de récupérer les infos des paramètres appliqués et les sauver dans le json
    //dans un div pour son positionnement
    var div_appliquer = document.createElement('div');
    div_appliquer.id = "div_bouton_appliquer_parametres";

    var bouton_appliquer = document.createElement("button");
    bouton_appliquer.id = "bouton_appliquer_parametres";
    bouton_appliquer.innerHTML = "Appliquer";
    bouton_appliquer.addEventListener("click", applique_parametres);

    div_fermer.appendChild(bouton_fermer);
    div.appendChild(div_fermer);
    div.appendChild(titre);
    for (var i =0; i<options.length; i++)
    {
        div.appendChild(options[i]);
    }
    div_appliquer.appendChild(bouton_appliquer);
    div.appendChild(div_appliquer);
    conteneur.appendChild(div);

    degrise_applique_parametres();
}

//récuppérer les noms des musiques de musics_input
function initialisation(event)
{
    var fichiers = document.querySelector("#musics_input").files;
    //let value = URL.createObjectURL(event.target.files[0]);
    //créer une option par fichier et mettre le nom de la musique dedans
    var selection = document.querySelector("#biblio_table");
    var biblio_length = biblio.length;
    for (var i = 0; i<fichiers.length;i++)
    {
        biblio.push(cree_musique(fichiers[i], event.target.files[i]));
        var tr = document.createElement('tr');
        tr.addEventListener("click", lance, false);
        tr.classList.add("tr_hover");
        var td_color = document.createElement('td');
        //change background color
        var td_music = document.createElement('td');
        td_music.innerHTML = biblio[biblio_length +i].nom;
        tr.appendChild(td_color);
        tr.appendChild(td_music);
        selection.appendChild(tr);
    }
    actual_biblio = biblio;

    //document.querySelector("#upload").classList.add("icon-rien-save");
    reinterprete_codes();
    recharge_recherche();

    var os = getOS();
    //si on est sur des machines assez puissantes on peut charger les temps des musiques
    //exclusion par défaut des smartphones, sous android et ios
    if (os != 'Android' || os != 'iOS') readmultifiles(fichiers, biblio_length);
}

//https://stackoverflow.com/a/38241481
function getOS() 
{
    var userAgent = window.navigator.userAgent,
        platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;
  
    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (/Linux/.test(platform)) {
      os = 'Linux';
    }
  
    return os;
}

//f de stackoverflow, charge les métadonnées de chaque musique et affiche sa progression à l'écran
function readmultifiles(files, biblio_length) 
{
    var reader = new FileReader();  
    function readFile(index) 
    {
        var audio = document.createElement('audio');
      if( index >= files.length ) return;
      var file = files[index];
      reader.onload = function(e) {  
        // get file content  
        var bin = e.target.result;
        // do sth with bin
        audio.src = bin;
            audio.addEventListener('loadedmetadata', function(){
                // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
                var duration = audio.duration;
                // example 12.3234 seconds
                //console.log("The duration of the song is of: " + duration + " seconds");
                // Alternatively, just display the integer value with
                // parseInt(duration)
                // 12 seconds
                biblio[biblio_length + index].duree = duration;
                maj_chargement_temps(index+1, files.length);
            },false);
        readFile(index+1)
      }
      reader.readAsDataURL(file);
    }
    readFile(0);
  }


function maj_chargement_temps(i, total)
{
    document.querySelector("#chargement_temps").innerHTML = i + "/" + total;
}


// constructor(nom, auteur, source, duree, album, tags, nb_jouee)
function cree_musique(fichier, src)
{
    var nom = fichier.name;
    var auteur = "";
    var source = URL.createObjectURL(src);
    var duree = "";
    var album = "";
    var tags = [];
    var couleurs = [];
    var nb_jouee = 0;
    var nouvelle_musique = new Musique(nom, auteur, source, duree, album, tags, couleurs, nb_jouee);
    nouvelle_musique.set_auteur();
    return nouvelle_musique;
}


function reinterprete_codes()
{
    //commence par albums puis tags car playlists en ont besoin
    var albums_actu = albums;
    albums = [];
    for (var i =0; i<albums_actu.length; i++)
    {
        main_creer_interpreter_code(albums_actu[i].titre_code, albums_actu[i].source_code, false);
    }
    var tags_actu = tags;
    tags = [];
    for (var i =0; i<tags_actu.length; i++)
    {
        main_creer_interpreter_code(tags_actu[i].titre_code, tags_actu[i].source_code, false);
    }
    var playlists_actu = playlists;
    playlists = [];
    for (var i =0; i<playlists_actu.length; i++)
    {
        main_creer_interpreter_code(playlists_actu[i].titre_code, playlists_actu[i].source_code, false);
    }
    console.log("j'ai réinterprété les codes");
}


function recharge_recherche()
{
    var entry = document.querySelector("#recherche_biblio");
    entry.value = "";
    if (recherche_biblio(entry.value)) actualise_biblio_affichee(actual_biblio);
}


function actualise_biblio_affichee(liste_biblio)
{
    var selection = document.querySelector("#biblio_table");
    selection.innerHTML = "";
    for (var i = 0; i<liste_biblio.length;i++)
    {
        var tr = document.createElement('tr');
        tr.addEventListener("click", lance, false);
        var td_color = document.createElement('td');
        //change background color
        for (var j = 0; j<liste_biblio[i].tags.length; j++) 
        {
            var div_color = document.createElement('div');
            div_color.classList.add("div_couleur_tag");
            div_color.style.backgroundColor = liste_biblio[i].couleurs[j];
            td_color.appendChild(div_color);
        }
        var td_music = document.createElement('td');
        td_music.innerHTML = liste_biblio[i].nom;
        tr.appendChild(td_color);
        tr.appendChild(td_music);
        selection.appendChild(tr);
    }
}

function input_recherche_biblio(event)
{
    var valeur = event.target.value;
    if (recherche_biblio(valeur)) actualise_biblio_affichee(actual_biblio);
}


function recherche_biblio(valeur)
{
    var found = false;
    if (valeur.length >= 3)
    {
        actual_biblio = [];
        found = true;
        //trouve un mot clé TAG au début
        var result = valeur.match(/TAG(.*)/);
        if (result != null) 
        {
            var res = trim_code(result[1]);
            for (var i =0; i<biblio.length; i++)
            {
                if (biblio[i].tags.includes(res))
                {
                    actual_biblio.push(biblio[i]);
                }
            }
            return found;
        }
        for (var i =0; i<biblio.length; i++)
        {
            if (biblio[i].nom.toLowerCase().includes(valeur.toLowerCase()))
            {
                actual_biblio.push(biblio[i]);
            }
        }
    }
    else if (valeur.length == 0)
    {
        actual_biblio = biblio;
        found = true;
    }
    return found;
}


function lance(event)
{
    var val = document.querySelector("#recherche_biblio").value;
    recherche_biblio(val);
    var i = event.target.parentElement.rowIndex;
    //mettre en évidence le tr joué
    gere_css_played_music(document.querySelector("#biblio_table").rows, i);
    actual_biblio[i].play(actual_biblio, i);
}

function enregistrer_code()
{
    //aller chercher le nom du code et son contenu
    var nom_code = document.querySelector("#code_name").value;
    var date = new Date;
    if (nom_code == "") nom_code = "Code généré à " + date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + "s";
    var code = document.querySelector("#code").value;
    //si fichier vide : on ne fait rien
    if (code == "") return;
    //interpréter le contenu
    main_creer_interpreter_code(nom_code, code, true);
}

//nom code, code, code modifié ?
function main_creer_interpreter_code(nom_code, code, modifie)
{
    var c = interprete_code(code);
    if (c == -1) return;
    code = trim_code(code);
    cree_code(nom_code, c[0], c[1], c[2], c[3], c[4], c[5], c[6], code, modifie);
}


function interprete_code(code)
{
    code = trim_code(code);
    //récupérer tout ce qu'il y a avant le premier deux-points
    var avant_deux_points = recupere_avant_deux_points(code);
    //le premier mot peut être playlist, tag, album ou freeze
    var freeze = false;
    var type = avant_deux_points.split(" ")[0];
    //premier mot clé
    if (type != "PLAYLIST" && type != "TAG" && type != "ALBUM" && type != "FREEZE") {erreur_code("avant :"); return -1;}
    //freeze
    if (type == "FREEZE") //on prend la ligne suivante
    {
        code = code.replace(avant_deux_points + ":", "");
        code = trim_code(code);
        freeze = true;
        avant_deux_points = recupere_avant_deux_points(code);
        type = avant_deux_points.split(" ")[0];
        //premier mot clé
        if (type != "PLAYLIST" && type != "TAG" && type != "ALBUM") {erreur_code("avant :"); return -1;}
    }
    //nom
    var valeur = avant_deux_points.match(/^(PLAYLIST|TAG|ALBUM)(.*)$/);
    var nom = "";
    if (valeur != null) 
    {
        nom = valeur[2];
        nom = trim_code(nom);
    }
    else {erreur_code("avant :"); return -1;}
    code = code.replace(avant_deux_points + ":", "");


    //recherche des titres à mettre dans la liste
    //si ALL est le premier mot : tous les titres des catégories mentionnées

    //si ALL TITLE IN : tous les titres comprennant les mots mentionnés
    //si ALL (...) : tous les titres des catégories mentionnées
    //si ALL PLAYLIST/ALBUM/TAG : tous les titres de la catégorie mentionnée
    //si ALL autre chose qui n'est pas des cas au dessus : on cherche dans toute la biblio
    code = trim_code(code);
    var first_keyword = code.split(" ")[0];
    if (first_keyword == "ALL")
    {
        var second_keyword = code.split(" ")[1];
        if(second_keyword == "TITLE" || second_keyword == "TITLES")
        {
            //si pas IN, on cherche un titre spécifique
            var third_keyword = code.split(" ")[2];
            if(third_keyword == "IN")
            {
                //recherche de titres dans une liste de titres
                var liste_recherche = [];
                var valeur = code.match(/.*\((.*)\).*/);
                if (valeur != null) liste_recherche = valeur[1].split(",");
                else {erreur_code("liste de recherche"); return -1;}
                var titres_totaux = [];
                for (var i =0; i<liste_recherche.length; i++)
                {
                    liste_recherche[i] = trim_code(liste_recherche[i]);
                    if (recherche_biblio(liste_recherche[i])) titres_totaux.push(actual_biblio);
                }
                //si le code se finit là, on passe à la création de l'instance de code
                code = code.replace(first_keyword+" " + second_keyword + " " + third_keyword + " (" + valeur[1] + ")", "");
                code = trim_code(code);
                //constructor(type, nom, auteur, freeze, 
        //titles_among, number_of_titles, random_titles, categories, titles_of_categories, titles_duration, 
        //color, total_duration, alternate, timer, 
        //source_file, titre_code)
                if (code == "") return [type, nom, freeze, titres_totaux, "", "all", false];
                //sinon : test de COLOR couleur
                else 
                {
                    var fourth_keyword = code.split(" ")[0];
                    if (fourth_keyword == "COLOR")
                    {
                        //colorname en 1 mot ou en hexadécimal
                        var color_name = code.split(" ")[1];
                        code = code.replace(fourth_keyword+" " +color_name, "");
                        code = trim_code(code);
                        if (code == "") return [type, nom, freeze, titres_totaux, color_name, "all", false];
                    }
                }
            }
        }
        //sinon : le code peut être de la forme 
        //ALL (TAG Electro UNION TAG Films)
        //si second_keyword[0] == (
        if (second_keyword[0] == "(")
        {
            //on détecte ce qui se touve entre les parenthèse ouvrante et fermante, 
            //jusqu'à la fin ou jusqu'à ce quon ne rencontre WHERE
            var titres_totaux = [];
            //tout ce qui est entre parenthèses
            var regex = new RegExp(/[^\(]*\((.+)\)[^\(]*/);
            if (! verifie_presence(code, "WHERE")) 
            {
                var tag_num = localise_equation(code, []);
                recherche_tags("TAG " + tag_num);
                titres_totaux.push(actual_biblio);
                //détruit les tags virtuels
                détruit_tags_virtuels();
            }
            /*
            if (valeur != null) 
            {
                //liste recherche prend les bouts de code par mot clé (union, diff, inter...) ou par ","
                liste_recherche = valeur[1].split("UNION");
                liste_recherche = valeur[1].split("DIFF");
                liste_recherche = valeur[1].split("INTER");
                liste_recherche = valeur[1].split(",");
            }
            else {erreur_code("liste de recherche"); return -1;}
            var titres_totaux = [];
            for (var i =0; i<liste_recherche.length; i++)
            {
                liste_recherche[i] = trim_code(liste_recherche[i]);
                if (recherche_biblio(liste_recherche[i])) titres_totaux.push(actual_biblio);
            }
            code = code.replace(valeur[0], "");
            code = trim_code(code);
            */
            if (!code.includes("COLOR")) return [type, nom, freeze, titres_totaux, "", "all", false];
            else 
            {
                var fourth_keyword = code.split(" ")[0];
                if (fourth_keyword == "COLOR")
                {
                    //colorname en 1 mot ou en hexadécimal
                    var color_name = code.split(" ")[1];
                    code = code.replace(fourth_keyword+" " +color_name, "");
                    code = trim_code(code);
                    if (code == "") return [type, nom, freeze, titres_totaux, color_name, "all", false];
                }
            }
        }
    }
    //si ALL n'est pas le premier mot : 
    //ca peut etre de la forme 30 RANDOM TITLES IN ALL ou 10 FIRST TITLE IN Zimmer ou 10 RANDOM TITLES IN TAG rammstein
    //first_keyword : numéro
    //second keyword : random, first ou last
    //third keyword : titles, playlist, tag, album
    //fourth keyword : in ou not
    //fifth keyword : all, in ou playlist, tag, album
    var first_keyword = code.split(" ")[0];
    if (! isNaN(first_keyword))
    {
        var second_keyword = code.split(" ")[1];
        if (second_keyword == "RANDOM")
        {
            var third_keyword = code.split(" ")[2];
            if (third_keyword == "TITLE" || third_keyword == "TITLES")
            {
                var fourth_keyword = code.split(" ")[3];
                if (fourth_keyword == "IN")
                {
                    //x RANDOM TITLES IN
                    var fifth_keyword = code.split(" ")[4];
                    var liste_recherche = [];
                    var titres_totaux = [];
                    if (fifth_keyword == "ALL")
                    {
                        //x RANDOM TITLES IN ALL
                        liste_recherche = "";
                    }
                    else if (fifth_keyword == "TAG")
                    {
                        var sixth_keyword = code.split(" ")[5];
                        liste_recherche = fifth_keyword + " " + sixth_keyword;
                        fifth_keyword = fifth_keyword + " " + sixth_keyword;
                    }
                    liste_recherche = trim_code(liste_recherche);
                    if (recherche_biblio(liste_recherche)) titres_totaux.push(actual_biblio);
                    code = code.replace(first_keyword + " " + second_keyword + " " +third_keyword + " " + fourth_keyword + " " + fifth_keyword, "");
                    code = trim_code(code);
                    if (code == "") return [type, nom, freeze, titres_totaux, "", parseInt(first_keyword), true];
                    else 
                    {
                        var fourth_keyword = code.split(" ")[0];
                        if (fourth_keyword == "COLOR")
                        {
                            //colorname en 1 mot ou en hexadécimal
                            var color_name = code.split(" ")[1];
                            code = code.replace(fourth_keyword+" " +color_name, "");
                            code = trim_code(code);
                            if (code == "") return [type, nom, freeze, titres_totaux, color_name, parseInt(first_keyword), true];
                        }
                    }
                }
            }
        }
    }

    //si on a WHERE : pas tous les titres de certaines catégories

    /*var key = [];
    avant_deux_points = avant_deux_points.split(" ");
    for (var j =0; j<avant_deux_points.length; j++)
    {
        let found = false;
        for (var i =0; i<keywords.length; i++)
        {
            if (avant_deux_points[j] == keywords[i]) 
            {
                key += valeur;
                found = true;
                break;
            }
        }
        if (! found) break;
    }
    
    console.log(key);*/
}

function trim_code(code)
{
    if (code[0] == " " || code[code.length-1] == " ") code = code.trim();
    return code;
}

function recupere_avant_deux_points(code)
{
    var avant_deux_points = "";
    var valeur = code.match("^([^:]+):");
    if(valeur != null) avant_deux_points = valeur[1];
    else if (! verifie_presence(code, ":")) {erreur_code(":"); return;}
    else erreur_code("avant :");
    return avant_deux_points;
}

function verifie_presence(code, bout)
{
    if (code.match(bout) != null) return true;
    return false;
}

function erreur_code(type)
{
    var body = document.querySelector("body");
    if (type == ":") body.innerHTML += ": attendu après le type et le titre de la liste";
    if (type == "avant :") body.innerHTML += "type et le titre de la liste attendus avant :";
    if (type == "liste de recherche") body.innerHTML += "liste de recherche de titres mal rentrée. Elle doit suivre le modèle ALL TITLES IN (bout de titre, bout de titre 2)";
    
}

/** 
fonction localise équation : prend une formule de la forme ((a union b inter c) diff (d union e)) et la découpe en variables et l'interprète en titres
récursive : prend les parenthèses les plus internes, développe l'équation et l'interprète, puis cherche d'autres parenthèses dans l'équation restante, ect jusqu'à ce que l'équation soit entièrement résolue
@param {string} code texte du code, diminue récursivement
@param {Musique[]} titres tableau de musiques correspondant au code, change en fonction des équations à interpréter
@returns renvoie les titres correspondant à l'équation résolue
**/
function localise_equation(code, titres)
{
    console.log("code avant match : " + code);
    let valeur;
    var regex = new RegExp(/.*\(([^\)]+)\).*/);
    valeur = code.match(regex);
    //code de la forme ((a union b inter c) diff (valeur[1])) -> valeur[1] à interpréter
    //si qqch a été trouvé dans match
    if (valeur != null)
    {
        //trouve les pistes correspondantes à l'équation
        var dev = developpe_equation(valeur[1]);
        //remplace match trouvé par "" pour passer à la suite
        code = code.replace("(" + valeur[1] + ")", "TAG " + dev);
        //on cherche la paire de parenthèses suivante à interpréter
        titres.push(localise_equation(code, titres));
    }
    else 
    {
        code = trim_code(code);
        console.log("code avec match null : " + code);
        if (recherche_tags(code)) titres = actual_biblio;
    }
    console.log(titres);
    return titres;
}

/**
function developpe equation : prend un bout d'équation à 2+ membres et la développe, récuppère les titres des tags et titres des membres et les interprète
@param {string} code code sans parenthèses à développer + interpréter
@returns renvoie les titres récupérés après interprétation (donc une seule liste correspondant à l'équation résolue)
**/
function developpe_equation(code)
{
    //liste de mots clés à partir desquels match : 
    //on match par 4, 1 : mb g, 2 : opération, 3 : mb d, 4 : reste du code
    //on teste l'appartenance de l'opération à telle catégorie et interpète les membres en conséquence, puis récursif sur le reste du code jusqu'à ce qu'il soit vide
    var recursive_regexp = new RegExp(/(.*)(UNION|INTER|DIFF|ALL TITLES IN|,|ALL)(.*)(UNION.*|INTER.*|DIFF.*|ALL TITLES IN.*|,.*|ALL.*)*/);
    var research_list = code.match(recursive_regexp);
    console.log(code);
    console.log(research_list);
    //développe chaque membre de l'équation
    var titres = [];
    console.log("tags avant op : ", tags);
    if (!recherche_biblio(research_list[1])) titres.push([actual_biblio]);
    console.log("titres mb1 biblio : ", titres);
    if (titres == []) 
    {
        if (recherche_tags(research_list[1])) titres.push([actual_biblio]);
        console.log("titres mb1 tags : ", titres);
    }
    if (!recherche_biblio(trim_code(research_list[3]))) titres.push([actual_biblio]);
    console.log("titres mb2 biblio : ", titres);
    if (titres.length != 2) 
    {
        if(recherche_tags(trim_code(research_list[3]))) titres.push([actual_biblio]);
        console.log("titres mb2 tags : ", titres);
    }
    research_list[2] = trim_code(research_list[2]);
    //puis opération entre les deux membres
    if (research_list[2] == "UNION" || research_list[2] == ",") titres = union(titres);
    else if (research_list[2] == "INTER") titres = inter(titres);
    else if (research_list[2] == "DIFF") titres = diff(titres);
    else if (research_list[2] == "ALL TITLES IN" || research_list[2] == "ALL") titres = titres[1];
    //crée Code (tag virtuel) une fois qu'on a tous les mb + op
    //renvoie nom du tag virtuel créé
    console.log("titres après op : ", titres);
    //nom = rng
    virtual_tag = new Code("TAG", rng(1000), "", false, 
    titres, "all", false, "", "", "", 
    "", "", false, false, 
    "", "", code);
    virtual_tag.set_virtual();
    tags.push(virtual_tag);
    return virtual_tag.nom;
}

//fonction recherche tag : prend un nom de tag, le trouve dans la liste de tags et met ses titres dans actual_biblio
//si tag trouvé, renvoie vrai, sinon faux
function recherche_tags(code)
{
    actual_biblio = [];
    var result = toString(code).match(/TAG(.*)/);
    if (result != null) 
    {
        var res = trim_code(result[1]);
        for (var i =0; i<tags.length; i++)
        {
            //transformer le nom en string pour ceux rng
            if (toString(tags[i].nom).includes(res))
            {
                actual_biblio.push(tags[i].titles_among);
                return true;
            }
        }
    }
    else return false;
}

//union joint les arrays d'un array et en ote les éléments dupliqués
function union(titres)
{
    //https://stackoverflow.com/a/9229821
    return [new Set(titres.flat(Infinity))];
}

//inter ne conserve que les éléments présents dans les deux arrays de titres
function inter(titres)
{
    //https://stackoverflow.com/a/52721485
    titres = union(titres);
    return titres.filter((s => v => s.has(v) || !s.add(v))(new Set));
}

//diff ne conserve que les éléments présents dans le premier et pas le second array
function diff(titres)
{
    //https://stackoverflow.com/a/53092728
    return titres[1].filter(n => !titres[2].includes(n))
}


function rng(limit)
{
    var rng = Math.floor(Math.random()*limit);
    while(table_rng.includes(rng))
    {
        rng = Math.floor(Math.random()*limit);
    }
    table_rng.push(rng);
    return rng;
}

//détruit les tags virtuels de la liste tags à l'issue de l'interprétation des équations
function détruit_tags_virtuels()
{
    var i =0;
    while (i<tags.length)
    {
        if (tags[i].virtual == true)
        {
            var removed = tags.splice(i, 1);
            continue;
        }
        i ++;
    }
}

function choix(tab, number)
{
    if (number < tab.length)
    {
        return tab.slice(0, number);
    }
    else return tab;
}


//constructor(type, nom, auteur, freeze, 
        //titles_among, number_of_titles, random_titles, categories, titles_of_categories, titles_duration, 
        //color, total_duration, alternate, timer, 
        //source_file, titre_code)
function cree_code(nom_code, type_code, nom_liste, freeze_code, 
    titres_totaux, couleur, number_titles, randomness, source_code, modifie)
{
    var titres_dans_meme_liste = [];
    for (var i =0; i<titres_totaux.length; i++)
    {
        for (var j =0; j<titres_totaux[i].length; j++)
        {
            titres_dans_meme_liste.push(titres_totaux[i][j]);
        }
    }
    var duree_totale = 0;
    for (var i =0; i<titres_dans_meme_liste.length; i++)
    {
        duree_totale += titres_dans_meme_liste[i].duree;
    }
    if (actively_displayed_code != undefined && modifie) 
    {
        if (type_code == "PLAYLIST") 
        {
            for (var i=0; i<playlists.length; i++)
            {
                if (actively_displayed_code == playlists[i]) 
                {
                    playlists[i] = new Code(type_code, nom_liste, "", freeze_code, 
                    titres_dans_meme_liste, number_titles, randomness, "", "", "", 
                    couleur, duree_totale, false, false, 
                    "", nom_code, source_code);
                    actively_displayed_code = playlists[i];
                    actively_played_playlist = playlists[i];
                    maj_liste(playlists);
                    break;
                }
            }
        }
        else if (type_code == "TAG") 
        {
            for (var i=0; i<tags.length; i++)
            {
                if (actively_displayed_code == tags[i]) 
                {
                    //enleve_tag_dans_musique(tags[i]);
                    tags[i] = new Code(type_code, nom_liste, "", freeze_code, 
                    titres_dans_meme_liste, number_titles, randomness, "", "", "", 
                    couleur, duree_totale, false, false, 
                    "", nom_code, source_code);
                    actively_displayed_code = tags[i];
                    ajoute_tag_dans_musiques(tags[i]);
                    maj_liste(tags);
                    break;
                }
            }
        }
        
        else 
        {
            for (var i=0; i<albums.length; i++)
            {
                if (actively_displayed_code == albums[i]) 
                {
                    albums[i] = new Code(type_code, nom_liste, "", freeze_code, 
                    titres_dans_meme_liste, number_titles, randomness, "", "", "", 
                    couleur, duree_totale, false, false, 
                    "", nom_code, source_code);
                    actively_displayed_code = albums[i];
                    maj_liste(albums);
                    break;
                }
            }
        }
    }
    else 
    {
        var nouveau_code = new Code(type_code, nom_liste, "", freeze_code, 
        titres_dans_meme_liste, number_titles, randomness, "", "", "", 
        couleur, duree_totale, false, false, 
        "", nom_code, source_code);

        if (type_code == "PLAYLIST") 
        {
            playlists.push(nouveau_code); 
            maj_liste(playlists);
        }
        else if (type_code == "TAG") 
        {
            tags.push(nouveau_code); 
            //enleve_tag_dans_musique(tags[tags.length-1]);
            ajoute_tag_dans_musiques(tags[tags.length-1]);
            maj_liste(tags);
        }
        else 
        {
            albums.push(nouveau_code); 
            maj_liste(albums);
        }
    }
}


function enleve_tag_dans_musique(code)
{
    for (var i =0; i<biblio.length; i++)
    {
        if (code.titles_among.includes(biblio[i]))
        {
            var index_tag = biblio[i].tags.indexOf(code.nom);
            let foo = biblio[i].tags.splice(index_tag, 1);
            let bar = biblio[i].couleurs.splice(index_tag, 1);
        }
    }
}


function ajoute_tag_dans_musiques(code)
{
    for (var i =0; i<biblio.length; i++)
    {
        if (code.titles_among.includes(biblio[i]))
        {
            biblio[i].tags.push(code.nom);
            biblio[i].couleurs.push(code.color);
        }
    }
}


function type_liste(liste)
{
    return liste[0].type;
}

function maj_liste(type)
{
    var enfant = document.querySelector("#conteneur_" + type_liste(type));
    enfant.innerHTML = "";
    var tab = document.createElement('table');
    var tr = document.createElement('tr');
    //th contient la flèche pour réduire et le nom du tableau
    var th = document.createElement('th');
    var img_redext = document.createElement('img');
    img_redext.src = "images/left-arrow.svg";
    img_redext.classList.add("mini_icon", "bottom_arrow");
    th.setAttribute("extended", "vrai");
    th.addEventListener("click", reduce_extend_list);
    th.appendChild(img_redext);
    //span pour le texte; non sélectionnable
    var span = document.createElement('span');
    span.innerHTML = '\t' + type_liste(type);
    span.style.pointerEvents = "none";
    //créer un tbody
    var tbody = document.createElement('tbody');
    th.appendChild(span);
    tab.appendChild(th);
    tab.appendChild(tbody);
    enfant.appendChild(tab);
    for (var i =0; i<type.length; i++)
    {
        var row = document.createElement('tr');
        if (type_liste(type) == "PLAYLIST") row.addEventListener("click", affiche_playlist, false);
        else if (type_liste(type) == "TAG") row.addEventListener("click", affiche_tag, false);
        var td_nom=document.createElement('td');
        td_nom.innerHTML = type[i].type + "\t" +type[i].nom;
        var td_download=document.createElement('td');
        var img_download = document.createElement('img');
        img_download.src = "images/download-arrow.svg";
        img_download.classList.add("mini_icon");
        img_download.addEventListener("click", download_one_file);
        td_download.appendChild(img_download);
        row.appendChild(td_nom);
        row.appendChild(td_download);
        tbody.appendChild(row);
    }
    if (!internet_connection) document.querySelector("#upload").classList.remove("icon-rien-save");
}

function reduce_extend_list(e)
{
    //si étendu : on réduit
    if (e.target.getAttribute("extended") == "vrai")
    {
        console.log(e.target.parentElement.childNodes);
        e.target.parentElement.childNodes[1].setAttribute("hidden", "hidden");
        e.target.firstChild.classList.remove("bottom_arrow");
        e.target.firstChild.classList.add("right_arrow");
        e.target.setAttribute("extended", "faux");
    }
    else if (e.target.getAttribute("extended") == "faux")
    {
        e.target.parentElement.childNodes[1].removeAttribute("hidden");
        e.target.firstChild.classList.remove("right_arrow");
        e.target.firstChild.classList.add("bottom_arrow");
        e.target.setAttribute("extended", "vrai");
    }
}

//affiche le nom du code et le code dans les input et texarea
function affiche_code(titre, source)
{
    var nom_code_content = document.querySelector("#code_name");
    nom_code_content.value = titre;
    var code_content = document.querySelector("#code");
    code_content.value = source;
    if (titre == '' && source == '') actively_displayed_code = undefined;
}


function affiche_tag(event)
{
    var selected = event.target.parentElement.rowIndex;
    //mettre en évidence le tr joué
    gere_css_played_music(document.querySelector("#conteneur_TAG table").rows, selected);
    var entry = document.querySelector("#recherche_biblio");
    entry.value = "TAG " + tags[selected].nom;
    if (recherche_biblio(entry.value)) actualise_biblio_affichee(actual_biblio);
    //afficher le code du tag
    affiche_code(tags[selected].titre_code, tags[selected].source_code);
    actively_displayed_code = tags[selected];
}

function affiche_playlist(event)
{
    var selected = event.target.parentElement.rowIndex;
    //mettre en évidence le tr joué
    gere_css_played_music(document.querySelector("#conteneur_PLAYLIST table").rows, selected);
    //créer un tableau clicable dont chaque case prend le couleur focus si clickée ou que la chanson précédente arrive à sa fin
    var contenant = document.querySelector("#playlist_contener");
    contenant.innerHTML = "";
    var tab = document.createElement('table');
    var th = document.createElement('th');
    var tbody = document.createElement('tbody');
    th.innerHTML = playlists[selected].nom;

    tab.appendChild(th);
    //var pour savoir si on joue une musique
    var have_music_to_play = true;
    //si pas freeze : shuffle
    var shuffled_titles = [];
    var selected_titles = [];
    if (playlists[selected].number_of_titles != "all")
    {
        var tableau = playlists[selected].titles_among;
        if (playlists[selected].random_titles) selected_titles = choix(shuffle(tableau), playlists[selected].number_of_titles);
        else selected_titles = choix(tableau, playlists[selected].number_of_titles);
    }
    else selected_titles = playlists[selected].titles_among;
    //si la playlist est vide : il n'y a pas de titres matchant cette playlist dans la bibli
    if (selected_titles.length == 0)
    {
        have_music_to_play = false;
        //créer un tr non cliquable et afficher un texte explicatif
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = "Votre bibliothèque ne contient aucun titre pouvant être ajouté à cette playlist";
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    if (! playlists[selected].freeze) shuffled_titles = shuffle(selected_titles);
    else shuffled_titles = playlists[selected].titles_among;
    for (var i =0; i<shuffled_titles.length; i++)
    {
        var tr = document.createElement('tr');
        tr.addEventListener("click", onclick_joue_playlist, false);
        var td = document.createElement('td');
        td.innerHTML = shuffled_titles[i].nom;
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    tab.appendChild(tbody);
    contenant.appendChild(tab);

    //afficher le code de la playlist
    affiche_code(playlists[selected].titre_code, playlists[selected].source_code);
    actively_displayed_code = playlists[selected];

    actively_played_playlist = new Playlist(playlists[selected], shuffled_titles);
    if (have_music_to_play) joue_playlist(0);
}

function affiche_parametres()
{
    var conteneur = document.querySelector("#conteneur_parametres div");
    conteneur.classList.remove("invisible");
}

//bouton applique : si grisé, le rend non grisé
//si non grisé, le rend grisé
function degrise_applique_parametres()
{
    var bouton_appliquer = document.querySelector("#bouton_appliquer_parametres");
    //enlever les event change tant que le bouton appliquer n'est pas à nouveau grisé
    var inputs = document.querySelectorAll("#conteneur_parametres div input");

    if (bouton_appliquer.disabled) 
    {
        bouton_appliquer.disabled = false;
        remove_event_listeners(inputs, "change", degrise_applique_parametres);
    }
    else 
    {
        bouton_appliquer.disabled = true;
        add_event_listeners(inputs, "change", degrise_applique_parametres);
    }
}

function background_color_change_realtime(e)
{
    var body = document.querySelector("body");
    body.style.backgroundColor = e.target.value;
}

//pour une liste d'éléments, enlève un event listener particulier
function remove_event_listeners(id_table, action, fonction)
{
    for (var i =0; i<id_table.length; i++)
    {
        id_table[i].removeEventListener(action, fonction);
    }
}

//pour une liste d'éléments, ajoute un event listener
function add_event_listeners(id_table, action, fonction)
{
    for (var i =0; i<id_table.length; i++)
    {
        id_table[i].addEventListener(action, fonction);
    }
}

//onclick sur applique paramètres
//pour chaque input de paramètres, lire la valeur 
//l'appliquer
//et la sauver dans le json
function applique_parametres()
{
    var inputs = document.querySelectorAll("#conteneur_parametres div input");
    degrise_applique_parametres();
    console.log(inputs);
}

function ferme_parametres()
{
    var conteneur = document.querySelector("#conteneur_parametres div");
    conteneur.classList.add("invisible");
}



//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(array) 
{
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

//event clic sur le titre dans la playlist (colonne lecture)
function onclick_joue_playlist(event)
{
    var ligne = event.target.parentElement.rowIndex;
    joue_playlist(ligne);
}

//joue le titre cliqué dans la playlist
function joue_playlist(i)
{
    //gere la couleur du row cliqué
    gere_css_played_music(document.querySelector("#playlist_contener table").rows, i);
    actively_played_playlist.musiques[i].play(actively_played_playlist.musiques, i);
}

//pour toutes les lignes de tableaux mises en évidence au clic, applique la classe de la couleur de mise en évidence
//prend des rows de table html et un indice pour le row à mettre en évidence
function gere_css_played_music(table_rows, i_to_add)
{
    //enlever la classe à toutes les lignes de la table
    for (var i =0; i<table_rows.length; i++) table_rows[i].classList.remove("played_music");  
    //ajouter la classe à la ligne i_to_add
    table_rows[i_to_add].classList.add("played_music");
}

function attente(audio)
{
    return new Promise(res=>{
        
        audio.onended = res
      })
}


function upload()
{
    var [code, file_names] = recuppere_tous_codes_et_noms();
    var chainePost = 'title=' +  JSON.stringify(file_names) + '&param='+ JSON.stringify(code);
    var xhr_np = new XMLHttpRequest();
    xhr_np.open("POST", "sauver_en_apm.php");
    xhr_np.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr_np.addEventListener("load", function () 
    {
        if (xhr_np.response == 'ok') document.querySelector("#upload").classList.add("icon-rien-save");
    }, false); 
    xhr_np.send(chainePost);
}


function download_all()
{
    var [text, filename] = recuppere_tous_codes_et_noms();
    console.log(text);
    console.log(filename);
    if (text.length < 4)
    {
        for (var i =0; i<text.length; i++)
        {
            download(text[i], filename[i]);
        }
    }
    else
    {
        //a faire en php
        //https://stackoverflow.com/questions/12225964/create-a-zip-file-and-download-it
        var local_time = new Date();
        var local_month = local_time.getMonth()+1;
        if (local_month < 9) local_month = "0" + local_month;

        var filename = "apm_" + local_time.getFullYear() + local_month + local_time.getDate() + 
            local_time.getHours() + local_time.getMinutes() + local_time.getSeconds();

        var xhr_np = new XMLHttpRequest();
        xhr_np.open("GET", "telecharger_zip.php");
        xhr_np.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr_np.addEventListener("load", function () 
        {
            if (xhr_np.response != 'fail') download_file_from_current_path(xhr_np.response);
            //détruit le zip une fois qu'il a servi
            var filename_post = 'file=' +  JSON.stringify(xhr_np.response);
            var xhr_np2 = new XMLHttpRequest();
            xhr_np2.open("POST", "supprimer_zip.php");
            xhr_np2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr_np2.addEventListener("load", function () 
            {
                if (xhr_np2.response == 'ok') console.log("tmp zip removed successfully");
            }, false); 
            xhr_np2.send(filename_post);
        }, false); 
        xhr_np.send();
    }
    document.querySelector("#download").classList.add("icon-rien-save");
}


function download(text, filename)
{
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function download_one_file(event)
{
    var row = event.target.parentElement.parentElement.rowIndex;
    var tableau_selectionne = event.target.parentElement.parentElement.firstChild.innerHTML.split("\t")[0];
    if (tableau_selectionne == "PLAYLIST") tableau_selectionne = playlists;
    else if (tableau_selectionne == "TAG") tableau_selectionne = tags;
    else tableau_selectionne = albums;
    var code = tableau_selectionne[row].source_code;
    var nom_code = tableau_selectionne[row].titre_code;
    download(code, nom_code);
    //empecher l'event de se poursuivre
    event.stopPropagation();
}


function recuppere_tous_codes_et_noms()
{
    var code = [];
    var file_names = [];
    for (var i=0; i<playlists.length; i++)
    {
        code.push(playlists[i].source_code);
        file_names.push(playlists[i].titre_code);
    }
    for (var i=0; i<tags.length; i++)
    {
        code.push(tags[i].source_code);
        file_names.push(tags[i].titre_code);
    }
    for (var i=0; i<albums.length; i++)
    {
        code.push(albums[i].source_code);
        file_names.push(albums[i].titre_code);
    }
    return [code, file_names];
}


/**
fonction download file from current path : télécharge un fichier du dossier courant à partir de son nom
adapté de https://stackoverflow.com/a/27944062
@param {string} filename nom du fichier à télécharger
@returns rien
**/
function download_file_from_current_path(filename)
{
    var local_path = window.location.origin+window.location.pathname;
    var element = document.createElement('a');
    element.setAttribute('href', local_path.split("apm.html")[1] +  filename);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function add_from_disk()
{
    var fichiers = document.querySelector("#add_apm_files").files;
    for (var i =0; i<fichiers.length; i++)
    {
        var reader = new FileReader();
        reader.fileName = fichiers[i].name;
        //add filename https://stackoverflow.com/a/33520129
        reader.onload = function (evt) 
        {
            main_creer_interpreter_code(evt.target.fileName, evt.target.result, false);
        }
        reader.readAsText(fichiers[i], "UTF-8");
    } 
}