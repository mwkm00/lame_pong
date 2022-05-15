let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 800;
const GAME_HEIGHT = 800;
const PADDLESPEED = 20;
const RADIUS = 10;
const INITIAL_SPEED = 15;
const HIT_SPEED = 35;
const MOUSE_DEAD_ZONE = 20;

var scorePlayer = 0
var scoreComputer = 0

const hitAudio = new Audio('assets/hit.mp3');


class Game
{
    constructor(gameWidth, gameHeight)
    {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
    }

    start()
    {
        this.paddle = new Paddle(this)
        this.EnemyPaddle = new EnemyP(this)
        new InputHandler(this.paddle);
        this.ball = new Ball(this)

        this.gameObjects = [this.paddle, this.EnemyPaddle, this.ball];
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

        if (this.paddle.paddleOnMouse())
        {
            this.paddle.stop();
        }

        if(this.EnemyPaddle.pos.x < this.ball.pos.x)
        {
            this.EnemyPaddle.moveRight();
        }
        else
        {
            this.EnemyPaddle.moveLeft();
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
    }

    draw(ctx)
    {
        this.gameObjects.forEach((object)=> object.draw(ctx))
    }
    
}

class Paddle 
{
    constructor(game)
    {
        this.gameWidth = game.gameWidth
        this.gameHeight = game.gameHeight

        this.width = 150;
        this.height = 30;

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
        context.fillStyle = "#000000"
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }

    paddleOnMouse()
    {
        if (Math.abs(game.mousePosX - Math.floor(this.pos.x+(this.width/2))) < MOUSE_DEAD_ZONE)
        {
            return true;
        }
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
        this.color = "#FF0000"
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
        context.fillStyle = this.color
        context.beginPath()
        context.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2, false)
        context.closePath()
        context.fill()
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
            if(this.pos.y < 0)
            {
                console.log("PLAYER SCORES")
                scorePlayer += 1
                document.getElementById("scorePlayer").innerText = scorePlayer
            }
            else
            {
                console.log("COMPUTER SCORES")
                scoreComputer += 1
                document.getElementById("scoreComputer").innerText = scoreComputer
            }
            this.speed = INITIAL_SPEED
            game.restart()

        }
        if (this.pos.x + this.radius > game.gameWidth || this.pos.x - this.radius < 0)
        {
            this.direction.x *= (-1)
        }

        if (this.collisionBottom() || this.collisionTop())
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
            hitAudio.play();
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
    constructor(paddle)
    {
        document.addEventListener('mousemove', (event)=> 
        {
            game.mousePosX = event.x
            let moveDirection = event.x -(paddle.pos.x+(paddle.width/2))
            if(event.x != Math.floor(paddle.pos.x))
            {
                if (moveDirection > 0 && event.x > paddle.pos.x)
                {
                    paddle.moveRight()
                }
                if (moveDirection < 0 && event.x < paddle.pos.x)
                {
                    paddle.moveLeft()
                }
            }
        })

    }

}

let game = new Game(GAME_WIDTH, GAME_HEIGHT)

game.start();

let lastTime = 0;
function gameLoop(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    game.update(deltaTime);
    game.draw(ctx)

    requestAnimationFrame(gameLoop);
}

gameLoop()