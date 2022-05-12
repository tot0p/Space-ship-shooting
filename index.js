let count = 0;
let count_star = 0;

let pause = false;
let gameOver = false;
let start = true
let settings = false

let sprPlayer;
let freeze;

let playerGrp;
let enemiesGrp;
let heartGrp;
let backgroundGrp;
let bulletGrp;
let powerupGrp;

let score = 0;

let debug = false;

let time = 0;
let timesec = 0;

let wave = 0;

let etoileIMG ;


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

function createEnemy(x, y, w = 64, h = 64, hp = 100, id = 1) {
    let sprEnemy = createSprite(x, y, w, h);
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
            if (!bounce_sound.isPlaying()) {
                bounce_sound.play()
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
    } else if (id === 4) { //boss
        sprEnemy.collide(allSprites)
        sprEnemy.addImage("1", loadImage("./img/boss1.png"));
        sprEnemy.addImage("2", loadImage("./img/boss2.png"));
        sprEnemy.addImage("3", loadImage("./img/boss3.png"));
        sprEnemy.addImage("4", loadImage("./img/boss4.png"));
        sprEnemy.scale = 2;
        sprEnemy.col = function(target) {
            target.activeControl = 90;
            target.setSpeed(-12);
            if (!bounce_sound.isPlaying()) {
                bounce_sound.play()
            }
            target.rm(10);
        }
        sprEnemy.phase = 1
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
                enemy_death.play()
                this.remove();
                score += 1000;
            } else if (this.hp <= 500 && this.phase < 4) {
                this.changeImage("4"); //phase 4
                this.phase++;
            } else if (this.hp <= 1000 && this.phase < 3) {
                this.changeImage("3"); //phase 3
                this.phase++;
            } else if (this.hp <= 1500 && this.phase < 2) {
                this.changeImage("2"); //phase 2
                this.phase++;
            }
        }
    } else {
        sprEnemy.rm = function(dg) {
            this.hp -= dg;
            if (this.hp <= 0) {
                enemy_death.play()
                this.remove();
                score += 10 * id;
                createpowerup(this.position.x,this.position.y, 32, 32, 0.5, function(){coeur()}, 90, loadImage("img/Coeur1.png"))
            }
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
        } else if (i.id === 2) {
            if (i.status) {
                i.addSpeed(Math.floor((Math.random() * 3)), Math.floor(Math.random() * 361));
                if (count % 180 === 0) {
                    i.shoot();
                }
            } else {
                i.addSpeed(0.5, 90);
            }
        } else if (i.id === 1) {
            if (i.status) {
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90
                i.setSpeed(Math.floor((Math.random() * 3)), i.rotation + 90);
                if (count % 120 === 0) {
                    i.shoot();
                }
            } else {
                i.setSpeed(1, 90);
            }
        } else if (i.id === 4) {
            if (i.status) {
                let direction = 90;
                i.rotation = degrees(Math.atan2(sprPlayer.position.y - i.position.y, sprPlayer.position.x - i.position.x)) - 90
                i.setSpeed(Math.floor((Math.random() * 5)), i.rotation + 90 + direction);
                if (count % 120 === 0) {
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
            let spawn = Math.floor(Math.random() * 5) + 4;
            createAllEnemy(spawn, 3);
        } else if (wave % 20 === 5 || wave % 20 - 1 === 15) { //Dragon
            let spawn = Math.floor(Math.random() * 5) + 4;
            createAllEnemy(spawn, 2);
        } else { //Classique
            let spawn = Math.floor(Math.random() * 4) + 2;
            createAllEnemy(spawn, 1);
            spawn = Math.floor(Math.random() * 2) + 1;
            createAllEnemy(spawn, 2);
            spawn = Math.floor(Math.random() * 2);
            createAllEnemy(spawn, 3);
        };
    }
}

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
        hit_damage.play()
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
                player_death.play()
                gameOver = true;
                pause = true;
            }
        }
    }
    playerGrp = Group();
    sprPlayer.addToGroup(playerGrp);
    // createpowerup(320, 200, 64, 64, 0.5, function(){Shower()}, +90, loadImage("img/Douche.png"))
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
    if (keyIsDown(65) == true && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation - 180)
    }
    if (keyIsDown(69) == true && sprPlayer.activeControl == 0) {
        sprPlayer.addSpeed(0.4, sprPlayer.rotation)
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
            bullet_explosion.play()
            window.setTimeout(function() { bullet.timout() }, 50);
        });
        player_shoot.play()
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



//#region powerup


function Shower() {
    textSize(50);
    textAlign(CENTER, CENTER)
    fill(255, 204, 0)
    text("Il est temps d'aller prendre une douche", 640, 400)
}

function coeur() {
    if (sprPlayer.lifes === 3 ){
        if (sprPlayer.hp === 100){
            score += 100;
        }else{
            sprPlayer.hp = 100;
        }
    }else{
        sprPlayer.lifes += 1;
    }
}

function createpowerup(x, y, h, w, speed, activation, direction, image) {
    let sprpowerup = createSprite(x,y)
    sprpowerup.setSpeed(speed,direction)
    sprpowerup.addImage(image)
    sprpowerup.oncollide = activation
    sprpowerup.rm = function(){
        this.oncollide()
        this.remove()
    }
    sprpowerup.addToGroup(powerupGrp)
}

function updatePowerup() {
    powerupGrp.forEach(element => {
        if (element.target) {
            outOfScreen(element);
                element.collide(playerGrp, function() {
                    element.rm();
                });
        } else {
            element.collide(playerGrp, function() {
                element.rm();
            });
            if (element.time + element.timelife <= count) {
                element.rm();
            }
        }
    });
}




//#endregion

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
    count++;
    cheatCode();
    playerUpdate();
    start_back();
    updateEnemy();
    bulletUpdate();
    updatePowerup();   
}

//#region cheatCode

function cheatCode(){
    if (keyWentDown(164)){
        let code = prompt("Hmmmm ...")
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
var restartBtn;
var startBtn;
var settingsBtn;
var goBack;
var gui;


var hearts = [];

function preload() {
    for (let i = 1; i <= 6; i++) {
        hearts.push(loadImage("./img/Coeur" + i.toString() + ".png"));
    }
    player_death = loadSound("./sounds/player_death.wav")
    enemy_death = loadSound("./sounds/enemy_death.wav")
    hit_damage = loadSound("./sounds/hit_damage.wav")
    player_shoot = loadSound("./sounds/player_shoot.wav")
    bullet_explosion = loadSound("./sounds/bullet_explosion.wav")
    bounce_sound = loadSound("./sounds/bounce.wav")
    game_music = loadSound("./sounds/game_music_space.mp3")
    game_music.setVolume(0.5)
    bounce_sound.setVolume(0.1)
    enemy_death.setVolume(0.1)
    hit_damage.setVolume(0.2)
    player_death.setVolume(0.6)
    bullet_explosion.setVolume(0.04)
    player_shoot.setVolume(0.05)
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
    window.onclose = game_music.stop()
    enemiesGrp = Group()
    backgroundGrp = Group()
    powerupGrp = Group()
        // createAllEnemy(1000)
    frameRate(60);
    // noCursor();
    let gameCanvas = createCanvas(1280, 600);
    gameCanvas.parent("gameCanvasContainer");
    etoileIMG =  loadImage("./img/etoiles.png");
    createPlayer(500, 300, 100, 200)
    framert = frameRate();
    bulletGrp = Group();
    createHeart();
    sprPlayer.addAnimation("piou", phase1, phase2, phase3, phase4, phase5, phase6, phase6, phase5, phase4, phase3, phase2, phase1)
    sprPlayer.changeAnimation("piou")
    buttonSetup()
    slider = createSlider(0, 255, 100);
    slider.hide()
}

function buttonSetup(){
    restartBtn = new Clickable();
    restartBtn.cornerRadius = 0;
    restartBtn.locate(520, 460);
    restartBtn.textScaled = true;
    restartBtn.text = "RESTART";
    restartBtn.resize(250, 100);
    restartBtn.color = "#FFFFFF";
    restartBtn.onPress = function() {
        window.location.reload()
    }

    startBtn = new Clickable();
    startBtn.cornerRadius = 0;
    startBtn.locate(520, 460);
    startBtn.textScaled = true;
    startBtn.text = "START";
    startBtn.resize(250, 100);
    startBtn.color = "#FFFFFF";
    startBtn.onPress = function() {
        start = false
        settings = false
    }
    settingsBtn = new Clickable();
    settingsBtn.cornerRadius = 0;
    settingsBtn.locate(520, 340);
    settingsBtn.textScaled = true;
    settingsBtn.text = "SETTINGS";
    settingsBtn.resize(250, 100);
    settingsBtn.color = "#FFFFFF";
    settingsBtn.onPress = function() {
        slider.show()
        start = false
        settings = true
    }
    goBack = new Clickable();
    goBack.cornerRadius = 0;
    goBack.locate(520, 460);
    goBack.textScaled = true;
    goBack.text = "MAIN MENU";
    goBack.resize(250, 100);
    goBack.color = "#FFFFFF";
    goBack.onPress = function() {
        slider.hide()
        start = true
        settings = false
    }
}

function startMenuDraw(){
    textSize(50);
    textAlign(CENTER, CENTER);
    fill(255, 204, 0);
    text("MECHANT TOTOP", 640, 160);
    startBtn.draw()
    settingsBtn.draw()
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
let slider

function draw() {
    background(0);
    if (start){
        count++;
        start_back();
        startMenuDraw();
        drawSprites(backgroundGrp);
    }else if(settings){
        slider.position(10, 10);
        slider.style('width', '80px');
        goBack.draw()
    } else{
        if (!pause) {
            if (!game_music.isPlaying()) {
                game_music.play();
            }
        } else {
            game_music.pause();
        }
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
                game_music.stop()
                gameOver = false
                window.location.reload()
            }
            count++
            game_over()
            start_back()
            drawSprites(backgroundGrp);
            restartBtn.draw();
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
    }
    debug_up();
}


function mousePressed() {
    if (!start && !settings){
        let fs = fullscreen();
        fullscreen(!fs);        
    }

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
    star.addImage(etoileIMG)
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

function start_back(){
    update_star()
    if (count % 4 === 0) {
        draw_star()
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
