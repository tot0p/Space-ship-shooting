let count = 0;
let count_star = 0;

let pause = false;
let gameOver = false;
let start = true;
let settings = false;

let sprPlayer;
let freeze;


let playerBulletSpeed =  10;
let playerGrp;
let enemiesGrp;
let heartGrp;
let backgroundGrp;
let bulletGrp;
let powerupGrp;
let meteoriteGrp;
let mobileMode = false;

let score = 0;

let gameOvertxt = "";

let debug = false;

let time = 0;
let timesec = 0;

let wave = 0;

let etoileIMG;
let canShoot = true;


let tripleDoses = 0;

let permitedShoot = 0;

//#region Tools

//Player can't go out of screen
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

//Is enemy out of screen ?
function enemyOutOfScreen(body) {
    if (body.position.x < 0 || body.position.x > 1280 || body.position.y < 0 || body.position.y > 600) {
        return true;
    }
    return false;
}

//Is meteorite out of screen ?
function meteoriteOutOfScreen(body) {
    if (body.position.y > 700) {
        return true;
    }
    return false; 
}

//#endregion


//#region Enemy

//create enemy according to id
function createEnemy(x, y, w = 64, h = 64, hp = 100, id = 1) {
    let sprEnemy = createSprite(x, y, w, h);
    sprEnemy.collide(allSprites);
    sprEnemy.id = id;
    sprEnemy.friction = 0.1;
    sprEnemy.scale = 1.2;
    sprEnemy.maxSpeed = 10;
    sprEnemy.depth = 100;
    sprEnemy.hp = hp * (Math.floor(wave / 20) + 1);
    sprEnemy.status = false;
    if (id === 3) { //Poulpe
        sprEnemy.addImage(loadImage("./img/poulpe.png"));
        sprEnemy.maxSpeed = 3;
        sprEnemy.col = function(target) {
            sprEnemy.setSpeed(-12);
            target.activeControl = 90;
            target.setSpeed(-12);
            if (!bounce_sound.isPlaying()) {
                bounce_sound.play();
            }
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
            target.rm(20 * (Math.floor(wave / 20) + 1));
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
        sprEnemy.scale = 0.8;
        sprEnemy.col = function(target) {
            this.rm(hp);
            target.rm(10 * (Math.floor(wave / 20) + 1));
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
    } else if (id === 5) { //Teeth
        sprEnemy.addImage(loadImage("./img/dent.png"));
        sprEnemy.scale = 2;
        sprEnemy.maxSpeed= 20;
        sprEnemy.col = function(target) {
            this.rm(hp*1000);
            gameOvertxt = "j'ai une dent contre toi je crois XD";
            target.lifes = -1;
            target.rm(hp);
        }
    } else if (id === 4) { //boss
        sprEnemy.collide(allSprites);
        sprEnemy.addImage("1", loadImage("./img/boss1.png"));
        sprEnemy.addImage("2", loadImage("./img/boss2.png"));
        sprEnemy.addImage("3", loadImage("./img/boss3.png"));
        sprEnemy.addImage("4", loadImage("./img/boss4.png"));
        sprEnemy.scale = 2;
        sprEnemy.maxSpeed = 5;
        sprEnemy.col = function(target) {
            target.activeControl = 90;
            sprEnemy.setSpeed(-12,sprEnemy.rotation+90);
            target.setSpeed(-12);
            if (!bounce_sound.isPlaying()) {
                bounce_sound.play();
            }
            target.rm(10 * (Math.floor(wave / 20) + 1));
        }
        sprEnemy.phase = 1;
        sprEnemy.shoot = function() {
            createBullet(sprEnemy.position.x, sprEnemy.position.y, loadImage("./img/balleboss.png"), function() {
                bulletGrp.remove(this);
                this.addImage(loadImage("./img/explosionbullet.png"));
                this.setSpeed(0, sprEnemy.rotation - 90);
                this.scale = 2;
                let bullet = this;
                window.setTimeout(function() { bullet.timout() }, 50);
            }, false, 5, sprEnemy.rotation + 90, 300, 50);
        }
    };
    if (id == 4) {
        sprEnemy.rm = function(dg) {
            this.hp -= dg;
            if (this.hp <= 0) {
                enemy_death.play();
                this.remove();
                score += 1000;
                createpowerup(this.position.x, this.position.y, 32, 32, 1, coeur, 90, loadImage("img/Coeur1.png"));
            } else if (this.hp <= 500 * (Math.floor(wave / 20) + 1) && this.phase < 4) {
                this.changeImage("4"); //phase 4
                this.phase++;
            } else if (this.hp <= 1000 * (Math.floor(wave / 20) + 1) && this.phase < 3) {
                this.changeImage("3"); //phase 3
                this.phase++;
            } else if (this.hp <= 1500 * (Math.floor(wave / 20) + 1) && this.phase < 2) {
                this.changeImage("2"); //phase 2
                this.phase++;
            }
        }
    } else {
        sprEnemy.rm = function(dg) {
            this.hp -= dg;
            if (this.hp <= 0) {
                enemy_death.play();
                this.remove();
                score += 10 * id;
                let random = Math.floor(Math.random() * 100);
                if (random <= 4) {
                    createpowerup(this.position.x, this.position.y, 32, 32, 0.5, coeur, 90, loadImage("img/Coeur1.png"));
                } else if (random >= 5 && random <= 7) {
                    createpowerup(this.position.x, this.position.y, 32, 32, 2, () => {
                        coeurMaudit();
                    }, 90,
                    loadImage("img/Coeur6.png"));
                } else if (random >= 8 && random <= 12){
                    createpowerup(this.position.x, this.position.y, 64, 64, 0.5,tripleShoot,90,loadImage("img/iconetriple.png"));
                } else if (random >= 13 && random <= 15){
                    createpowerup(this.position.x, this.position.y, 64, 64, 0.5,noShoot,90,loadImage("img/noshoot.png"));
                }
            }
        }
    }
    sprEnemy.addToGroup(enemiesGrp);
}

//Enemy's shoot according to id & Waves update
function updateEnemy() {
    for (let i of enemiesGrp) {
        if (i.id === 3) {
            if (i.status) {
                i.addSpeed(Math.floor((Math.random() * 3)), Math.floor(Math.random() * 361));
                if (count % 180 === 0 && canShoot) {
                    i.shoot();
                }
            } else {
                i.addSpeed(0.5, 90);
            }
        } else if (i.id === 2) {
            if (i.status) {
                i.addSpeed(Math.floor((Math.random() * 3)), Math.floor(Math.random() * 361));
                if (count % 180 === 0&& canShoot) {
                    i.shoot();
                }
            } else {
                i.addSpeed(0.5, 90);
            }
        } else if (i.id === 1) {
            if (i.status) {
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90;
                i.setSpeed(Math.floor((Math.random() * 3)), i.rotation + 90);
                if (count % 120 === 0&& canShoot) {
                    i.shoot();
                }
            } else {
                i.setSpeed(1, 90);
            }
        } else if (i.id === 5) {
            if (i.status) {
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90;
                i.setSpeed(10, i.rotation + 90);
            } else {
                i.setSpeed(20, 90);
            }
        } else if (i.id === 4) {
            if (i.status) {
                let direction = 90;
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90;
                i.addSpeed(Math.floor((Math.random() * 5)), i.rotation + 90 + direction);
                if (count % 60 === 0&& canShoot) {
                    i.shoot();
                    direction += 1;
                }
            } else {
                i.setSpeed(1, 90);
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
        wave++;
        if (wave % 20 === 0) { //Boss
            createAllEnemy(1, 4);
        } else if (wave % 20 === 10) { //Poulpe
            let spawn = Math.floor(Math.random() * 6) + 4;
            createAllEnemy(spawn, 3);
        } else if (wave % 20 === 5 || wave % 20 === 15) { //Dragon
            let spawn = Math.floor(Math.random() * 6) + 4;
            createAllEnemy(spawn, 2);
        } else { //Classique
            let spawn = Math.floor(Math.random() * 5) + 2;
            createAllEnemy(spawn, 1);
            spawn = Math.floor(Math.random() * 3) + 1;
            createAllEnemy(spawn, 2);
            spawn = Math.floor(Math.random() * 2);
            createAllEnemy(spawn, 3);
        };
    }
}

//Create x enemies at random positions
function createAllEnemy(num, id) {
    let all = [];
    for (let i = 0; i < num; i++) {
        let x = Math.floor(Math.random() * 1236);
        while (x in all) {
            x = Math.floor(Math.random() * 1236);
        }
        if (id === 4) {
            createEnemy(x, Math.floor(Math.random() * -1000), 45, 61, 2000, id);
        } else {
            createEnemy(x, Math.floor(Math.random() * -1000), 64, 64, 100, id);
        };
    }
}

//#endregion



//#region player

//Create player & manage his life / hearts
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
    sprPlayer.collide(allSprites);
    sprPlayer.rm = function(dmg = 0) {
        hit_damage.play();
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
        }
        if (this.lifes <= 0) {
            powerupGrp.removeSprites();
            playerGrp.removeSprites();
            enemiesGrp.removeSprites();
            bulletGrp.removeSprites();
            player_death.play();
            gameOver = true;
            pause = true;
        }
    }
    playerGrp = Group();
    sprPlayer.addToGroup(playerGrp);
}



let shoot = 0;

//Player's input
function playerUpdate() {
    if (tripleDoses > 0)  tripleDoses--;
    if (permitedShoot > 0) permitedShoot--;
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
    if (keyIsDown(65) == true && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation - 180);
    }
    if (keyIsDown(69) == true && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation);
    }
    if ((keyIsDown(UP_ARROW) == true || keyIsDown(90) == true) && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation - 90);
    }
    if ((keyIsDown(DOWN_ARROW) == true || keyIsDown(83) == true) && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation + 90);
    }
    if (keyIsDown(32) == true && shoot == 0 && permitedShoot <=0) {
        shoot = 10;
        if (tripleDoses > 0){
            createBullet(sprPlayer.position.x-5, sprPlayer.position.y, loadImage("./img/projectiles.png"), function() {
                bulletGrp.remove(this);
                this.addImage(loadImage("./img/explosionbullet.png"));
                this.setSpeed(0, sprPlayer.rotation - 90);
                this.scale = 2;
                this.speed = 1;
                let bullet = this;
                window.setTimeout(function() { bullet.timout() }, 50);
            }, true, playerBulletSpeed,sprPlayer.rotation - 135);
            createBullet(sprPlayer.position.x+5, sprPlayer.position.y, loadImage("./img/projectiles.png"), function() {
                bulletGrp.remove(this);
                this.addImage(loadImage("./img/explosionbullet.png"));
                this.setSpeed(0, sprPlayer.rotation - 90);
                this.scale = 2;
                this.speed = 1;
                let bullet = this;
                window.setTimeout(function() { bullet.timout() }, 50);
            }, true, playerBulletSpeed,sprPlayer.rotation - 45);
        }
        createBullet(sprPlayer.position.x, sprPlayer.position.y, loadImage("./img/projectiles.png"), function() {
            bulletGrp.remove(this);
            this.addImage(loadImage("./img/explosionbullet.png"));
            this.setSpeed(0, sprPlayer.rotation - 90);
            this.scale = 2;
            this.speed = 1;
            let bullet = this;
            bullet_explosion.play();
            window.setTimeout(function() { bullet.timout() }, 50);
        }, true, playerBulletSpeed);
        player_shoot.play();
    }
    outOfScreen(sprPlayer);
    // powerup de ouf
    // window.setTimeout(function(){bullet.setSpeed(15, sprPlayer.rotation-90)}, 1000)
    // let bullet = createSprite(sprPlayer.position.x,sprPlayer.position.y,1,1)
    // bullet.addImage(loadImage("./projectiles.png"))
    // bullet.setSpeed(2, sprPlayer.rotation-90)
    // window.setTimeout(function(){bullet.setSpeed(15, sprPlayer.rotation-90)}, 1000)
}

//Remove bullets on collision
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

//Create bullet's properti
//target = true == ennemies is target else player 
function createBullet(x, y, image, rm, target = true, speed = 10, rot = sprPlayer.rotation - 90, time = 80, dmg = 20) {
    let bullet = createSprite(x, y, 1, 1);
    bullet.dmg = dmg;
    bullet.addImage(image);
    bullet.rot = rot;
    bullet.currentSpeed = speed;
    bullet.setSpeed(bullet.currentSpeed, bullet.rot);
    bullet.timout = function() {
        this.remove();
    }
    bullet.target = target;
    bullet.rm = rm;
    bullet.time = count;
    bullet.timelife = time;
    bullet.addToGroup(bulletGrp);
}

//#endregion



//#region powerup


function Shower() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    score += 1000000;
    gameOvertxt = "Il est temps d'aller prendre une douche";
    sprPlayer.lifes = -1;
    sprPlayer.rm(100);

}

//Heal Player
function coeur() {
    if (sprPlayer.lifes === 3) {
        if (sprPlayer.hp === 100) {
            score += 100;
        } else {
            sprPlayer.hp = 100;
        }
    } else {
        sprPlayer.lifes += 1;
    }
}

//Hurt Player
function coeurMaudit() {
    if (sprPlayer.lifes > 1) {
        sprPlayer.lifes -= 1;
    } else {
        sprPlayer.lifes = -1;
        sprPlayer.rm(100);
        score = 0;
        gameOvertxt = "Tu as ete maudit, LOSER !!!";
    }
}

function Whey() {
    if (sprPlayer.maxSpeed < 12) {
        sprPlayer.maxSpeed += 1;
        playerBulletSpeed += 1;
    } else {
        if  (sprPlayer.hp === 100) {
            score += 50;
        } else if (sprPlayer.hp > 50) {
            sprPlayer.hp = 100;
        } else {
            sprpowerup.hp = 50;
        }
    }
}

function tripleShoot() {
    tripleDoses = 600;
}

function noShoot(){
    permitedShoot = 300;
}


function Tacos() {
    sprPlayer.hp = 1;
    sprPlayer.lifes = 1;
    gameOvertxt = "Tacos, Tacos, Tacos";
}

function createpowerup(x, y, h, w, speed, activation, direction, image) {
    let sprpowerup = createSprite(x, y);
    sprpowerup.setSpeed(speed, direction);
    sprpowerup.addImage(image);
    sprpowerup.oncollide = activation;
    sprpowerup.rm = function() {
        this.oncollide();
        this.remove();
    };
    sprpowerup.addToGroup(powerupGrp);
}

function updatePowerup() {
    powerupGrp.forEach(element => {
        element.collide(playerGrp, function() {
            element.rm();
        });
        if (enemyOutOfScreen(element)) {
            element.remove();
        }
    });
}

function generatePowerup() {
    if (count % 60 === 0) {
        let c = Math.floor(Math.random()* 10000) ;
        if (c === 5000) {
            createpowerup(Math.floor(Math.random() * 1000 + 100 ), 0, 64, 64, 0.5, () => {
                Shower();
            }, 90,
            loadImage("img/Douche.png"));
        }else if (c >= 100 && c <= 150) {
            createpowerup(Math.floor(Math.random() * 1000 + 100 ), 0, 64, 64, 0.5, 
                Tacos
            , 90, 
            loadImage("img/Tacos.png"));
        }
    }
}


//#endregion

//#region gui

function createHeart() {
    heartGrp = Group();
    for (let i = 0; i < 3; i++) {
        let heart = createSprite(200 + i * 48, 25, 32, 32);
        heart.scale = 1.5;
        heart.addToGroup(heartGrp);
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
        c++;
    }
}

//Show time played
function drawTime() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    if (timesec < 10) {
        text("Time : " + time.toString() + " : " + "0" + timesec.toString(), 500, 25);
    } else {
        text("Time : " + time.toString() + " : " + timesec.toString(), 500, 25);
    }
}

//Show player's score
function drawScore() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("Score: " + score.toString() + "pts", 850, 25);
}

//Show current wave
function drawWave() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("Wave: " + wave.toString(), 1150, 25);
}

function draw_gui() {
    drawTime();
    drawScore();
    drawWave();
    drawLife();
}

//#endregion

function gameUpdate() {
    count++;
    cheatCode();
    playerUpdate();
    start_back();
    generateMeteorite();
    updateEnemy();
    bulletUpdate();
    updatePowerup();
    generatePowerup();
}

//#region cheatCode

function cheatCode() {
    if (keyWentDown(222)) {
        let command = prompt("command:");
        let nb;
        switch (command.toLocaleLowerCase()) {
            case "lag":
                createAllEnemy(10000, 1);
                break;
            case "mynameisoctopus":
                createAllEnemy(10, 3);
                break;
            case "pepito":
                createMeteorite();
                break;
            case "life":
                nb = prompt("nb ? ");
                nb = parseInt(nb);
                if (isNaN(nb)) {
                    alert("is not number !!!");
                    break;
                }
                sprPlayer.lifes = nb;
                sprPlayer.hp = 100;
                break;
            case "wave":
                nb = prompt("nb ? ");
                nb = parseInt(nb);
                if (isNaN(nb)) {
                    alert("is not number !!!");
                    break;
                }
                wave = nb - 1;
                enemiesGrp.removeSprites();
                break;
            case "douche":
                createpowerup(200, 0, 64, 64, 0.5, 
                        Shower, 90,
                    loadImage("img/Douche.png"));
                break;
            case "doomslayer":
                game_music.stop();
                game_music = doom_slayer ;
                temp_value = s1.val;
                game_music.setVolume(temp_value);
                break;
            case "tacos":
                createpowerup(Math.floor(Math.random() * 1000 + 100 ), 0, 64, 64, 0.5,Tacos, 90, 
                loadImage("img/Tacos.png"));
                break;
            case "shoot":
                canShoot = !canShoot;
                break;
            case "tripledose":
                createpowerup(Math.floor(Math.random() * 1000 + 100 ), 0, 64, 64, 2,tripleShoot,90,loadImage("img/iconetriple.png"));
                break;
            case "maudit":
                createpowerup(Math.floor(Math.random() * 1000 + 100 ), 0, 64, 64, 2, coeurMaudit ,  90,
                loadImage("img/Coeur6.png"));
                break;
            case "bigmama":
                sprPlayer.scale +=1;
                break;
            case "whey":
                createpowerup(Math.floor(Math.random()* 1000 + 100), 0, 64, 64, 0.5, 
                    Whey
                , 90,
                loadImage("img/balleboss.png"));
                break;
            case "noshoot":
                createpowerup(Math.floor(Math.random() * 1000 + 100 ),0, 64, 64, 2, noShoot,90,loadImage("img/noshoot.png"));
                break;
            default:
                alert("invalide command !!!");
                createAllEnemy(1, 5);
                break;
        }
    }
}


//#endregion


let framert;
var phase1;
var phase2;
var phase3;
var phase4;
var phase5;
var phase6;
var tiny_ship;
var tiny_ship_img;
var player_shoot;
var bullet_explosion;
var player_death;
var enemy_death;
var hit_damage;
var bounce_sound;
var game_music;
var menu_click;
var restartBtn;
var startBtn;
var settingsBtn;
var goBack;
var validateSettings;
var sprAsteroide;
var doom_slayer;
var temp_value;
var effectsVolume;
var effectSoundTest;
var backToGame;
let gui;
let gamegui;
let joystick;
let s1;
let s2;

var hearts = [];

//Load sounds & images before the game start
function preload() {
    for (let i = 1; i <= 6; i++) {
        hearts.push(loadImage("./img/Coeur" + i.toString() + ".png"));
    }
    player_death = loadSound("./sounds/player_death.wav");
    enemy_death = loadSound("./sounds/enemy_death.wav");
    hit_damage = loadSound("./sounds/hit_damage.wav");
    player_shoot = loadSound("./sounds/player_shoot.wav");
    bullet_explosion = loadSound("./sounds/bullet_explosion.wav");
    bounce_sound = loadSound("./sounds/bounce.wav");
    game_music = loadSound("./sounds/game_music_space.mp3");
    menu_click = loadSound("./sounds/menuSelect.wav");
    doom_slayer = loadSound("./sounds/Doom.mp3");
    menu_click.setVolume(0.2);
    game_music.setVolume(1);
    bounce_sound.setVolume(0.2);
    enemy_death.setVolume(0.2);
    hit_damage.setVolume(0.2);
    player_death.setVolume(0.2);
    bullet_explosion.setVolume(0.2);
    player_shoot.setVolume(0.2);
    tiny_ship_img = loadImage("./img/tiny-ship.png");
    tiny_ship = loadSpriteSheet("./img/tiny-ship.png", 64, 64, 9);
    phase1 = loadImage("./img/phase1.png");
    phase2 = loadImage("./img/phase2.png");
    phase3 = loadImage("./img/phase3.png");
    phase4 = loadImage("./img/phase4.png");
    phase5 = loadImage("./img/phase5.png");
    phase6 = loadImage("./img/phase6.png");
    sprAsteroide = loadImage("./img/asteroide.png");
}

function setup() {
    window.onclose = game_music.stop();
    enemiesGrp = Group();
    backgroundGrp = Group();
    powerupGrp = Group();
    meteoriteGrp = Group();
    frameRate(60);
    let gameCanvas = createCanvas(1280, 600);
    gameCanvas.parent("gameCanvasContainer");
    etoileIMG = loadImage("./img/etoiles.png");
    createPlayer(500, 300, 100, 200);
    framert = frameRate();
    bulletGrp = Group();
    createHeart();
    sprPlayer.addAnimation("piou", phase1, phase2, phase3, phase4, phase5, phase6, phase6, phase5, phase4, phase3, phase2, phase1);
    sprPlayer.changeAnimation("piou");
    buttonSetup();
    gui = createGui();
    gamegui = createGui();
    // joystick = createJoystick("Joystick", 10, 10, 175, 175, -1, 1, 1, -1);
    s1 = createSlider("Slider", 300, 170, 700, 50, 0, 2);
    s2 = createSlider("Slider", 300, 270, 700, 50, 0, 0.5);
}

function buttonSetup() {
    restartBtn = new Clickable();
    restartBtn.cornerRadius = 0;
    restartBtn.locate(520, 460);
    restartBtn.textScaled = true;
    restartBtn.text = "RESTART";
    restartBtn.resize(250, 100);
    restartBtn.color = "#000000";
    restartBtn.textColor = "#ffcc00";
    restartBtn.stroke = "#ffcc00";
    restartBtn.onPress = function() {
        menu_click.play();
        window.location.reload();
    }

    startBtn = new Clickable();
    startBtn.cornerRadius = 0;
    startBtn.locate(520, 460);
    startBtn.textScaled = true;
    startBtn.text = "START";
    startBtn.resize(250, 100);
    startBtn.color = "#000000";
    startBtn.textColor = "#ffcc00";
    startBtn.stroke = "#ffcc00";
    startBtn.onPress = function() {
        menu_click.play();
        start = false;
        settings = false;
    }
    settingsBtn = new Clickable();
    settingsBtn.cornerRadius = 0;
    settingsBtn.locate(520, 340);
    settingsBtn.textScaled = true;
    settingsBtn.text = "SETTINGS";
    settingsBtn.resize(250, 100);
    settingsBtn.color = "#000000";
    settingsBtn.textColor = "#ffcc00";
    settingsBtn.stroke = "#ffcc00";
    settingsBtn.onPress = function() {
        menu_click.play();
        start = false;
        settings = true;
    }

    effectSoundTest = new Clickable();
    effectSoundTest.cornerRadius = 0;
    effectSoundTest.locate(520, 340);
    effectSoundTest.textScaled = true;
    effectSoundTest.text = "TEST SOUND VOLUME";
    effectSoundTest.resize(250, 100);
    effectSoundTest.color = "#000000";
    effectSoundTest.textColor = "#ffcc00";
    effectSoundTest.stroke = "#ffcc00";
    effectSoundTest.onPress = function() {
        menu_click.play();
    }

    goBack = new Clickable();
    goBack.cornerRadius = 0;
    goBack.locate(520, 460);
    goBack.textScaled = true;
    goBack.text = "MAIN MENU";
    goBack.resize(250, 100);
    goBack.color = "#000000";
    goBack.textColor = "#ffcc00";
    goBack.stroke = "#ffcc00";
    goBack.onPress = function() {
        menu_click.play();
        start = true;
        settings = false;
    }
    backToGame = new Clickable();
    backToGame.cornerRadius = 0;
    backToGame.locate(520, 340);
    backToGame.textScaled = true;
    backToGame.text = "CONTINUE";
    backToGame.resize(250, 100);
    backToGame.color = "#000000";
    backToGame.textColor = "#ffcc00";
    backToGame.stroke = "#ffcc00";
    backToGame.onPress = function() {
        menu_click.play;
        pause = false;
        backgroundGrp.toArray().forEach(i => {
            i.setSpeed(i.currentSpeed, 90);
        })
        bulletGrp.toArray().forEach(i => {
            i.setSpeed(i.currentSpeed, i.rot);
        })
        powerupGrp.toArray().forEach(i => {
            i.setSpeed(1, 90);
        })
        meteoriteGrp.toArray().forEach(i => {
            i.setSpeed(2, 90);
        })
    }
}


//Show Menu
function startMenuDraw() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("Space ship shooting !!!", 640, 160);
    startBtn.draw();
    settingsBtn.draw();

}

//Show FPS
function debug_up() {
    if (keyWentDown(187) || keyWentDown(61)) {
        debug = !debug;
    }
    if (debug) {
        if (count % 60 == 0) {
            framert = frameRate();
        }
        textSize(10);
        textAlign(CENTER, CENTER);
        fill(255, 204, 0);
        text("fps : " + Math.floor(framert).toString(), 50, 10);
    }
}

function settingsMenuDraw() {
    s1.draw();
    s2.draw();
    textSize(20);
    textAlign(RIGHT, CENTER);
    fill(255, 204, 0);
    text("MUSIC VOLUME", 260, 200);
    textSize(20);
    textAlign(RIGHT, CENTER);
    fill(255, 204, 0);
    text("EFFECTS VOLUME", 260, 300);
    effectSoundTest.draw();
    if (s1.isChanged || s2.isChanged){
        game_music.setVolume(s1.val);
        menu_click.setVolume(s2.val);
        bounce_sound.setVolume(s2.val);
        enemy_death.setVolume(s2.val);
        hit_damage.setVolume(s2.val);
        player_death.setVolume(s2.val);
        bullet_explosion.setVolume(s2.val);
        player_shoot.setVolume(s2.val);
    }
    goBack.draw();
}

let musicVolume;

function draw() {
    background(0);        
    if (!game_music.isPlaying()) {
        game_music.play();
    }
    if (start) {
        count++;
        start_back();
        startMenuDraw();
        drawSprites(backgroundGrp);
    } else if (settings) {
        start_back();
        settingsMenuDraw();
    } else {
        if (!pause) {
            if (timesec == 60) {
                time += 1;
                timesec = 0;
            } else if (count % 60 == 0 && count != 0) {
                timesec += 1;
            }
        }
        if (keyWentDown(ENTER) && gameOver == false) {
            pause = !pause;
            if (pause) {
                enemiesGrp.toArray().forEach(i => {
                    i.setSpeed(0, i.rotation);
                })
                bulletGrp.toArray().forEach(i => {
                    i.setSpeed(0, 0);
                })
                backgroundGrp.toArray().forEach(i => {
                    i.setSpeed(0, i.rotation);
                })
                powerupGrp.toArray().forEach(i => {
                    i.setSpeed(0, 90);
                })
                meteoriteGrp.toArray().forEach(i => {
                    i.setSpeed(0, 0);
                })
            } else {
                backgroundGrp.toArray().forEach(i => {
                    i.setSpeed(i.currentSpeed, 90);
                })
                bulletGrp.toArray().forEach(i => {
                    i.setSpeed(i.currentSpeed, i.rot);
                })
                powerupGrp.toArray().forEach(i => {
                    i.setSpeed(1, 90);
                })
                meteoriteGrp.toArray().forEach(i => {
                    i.setSpeed(2, 90);
                })
            }
        }
        if (gameOver) {
            cursor();
            if (keyWentDown(ENTER)) {
                game_music.stop();
                gameOver = false;
                window.location.reload();
            }
            count++;
            game_over();
            start_back();
            drawSprites(backgroundGrp);
            restartBtn.draw();
        }
        if (pause) {
            if (!gameOver){
                background(0);
                textSize(50);
                textAlign(CENTER, CENTER);
                fill(255, 204, 0);
                text("PAUSE", 640, 80);
                s1.draw();
                s2.draw();
                textSize(20);
                textAlign(RIGHT, CENTER);
                fill(255, 204, 0);
                text("MUSIC VOLUME", 260, 200);
                textSize(20);
                textAlign(RIGHT, CENTER);
                fill(255, 204, 0);
                text("EFFECTS VOLUME", 260, 300);
                backToGame.draw();
                restartBtn.draw();
            }
            if (s1.isChanged || s2.isChanged){
                game_music.setVolume(s1.val);
                menu_click.setVolume(s2.val);
                bounce_sound.setVolume(s2.val);
                enemy_death.setVolume(s2.val);
                hit_damage.setVolume(s2.val);
                player_death.setVolume(s2.val);
                bullet_explosion.setVolume(s2.val);
                player_shoot.setVolume(s2.val);
            }
        } else {
            gameUpdate();
            drawSprites();
            drawSprites(bulletGrp);
            drawSprites(enemiesGrp);
            drawSprites(playerGrp);
            drawSprites(powerupGrp);
            drawSprites(meteoriteGrp);
            draw_gui();
        }
    }
    debug_up();
}


//#region game over

//Show Game Over screen
function game_over() {
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("GAME OVER", 640, 80);
    text(gameOvertxt, 640, 160);
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

let star_list = [];

//Create star's properties
function draw_star() {
    let star = createSprite(Math.floor(Math.random() * 1280), -5, 1, 1);
    star.addImage(etoileIMG);
    star.currentSpeed = Math.floor(Math.random() * 6) + 3;
    star.setSpeed(star.currentSpeed, 90);
    star.rm = function() { if (star.position.y > 600) { this.remove(); } };
    star_list.push(star);
    star.addToGroup(backgroundGrp);
}

//Remove stars
function update_star() {
    for (let i of star_list) {
        i.rm();
    }
}

//Generate stars
function start_back() {
    update_star();
    if (count % 4 === 0) {
        draw_star();
    }
}
//#endregion

//#region Meteorite

//Create meteorite's properties
function createMeteorite() {
    let beX = Math.floor(Math.random() * 1281);
    let sprMeteorite = createSprite(beX, -100, 94, 89);
    sprMeteorite.addImage(sprAsteroide);
    sprMeteorite.scale = Math.random() * 1 + 1;
    sprMeteorite.setSpeed(2, 90);
    sprMeteorite.rm = function() {
        this.remove();
    };
    sprMeteorite.addToGroup(meteoriteGrp);
}

//Remove meteorite on collision or out of screen
function updateMeteorite() {
    meteoriteGrp.forEach(element => {
        element.collide(playerGrp, function() {
            element.rm();
            sprPlayer.rm(100);
        });
        if (meteoriteOutOfScreen(element)) {
            element.rm();
        }
    });
}

//Generate a meteorite every 30 seconds
function generateMeteorite() {
    updateMeteorite();
    if (count % 1800 === 0) {
        createMeteorite();
    }
}

//#endregion

window.preload = preload;
window.setup = setup;
window.draw = draw;
