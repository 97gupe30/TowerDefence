var level = 1;
var enemies = [[], 1, 0, 5, 0]; // INDEX 0 = Hur många fiender som är ute på planen just nu. INDEX 1 = Hur många finder som ska komma på denna leveln. INDEX 2 = Unikt ID.
var genEnemy = true;
var hp = 100;
var moveActive = false;
var towers = [];

function init() {
    game = document.getElementById('camera');
    ctx = game.getContext('2d');
    game.addEventListener("mousedown", getPosition, false);

    window.setInterval(animate, 25);
    window.setInterval(generate, 1000);
}

function mapLayout() {
    if(level == 1) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 100, 900, 50);
        ctx.fillRect(100, 300, 800, 50);
        ctx.fillRect(850, 100, 50, 100);
        ctx.fillRect(100, 250, 50, 100);
        ctx.fillRect(900, 200, -800, 50);
        ctx.fillRect(850, 300, 50, 200);
    }
}

function keyHandler(event) {
    if(moveActive) {
        var key = event.keyCode;
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
}

function Enemy(x, y, Ehp) {
    this.x = x;
    this.y = y;
    this.hp = Ehp

    this.render = function() {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, 2*Math.PI);
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
        enemies[0].splice(0, 1);
    }
}


// KÖP SAKER
function Tower(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;

    this.render = function() {
        if(this.type == 'tower1') {
            var img = new Image();
            img.src = "images/tower1.jpg";
            img.width = 50;
            img.height = 50;
            ctx.beginPath();
            ctx.drawImage(img, this.x, this.y);
            ctx.arc(this.x + 25, this.y + 25, 60, 0, 2*Math.PI);
            ctx.stroke();
            ctx.closePath();

        }
    }
    
    this.attack = function() {
        var dx, dy, d;
        if(this.type == 'tower1') {
            for(var i = 0; i < enemies[0].length; i++) {
                dx = enemies[0][i].x - this.x + 25;
                dy = enemies[0][i].y - this.y + 25;
                d = Math.sqrt(dx*dx + dy*dy);
                console.log(d);
                if(d <= 60) {
                    alert(1);
                }
            }
        }
    }
}

function tower1() {
    towers.push(new Tower(0, 50, 'tower1'));
}

function getPosition(event) {
    var x = event.x;
    var y = event.y;

    x -= game.offsetLeft;
    y -= game.offsetTop;
    for(var i = 0; i < towers.length; i++) {
        if(x > towers[i].x && x < towers[i].x + 50 && y > towers[i].y && y < towers[i].y +50) {
            moveActive = true;
            enemies[4] = i;
        }
    }
}


function animate() {
    ctx.clearRect(0, 0, 1000, 500);
    mapLayout();
    if(level === 1) {
        for(var i = 0; i < enemies[0].length; i++) {
            enemies[0][i].render();
            enemies[0][i].walk();
        }
    }
    for(var i = 0; i < towers.length; i++) {
        towers[i].render();
        towers[i].attack();
    }

    document.getElementById('hp').innerHTML = "HP: " + hp;
}

function generate() {
    if(enemies[0].length < enemies[1] && genEnemy) {
        enemies[0].push(new Enemy(0, 125, 10));
        enemies[2]++;
        if(enemies[2] == enemies[1]) {
            genEnemy = false;
        }
    }
}