let count = 0;
let count_star = 0;

let pause = false;
let gameOver = false;

let sprPlayer;
let freeze;

let playerGrp;
let enemiesGrp;
let heartGrp;
let bulletGrp;
let backgroundGrp;

let score = 0;
let level = 1;

let debug = false;

let time = 0;
let timesec = 0;

let wave = 0;


//#region Tools

function outOfScreen(body) {
    if (body.position.x < 0) {
        body.position.x = 1280;
    }
    if (body.position.x > 1280) {
        body.position.x = 0;
    }
    if (body.position.y < 0) {
        body.position.y = 600;
    }
    if (body.position.y > 600) {
        body.position.y = 0;
    }
}

function enemyOutOfScreen(body) {
    if (body.position.x < 0 || body.position.x > 1280 || body.position.y < 0 || body.position.y > 600) {
        return true;
    }
    return false;
}

//#endregion


//#region Enemy

function createEnemy(x, y, h = 64, w = 64, hp = 100, id = 1) {
    let sprEnemy = createSprite(x, y, h, w);
    sprEnemy.id = id
    sprEnemy.friction = 0.1;
    sprEnemy.scale = 1.2;
    sprEnemy.maxSpeed = 10;
    sprEnemy.depth = 100;
    sprEnemy.hp = hp;
    sprEnemy.status = false;
    if (id === 3) { //Poulpe
        sprEnemy.addImage(loadImage("./img/poulpe.png"));
        sprEnemy.collide(allSprites)
        sprEnemy.col = function(target) {
            target.activeControl = 90;
            target.setSpeed(-12);
        }
        sprEnemy.shoot = function() {
            for (let i = 0; i < 8; i++) {
                createBullet(sprEnemy.position.x, sprEnemy.position.y, loadImage("./img/fireball_drake.png"), function() {
                    bulletGrp.remove(this);
                    this.addImage(loadImage("./img/explosionbullet.png"));
                    this.setSpeed(0, sprEnemy.rotation - 90);
                    this.scale = 2;
                    let bullet = this;
                    window.setTimeout(function() { bullet.timout() }, 50);
                }, false, 3, 45 * i, 150);
            }
        }
    } else if (id === 2) { //Dragon
        sprEnemy.addImage(loadImage("./img/sprite_dragon.png"));
        sprEnemy.col = function(target) {
            this.rm(hp);
            target.rm(20);
        }
        sprEnemy.shoot = function() {
            let pos = 45;
            for (let i = 0; i < 3; i++) {
                createBullet(sprEnemy.position.x, sprEnemy.position.y, loadImage("./img/fireball_drake.png"), function() {
                    bulletGrp.remove(this);
                    this.addImage(loadImage("./img/explosionbullet.png"));
                    this.setSpeed(0, sprEnemy.rotation - 90);
                    this.scale = 2;
                    let bullet = this;
                    window.setTimeout(function() { bullet.timout() }, 50);
                }, false, 3, pos, 150);
                pos += 45;
            }
        }
    } else if (id === 1) { //Ship
        sprEnemy.addAnimation("tiny-ship", tiny_ship);
        sprEnemy.changeAnimation("tiny-ship");
        sprEnemy.scale = 0.8
        sprEnemy.col = function(target) {
            this.rm(hp);
            target.rm(10);
        }
        sprEnemy.shoot = function() {
            createBullet(sprEnemy.position.x, sprEnemy.position.y, loadImage("./img/fireball_drake.png"), function() {
                bulletGrp.remove(this);
                this.addImage(loadImage("./img/explosionbullet.png"));
                this.setSpeed(0, sprEnemy.rotation - 90);
                this.scale = 2;
                let bullet = this;
                window.setTimeout(function() { bullet.timout() }, 50);
            }, false, 3, sprEnemy.rotation + 90, 150, 10);
        }
    }
    sprEnemy.rm = function(dg) {
        this.hp -= dg;
        console.log(hp)
        if (this.hp <= 0) {
            this.remove();
            score += 10 * id;
        }
    }
    sprEnemy.addToGroup(enemiesGrp);
}


function updateEnemy() {
    for (let i of enemiesGrp) {
        if (i.id === 3) {
            if (i.status) {
                i.addSpeed(Math.floor((Math.random() * 3)), Math.floor(Math.random() * 361));
                if (count % 180 === 0) {
                    i.shoot();
                }
            } else {
                i.addSpeed(0.5, 90);
            }
        }
        if (i.id === 2) {
            if (i.status) {
                i.addSpeed(Math.floor((Math.random() * 3)), Math.floor(Math.random() * 361));
                if (count % 180 === 0) {
                    i.shoot();
                }
            } else {
                i.addSpeed(0.5, 90);
            }
        }
        if (i.id === 1) {
            if (i.status) {
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90
                i.setSpeed(Math.floor((Math.random() * 3)), i.rotation + 90);
                if (count % 120 === 0) {
                    i.shoot();
                }
            } else {
                i.setSpeed(0.5, 90);
            }
        }
        if (i.status) {
            outOfScreen(i);
        } else {
            i.status = !enemyOutOfScreen(i);
        }
    };
    //New Wave
    if (enemiesGrp.length === 0) {
        if (wave % 20 === 0 && wave != 0) {
            //Boss
        } else if (wave % 20 === 10) { //Poulpe
            let spawn = Math.floor(Math.random() * 6) + 5;
            createAllEnemy(spawn, 3);
        } else if (wave % 20 === 5 || wave % 20 === 15) { //Dragon
            let spawn = Math.floor(Math.random() * 7) + 6;
            createAllEnemy(spawn, 2);
        } else { //Classique
            let spawn = Math.floor(Math.random() * 4) + 3;
            createAllEnemy(spawn, 1);
            spawn = Math.floor(Math.random() * 2) + 2;
            createAllEnemy(spawn, 2);
            spawn = Math.floor(Math.random() * 2);
            createAllEnemy(spawn, 3);
        };
        level++;
        wave++;
    }
}

function createAllEnemy(num, id) {
    let all = [];
    for (let i = 0; i < num; i++) {
        let x = Math.floor(Math.random() * 1236);
        while (x in all) {
            x = Math.floor(Math.random() * 1236);
        }
        createEnemy(x, Math.floor(Math.random() * -1000), 64, 64, 100, id);
    }
}

//#endregion



//#region player

function createPlayer(x, y, h, w) {
    sprPlayer = createSprite(x, y, h, w);
    sprPlayer.friction = 0.015;
    sprPlayer.addImage(phase1);
    sprPlayer.addImage(phase2);
    sprPlayer.addImage(phase3);
    sprPlayer.addImage(phase4);
    sprPlayer.addImage(phase5);
    sprPlayer.addImage(phase6);
    sprPlayer.scale = 0.8;
    sprPlayer.maxSpeed = 7;
    sprPlayer.depth = 1000;
    sprPlayer.hp = 100;
    sprPlayer.lifes = 3;
    sprPlayer.activeControl = 0;
    sprPlayer.inv = -70;
    sprPlayer.rm = function(dmg = 0) {
        if (this.inv + 30 <= count) {
            if (this.hp > 0) {
                this.hp -= dmg;
                this.inv = count;
            }
            if (this.lifes > 0 && this.hp <= 0) {
                this.lifes--;
                this.hp = 100;
                this.inv = count;
            }
            if (this.lifes <= 0) {
                playerGrp.removeSprites();
                enemiesGrp.removeSprites();
                bulletGrp.removeSprites();
                gameOver = true;
                pause = true;
            }
        }
    }
    playerGrp = Group();
    sprPlayer.addToGroup(playerGrp);
}



let shoot = 0;

function playerUpdate() {
    if (sprPlayer.activeControl > 0) {
        sprPlayer.activeControl--;
    }
    playerGrp.overlap(enemiesGrp, function(player, en) { en.col(player) })
    if (shoot > 0) { shoot--; }
    if (keyIsDown(LEFT_ARROW) == true || keyIsDown(81) == true) {
        sprPlayer.rotation -= 6;
    }
    if (keyIsDown(RIGHT_ARROW) == true || keyIsDown(68) == true) {
        sprPlayer.rotation += 6;
    }
    if ((keyIsDown(UP_ARROW) == true || keyIsDown(90) == true) && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation - 90);
    }
    if ((keyIsDown(DOWN_ARROW) == true || keyIsDown(83) == true) && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation + 90);
    }
    if (keyIsDown(32) == true && shoot == 0) {
        shoot = 10;
        createBullet(sprPlayer.position.x, sprPlayer.position.y, loadImage("./img/projectiles.png"), function() {
            bulletGrp.remove(this);
            this.addImage(loadImage("./img/explosionbullet.png"));
            this.setSpeed(0, sprPlayer.rotation - 90);
            this.scale = 2;
            this.speed = 1;
            let bullet = this;
            window.setTimeout(function() { bullet.timout() }, 50);
        });
    }
    outOfScreen(sprPlayer);
    // powerup de ouf
    // window.setTimeout(function(){bullet.setSpeed(15, sprPlayer.rotation-90)}, 1000)
    // let bullet = createSprite(sprPlayer.position.x,sprPlayer.position.y,1,1)
    // bullet.addImage(loadImage("./projectiles.png"))
    // bullet.setSpeed(2, sprPlayer.rotation-90)
    // window.setTimeout(function(){bullet.setSpeed(15, sprPlayer.rotation-90)}, 1000)
}

function bulletUpdate() {
    bulletGrp.toArray().forEach(element => {
        if (element.target) {
            outOfScreen(element);
            enemiesGrp.toArray().forEach(en => {
                element.collide(en, function() {
                    element.rm();
                    en.rm(element.dmg);
                });
            });
            if (element.time + element.timelife <= count) {
                element.rm();
            }
        } else {
            sprPlayer.collide(element, function() {
                element.rm();
                sprPlayer.rm(element.dmg);
            });
            if (element.time + element.timelife <= count) {
                element.rm();
            }
        }
    });
}
//target = true == ennemies is target else player 
function createBullet(x, y, image, rm, target = true, speed = 10, rot = sprPlayer.rotation - 90, time = 80, dmg = 20) {
    let bullet = createSprite(x, y, 1, 1)
    bullet.dmg = dmg
    bullet.addImage(image)
    bullet.rot = rot
    bullet.currentSpeed = speed
    bullet.setSpeed(bullet.currentSpeed, bullet.rot)
    bullet.timout = function() {
        this.remove()
    }
    bullet.target = target
    bullet.rm = rm
    bullet.time = count
    bullet.timelife = time
    bullet.addToGroup(bulletGrp)
}

//#endregion

function Shower() {
    if (count >= 600) {
        // createSprite(x, y)
        // loadImage("./img/Icone.png")
        textSize(10);
        textAlign(CENTER, CENTER)
        fill(255, 204, 0)
        text("Il est temps d'aller prendre une douche", 640, 400)
    }
}

//#region gui

function createHeart() {
    heartGrp = Group()
    for (let i = 0; i < 3; i++) {
        let heart = createSprite(200 + i * 48, 25, 32, 32);
        heart.scale = 1.5
        heart.addToGroup(heartGrp)
    }
}

function drawHeart(heart, id) {
    if (sprPlayer.lifes - 1 < id) {
        heart.addImage(hearts[5]);
    } else if (sprPlayer.lifes - 1 == id) {
        let calcul = 6 - Math.ceil(sprPlayer.hp / 20) - 1;
        heart.addImage(hearts[calcul.toString()]);
    } else {
        heart.addImage(hearts[0]);
    }
}

function drawLife() {
    let c = 0;
    for (let i of heartGrp) {
        drawHeart(i, c);
        c++
    }
}

function drawTime() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    if (timesec < 10) {
        text("Time : " + time.toString() + " : " + "0" + timesec.toString(), 500, 25)
    } else {
        text("Time : " + time.toString() + " : " + timesec.toString(), 500, 25)
    }
}

function drawScore() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("Score: " + score.toString() + "pts", 850, 25)
}

function drawWave() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("Wave: " + wave.toString(), 1150, 25)
}

function draw_gui() {
    drawTime()
    drawScore()
    drawWave()
    drawLife()
}

//#endregion

function gameUpdate() {
    count++
    playerUpdate()
    update_star()
    updateEnemy()
    bulletUpdate()
    if (count % 4 === 0) {
        draw_star()
    }
}



let framert;
var phase1;
var phase2;
var phase3;
var phase4;
var phase5;
var phase6;
var tiny_ship;
var tiny_ship_img;


var hearts = [];

function preload() {
    for (let i = 1; i <= 6; i++) {
        hearts.push(loadImage("./img/Coeur" + i.toString() + ".png"));
    }
    tiny_ship_img = loadImage("./img/tiny-ship.png")
    tiny_ship = loadSpriteSheet("./img/tiny-ship.png", 64, 64, 9);
    phase1 = loadImage("./img/phase1.png");
    phase2 = loadImage("./img/phase2.png");
    phase3 = loadImage("./img/phase3.png");
    phase4 = loadImage("./img/phase4.png");
    phase5 = loadImage("./img/phase5.png");
    phase6 = loadImage("./img/phase6.png");
}

function setup() {
    enemiesGrp = Group()
    backgroundGrp = Group()
        // createAllEnemy(1000)
    frameRate(60);
    noCursor();
    let gameCanvas = createCanvas(1280, 600);
    gameCanvas.parent("gameCanvasContainer");
    createPlayer(500, 300, 100, 200)
    framert = frameRate()
    bulletGrp = Group()
    createHeart()
    sprPlayer.addAnimation("piou", phase1, phase2, phase3, phase4, phase5, phase6, phase6, phase5, phase4, phase3, phase2, phase1)
    sprPlayer.changeAnimation("piou")
}


function debug_up() {
    if (keyWentDown(187) || keyWentDown(61)) {
        debug = !debug
    }
    if (debug) {
        if (count % 60 == 0) {
            framert = frameRate()
        }
        textSize(10);
        textAlign(CENTER, CENTER);
        fill(255, 204, 0);
        text("fps : " + Math.floor(framert).toString(), 50, 10)
    }
}

function draw() {
    background(0);
    // Shower()
    if (!pause) {
        if (timesec == 60) {
            time += 1
            timesec = 0
        } else if (count % 60 == 0 && count != 0) {
            timesec += 1
        }
    }
    if (keyWentDown(ENTER) && gameOver == false) {
        pause = !pause
        if (pause) {
            enemiesGrp.toArray().forEach(i => {
                i.setSpeed(0, i.rotation)
            })
            bulletGrp.toArray().forEach(i => {
                i.setSpeed(0, 0)
            })
            backgroundGrp.toArray().forEach(i => {
                i.setSpeed(0, i.rotation)
            })
        } else {
            backgroundGrp.toArray().forEach(i => {
                i.setSpeed(i.currentSpeed, 90)
            })
            bulletGrp.toArray().forEach(i => {
                i.setSpeed(i.currentSpeed, i.rot)
            })

        }
    }
    if (gameOver) {
        cursor();
        if (keyWentDown(ENTER)) {
            gameOver = false
            window.location.reload()
        }
        count++
        game_over()
        update_star()
        if (count % 4 === 0) {
            draw_star()
        }
        drawSprites(backgroundGrp);
    }

    if (pause) {
        drawSprites();
        drawSprites(bulletGrp);
        drawSprites(enemiesGrp);
        drawSprites(playerGrp);
    } else {
        gameUpdate();
        drawSprites();
        drawSprites(bulletGrp);
        drawSprites(enemiesGrp);
        drawSprites(playerGrp);
        draw_gui();
    }
    debug_up();
}


function mousePressed() {
    let fs = fullscreen();
    fullscreen(!fs);
}


//#region game over

function game_over() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("GAME OVER", 640, 160);
    text("Score : " + score.toString(), 640, 240);
    if (timesec < 10) {
        text("Time : " + time.toString() + " : " + "0" + timesec.toString(), 640, 320);
    } else {
        text("Time : " + time.toString() + " : " + timesec.toString(), 640, 320);
    }
    text("Wave : " + wave.toString(), 640, 400);
}

//#endregion


//#region star

let star_list = []

function draw_star() {
    let star = createSprite(Math.floor(Math.random() * 1280), -5, 1, 1)
    star.addImage(loadImage("./img/etoiles.png"))
    star.currentSpeed = Math.floor(Math.random() * 6) + 3
    star.setSpeed(star.currentSpeed, 90)
    star.rm = function() { if (star.position.y > 600) { this.remove() } }
    star_list.push(star)
    star.addToGroup(backgroundGrp)
}

function update_star() {
    for (let i of star_list) {
        i.rm()
    }
}
//#endregion


//#region Bonus

// function creatBonus(h, y, w = 32, h = 32, hp = 1) {
//     let powerup = createsprite(x,y,h,w)
//     powerup.addImage(loadImage("./img/Icone.png"))
//     powerup.maxSpeed = 4 
//     
// }


//#endregion
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;