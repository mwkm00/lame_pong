let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 800
const GAME_HEIGHT = 800
const PADDLESPEED = 20
const RADIUS = 10
const INITIAL_SPEED = 15
const HIT_SPEED = 35
const MOUSE_DEAD_ZONE = 20
const RENDER_COLOR = "#ffffffff"
const LINE_WIDTH = 10
const PADDLE_HEIGHT = 20
const PADDLE_WIDTH = 150
const SCORE_TO_WIN = 10

var gameEnded = false
var gameVictor = "PLAYER 1"
var EnemyAI = true
var paused = false

const BALL_STYLE = "normal" // "normal", "retro"

var scorePlayer = 0
var scorePlayer2 = 0

const hitAudio = new Audio('assets/hit.mp3')
const bounceAudio = new Audio('assets/bounce.mp3')
const scoredAudio = new Audio('assets/scored.mp3')
const startAudio = new Audio('assets/start.mp3')
const keyPressed = new Audio('assets/muted.mp3')
keyPressed.volume = 0.5

class Menu
{
    constructor()
    {
        this.pongPos = GAME_HEIGHT/2-100
        this.playButtonPos = GAME_HEIGHT/2+100
    }
    draw(context)
    {
        context.fillStyle = RENDER_COLOR
        context.font = "80px Chava"
        context.fillText("PONG",GAME_WIDTH/2.9,this.pongPos)
        context.font = "40px Chava"
        context.fillText("PLAY",GAME_WIDTH/2.4,this.playButtonPos)
    }
}

class VictoryScreen
{
    constructor(game)
    {
        this.font = "80px Chava"
        this.screenPosY = game.gameHeight/2
        this.screenPosX = game.gameWidth/4.4
    }
    draw(context)
    {
        if(gameEnded)
        {
            context.font = this.font
            context.fillText(gameVictor,this.screenPosX,this.screenPosY-2*LINE_WIDTH)
            context.fillText("WINS",this.screenPosX,1.2*this.screenPosY)
        }
    }
    update(deltaTime)
    {
    }
}

class PauseScreen
{
    constructor(game)
    {
        this.font = "80px Chava"
        this.screenPosY = game.gameHeight/2
        this.screenPosX = game.gameWidth/3.5
    }
    draw(context)
    {
        if(paused)
        {
            context.font = this.font
            context.fillText("PAUSED",this.screenPosX,this.screenPosY-2*LINE_WIDTH)
        }
    }
    update(deltaTime)
    {
    }
}

class Game
{
    constructor(gameWidth, gameHeight)
    {
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
    }

    start()
    {
        this.paddle = new Paddle(this)
        this.EnemyPaddle = new EnemyP(this)
        new InputHandler(this.paddle, "ArrowLeft", "ArrowRight")
        new InputHandler(this.EnemyPaddle, "a", "d")
        this.ball = new Ball(this)
        this.middleLine = new middleLine(this)
        this.scoreDisplay = new Score(this)
        this.endScreen = new VictoryScreen(this)
        this.pauseScreen = new PauseScreen(this)

        this.gameObjects = [this.ball, this.middleLine, this.scoreDisplay,this.pauseScreen,this.endScreen, this.paddle, this.EnemyPaddle]
    }

    restart()
    {
        this.ball.pos.x = game.gameWidth/2
        this.ball.pos.y = game.gameHeight/2
        this.ball.direction.x = 0
        this.ball.direction.y = 0
        this.paddle.pos.x = game.gameWidth/2
        this.EnemyPaddle.pos.x = game.gameWidth/2
    }

    update(deltaTime)
    {
        this.gameObjects.forEach((object)=> object.update(deltaTime))

        if (EnemyAI)
        {
            if(this.EnemyPaddle.pos.x < this.ball.pos.x)
            {
                this.EnemyPaddle.moveRight();
            }
            else
            {
                this.EnemyPaddle.moveLeft();
            }
        }

        if(this.ball.pos.x < 0|| this.ball.pos.x > this.gameWidth)
        {
            if (this.ball.pos.x < 0)
            {
                this.ball.pos.x = 50
            }
            else
            {
                this.ball.pos.x = this.gameWidth - 50
            }
        }

        if(scorePlayer == SCORE_TO_WIN || scorePlayer2 == SCORE_TO_WIN)
        {
            if (scorePlayer2 == SCORE_TO_WIN)
            {
                gameVictor = "PLAYER 2"
            }
            this.gameObjects.pop()
            this.gameObjects.pop()
            scorePlayer = ""
            scorePlayer2 = ""
            gameEnded = true
        }

    }

    draw(ctx)
    {
        this.gameObjects.forEach((object)=> object.draw(ctx))
    }
    
}

class middleLine
{
    constructor(game)
    {
        this.pos = game.gameHeight/2
    }
    draw(context)
    {
        context.strokeStyle = RENDER_COLOR;
        context.lineWidth = LINE_WIDTH;
        context.setLineDash([15, 15]);
        context.beginPath()
        context.moveTo(0, this.pos)
        context.lineTo(game.gameWidth, this.pos)
        context.stroke();
    }
    update(deltaTime)
    {
    }
}

class Score
{
    constructor(game)
    {
        this.font = "80px Chava"
        this.player2Score = scorePlayer2
        this.playerScore = scorePlayer
    }
    draw(context)
    {
        context.font = this.font
        context.fillText(this.player2Score,0,((game.gameHeight/2)-1.5*LINE_WIDTH))
        context.fillText(this.playerScore,0,((game.gameHeight/2)+7*LINE_WIDTH))
    }
    update(deltaTime)
    {
        this.player2Score = scorePlayer2
        this.playerScore = scorePlayer
    }
}

class Paddle 
{
    constructor(game)
    {
        this.gameWidth = game.gameWidth
        this.gameHeight = game.gameHeight

        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;

        this.maxSpeed = PADDLESPEED;

        this.speed = 0;

        this.pos = {
            x: this.gameWidth/2 - this.width/2, 
            y: this.gameHeight - this.height - 10
        };
    }

    moveLeft()
    {
        this.speed = -this.maxSpeed;
    }

    moveRight()
    {
        this.speed = this.maxSpeed;
    }

    stop()
    {
        this.speed = 0;
    }

    draw(context)
    {
        context.fillStyle = RENDER_COLOR
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }

    update(deltaTime)
    {
        if(!deltaTime) return;
        this.pos.x += this.speed / deltaTime;

        if(this.pos.x < 0 || this.pos.x > this.gameWidth-this.width)
        {
            if(this.speed < 0)
            {
                this.pos.x = 0
                this.speed = 0
            }
            else
            {
                this.pos.x = this.gameWidth - this.width
                this.speed = 0
            }

        }
    }
}

class Ball
{
    constructor(game)
    {
        this.radius = RADIUS
        this.color = RENDER_COLOR
        this.pos = 
        {
            x: game.gameWidth/2,
            y: game.gameHeight/2
        }

        this.speed = INITIAL_SPEED
        this.direction =
        {
            x: 0,
            y: 0
        }

        this.game = game;
    }
    
    draw(context)
    {
        if (BALL_STYLE == "retro")
        {
            context.fillStyle = RENDER_COLOR
            context.fillRect(this.pos.x, this.pos.y, this.radius, this.radius)
        }
        else
        {
            context.fillStyle = this.color
            context.beginPath()
            context.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2, false)
            context.closePath()
            context.fill()
        }
    }

    update(deltaTime)
    {
        if (!deltaTime) return
        if (Math.abs(this.direction.x) >= 0.9 || Math.abs(this.direction.x) <= 0.1)
        {
            const directionVector = Math.random() * (2*Math.PI)
            this.direction = {x: Math.cos(directionVector), y: Math.sin(directionVector)}
        }
        this.pos.x += (this.direction.x * this.speed) / deltaTime
        this.pos.y += (this.direction.y * this.speed) / deltaTime

        if (this.pos.y - this.radius > game.gameHeight || this.pos.y + this.radius < 0)
        {
            if (!gameEnded)
            {
                scoredAudio.play()
                if(this.pos.y < 0)
                {
                    console.log("PLAYER SCORES")
                    scorePlayer += 1
                }
                else
                {
                    console.log("COMPUTER SCORES")
                    scorePlayer2 += 1
                }
                this.speed = INITIAL_SPEED
                game.restart()
            }
            else
            {
                bounceAudio.play()
                this.direction.y *= (-1)
            }

        }
        if (this.pos.x + this.radius > game.gameWidth || this.pos.x - this.radius < 0)
        {
            bounceAudio.play()
            this.direction.x *= (-1)
        }

        if ((this.collisionBottom() || this.collisionTop()) && !gameEnded)
        {
            this.speed = HIT_SPEED
            let paddleHalfWidth;
            let paddlePos;
            if (this.collisionBottom())
            {
                paddleHalfWidth = this.game.paddle.width/2
                paddlePos = this.game.paddle.pos.x
            }
            else
            {
                paddleHalfWidth = this.game.EnemyPaddle.width/2
                paddlePos = this.game.EnemyPaddle.pos.x
            }
            let middlePoint = paddlePos + paddleHalfWidth
            let collidePoint = this.pos.x - middlePoint
            collidePoint = collidePoint / paddleHalfWidth
            let angleRadians = (Math.PI/4) * collidePoint

            if(this.collisionBottom() && Math.cos(angleRadians)>0)
            {
                this.direction.y = (-1)*Math.cos(angleRadians)    
            }
            else
            {
                this.direction.y = Math.cos(angleRadians)
            }
            hitAudio.play()
            this.direction.x = Math.sin(angleRadians)  
        }
    }

    collisionBottom()
    {
        let PaddleLeft = this.game.paddle.pos.x
        let PaddleRight = this.game.paddle.pos.x + this.game.paddle.width
        let PaddleTop = this.game.paddle.pos.y

        let BallBottom = this.pos.y + this.radius
        let BallLeft = this.pos.x - this.radius
        let BallRight = this.pos.x + this.radius

        return ((BallBottom >= PaddleTop) && (BallRight >= PaddleLeft) && (BallLeft <= PaddleRight))
    }

    collisionTop()
    {
        let PaddleLeft = this.game.EnemyPaddle.pos.x
        let PaddleRight = this.game.EnemyPaddle.pos.x + this.game.EnemyPaddle.width
        let PaddleTop = this.game.EnemyPaddle.pos.y + this.game.EnemyPaddle.height

        let BallTop = this.pos.y - this.radius
        let BallLeft = this.pos.x - this.radius
        let BallRight = this.pos.x + this.radius
        return ((BallTop <= PaddleTop) && (BallRight >= PaddleLeft) && (BallLeft <= PaddleRight))
    }

}

class EnemyP extends Paddle
{
    constructor(game)
    {
        super(game)
        this.pos ={
            x:this.gameWidth/2 - this.width/2,
            y:10
        }
    }

}

class InputHandler
{
    constructor(paddle, left, right)
    {
        document.addEventListener('keydown', (event)=> 
        {
            switch (event.key)
            {
                case right:
                    paddle.moveRight()
                    break;
                case left:
                    paddle.moveLeft()
                    break;
            }
        })

        document.addEventListener('keyup', (event)=> 
        {
            switch (event.key)
            {
                case right:
                    if(paddle.speed>0)
                    {
                        paddle.stop();
                    }
                    break;
                case left:
                    if(paddle.speed<0)
                    {
                        paddle.stop();
                    }
                    break;
            }
        })

    }

}


let menu = new Menu()
menu.draw(ctx)

let lastTime = 0;
function gameLoop(timeStamp) 
{
    let deltaTime = timeStamp - lastTime
    
    console.log(deltaTime)

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    if (!paused)
    {
        game.update(deltaTime)
    }
    game.draw(ctx)

    lastTime = timeStamp;

    requestAnimationFrame(gameLoop)
}

let game = new Game(GAME_WIDTH, GAME_HEIGHT)
let endScreen = new VictoryScreen(game)

document.addEventListener('keydown', (event)=>  
{
    switch (event.key)
    {
        case " ":
            scorePlayer = 0
            scorePlayer2 = 0
            gameEnded = false
            game = new Game(GAME_WIDTH, GAME_HEIGHT)
            startAudio.play()
            game.start()
            gameLoop()
            break
        case "i":
            keyPressed.play()
            EnemyAI = !EnemyAI
            game.EnemyPaddle.stop()
            break
        case "m":
            keyPressed.play()
            hitAudio.muted = !hitAudio.muted
            bounceAudio.muted = !bounceAudio.muted
            scoredAudio.muted = !scoredAudio.muted
            startAudio.muted = !startAudio.muted
        case "p":
            keyPressed.play()
            if (!gameEnded)
            {
                paused = !paused
            }
    }
})