let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLESPEED = 15;
const BALLSIZE = 50;
const BALL_LEFT_UP_CORRECTION = 20;
const BALL_RIGHT_DOWN_CORRECTION = 30;

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

        this.gameObjects = [this.paddle, this.ball, this.EnemyPaddle];
    }

    update(deltaTime)
    {
        this.gameObjects.forEach((object)=> object.update(deltaTime))
        if(this.EnemyPaddle.pos.x < this.ball.pos.x)
        {
            this.EnemyPaddle.moveRight();
        }
        else
        {
            this.EnemyPaddle.moveLeft();
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
        document.addEventListener('keydown', (event)=> 
        {
            switch (event.key)
            {
                case "ArrowRight":
                    paddle.moveRight()
                    break;
                case "ArrowLeft":
                    paddle.moveLeft()
                    break;
            }
        })

        document.addEventListener('keyup', (event)=> 
        {
            switch (event.key)
            {
                case "ArrowRight":
                    if(paddle.speed>0)
                    {
                        paddle.stop();
                    }
                    break;
                case "ArrowLeft":
                    if(paddle.speed<0)
                    {
                        paddle.stop();
                    }
                    break;
            }
        })
    }

}

class Ball
{
    constructor(game)
    {
        this.gameWidth = game.gameWidth
        this.gameHeight = game.gameHeight
        
        this.game = game;

        this.image = document.getElementById("ball");
        this.pos = {
            x: 15,
            y: 15
        }
        this.speed = {
            x: 2,
            y: 2
        }
        this.size = BALLSIZE;
        this.r_up_correction = BALL_RIGHT_DOWN_CORRECTION
        this.l_down_correction = BALL_LEFT_UP_CORRECTION
    }

    draw(context)
    {
        context.drawImage(this.image, this.pos.x, this.pos.y, this.size,this.size)
    }

    update(deltaTime)
    {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;

        if(this.pos.x+this.r_up_correction > this.gameWidth || this.pos.x+this.l_down_correction < 0)
        {
            this.speed.x = -this.speed.x;
        }

        if(this.pos.y+this.r_up_correction > this.gameHeight || this.pos.y+this.l_down_correction < 0)
        {
            this.speed.y = -this.speed.y;
        }

        let bottomOfBall = this.pos.y + this.r_up_correction;
        let topOfBall = this.pos.y

        let topOfPaddle = this.game.paddle.pos.y;
        let bottomOfEnemyPaddle = this.game.EnemyPaddle.pos.y

        let leftEndPaddle = this.game.paddle.pos.x;
        let rightEndPaddle = this.game.paddle.pos.x + this.game.paddle.width

        let leftEndEnemyPaddle = this.game.EnemyPaddle.pos.x
        let rightEndEnemyPaddle = this.game.EnemyPaddle.pos.x + this.game.EnemyPaddle.width

        if(bottomOfBall >= topOfPaddle && this.pos.x+this.r_up_correction >= leftEndPaddle && this.pos.x+this.l_down_correction <= rightEndPaddle)
        {
            this.speed.y = -this.speed.y
            this.pos.y = this.game.paddle.pos.y - this.r_up_correction;
        }

        if(topOfBall <= bottomOfEnemyPaddle && this.pos.x+this.l_down_correction >= leftEndEnemyPaddle && this.pos.x+this.r_up_correction <= rightEndEnemyPaddle)
        {
            this.speed.y = -this.speed.y
            this.pos.y = this.game.EnemyPaddle.pos.y+5;
        }
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