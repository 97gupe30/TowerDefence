var level = 1;
var enemies = [[], 100, 0, 5, 0]; // INDEX 0 = Fiende object INDEX 1 = Hur många finder som ska komma på denna leveln. INDEX 2 = Antal fiender ute på planen. INDEX 3 = Fiendens hastighet. INDEX 4 = Används till att röra tornen
var towers = [];
var menus = [new Menu('dead'),
             new Menu('restart')
            ];
var towerCount = 0;

// Värde variabler
var hp = 100;
var money = 100;

// Booleans
var genEnemy = true; // Ifall man ska kunna generera nya fiender.
var moveActive = false; // Ifall man kan flytta torn eller inte.
var confirm = false;

// timer variabler;
var infoBox;
var cdTimeout;

function init() {
    game = document.getElementById('camera');
    ctx = game.getContext('2d');
    game.addEventListener("mousedown", getPosition, false);
                                                        
    window.setInterval(animate, 25);
    window.setInterval(generate, 1000);
}


function keyHandler(event) {
    var key = event.keyCode;
    if(moveActive) {
        if(key == 65) {
            towers[enemies[4]].x -= 50;
        } else if(key == 68) {
            towers[enemies[4]].x += 50;
        } else if(key == 87) {
            towers[enemies[4]].y -= 50;
        } else if(key == 83) {
            towers[enemies[4]].y += 50;
        } else if(key == 13) {
            moveActive = false;
        }
    }
    if(key == 82) {
        document.getElementById('infoBox').innerHTML = 'Are you sure you want to restart?';
    }
}

function Enemy(x, y, Ehp, id) {
    this.x = x;
    this.y = y;
    this.hp = Ehp;
    this.id = id;

    this.render = function() {
        var enemyImg = new Image();
        enemyImg.src = "images/banana1.png";
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.drawImage(enemyImg, this.x - 12.5, this.y - 12.5);
        ctx.closePath();
        ctx.fill();
    }


    this.walk = function() {
        if(this.x < 875 && this.y == 325) {
            this.x += enemies[3];
        } else if(this.x <= 875 && this.x > 125 && this.y == 225) {
            this.x -= enemies[3];
        } else if(this.x < 875 && this.y == 125) {
            this.x+= enemies[3];
        } else if(this.y > 100 && this.y < 225 && this.x == 875) {
            this.y+= enemies[3];
        } else if(this.y > 200 && this.y < 325 && this.x == 125) {
            this.y += enemies[3];
        } else if(this.x == 875 && this.y > 290) {
            this.y += enemies[3];
        }

        if(this.x === 875 && this.y === 520) {
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
        if(this.type == 'tower1') {
            var img = new Image();
            img.src = "images/tower1.png";
            img.width = 50;
            img.height = 50;
            ctx.beginPath();
            ctx.drawImage(img, this.x, this.y);
            ctx.arc(this.x + 25, this.y + 25, 70, 0, 2*Math.PI);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.closePath();

        }
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
                        console.log(enemies[0][i].hp);
                        this.cd = false;
                        cdTimeout = setTimeout(function() {
                            towers[j].cd = true;
                        }, 500);
                    }
                }
            }
        }
    }

    this.attackAnimation = function(i) {
        ctx.beginPath(); // Målar ut laser stråle
        ctx.moveTo(this.x + 25, this.y + 25);
        ctx.lineTo(enemies[0][i].x, enemies[0][i].y);
        ctx.closePath();
        ctx.strokeStyle = "#000055";
        ctx.lineWidth = 2;
        ctx.stroke();
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
            enemies[4] = i; // OBS: BYTT NAMN PÅ DENNA VARIABELN. DEN HÖR INTE TILL ENEMIES.
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

function Menu(type) {
    this.type = type;

    this.startMenu = function() {
        if(this.type == 'dead') {
            var currentSpeed = enemies[3];
            enemies[3] = 0;
            genEnemy = false;
            moveActive = false;
            document.getElementById('infoBox').innerHTML = "You died. Press 'R' to restart.";
            clearTimeout(cdTimeout);
            for(var i = 0; i < towers.length; i++) {
                towers[i].cd = false;
            }
        } else if(this.type == 'restart') {
            enemies = [[], 100, 0, 5, 0];
            towers = [];
            level = 1;
            hp = 100;
            money = 100;
            genEnemy = true;
            moveActive = false;
        }
    }
}


function animate() {
    ctx.clearRect(0, 0, 1000, 500);
    if(level === 1) {
        for(var i = 0; i < enemies[0].length; i++) {
            enemies[0][i].render();
            enemies[0][i].walk();
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
        menus[0].startMenu();
    }
    document.getElementById('hp').innerHTML = hp + "HP";
    document.getElementById('money').innerHTML = "Wallet: " + money + "kr";
}

function generate() {
    if(enemies[0].length < enemies[1] && genEnemy) {
        enemies[0].push(new Enemy(0, 125, 10, enemies[2]));
        enemies[2]++;
        if(enemies[2] == enemies[1]) {
            genEnemy = false;
        }
    }
}