
let player


export function createPlayer(x,y,h,w) {
    let sprPlayer = createSprite(200, 300, 70, 140)
    player = {
        rect: {
            x: x,
            y: y,
            h: h,
            w: w,
            angle: 0,
        },
        turn: 5,
        masse: 10,
        velocity: 10,
        health: 3,
        powerUps: [],
        previous: 0
    }
    window.addEventListener("keydown", function(event) {
        console.log(event)
        if (event.code === "KeyW" || event.code === "ArrowUp"){
            player.rect.y -= 10
        }else if (event.code === "KeyS" || event.code === "ArrowDown"){
            player.rect.y += 10
        }
        if (event.code === "KeyA" || event.code === "ArrowLeft"){
            player.rect.angle -= player.turn
            sprPlayer.rotation = player.rect.angle
        }else if(event.code === "KeyD" || event.code === "ArrowRight"){
            player.rect.angle += player.turn
            sprPlayer.rotation = player.rect.angle
        }
        if (event.code === "Space"){
            console.log("piou")
        }
    }, true);
    return player
}