class Code
{
    constructor(type, nom, auteur, freeze, 
        titles_among, number_of_titles, random_titles, categories, titles_of_categories, titles_duration, 
        color, total_duration, alternate, timer, 
        source_file, titre_code, source_code, 
        virtual)
    {
        //type = playlist, tag, album
        this.type = type;
        //nom : de la playlist/tag/album
        this.nom = nom;
        //auteur : si album
        this.auteur = auteur;
        //freeze : true or false, si oui pas de random play. défaut à faux
        //si freeze est vrai, la playlist n'est pas réinterprétée à chaque fois qu'elle est jouée.
        this.freeze = freeze;

        //titles_among : musiques dans lesquels le code peut piocher
        this.titles_among = titles_among;
        //number of titles : all si tout, sinon nombre
        this.number_of_titles = number_of_titles;
        //random_titles : true ou false, choisit des titres aléatoirement dans amongtitles
        this.random_titles = random_titles;
        //categories : pour alternate, on a besoin des noms des catégories à jouer alternativement
        this.categories = categories;
        //titles_of_categories : pour chaque catégorie, liste des titres qu'elle contient
        this.titles_of_categories = titles_of_categories;
        //titles_duration, en secondes. 1er champ : sup ou inf, second : temps en sec
        this.titles_duration = titles_duration;

        //color : pour les tags. accepte hexadécimal ou rgb(a)
        this.color = color;
        //total_duration : combien de temps dure la playlist au total
        this.total_duration = total_duration;
        //alternate : tableau contenant le nombre de musiques jouées par catégorie
        this.alternate = alternate;
        //timer bippe tout les x temps en secondes (sonorité à déterminer)
        this.timer = timer;

        //source file permet de relire le fichier pour le réinterpréter si besoin
        this.source_file = source_file;
        //titre code est le nom donné par l'utilisateur au code
        this.titre_code = titre_code;
        //source_code : entièreté du code
        this.source_code = source_code;
        //virtual : si le Code est virtuel, il est détruit une fois que la playlist/tag qui l'a créé est détruit
        this.virtual = false;
    }

    set_virtual()
    {
        //le Code créé est virtuel, détruit à la fin de la pile de fonctions qui l'a créé
        this.virtual = true;
    }
}