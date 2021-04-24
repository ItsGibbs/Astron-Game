export {startGame,  dieanim, player, updateGameArea}
import {collide} from './collide.js';
import{testcollide} from './testcollide.js';
import {playermove} from './player.js';
import {ennemimove} from './ennemi.js';
import {playerShoot, bulletvisible} from './weapon.js';
import {component, myGameArea, camera,  changelevel, scoreboard } from "./object.js"

//création de toute les variables
var player; //Variable joueur
var platforme=[];//tableau comprenant toutes les plataformes
var piegepik = [];
var ennemi = []; //Variable ennemi
var endlevel
var level = [];
var ammo = [];
var coins = [];
var timerfall = 1;
var jump = false;
var walljump = false;
var nbjump = 0;
var walljumptimer = 0;
var numerolevel = 0;
var gameanim = true;
var tmort = 100;
var mortaudio = true;
var affichagex;
var affichagey;
var ammoTimer = 0;
var release = true;
var score = 0;
var timer = 0;



function startGame() { // Fonction au lancement du jeu

    myGameArea.start(); // mise en place du canneva
    level[numerolevel].start();

    var myAudio = new Audio('sprite\\Audio\\MusicLoop.mp3');
    myAudio.loop = true;
    myAudio.play();

}

function updateGameArea() { //fonction main, lue a chaque chaque frameexport {component, myGameArea, camera,  changelevel, scoreboard }

    myGameArea.clear()
    level[numerolevel].update();

    timer = scoreboard(timer, score)

    var playerShootTab = playerShoot(myGameArea, ammo, ammoTimer, player, bulletvisible)
    ammoTimer = playerShootTab[1]

    camera(player, platforme, piegepik, ennemi, endlevel, level, numerolevel, coins)

    var collidetab = collide(timerfall, jump, walljumptimer, player, platforme, nbjump, piegepik, ennemi, ammo, myGameArea, coins, score)
    timerfall = collidetab[0]
    nbjump = collidetab[1]
    jump = collidetab[2]
    walljumptimer = collidetab[3]
    player = collidetab[4]
    ammo = collidetab[8]
    score = collidetab[10]

    var playermovetab = playermove(timerfall, jump, walljumptimer, nbjump, walljump, player, platforme, myGameArea, release);
    timerfall = playermovetab[0]
    jump = playermovetab[1]
    walljumptimer = playermovetab[2]
    nbjump = playermovetab[3]
    walljump = playermovetab[4]
    player = playermovetab[5]
    platforme = playermovetab[6]
    release = playermovetab[7]

    ennemi = ennemimove(ennemi)

    


    player.newPos(); //raffraichit les positions du joueur
    player.update(); //affiche le joueur

    endlevel.newPos()
    endlevel.update()

    for (var i = 0; i < ennemi.length; i++) { //incrémente de 1 la variables de l'intervalle du pattern des ennemies
        ennemi[i].time++
    }
    for (var i = 0; i < platforme.length; i++) { //boucle pour afficher toute les platformes
        platforme[i].newPos()
        platforme[i].update();
    }
    for (var i = 0; i < piegepik.length; i++) {
        piegepik[i].newPos();
        piegepik[i].update();
    }
    for (var i = 0; i < ennemi.length; i++) {
        ennemi[i].newPos();
        ennemi[i].update();
        ennemi[i].speedY = 1;
    }
    for (var i = 0; i < coins.length; i++) {
        coins[i].newPos();
        coins[i].update();
    }

    var changeleveltab = changelevel(testcollide, player, endlevel, platforme, piegepik, ennemi, level, ammo, coins, numerolevel,gameanim) 
    numerolevel = changeleveltab[0]
    gameanim = changeleveltab[6]


    if (myGameArea.keys && myGameArea.keys[27]) { //menu pause
        if (requestAnimationFrame(pause) == false) {
            requestAnimationFrame(pause)
        }
    }

    if (gameanim == true) {
        if (requestAnimationFrame(updateGameArea) == false) {
            requestAnimationFrame(updateGameArea);
        }
    }
}

function dieanim() { //fonction qui s'enclenche quand le personnage meurt

    var audio = new Audio('sprite\\Audio\\Die.wav');
    var ctx = myGameArea.canvas.getContext("2d");
    var img = document.getElementById("PlayerDead");

    if (mortaudio == true) {
        audio.play();
        mortaudio = false
        affichagex = player.x - player.width * 0.3
        affichagey = player.y - player.height / 2
    }
    ctx.drawImage(img, affichagex, affichagey, 30 * 1.3, 30 * 1.3)

    player.image = null
    player.update();
    player.x = 0
    player.y = 0
    player.width = 0
    player.height = 0

    for (var i = 0; i < piegepik.length; i++) {
        piegepik[i].width = 0
        piegepik[i].height = 0
    }
    tmort--

    if (tmort > 0) {

        gameanim = false
        requestAnimationFrame(dieanim)

    } else if (tmort == 0) {

        gameanim = true
        tmort = 100

        player.speedX = 0
        player.speedY = 0
        level[numerolevel].start()
        mortaudio = true

        requestAnimationFrame(updateGameArea);
    }
}

function pause() {
    if (myGameArea.keys && myGameArea.keys[13] && gameanim == false) {
        var audio = new Audio('sprite\\Audio\\CloseMenu.ogg');
        audio.play();
        gameanim = true
        if (requestAnimationFrame(updateGameArea) == false) {
            requestAnimationFrame(updateGameArea);
        }

    } else if (myGameArea.keys && myGameArea.keys[8] && gameanim == false) {
        var audio = new Audio('sprite\\Audio\\Jump.wav');
        audio.play();
        gameanim = true
        requestAnimationFrame(updateGameArea);
        player.speedX = 0
        player.speedY = 0
        level[numerolevel].start()
    } else {
        var ctx = myGameArea.canvas.getContext("2d");
        var img = document.getElementById("PauseMenu");
        ctx.drawImage(img, 0, 0, 1000, 1000 / (16 / 9));
        gameanim = false
        requestAnimationFrame(pause)
    }


    return [myGameArea, updateGameArea, gameanim]
}

level[0] = {
    start: function() {
        /* ----------- reset score ----------- */
        score = 0;
        /* ----------- création du joueur ----------- */
        player = new component(25, 25, "red", 0, 420, "PlayerStandingFace"); //création du joueur
        /* ----------- etage 1 ----------- */
        player = new component(30, 30, "red", 0, 400); //crÃ©ation du joueur
        platforme[0] = new component(30, 2000, "blue", 0, 0); //wall
        platforme[1] = new component(30, 2000, "blue", 1970, 0);
        platforme[2] = new component(720, 30, "blue", 0, 470); //sole
        platforme[3] = new component(938, 30, "blue", 844, 470);
        platforme[4] = new component(95, 31, "blue", 1875, 469);
        platforme[5] = new component(90, 10, "blue", 1408, 345); //platform suspendu
        platforme[6] = new component(95, 30, "blue", 1750, 314);
        platforme[7] = new component(94, 124, "blue", 30, 0); //plafond
        platforme[8] = new component(96, 93, "blue", 124, 0);
        platforme[9] = new component(248, 156, "blue", 220, 0);
        platforme[10] = new component(93, 30, "blue", 468, 0);
        platforme[11] = new component(123, 156, "blue", 626, 0);
        platforme[12] = new component(124, 93, "blue", 750, 0);
        platforme[13] = new component(124, 156, "blue", 813, 0);
        platforme[14] = new component(62, 93, "blue", 937, 0);
        platforme[15] = new component(249, 30, "blue", 1000, 0);
        platforme[16] = new component(372, 124, "blue", 1188, 0);
        platforme[17] = new component(310, 156, "blue", 1250, 0);
        platforme[18] = new component(217, 187, "blue", 1344, 0);
        platforme[19] = new component(94, 143, "blue", 1560, 12);
        platforme[20] = new component(348, 11, "blue", 1560, 0);
        platforme[21] = new component(92, 125, "blue", 1625, 62);
        platforme[22] = new component(155, 60, "blue", 1690, 157);
        platforme[23] = new component(93, 93, "blue", 1907, 0);
        platforme[24] = new component(26, 57, "red", 1253, 410); //tuyau
        platforme[25] = new component(86, 26, "red", 1255, 409);
        platforme[26] = new component(26, 57, "red", 1315, 410);
        platforme[27] = new component(57, 26, "red", 1315, 441);
        platforme[28] = new component(30, 309, "red", 1940, 160); //tuyau2
        platforme[29] = new component(29, 27, "red", 1911, 442);
        /* ----------- etage 2 ----------- */
        platforme[30] = new component(1782, 30, "blue", 0, 500); //plafond
        platforme[31] = new component(30, 30, "blue", 1751, 530);
        platforme[32] = new component(94, 31, "blue", 1906, 499);
        platforme[33] = new component(156, 188, "blue", 1250, 530);
        platforme[34] = new component(374, 126, "blue", 969, 530);
        platforme[35] = new component(186, 95, "blue", 813, 530);
        platforme[36] = new component(33, 30, "blue", 780, 530);
        platforme[37] = new component(248, 63, "blue", 532, 530);
        platforme[38] = new component(155, 125, "blue", 438, 530);
        platforme[39] = new component(186, 63, "blue", 282, 530);
        platforme[40] = new component(217, 94, "blue", 157, 530);
        platforme[41] = new component(188, 125, "blue", 30, 530);
        platforme[42] = new component(125, 156, "blue", 30, 530);
        platforme[43] = new component(95, 31, "blue", 1781, 625); //platform
        platforme[44] = new component(95, 31, "blue", 1687, 719);
        platforme[45] = new component(95, 31, "blue", 1875, 719);
        platforme[46] = new component(95, 31, "blue", 1781, 875);
        platforme[47] = new component(155, 31, "blue", 1407, 625);
        platforme[48] = new component(92, 188, "blue", 282, 782);
        platforme[49] = new component(63, 123, "blue", 30, 970);
        platforme[50] = new component(60, 31, "red", 1911, 529); //tuyau1
        platforme[51] = new component(182, 31, "red", 1534, 940); //tuyau2
        platforme[52] = new component(30, 345, "red", 1562, 530); //tuyau3
        platforme[53] = new component(26, 247, "red", 1472, 723); //tuyau4
        platforme[54] = new component(27, 28, "red", 1379, 718); //tuyau5
        platforme[55] = new component(28, 121, "red", 254, 848); //tuyau6
        platforme[56] = new component(1812, 61, "blue", 188, 970); //sole
        platforme[57] = new component(63, 123, "blue", 30, 970);
        platforme[58] = new component(90, 10, "blue", 1283, 906); //platform suspendu
        platforme[59] = new component(90, 10, "blue", 1064, 844);
        platforme[60] = new component(90, 10, "blue", 689, 750);
        platforme[61] = new component(90, 10, "blue", 502, 844);
        platforme[62] = new component(90, 21, "blue", 877, 876); //tapis roulant
        /*----------- etage 3 ----------- */
        platforme[63] = new component(405, 30, "blue", 0, 1470); //sole
        platforme[64] = new component(718, 30, "blue", 563, 1470);
        platforme[65] = new component(155, 30, "blue", 1438, 1470);
        platforme[66] = new component(125, 373, "blue", 30, 1095); //platform
        platforme[67] = new component(63, 30, "blue", 155, 1125);
        platforme[68] = new component(93, 30, "blue", 375, 1157);
        platforme[69] = new component(156, 33, "blue", 438, 1403);
        platforme[70] = new component(31, 30, "blue", 500, 1344);
        platforme[71] = new component(124, 33, "blue", 594, 1247);
        platforme[72] = new component(93, 30, "blue", 844, 1375);
        platforme[73] = new component(91, 22, "blue", 220, 1282); //tapis roulant
        platforme[74] = new component(28, 28, "red", 155, 1155); //tuyau1
        platforme[75] = new component(28, 60, "red", 938, 1093); //tuyau2
        platforme[76] = new component(26, 63, "red", 1190, 1281); //tuyau3
        platforme[77] = new component(26, 63, "red", 1190, 1406);
        platforme[78] = new component(178, 28, "red", 1286, 1218); //tuyau4
        platforme[79] = new component(93, 156, "blue", 1563, 1500); //plafond
        platforme[80] = new component(91, 124, "blue", 1626, 1563);
        platforme[81] = new component(154, 62, "blue", 1688, 1657);
        platforme[82] = new component(281, 31, "blue", 563, 1031);
        platforme[83] = new component(219, 94, "blue", 656, 1031);
        platforme[84] = new component(344, 63, "blue", 750, 1031);
        platforme[85] = new component(157, 157, "blue", 1031, 1031);
        platforme[86] = new component(63, 157, "blue", 1156, 1124);
        platforme[87] = new component(407, 188, "blue", 1187, 1031);
        platforme[88] = new component(217, 156, "blue", 1532, 1031);
        platforme[89] = new component(251, 188, "blue", 1719, 1031);
        platforme[90] = new component(157, 188, "blue", 1813, 1218);
        platforme[91] = new component(126, 31, "blue", 1844, 1406);
        platforme[92] = new component(63, 157, "blue", 1907, 1436);
        /*----------- etage 4 ----------- */
        platforme[93] = new component(2000, 29, "blue", 0, 1999); //sole
        platforme[94] = new component(532, 29, "blue", 30, 1969);
        platforme[95] = new component(312, 29, "blue", 969, 1969);
        platforme[96] = new component(156, 29, "blue", 1375, 1969);
        platforme[97] = new component(313, 29, "blue", 1657, 1969);
        platforme[98] = new component(32, 30, "blue", 1938, 1813); //platforme
        platforme[99] = new component(29, 29, "blue", 1719, 1940); //box
        platforme[100] = new component(29, 90, "blue", 1689, 1878);
        platforme[101] = new component(29, 60, "blue", 1658, 1909);
        platforme[102] = new component(27, 60, "blue", 1502, 1909); //box 2
        platforme[103] = new component(27, 29, "blue", 1471, 1940);
        platforme[104] = new component(27, 29, "blue", 1220, 1940); //box 3
        platforme[105] = new component(27, 152, "blue", 1189, 1815);
        platforme[106] = new component(27, 183, "blue", 1158, 1784);
        platforme[107] = new component(27, 213, "blue", 1127, 1753);
        platforme[108] = new component(27, 183, "blue", 1096, 1784);
        platforme[109] = new component(27, 121, "blue", 1065, 1846);
        platforme[110] = new component(27, 29, "blue", 1034, 1940);
        platforme[111] = new component(91, 27, "blue", 1282, 1814); //platform suspendu
        platforme[112] = new component(91, 27, "blue", 720, 1751);
        platforme[113] = new component(91, 22, "blue", 845, 1907); //tapis roulant
        platforme[114] = new component(91, 22, "blue", 595, 1907);
        platforme[115] = new component(28, 90, "red", 1942, 1879); //tuyau 1
        platforme[116] = new component(28, 122, "red", 1378, 1656); //tuyau 2
        platforme[117] = new component(26, 152, "red", 470, 1817); //tuyau 3
        platforme[118] = new component(23, 213, "red", 441, 1757);
        platforme[119] = new component(78, 23, "red", 384, 1755);
        platforme[120] = new component(23, 55, "red", 381, 1757);
        platforme[121] = new component(23, 83, "red", 411, 1787);
        platforme[122] = new component(83, 25, "red", 379, 1657); //tuyau 4
        platforme[123] = new component(84, 25, "red", 317, 1689);
        platforme[124] = new component(23, 153, "red", 317, 1717);
        platforme[125] = new component(22, 85, "red", 349, 1848);
        platforme[126] = new component(34, 22, "red", 372, 1910);
        platforme[127] = new component(1188, 31, "blue", 375, 1500); //plafond
        platforme[128] = new component(217, 157, "blue", 1344, 1530);
        platforme[129] = new component(186, 125, "blue", 1249, 1530);
        platforme[130] = new component(218, 94, "blue", 1188, 1530);
        platforme[131] = new component(218, 32, "blue", 1000, 1530);
        platforme[132] = new component(62, 63, "blue", 937, 1530);
        platforme[133] = new component(124, 126, "blue", 813, 1530);
        platforme[134] = new component(124, 63, "blue", 750, 1530);
        platforme[135] = new component(123, 125, "blue", 626, 1530);
        platforme[136] = new component(218, 63, "blue", 438, 1530);
        platforme[137] = new component(248, 155, "blue", 220, 1500);
        platforme[138] = new component(96, 94, "blue", 124, 1500);
        platforme[139] = new component(94, 124, "blue", 30, 1500);

        /* ----------- pieges ----------- */
        piegepik[0] = new component(124, 18, "white", 720, 482); //etage1
        piegepik[1] = new component(254, 20, "white", 1716, 950); //etage2
        piegepik[2] = new component(254, 20, "white", 1716, 950); //etage2
        piegepik[3] = new component(36, 20, "white", 1498, 950);
        piegepik[4] = new component(1097, 20, "white", 375, 950);
        piegepik[5] = new component(249, 20, "white", 156, 1450); //etage3
        piegepik[6] = new component(156, 20, "white", 406, 1480);
        piegepik[7] = new component(156, 15, "white", 438, 1388);
        piegepik[8] = new component(124, 15, "white", 594, 1232);
        piegepik[9] = new component(62, 20, "white", 719, 1450);
        piegepik[10] = new component(94, 15, "white", 844, 1358);
        piegepik[11] = new component(125, 20, "white", 1031, 1450);
        piegepik[12] = new component(156, 20, "white", 1281, 1480);
        piegepik[13] = new component(125, 20, "white", 1532, 1980); //etage 4
        piegepik[14] = new component(93, 20, "white", 1282, 1980);
        piegepik[15] = new component(89, 25, "white", 1283, 1840);
        piegepik[16] = new component(405, 20, "white", 563, 1980);
        piegepik[17] = new component(89, 25, "white", 721, 1780);
        /*---------- ennemie-------*/
        ennemi[0] = new component(30, 30, "red", 900, 440);
        ennemi[0].image = "Ennemi1"
        ennemi[1] = new component(30, 30, "red", 900, 300);
        ennemi[1].image = "EnnemiFlying"

        /*-----------finlevel------*/
        endlevel = new component(100, 100, "white", 0, 1900);


        /*-----------Piece---------*/
        coins[0] = new component(30, 30, "yellow", 400, 400)



        for (var i = 0; i < coins.length; i++) {
            coins[i].image = "CoinLarge"
        }

        this.x = 0
        this.y = 0
        this.width = 2000
        this.height = 2000



    },


    update: function() {
        var ctx = myGameArea.canvas.getContext("2d");
        var img = document.getElementById("level1");
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
}

level[1] = {
    start: function() {

        platforme = []
        platforme = []; //tableau comprenant toutes les plataformes
        piegepik = [];
        ennemi = []; //Variable ennemi
        ammo = [];
        coins = [];


        player = new component(25, 25, "red", 0, 400, "PlayerStandingFace"); //création du joueur
         platforme[0]= new component(31,512,"blue",0,0); //wall
        platforme[1]= new component(543,30,"blue",0,481); //sole
        platforme[2]= new component(28,28,"blue",226,194); //plateform
        platforme[3]= new component(28,28,"blue",386,258);
        piegepik[0]= new component(1153,15,"white",543,496); //piege
        platforme[4]= new component(96,14,"blue",608,416); //plateform
        platforme[5]= new component(96,14,"blue",608,288);
        platforme[6]= new component(96,14,"blue",768,352);
        platforme[7]= new component(96,14,"blue",768,224);
        platforme[8]= new component(96,14,"blue",928,160);
        platforme[9]= new component(130,10,"blue",1023,381);
        piegepik[1]= new component(126,15,"white",1025,366); //piege
        platforme[10]= new component(96,14,"blue",1152,159); //plateform
        platforme[11]= new component(96,14,"blue",1248,416);
        platforme[12]= new component(96,14,"blue",1504,416);
        platforme[13]= new component(415,30,"blue",1696,481); //sole
        platforme[14]= new component(26,60,"red",1924,420); //tuyau
        platforme[15]= new component(96,28,"red",2016,451);
        piegepik[2]= new component(610,15,"white",2112,496); //piege
        platforme[16]= new component(160,26,"red",2208,355); //tuyau
        platforme[17]= new component(26,130,"red",2435,128);
        platforme[18]= new component(26,160,"red",2563,256);
        platforme[19]= new component(92,26,"red",2656,452);
        platforme[20]= new component(354,30,"blue",2720,481); //sole
        platforme[21]= new component(130,32,"blue",2943,449); //escalier
        platforme[22]= new component(96,32,"blue",2976,417);
        platforme[23]= new component(64,32,"blue",3009,385);
        platforme[24]= new component(32,32,"blue",3041,353);
        platforme[25]= new component(63,10,"blue",3073,353); //plateform
        piegepik[3]= new component(255,15,"white",3073,496); //piege
        platforme[26]= new component(63,10,"blue",3263,353); //plateform
        platforme[27]= new component(65,160,"blue",3326,353);
        piegepik[4]= new component(767,15,"white",3393,496); //piege
        platforme[28]= new component(32,10,"blue",3488,320); //plateform
        platforme[29]= new component(32,10,"blue",3616,288);
        platforme[30]= new component(30,13,"blue",3745,256);
        platforme[31]= new component(32,10,"blue",3872,224);
        platforme[32]= new component(30,13,"blue",4001,192);
        platforme[33]= new component(90,10,"blue",4131,192); //plateform suspendu
        platforme[34]= new component(32,40,"blue",4160,446); //wall
        piegepik[5]= new component(32,15,"white",4160,430);
        platforme[35]= new component(32,104,"blue",4192,382); //wall
        piegepik[6]= new component(32,15,"white",4192,366);
        platforme[36]= new component(32,168,"blue",4224,318); //wall
        piegepik[7]= new component(32,15,"white",4224,302);
        platforme[37]= new component(32,34,"blue",4256,382); //wall
        piegepik[8]= new component(32,15,"white",4256,366);
        platforme[38]= new component(766,30,"blue",4160,481); //sole
        piegepik[9]= new component(32,18,"white",4256,463);
        platforme[39]= new component(32,10,"blue",4672,384); //plateform
        platforme[40]= new component(64,12,"blue",4576,288);
        platforme[41]= new component(32,130,"blue",4800,350); //tree
        platforme[42]= new component(32,4,"blue",4768,418);
        platforme[43]= new component(32,4,"blue",4832,386);
        platforme[44]= new component(92,33,"blue",4770,318);
        platforme[45]= new component(124,59,"blue",4738,260);
        platforme[46]= new component(59,33,"blue",4803,228);
        piegepik[10]= new component(320,18,"white",4928,494); //piege
        piegepik[11]= new component(96,18,"white",5344,494);
        piegepik[12]= new component(96,18,"white",5536,494);
        piegepik[13]= new component(160,18,"white",5728,494);
        platforme[47]= new component(92,22,"blue",4994,417); //tapis roulant
        platforme[48]= new component(96,32,"blue",5248,480); //plateform1
        platforme[49]= new component(96,64,"blue",5440,448); //plateform2
        platforme[50]= new component(96,96,"blue",5632,416); //plateform3
        platforme[51]= new component(32,10,"blue",5856,352); //plateform4
        platforme[52]= new component(96,32,"blue",5632,288); //plateform5
        platforme[53]= new component(96,32,"blue",5440,256); //plateform6
        platforme[54]= new component(68,32,"blue",5454,288);
        platforme[55]= new component(96,32,"blue",5440,320);
        platforme[56]= new component(96,32,"blue",5248,224); //plateform7
        platforme[57]= new component(68,100,"blue",5262,255);
        platforme[58]= new component(96,32,"blue",5248,352);
        platforme[59]= new component(800,32,"blue",5376,128); //sole
        piegepik[14]= new component(94,18,"white",5441,110); //piege
        piegepik[15]= new component(30,18,"white",5601,110);
        piegepik[16]= new component(126,18,"white",5697,110);
        platforme[60]= new component(26,130,"red",6275,0); //tuyau
        platforme[61]= new component(320,97,"blue",5888,160); //sole
        platforme[62]= new component(224,33,"blue",5888,256);
        platforme[63]= new component(192,98,"blue",5888,288);
        platforme[64]= new component(224,33,"blue",5888,385);
        platforme[65]= new component(256,33,"blue",5888,417);
        platforme[66]= new component(320,33,"blue",5888,449);
        platforme[67]= new component(31,10,"blue",6337,192); //plateform
        platforme[68]= new component(128,32,"blue",6368,160); //sole
        platforme[69]= new component(160,32,"blue",6368,192);
        platforme[70]= new component(224,32,"blue",6368,224);
        platforme[71]= new component(224,32,"blue",6464,255);
        platforme[72]= new component(288,32,"blue",6496,287);
        platforme[73]= new component(320,32,"blue",6496,319);
        platforme[74]= new component(352,32,"blue",6496,351);
        platforme[75]= new component(480,33,"blue",6464,383);
        platforme[76]= new component(608,33,"blue",6432,416);
        platforme[77]= new component(736,33,"blue",6368,449);
        platforme[78]= new component(2304,30,"blue",5888,481);
        platforme[79]= new component(31,512,"blue",8192,0); //wall
        
        /* ----------- plafond ----------- */
        platforme[80]= new component(161,95,"blue",30,0);
        platforme[81]= new component(96,63,"blue",191,0);
        platforme[82]= new component(286,95,"blue",257,0);
        platforme[83]= new component(161,63,"blue",543,0);
        platforme[84]= new component(190,95,"blue",705,0);
        platforme[85]= new component(160,63,"blue",895,0);
        platforme[86]= new component(193,31,"blue",1055,0);
        platforme[87]= new component(638,63,"blue",1249,0);
        platforme[88]= new component(222,32,"blue",1281,63);
        platforme[89]= new component(190,32,"blue",1601,63);
        platforme[90]= new component(1124,31,"blue",1851,0);
        platforme[91]= new component(446,31,"blue",1985,31);
        platforme[92]= new component(94,32,"blue",2017,62);
        platforme[93]= new component(254,33,"blue",2177,62);
        platforme[94]= new component(94,33,"blue",2241,94);
        platforme[95]= new component(222,33,"blue",2497,30);
        platforme[96]= new component(93,32,"blue",2530,62);
        platforme[97]= new component(381,63,"blue",2753,0);
        platforme[98]= new component(1213,95,"blue",2849,0);
        platforme[99]= new component(158,32,"blue",2977,94);
        platforme[100]= new component(158,96,"blue",3329,94);
        platforme[101]= new component(191,33,"blue",3487,94);
        platforme[102]= new component(190,33,"blue",3777,94);
        platforme[103]= new component(898,63,"blue",4062,0);
        platforme[104]= new component(670,33,"blue",4225,62);
        platforme[105]= new component(542,33,"blue",4289,95);
        platforme[106]= new component(350,32,"blue",4353,128);
        platforme[107]= new component(222,32,"blue",4385,160);
        platforme[108]= new component(190,128,"blue",4385,192);
        platforme[109]= new component(128,32,"blue",4352,320);
        piegepik[17]= new component(32,17,"white",4352,303); //piege
        platforme[110]= new component(96,32,"blue",4352,352);
        platforme[111]= new component(128,31,"blue",4320,384);
        piegepik[18]= new component(32,17,"white",4320,367); //piege
        platforme[112]= new component(350,95,"blue",4961,0);
        platforme[113]= new component(579,31,"blue",5311,0);
        platforme[114]= new component(191,63,"blue",5889,0);
        platforme[115]= new component(481,31,"blue",6080,0);
        platforme[116]= new component(255,63,"blue",6561,0);
        platforme[117]= new component(255,127,"blue",6816,0);
        platforme[118]= new component(1121,32,"blue",7071,0);
        platforme[119]= new component(191,32,"blue",7071,31);
        platforme[120]= new component(160,32,"blue",7071,62);
        endlevel = new component(160,32,"blue",7071,62);
        this.x = 0
        this.y = 0
        this.width = 8192
        this.height = 512
       

    },


    update: function() {
        var ctx = myGameArea.canvas.getContext("2d");
        var img = document.getElementById("level2");
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
}