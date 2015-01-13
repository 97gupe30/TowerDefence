var level = 1;
var enemies = [[], 3, 0, 0]; // INDEX 0 = Fiende object INDEX 1 = Hur många finder som ska komma på denna leveln. INDEX 2 = Antal fiender ute på planen. INDEX 3 = Fiendens hastighet. INDEX 4 = Används till att röra tornen
var towers = [];
var menus = [new Menu('dead'),
             new Menu('restart'),
             new Menu('pause'),
             new Menu('waveClear')
            ];
var menuP = 'pause';
var towerCount = 0;
var currentEnemies = []; // sparar allt om fienderna när man pausar.
var speed = []; // Sparar fiendernas hastigheter när man pausar

// Värde variabler
var hp = 100;
var money = 100;

// Booleans
var genEnemy = true; // Ifall man ska kunna generera nya fiender.
var moveActive = false; // Ifall man kan flytta torn eller inte.
var confirm = false; // Till reset menyn
var confirmWave = false;
var confirmMove; // Till menyer.

// timer variabler;
var infoBox;
var cdTimeout;
var spawn;

function init() {
    game = document.getElementById('camera');
    ctx = game.getContext('2d');
    game.addEventListener("mousedown", getPosition, false);

    window.setInterval(animate, 25);
    spawn = window.setInterval(generate, 1000);
}


function keyHandler(event) {
    var key = event.keyCode;
    if(moveActive) { // Flytta torn
        if(key == 65) {
            towers[enemies[3]].x -= 50;
        } else if(key == 68) {
            towers[enemies[3]].x += 50;
        } else if(key == 87) {
            towers[enemies[3]].y -= 50;
        } else if(key == 83) {
            towers[enemies[3]].y += 50;
        } else if(key == 13) {
            moveActive = false;
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
                menus[1].startMenu();
            } else {
                document.getElementById('infoBox').innerHTML = "";
            }
        }
    }
    if(key == 80 && confirmWave != true) {
        menus[2].startMenu();
    }
    if(confirmWave) {
        if(key == 80) {
            document.getElementById('infoBox').innerHTML = "";
            enemies[1] += 3;
            enemies[2] = 0;
            genEnemy = true;
            confirmWave = false;
        }
    }
}

function Menu(type) {
    this.type = type;

    this.startMenu = function() {
        if(this.type == 'dead') {
            for(var i = 0; i < enemies[0].length; i++) {
                enemies[0][i].speed = 0;
            }
            genEnemy = false;
            moveActive = false;
            document.getElementById('infoBox').innerHTML = "You died. Press 'R' to restart.";
            clearTimeout(cdTimeout);
            for(var i = 0; i < towers.length; i++) {
                towers[i].cd = false;
            }
        } else if(this.type == 'restart') {
            document.getElementById('infoBox').innerHTML = "";
            enemies = [[], 3, 0, 5, 0];
            towers = [];
            level = 1;
            hp = 100;
            money = 100;
            genEnemy = true;
            moveActive = false;
            confirm = false;
        } else if(this.type == 'pause') {
            if(menuP == 'pause') {
                menuP = 'unpause';
                document.getElementById('infoBox').innerHTML = "Press 'P' to unpause.";
                for(var i = 0; i < enemies.length; i++) {
                    currentEnemies[i] = enemies[i];
                }
                for(var i = 0; i < enemies[0].length; i++) {
                    speed[i] = enemies[0][i].speed;
                    enemies[0][i].speed = 0;
                }
                moveActive = false;
                genEnemy = false;
            } else if(menuP == 'unpause') {
                document.getElementById('infoBox').innerHTML = "";
                menuP = 'pause';
                for(var i = 0; i < currentEnemies.length; i++) {
                    enemies[i] = currentEnemies[i];
                }
                for(var i = 0; i < enemies[0].length; i++) {
                    enemies[0][i].speed = speed[i]
                }
                if(enemies[1] != enemies[2]) {
                    genEnemy = true;
                }
            }
        } else if(this.type == 'waveClear') {
            document.getElementById('infoBox').innerHTML = "Press 'P' to start the next wave.";
            confirmWave = true;
            level++;
        }
    }
}

function Enemy(type, x, y, Ehp, speed, dmg, price, id, active) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.hp = Ehp;
    this.startHP = Ehp;
    this.speed = speed;
    this.dmg = dmg;
    this.price = price;
    this.id = id;
    this.active = false;

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

        }

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.drawImage(enemyImg, this.x - 12.5, this.y - 12.5);
        ctx.closePath();
        ctx.fill();
    }


    this.walk = function() {
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
            hp -= 5;
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
                menus[3].startMenu();
            }
        }

    }
}


// KÖP SAKER
function Tower(x, y, type, id) { // CD == Om tornet kan skada fiender
    this.x = x;
    this.y = y;
    this.type = type;
    this.id = id;
    this.cd = true;

    this.render = function() {
        var img = new Image();
        switch(this.type) {
            case 'tower1':
                img.src = "images/tower1.png";
                break;
            case 'ice_tower':
                img.src = "images/ice_tower.png";
                break;
        }
        img.width = 50;
        img.height = 50;
        ctx.beginPath();
        ctx.drawImage(img, this.x, this.y);
        ctx.closePath();
    }

    this.attack = function(j) {
        var dx, dy, d;
        if(this.type == 'tower1') {
            for(var i = 0; i < enemies[0].length; i++) { // Räknar ut om fienden är inom tornets Attack Range.
                dx = enemies[0][i].x - this.x - 25;
                dy = enemies[0][i].y - this.y - 25;
                d = Math.sqrt(dx*dx + dy*dy);
                if(d <= 70) { // Ifall fienden är inom tornets Attack Range målar vi ut skottet och lägger till en CD.
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
            for(var i = 0; i < enemies[0].length; i++) { // Räknar ut om fienden är inom tornets Attack Range.
                dx = enemies[0][i].x - this.x - 25;
                dy = enemies[0][i].y - this.y - 25;
                d = Math.sqrt(dx*dx + dy*dy);
                if(d <= 70) {
                    this.attackAnimation(i);
                    if(enemies[0][i].speed != 2) {
                        timerHandler('slow', i, j, enemies[0][i].speed, enemies[0][i].id);
                        enemies[0][i].speed = 2;
                    }
                }
            }
        }
    }

    var rStroke = 0;
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
            rStroke += 5;
            if(rStroke >= 70) {
                rStroke = 0;
            }
        }
    }
}

function timerHandler(type, i, j, memory, sentid) {
    if(type == 'slow') {
        cdTimeout = setTimeout(function() {
            while(enemies[0].length <= i) {
                i--;
            }
            while(enemies[0][i].id != sentid) {
                enemies[0][i].id--;
            }
            alert(enemies[0][i].id + " " + sentid);
            if(enemies[0][i].id == sentid) {
                enemies[0][i].speed = memory;
            }
        }, 5000);
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

function buyTower(type, cost) {
    if(money >= cost) {
        towers.push(new Tower(0, 50, type, towerCount));
        money -= cost;
    } else {
        clearTimeout(infoBox);
        document.getElementById('infoBox').innerHTML = "You need more money to do that.";
        infoBox = setTimeout(function() {
            document.getElementById('infoBox').innerHTML = "";
        }, 5000);
    }
    towerCount++;
}


function animate() {
    ctx.clearRect(0, 0, 1000, 500);
    for(var i = 0; i < enemies[0].length; i++) {
        enemies[0][i].render();
        enemies[0][i].walk();
        if(enemies[0].length > 0) { 
            if(enemies[0][i].hp <= 0) {
                enemies[0][i].die();
            }
        }
    }
    for(var j = 0; j < towers.length; j++) {
        towers[j].render();
        towers[j].attack(j);
    }

    if(hp <= 0) {
        if(confirm != true) {
            menus[0].startMenu();
        }
    }

    document.getElementById('hp').innerHTML = hp + "HP";
    document.getElementById('money').innerHTML = "Wallet: " + money + "kr";
}

function generate() {
    if(enemies[0].length < enemies[1] && genEnemy) {
        if(level == 1 || level == 2) {
            enemies[0].push(new Enemy('banana', 0, 125, 10, 5, 5, 5, enemies[2])); // type, x, y, Ehp, speed, dmg, price, id
        } else if(level >= 3 && level <= 5) {
            enemies[0].push(new Enemy('apple', 0, 125, 15, 6, 6, 10, enemies[2]));
            window.clearInterval(spawn);
            spawn = window.setInterval(generate, 800);
        } else if(level > 5) {
            enemies[0].push(new Enemy('orange', 0, 125, 30, 8, 10, 20, enemies[2]));
            window.clearInterval(spawn);
            spawn = window.setInterval(generate, 500);
        }

        enemies[2]++;
        if(enemies[2] == enemies[1]) {
            genEnemy = false;
        }
    }
}