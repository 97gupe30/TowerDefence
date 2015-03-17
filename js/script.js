var level = 1;
var enemies = [[], 3, 0, 0]; // INDEX 0 = Fiende object INDEX 1 = Hur många finder som ska komma på denna leveln.(3 = DEFAULT) INDEX 2 = Antal fiender ute på planen. INDEX 3 = Fiendens hastighet. INDEX 4 = Används till att röra tornen
var towers = [];
var towerShots = [];
var towerCount = 0; // Räknar antal torn som finns ute.
var currentEnemies = []; // sparar allt om fienderna när man pausar.
var speed = []; // Sparar fiendernas hastigheter när man pausar
var menus = new Menu();
var menuP = 'unpause'; // Håller koll på om vi ska pausa eller ta bort pausen.
var canMove = true;
var intro = true;

//Skott variabler
var superBeam = false; // true == CD är på.


// Värde variabler
var hp = 100;
var money = 100;

// Booleans
var genEnemy = true; // Ifall man ska kunna generera nya fiender.
var moveActive = false; // Ifall man kan flytta torn eller inte.
var confirm = false; // Till reset menyn
var confirmWave = false; // Om vi ska fortsätta på näste wave eller inte.
var stroke = true;
var settings = false;
var confirmMove; // Till menyer.

// timer variabler;
var infoBox;
var cdTimeout;
var spawn;
var savecdTimeout;

// Ljud variabler
var backgroundMusic;

var spritesheets = [];
var animations = [];
var spriteCount = 0;
var tpSender = 0;
var tpReciever = 0;

//Musik
var bgMusic = true;

var map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1]
]

function init() {
    game = document.getElementById('camera');
    ctx = game.getContext('2d');
    game.addEventListener("mousedown", getPosition, false);

    backgroundMusic = sound = new Howl({
        urls: ['music/background.mp3'],
        autoplay: true,
        loop: true,
        volume: 0.5,
    });

    window.setInterval(animate, 25);
    spawn = window.setInterval(generate, 1000);
} 

function Achivement(name, unlockMethod, counter, typePrice, price) {
    this.name = name;
    this.unlock = unlockMethod;
    this.count = counter;
    this.price = price;
    this.typePrice = typePrice;
    this.check = function() {
        if(this.unlock >= this.count) {
            this.typePri
        }
    }
}


function SpriteSheet(path, frameWidth, frameHeight, id) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.id = id;

    // calculate the number of frames in a row after the image loads
    var self = this;
    this.image.onload = function() {
        self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
    };

    this.image.src = path;
}

function Animation(spritesheet, frameSpeed, startFrame, endFrame, x, y, id, towerId) {
    this.towerId = towerId;
    var animationSequence = [];  // array holding the order of the animation
    var currentFrame = 0;        // the current frame to draw
    var counter = 0;             // keep track of frame rate
    this.x = x;
    this.y = y;
    this.id = id;

    // create the sequence of frame numbers for the animation
    for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
        animationSequence.push(frameNumber);

    // Update the animation
    this.update = function() {

        // update to the next frame if it is time
        if (counter == (frameSpeed - 1))
            currentFrame = (currentFrame + 1) % animationSequence.length;
        if(currentFrame >= endFrame - 1) {
            for(var k = 0; k < animations.length; k++) {
                if(animations[k].id == this.id) {
                    animations.splice(k, 1);
                }
            }
        }
        // update the counter
        counter = (counter + 1) % frameSpeed;
    };

    // draw the current frame
    this.draw = function() {
        // get the row and col of the frame
        var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
        var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

        ctx.drawImage(
            spritesheet.image,
            col * spritesheet.frameWidth, row * spritesheet.frameHeight,
            spritesheet.frameWidth, spritesheet.frameHeight,
            this.x, this.y,
            spritesheet.frameWidth, spritesheet.frameHeight);
    };
}

function keyHandler(event) {
    var key = event.keyCode;
    if(key == 27) {
        menus.settings();
    }
    if(moveActive && canMove) { // Flytta torn
        if(key == 65) {
            towers[enemies[3]].x -= 50;
            for(var i = 0; i < animations.length; i++) {
                if(animations[i].towerId == towers[enemies[3]].id) {
                    animations[i].x -= 50;
                }
            }
        } else if(key == 68) {
            towers[enemies[3]].x += 50;
            for(var i = 0; i < animations.length; i++) {
                if(animations[i].towerId == towers[enemies[3]].id) {
                    animations[i].x += 50;
                }
            }
        } else if(key == 87) {
            towers[enemies[3]].y -= 50;
            for(var i = 0; i < animations.length; i++) {
                if(animations[i].towerId == towers[enemies[3]].id) {
                    animations[i].y -= 50;
                }
            }
        } else if(key == 83) {
            towers[enemies[3]].y += 50;
            for(var i = 0; i < animations.length; i++) {
                if(animations[i].towerId == towers[enemies[3]].id) {
                    animations[i].y += 50;
                }
            }
        } else if(key == 13) {
            if(map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] == 0) {
                document.getElementById('infoBox').innerHTML = "You can't place a tower on the road.";
            } else if(map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] != 0 && map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] != 1) {
                document.getElementById('infoBox').innerHTML = "You can't place a tower outside the map.";
            } else {
                var check = 0;
                for(var i = 0; i < towers.length; i++) {
                    if(towers[enemies[3]].x == towers[i].x && towers[enemies[3]].y == towers[i].y && towers[enemies[3]].id != towers[i].id) {
                        document.getElementById('infoBox').innerHTML = "You can't place a tower on another tower.";
                        check = 1;
                    }
                }
                if(check == 0) {
                    document.getElementById('infoBox').innerHTML = "";
                    moveActive = false;
                }
            }

        }
    }




    if(key == 82) { // "R", Starta reset menyn
        document.getElementById('infoBox').innerHTML = 'Are you sure you want to restart?<br><br><span id="yes">YES</span> <span id="no">NO</span>';
        document.getElementById('infoBox').style.top = '450px';
        document.getElementById('no').style.backgroundColor= 'whitesmoke';
        confirm = true;
        confirmMove = 'right';
    }

    if(confirm) { // Reset menyn.
        if(key == 37) {
            confirmMove = 'left';
            document.getElementById('no').style.backgroundColor = '';
            document.getElementById('yes').style.backgroundColor = 'whitesmoke';
        } else if(key == 39) {
            confirmMove = 'right';
            document.getElementById('yes').style.backgroundColor = "";
            document.getElementById('no').style.backgroundColor= 'whitesmoke';
        } else if(key == 13) {
            confirm = false;
            document.getElementById('infoBox').style.top = '480px';
            if(confirmMove == 'left') {
                menus.restart();
            } else {
                document.getElementById('infoBox').innerHTML = "";
            }
        }
    }

    if(key == 80 && confirmWave != true) {
        menus.pause();
    }

    if(confirmWave && map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] == 1) {
        if(key == 80) {
            document.getElementById('infoBox').innerHTML = "";
            var random = Math.round(Math.random() * 4);
            enemies[1] += random;
            enemies[2] = 0;
            genEnemy = true;
            confirmWave = false;
            canMove = false;

        }      
    } else if(confirmWave && map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] == 0 && key == 80) {
        document.getElementById('infoBox').innerHTML = "You can't start the next wave with a tower on the road.";
    } else if(confirmWave && map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] != 0 && key == 80 && map[Math.floor(towers[enemies[3]].y / 50)][Math.floor(towers[enemies[3]].x / 50)] != 1) {
        document.getElementById('infoBox').innerHTML = "You can't start the next wave with a tower outside the map.";
    }
}


function Menu() {
    this.settings = function() {
        if(settings != true) {
            document.getElementById('over').style.display = 'block';
            document.getElementById('hp').style.opacity = '0.5';
            document.getElementById('money').style.opacity = '0.5';
            document.getElementById('wave').style.display = 'none';
            settings = true;
            this.pause();
        } else {
            document.getElementById('over').style.display = 'none';
            document.getElementById('hp').style.opacity = '1';
            document.getElementById('money').style.opacity = '1';
            document.getElementById('wave').style.display = 'block';
            settings = false;
            this.pause();
        }
    }

    this.dead = function() {
        for(var i = 0; i < enemies[0].length; i++) {
            enemies[0][i].speed = 0;
        }
        genEnemy = false;
        moveActive = false;
        document.getElementById('infoBox').innerHTML = "You died. Press 'R' to restart.";
        for(var i = 0; i < cdTimeout.length; i++) {
            clearTimeout(cdTimeout);
        }
        for(var i = 0; i < towers.length; i++) {
            towers[i].cd = false;
        }
    }

    this.restart = function() {
        document.getElementById('infoBox').innerHTML = "";
        enemies = [[], 3, 0, 5, 0];
        towers = [];
        level = 1;
        hp = 100;
        money = 100;
        genEnemy = true;
        moveActive = false;
        confirm = false;
    }
    var text;
    this.pause = function() {
        if(menuP == 'unpause' && towers.length > 0) {
            canMove = false;
            document.getElementById('infoBox').innerHTML = "";
            menuP = 'pause';
            intro = false;
            for(var i = 0; i < currentEnemies.length; i++) {
                enemies[i] = currentEnemies[i];
            }
            for(var i = 0; i < enemies[0].length; i++) {
                enemies[0][i].speed = speed[i]
            }
            if(enemies[1] != enemies[2]) {
                genEnemy = true;
            }

        } else if(menuP == 'unpause' && towers.length <= 0) {
            document.getElementById('infoBox').innerHTML = "You need to have atleast 1 tower on the map.";
        }
    }

    this.waveClear = function() {
        document.getElementById('infoBox').innerHTML = "Press 'P' to start the next wave.";
        money += 10;
        confirmWave = true;
        enemies[2] = 0;
        level++;
        canMove = true;
    }
}

function Enemy(type, x, y, Ehp, speed, dmg, price, id, active) {
    this.type = type;
    this.x = x * 50;
    this.y = y;
    this.trackX = 0;
    this.trackY = 2;
    this.hp = Ehp;
    this.startHP = Ehp;
    this.speed = speed;
    this.dirr = 'x';
    this.dmg = dmg;
    this.price = price;
    this.id = id;
    this.active = false;
    this.cannon = false;

    this.render = function() {
        ctx.lineWidth = 1;
        ctx.rect(this.x - 15, this.y - 18, 20, 5);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - 15, this.y - 18, this.hp/this.startHP * 20, 5);

        var enemyImg = new Image();
        switch(this.type) {
            case 'banana':
                if(this.hp / this.startHP > 0.5) {
                    enemyImg.src = "images/banana1.png";
                } else if(this.hp / this.startHP <= 0.5) {
                    enemyImg.src = "images/banana1half.png";
                }
                break;
            case 'apple':
                enemyImg.src = "images/apple1.png";
                break;
            case 'orange':
                enemyImg.src = "images/apelsin.png";
                break;
            case 'kokosnot':
                enemyImg.src = "images/kokosnot.png";
                break;
            case 'vindruva':
                enemyImg.src = "images/vindruvor.png";
                break;

        }

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.drawImage(enemyImg, this.x - 12.5, this.y - 12.5);
        ctx.closePath();
        ctx.fill();
    }


    this.walk = function(i) {
        /* console.log(Math.floor(this.y / 50) + " " + Math.floor(this.x / 50));

        if(map[Math.floor(this.y / 50)][Math.floor(this.x / 50)] == 0) {
            if(enemies[0][i].dirr == 'x') {
                this.x += this.speed;
            } else if(enemies[0][i].dirr == 'y') {
                this.y += this.speed;
            }

        } else {
            if(map[Math.floor(this.y / 50) - 1][Math.floor(this.x / 50)] == 0) {
                alert("Fritt höger");
                this.dirr = 'x';
                this.speed = +this.speed;
            } else if(map[Math.floor(this.y / 50) - 1][Math.floor(this.x / 50) - 2] == 0) {
                alert("Fritt vänster");
                this.dirr = 'x';
                this.speed = -this.speed;
            } else if(map[Math.floor(this.y / 50)][Math.floor(this.x / 50) - 1] == 0) {
                alert("Fritt Neråt");
                this.dirr = 'y';
                this.speed = +this.speed;
            } else if(map[Math.floor(this.y / 50) + 2][Math.floor(this.x / 50) - 1] == 0) {
                alert("Fritt uppåt");
                this.dirr = 'y';
                this.speed = -this.speed;
            } else {
                alert("No match");
            }
        }
*/


        if(this.x < 875 && this.y < 340 && this.y > 320) {
            this.x += this.speed;
        } else if(this.x <= 900 && this.x > 125 && this.y >= 225 && this.y <= 250) {
            this.x -= this.speed;
        } else if(this.x < 875 && this.y >= 125 && this.y <= 130) {
            this.x+= this.speed;
        } else if(this.y > 100 && this.y < 225 && this.x >= 875) {
            this.y+= this.speed;
        } else if(this.y > 200 && this.y < 325 && this.x <= 125) {
            this.y += this.speed;
        } else if(this.x >= 875 && this.y > 290) {
            this.y += this.speed;
        }

        if(this.x >= 875 && this.y >= 520) {
            hp -= this.dmg;
            this.die();
        }
    }

    this.die = function() {
        // Denna for-loopen kollar igen alla ID i arrayen enemies [0] och kollar ifall ID:en är samma på den som vi är på just nu. Ifall den är det så tar den bort den från arrayen och fienden har dött.
        for(var i = 0; i < enemies[0].length; i++) { 
            if(enemies[0][i].id === this.id) {
                enemies[0].splice(i, 1);
            }
            if(enemies[0].length == 0 && genEnemy == false) { // När waven är klar.
                menus.waveClear();
            }
        }

    }
}




// KÖP SAKER
function Tower(x, y, r, type, id) { // CD == Om tornet kan skada fiender
    this.x = x;
    this.y = y;
    this.r = r;
    this.type = type;
    this.id = id;
    this.cd = true;

    if(this.type == 'canon_tower') {
        this.imgSrc = 'images/canon_tower-down.png';
    }

    this.render = function() {
        var img = new Image();
        switch(this.type) {
            case 'tower1':
                img.src = "images/tower1.png";
                break;
            case 'ice_tower':
                img.src = "images/ice_tower.png";
                break;
            case 'canon_tower':
                img.src = this.imgSrc;
                break;
            case 'super_beam':
                img.src = 'images/super_beam.png';
        }

        if(stroke) {
            ctx.beginPath();
            ctx.arc(this.x + 25, this.y + 25, this.r, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }

        img.width = 50;
        img.height = 50;
        ctx.beginPath();
        ctx.drawImage(img, this.x, this.y);
        ctx.closePath();
    }

    this.attack = function(j) {
        var dx, dy, d;
        if(menuP == 'pause') {
            if(this.type == 'tower1') {
                for(var i = 0; i < enemies[0].length; i++) { // Räknar ut om fienden är inom tornets Attack Range.
                    dx = enemies[0][i].x - this.x - 25;
                    dy = enemies[0][i].y - this.y - 25;
                    d = Math.sqrt(dx*dx + dy*dy);
                    if(d <= this.r) { // Ifall fienden är inom tornets Attack Range målar vi ut skottet och lägger till en CD.
                        this.attackAnimation(i);
                        if(this.cd) { // Lägger till en 0.5 sekunds CD på tornet
                            enemies[0][i].hp -= 3;
                            if(enemies[0][i].hp <= 0) {
                                money += enemies[0][i].price;
                            }
                            this.cd = false;
                            cdTimeout = setTimeout(function() {
                                towers[j].cd = true;
                            }, 500);
                        }
                    }
                }
            } else if(this.type == 'ice_tower') {
                this.attackAnimation(i);
                for(var i = 0; i < enemies[0].length; i++) { // Räknar ut om fienden är inom tornets Attack Range.
                    dx = enemies[0][i].x - this.x - 25;
                    dy = enemies[0][i].y - this.y - 25;
                    d = Math.sqrt(dx*dx + dy*dy);
                    if(d <= this.r) {
                        if(enemies[0][i].speed != 2 && this.cd) {
                            timerHandler('slow', i, j, enemies[0][i].speed, enemies[0][i].id);
                            enemies[0][i].speed = 2;
                            this.cd = false;
                            setTimeout(function() {
                                towers[j].cd = true;
                            }, 1000);
                        }
                    }
                }
            } else if(this.type == 'canon_tower') {
                for(var i = 0; i < enemies[0].length; i++) { // Räknar ut om fienden är inom tornets Attack Range.
                    dx = enemies[0][i].x - this.x - 25;
                    dy = enemies[0][i].y - this.y - 25;
                    d = Math.sqrt(dx*dx + dy*dy);

                    if(d <= this.r && menuP != 'unpause') { // Ifall fienden är inom tornets Attack Range målar vi ut skottet och lägger till en CD.
                        if(this.cd) { // Lägger till en 0.5 sekunds CD på tornet
                            spritesheets.push(new SpriteSheet('images/explosion.png', 128, 128, spriteCount));
                            var tempx = this.x,
                                tempy = this.y,
                                tempCount = spriteCount,
                                tempId = this.id;
                            spriteCount++;
                            spritesheets.push(new SpriteSheet('images/canon_charge.png', 50, 50, spriteCount));
                            animations.push(new Animation(spritesheets[spriteCount], 2, 0, 19, this.x, this.y, spriteCount));
                            spriteCount++;
                            setTimeout(function() {
                                for(var k = 0; k < spritesheets.length; k++) {
                                    if(spritesheets[k].id == tempCount) {
                                        animations.push(new Animation(spritesheets[k], 2, 0, 16, tempx - 35, tempy - 35, k));
                                    }

                                }
                                for(var k = 0; k < enemies[0].length; k++) {
                                    dx = enemies[0][k].x - towers[tempId].x - 25;
                                    dy = enemies[0][k].y - towers[tempId].y - 25;
                                    d = Math.sqrt(dx*dx + dy*dy);
                                    if(d <= 100 && enemies[0][k].cannon == false) {
                                        enemies[0][k].hp -= 10;
                                        enemies[0][k].cannon = true;
                                    }

                                }
                                for(var k = 0; k < enemies[0].length; k++) {
                                    enemies[0][k].cannon = false;
                                }

                            }, 1050);

                            if(enemies[0][i].hp <= 0) {
                                money += enemies[0][i].price;
                            }

                            this.cd = false;
                            cdTimeout = setTimeout(function() {
                                towers[j].cd = true;
                            }, 2300);
                        }
                    }
                }
            } else if(this.type == 'tp_sender') {
                for(var i = 0; i < enemies[0].length; i++) {
                    dx = enemies[0][i].x - this.x - 25;
                    dy = enemies[0][i].y - this.y - 25;
                    d = Math.sqrt(dx*dx + dy*dy);

                    if(d <= this.r && this.cd) {


                        this.cd = false;
                        cdTimeout = setTimeout(function() {
                            towers[j].cd = true;
                        }, 2300);

                    }
                }
            }
        }

    }

    var rStroke = 0;
    rStroke2 = 0;
    this.attackAnimation = function(i) {
        if(this.type == 'tower1') {
            ctx.beginPath(); // Målar ut laser stråle
            ctx.moveTo(this.x + 25, this.y + 25);
            ctx.lineTo(enemies[0][i].x + 6.25, enemies[0][i].y + 6.25);
            ctx.strokeStyle = "#000055";
            ctx.lineWidth = 2;
            ctx.stroke(); // NÅGOT ÄR FEL HÄR. KOLLA PÅ DET SEN. DET BLIR TVÅ LASRAR.
            ctx.closePath();
        } else if(this.type == 'ice_tower') {
            ctx.beginPath();
            ctx.arc(this.x + 25, this.y + 25, rStroke, 0, 2*Math.PI);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#8ca3e2";
            ctx.stroke();
            ctx.closePath();
            rStroke += 2;
            if(rStroke >= 70) {
                rStroke = 0;
            }
        } else if(this.type == 'super_beam') {
            ctx.beginPath();
            ctx.arc(this.x + 25, this.y + 25, rStroke2, 0, 2*Math.PI);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.closePath();
            rStroke2 += 5;
            if(rStroke2 >= this.r) {
                for(var k = 0; k < enemies[0].length; k++) {
                    var dx = enemies[0][k].x - this.x - 25;
                    var dy = enemies[0][k].y - this.y - 25;

                    var d = Math.sqrt(dx*dx + dy*dy);

                    if(d <= this.r) {
                        enemies[0][k].hp -= 60;
                    }
                }
                spritesheets.push(new SpriteSheet('images/super_beam_animation.png', 50, 50, spriteCount));
                animations.push(new Animation(spritesheets[spriteCount], 9, 0, 24, this.x, this.y, spriteCount, this.id));
                spriteCount++;
                rStroke2 = 0;
                this.cd = false;
                setTimeout(function() {
                    towers[i].cd = true;
                }, 5000);
            }
        }
    }
}

/*function Towershot(x, y, vs, dmg, id) {
    this.x = x;
    this.y = y;
    this.vs = vs;
    this.id = id;

    this.render = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
        this.y -= this.vs;
        this.crashDetect();
    }

    this.crashDetect = function() {
        for(var i = 0; i < enemies[0].length; i++) {
            if(this.x >= enemies[0][i].x && this.x <= enemies[0][i].x + 50 && this.y >= enemies[0][i].y && this.y <= enemies[0][i].y + 50) {
                enemies[0][i].hp -= 10;
            }
        }
    }
} */

function timerHandler(type, i, j, memory, sentid) {
    if(type == 'slow') {
        cdTimeout = setTimeout(function() {
            // Denna foor loopen fixar en bugg som fanns med ice-tower då fiendens hastighet inte kom tillbaka.
            for(var k = 0; k < enemies[0].length; k++) {
                if(enemies[0][k].id == sentid) {
                    enemies[0][k].speed = memory;
                }
            }
        }, 5000);
    } else if(type == 'spritesheet') {
        setTimeout(function() {
            for(var k = 0; k < spritesheets.length; k++) {
                if(spritesheets[k].id == i) {
                    spritesheets.splice(k, 1);
                    animations.splice(k, 1);
                }
            }
        }, j);
    }
}


function getPosition(event) {
    var x = event.x;
    var y = event.y;

    x -= game.offsetLeft;
    y -= game.offsetTop;
    for(var i = 0; i < towers.length; i++) {
        if(x > towers[i].x && x < towers[i].x + 50 && y > towers[i].y && y < towers[i].y + 50) {
            moveActive = true;
            enemies[3] = i; // OBS: BYTT NAMN PÅ DENNA VARIABELN. DEN HÖR INTE TILL ENEMIES.
        }
    }
}

function buyTower(type, cost, r) {
    if(money >= cost) {
        towers.push(new Tower(0, 50, r, type, towerCount));
        money -= cost;
        clearTimeout(infoBox);
        towerCount++;
    } else {
        document.getElementById('infoBox').innerHTML = "You need more money to do that.";
        infoBox = setTimeout(function() {
            document.getElementById('infoBox').innerHTML = "";
        }, 5000);
    }
}




function animate() {
    ctx.clearRect(0, 0, 1000, 500);

    for(var i = 0; i < enemies[0].length; i++) {
        enemies[0][i].render();
        enemies[0][i].walk(i);
        if(enemies[0].length > 0) { 
            if(enemies[0][i].hp <= 0) {
                enemies[0][i].die();
            }
        }
    }

    for(var j = 0; j < towers.length; j++) {
        towers[j].render();
        towers[j].attack(j);
        if(towers[j].type == 'super_beam' && towers[j].cd == true) {
            towers[j].attackAnimation(j);
        }
    }

    if(animations.length > 0) {
        for(var i = 0; i < animations.length; i++) {
            animations[i].draw();
            animations[i].update();
        }
    }


    if(hp <= 0) {
        if(confirm != true) {
            menus.dead();
        }
    }

    document.getElementById('hp').innerHTML = hp + "HP";
    document.getElementById('money').innerHTML = "Wallet: " + money + "G";
    document.getElementById('wave').innerHTML = "Wave: " + level;
}

function generate() {
    if(intro != true) {
        var tempMax;
        if(enemies[0].length < enemies[1] && genEnemy) {
            if(level < 5) {
                enemies[0].push(new Enemy('banana', 0, 125, 10, 5, 5, 5, enemies[2])); // type, x, y, Ehp, speed, dmg, price, id
            } else if(level >= 5 && level <= 8) {
                enemies[0].push(new Enemy('apple', 0, 125, 15, 6, 6, 10, enemies[2]));
                window.clearInterval(spawn);
                spawn = window.setInterval(generate, 800);
            } else if(level > 8 && level <= 9) {
                enemies[0].push(new Enemy('orange', 0, 125, 35, 8, 10, 20, enemies[2]));
                window.clearInterval(spawn);
                spawn = window.setInterval(generate, 500);
            } else if(level > 9 && level < 12) {
                if(tempMax == null) {
                    tempMax = enemies[1];
                }
                enemies[1] = 2;
                enemies[0].push(new Enemy('kokosnot', 0, 125, 50, 5, 20, 20, enemies[2]));
            } else if(level > 7 && level < 10) {
                enemies[0].push(new Enemy('vindruva', 0, 125, 5, 13, 3, 20, enemies[2]));
                window.clearInterval(spawn);
                spawn = window.setInterval(generate, 350);
            } else if(level >= 12) {
                
                var random = Math.random();
                console.log(random);
                window.clearInterval(spawn);
                if(random <= 0.2) {
                    spawn = window.setInterval(generate, 1000);
                    enemies[0].push(new Enemy('banana', 0, 125, 10, 5, 5, 5, enemies[2]));
                } else if(random > 0.2 && random <= 0.4) {
                    spawn = window.setInterval(generate, 800);
                    enemies[0].push(new Enemy('apple', 0, 125, 15, 6, 6, 10, enemies[2]));
                } else if(random > 0.4 && random <= 0.6) {
                    spawn = window.setInterval(generate, 500);
                    enemies[0].push(new Enemy('orange', 0, 125, 35, 8, 10, 20, enemies[2]));
                } else if(random > 0.6  && random <= 0.8) {
                    spawn = window.setInterval(generate, 800);
                    enemies[0].push(new Enemy('kokosnot', 0, 125, 50, 5, 20, 20, enemies[2]));
                } else if(random > 0.8 && random <= 1) {
                    spawn = window.setInterval(generate, 350);
                    enemies[0].push(new Enemy('vindruva', 0, 125, 5, 13, 3, 20, enemies[2]));
                }
            }
                enemies[2]++;               


            if(enemies[2] == enemies[1]) {
                genEnemy = false;
                tempMax = null;
            }
        }
    }
}