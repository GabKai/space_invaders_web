const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
let game = {
    over: false,
    active: true
}

class Player{
    constructor(){

        this.position = {
            x: 0,
            y: 0
        }

        this.counter = 0
        this.opacity = 1

        const image = new Image()
        image.src = "res/ship.png"

        this.image = image
        this.image.onload = () => {
            const scale = 0.15
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            
            this.position = {
                x: (canvas.width - this.width)/2,
                y: (canvas.height - this.height) -20
            }
        }
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        if(this.image){
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        }
        c.restore()
    }

    update(){
        this.counter += 1
        if(this.counter >= 75){
            addTiro(this.position.x + this.width/2,this.position.y,0,-10)
            this.counter = 0
        }
    }
}

class Alien{
    constructor(px,py){

        this.position = {
            x: px,
            y: py
        }

        this.counterMax = Math.floor((Math.random()+0.75)*360)
        this.counter = 0

        const image = new Image()
        image.src = "res/alien.png"

        this.image = image
        this.image.onload = () => {
            const scale = 0.2
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        }
    }

    draw() {
        if(this.image){
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        }
    }

    update({velocity}){

        this.position.x += velocity.x;
        this.position.y += velocity.y;

        this.counter += 1
        if(this.counter >= this.counterMax){
            addTiro(this.position.x + this.width/2,this.position.y,0,10)
            this.counter = 0
        }
    }
}

class Grid{
    constructor(startx, starty, starts) {
        this.position = {
            x:startx,
            y:starty
        }

        this.velocity = {
            x:starts,
            y:0
        }

        this.aliens = []
        this.width = 0
        this.height = 0

        for(let i = 0; i < 12; i++){
            for(let j = 0; j < 4; j++){
                this.aliens.push(new Alien(this.position.x + (60*i),this.position.y + (40*j)))
                this.height += 40
            }
            this.width += 60
        }
    }

    draw(){
        this.aliens.forEach((alien) => {
            alien.draw()
        })
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if(this.position.x <= 0){
            this.velocity.x = this.velocity.x*-1
        }else if(this.position.x + this.width >= canvas.width){
            this.velocity.x = this.velocity.x*-1;
        }
        
        this.aliens.forEach((alien) => {
            alien.update({velocity:this.velocity})
        })
    }
}

class Projectile {
    constructor({position,velocity}){
        this.position = position;
        this.velocity = velocity;

        this.radius = 3;
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x,this.position.y, this.radius, 0, Math.PI*2)
        if(this.velocity.y < 0){
            c.fillStyle = 'red'
        }else{
            c.fillStyle = 'chartreuse'
        }
        c.fill()
        c.closePath()
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({position,velocity, radius, color, time}){
        this.position = position
        this.velocity = velocity

        this.radius = radius
        this.color = color
        this.timemax = time
        this.time = time
    }

    draw(){
        c.save()
        c.globalAlpha = (this.time / this.timemax)
        c.beginPath()
        c.arc(this.position.x,this.position.y, this.radius, 0, Math.PI*2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.time -= 1
    }
}

const player = new Player()
const grids =[
    (new Grid(50, 70, 3)),
    (new Grid(canvas.width - (770), 270, -3))
]
const tiros = []
const particles = []
let score = 0

function addTiro(px,py,sx,sy){
    tiros.push(new Projectile({position:{x:px,y:py},velocity:{x:sx,y:sy}}))
}
function mousemove(e){
    if(!game.over){
        if(player.image){
            player.position.x = e.x - player.width/2;
        }
    }
}

function render(){
    player.draw()
    grids.forEach((grid) => {
        grid.draw()
    })
    tiros.forEach((projectile) => {
        projectile.draw()
    })
    particles.forEach((particle) => {
        particle.draw()
    })
}

function update(){
    if(!game.over){
        player.update()
    }
    grids.forEach((grid) => {
        grid.update()
    })
    tiros.forEach((projectile,index) => {
        if(projectile.position.y + projectile.radius < 0 || projectile.position.y > canvas.height){
            setTimeout(() => {
                tiros.splice(index,1)
            }, 0)
        }else{
            projectile.update()
        }
    })

    // colisao
    tiros.forEach((projectile, i) => {
        //bala
        if(projectile.velocity.y < 0){
            let gq = 2
            grids.forEach((grid) => {
                grid.aliens.forEach((alien, j) => {
                    if(projectile.position.y >= alien.position.y && projectile.position.y <= alien.position.y + alien.height){
                        if(projectile.position.x >= alien.position.x && projectile.position.x <= alien.position.x + alien.width){
                            
                            for(let i = 0; i < 15; i++){
                                particles.push(
                                    new Particle({
                                        position:{
                                            x: alien.position.x + alien.width/2,
                                            y: alien.position.y + alien.height/2
                                        },
                                        velocity:{
                                            x: (Math.random() - 0.5)*2,
                                            y: (Math.random() - 0.5)*2
                                        },
                                        radius: Math.floor(Math.random()*2)+1,
                                        color:'chartreuse',
                                        time: Math.floor(Math.random()*50)+30
                                    })
                                )
                            }
                            
                            setTimeout(() => {
                                tiros.splice(i,1)
                                grid.aliens.splice(j,1)
                                score += 100
                            }, 0)
                        }
                    }
                })
                if(grid.aliens.length == 0){
                    gq -= 1
                }
            })
            if(gq <= 0){
                setTimeout(() => {
                    game.active = false
                }, 2000)
            }
        }else if(!game.over){
            if(projectile.position.y >= player.position.y && projectile.position.y <= player.position.y + player.height){
                if(projectile.position.x >= player.position.x && projectile.position.x <= player.position.x + player.width){
                    
                    for(let i = 0; i < 150; i++){
                        particles.push(
                            new Particle({
                                position:{
                                    x: player.position.x + player.width/2,
                                    y: player.position.y + player.height/2
                                },
                                velocity:{
                                    x: (Math.random() - 0.5)*5,
                                    y: (Math.random() - 0.5)*5
                                },
                                radius: Math.floor(Math.random()*3)+1,
                                color:'white',
                                time: Math.floor(Math.random()*175)+175
                            })
                        )
                    }
                    
                    setTimeout(() => {
                        tiros.splice(i,1)
                        player.opacity = 0
                        game.over = true
                    }, 0)

                    setTimeout(() => {
                        game.active = false
                    }, 2000)
                }
            }
        }
    })    

    
    particles.forEach((particle, i) => {
        particle.update()
        if(particle.time <= 0){
            setTimeout(() => {
                particles.splice(i,1)
            })
        }
    })
}

function animate(){
    if(!game.active){
        gameExit()
    }
    window.requestAnimationFrame(animate)

    c.fillStyle = 'black'
    c.fillRect(0,0, canvas.width, canvas.height)

    update()
    render()
}
animate()

function gameExit() {
    sessionStorage.setItem("score", score)
    window.location.replace("home.html");
}

