//Naelle Guillon
//14/03/2024
//general functions : fonctions js non spécifiques au projet

//getOS() : string
//rng(limite, table dans laquelle le stocker et vérifier s'il n'existe pas déjà) : int
//remove event listeners(elements, action, fonction) : void
//add event listeners(elements, action, fonction) : void
//shuffle(array) : array
//rgb to hsl(rgb) : string



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

//rng entier entre 0 et la limite non incluse
//si rng déjà dans un array, recommence
//push rng dans tab
//return rng
function rng(limit, table_rng)
{
    var rng = Math.floor(Math.random()*limit);
    while(table_rng.includes(rng))
    {
        rng = Math.floor(Math.random()*limit);
    }
    table_rng.push(rng);
    return rng;
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

//https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
function rgb_to_hsl(rgb_color)
{
    //https://stackoverflow.com/a/11003212
    var rgb = rgb_color.match(/\d+/g);
    rgb = rgb.map(Number);
    //r,g,b E [0,1]
    if (rgb[0] > 1 || rgb[1] > 1 || rgb[2] > 1)
    {
        for (i=0; i<rgb.length; i++)
        {
            rgb[i] = rgb[i]/256;
        }
    }
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];

    var Xmax = Math.max(...rgb);
    var Xmin = Math.min(...rgb);
    //c chroma
    var c = Xmax - Xmin;
    //https://stackoverflow.com/a/8023734
    var diffc = x => (Xmax - x) / 6 / c + 1 / 2;
    var rr = diffc(r);
    var gg = diffc(g);
    var bb = diffc(b);
    //l lightness
    var l = (Xmax + Xmin)/2;
    //h hue
    var h = 0;
    /*
    ne marche pas quand plusieurs couleurs ont la même valeur*/
    if (Xmax == r) h = ((g-b)/c) % 6;
    else if (Xmax == g) h = ((b-r)/c) + 2;
    else if (Xmax == b) h = ((r-g)/c) + 4;
    
    /*ne marche pas non plus quand r=g=b
    if (Xmax == r) h = bb - gg;
    else if (Xmax == g) h = (1/3) + rr - bb;
    else if (Xmax == b) h = (2/3) + gg - rr;*/
    if (Number.isNaN(h)) h = 0;
    //s saturation
    var s = 0;
    if (l != 0 || l != 1) s = (Xmax-l)/(Math.min(l, 1-l));
    //return h,s,l
    return [h*60, s*100, l*100];
}

function check_correct_boundaries(num, min, max)
{
    if (num < min) num = min;
    else if (num > max) num = max;
    return num;
}