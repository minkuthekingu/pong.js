let canvas;
// Context provides functions used for drawing and 
// working with Canvas
let ctx;
 
// Used to monitor whether paddles and ball are
// moving and in what direction
let DIRECTION = {
    STOPPED: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
// The paddle object used for both the minku and AI
class Paddle{
    constructor(side) {
        // Define size of paddle
        this.width = 15;
        this.height = 65;
        // Put paddle on right or left for minku and AI
        this.x = side === 'left' ? 150 : canvas.width - 150;
        // Center the paddle
        this.y = canvas.height / 2;
        // Will hold the increasing score
        this.score = 0;
        // Defines movement direction of paddles
        this.move = DIRECTION.STOPPED;
        // Defines how quickly paddles can be moved
        this.speed = 11;
    }
}
 
// The ball object 
class Ball{
    constructor(newSpeed) {
        // Size of ball
        this.width = 15;
        this.height = 15;
        // Position in center
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        // Ball moves in x & y direction so monitor both
        this.moveX = DIRECTION.STOPPED;
        this.moveY = DIRECTION.STOPPED;
        // Speed ball can move
        this.speed = newSpeed;
    }
}
 
let minku;
let aiPlayer;
let ball;
// Monitors whether ball is currently in play
let running = false;
let gameOver = false;
// Will be used to add a delay before play resumes
let delayAmount;
// Should ball target minku or AI
let targetForBall;
// Used to play sounds when paddle hits a ball
let beepSound;
 
 
// Call for our function to execute when page is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);
 
function SetupCanvas(){
    // Get reference to canvas element
    canvas = document.getElementById('my-canvas');
    // Get methods for manipulating the canvas
    ctx = canvas.getContext('2d');
    // Define canvas size
    canvas.width = 1400;
    canvas.height = 1000;
    // Create minku and AI paddles
    minku = new Paddle('left');
    aiPlayer = new Paddle('right');
    // Create ball and define its speed
    ball = new Ball(7);
    // Make AI paddle slightly slower then the ball
    // and the minku
    aiPlayer.speed = 6.5;
 
    // Set target for ball to the minku
    targetForBall = minku;
 
    // Set delay between scores
    delayAmount = (new Date()).getTime();
 
    // Allow for playing sound
    beepSound = document.getElementById('beepSound');
    beepSound.src = 'beep.wav';
 
    // Handle keyboard input
    document.addEventListener('keydown', MoveminkuPaddle);
    document.addEventListener('keyup', StopminkuPaddle);
 
    // Draw the board for the 1st time
    Draw();
}
 
function Draw(){
    // Clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Draw Canvas background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Paddles
    ctx.fillStyle = 'white';
    ctx.fillRect(minku.x, minku.y, minku.width, minku.height);
    ctx.fillRect(aiPlayer.x, aiPlayer.y, aiPlayer.width, aiPlayer.height);
 
    // Draw Ball
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
 
    // Set font for scores
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
 
    // Draw scores
    ctx.fillText(minku.score.toString(), (canvas.width/2) - 300, 100);
    ctx.fillText(aiPlayer.score.toString(), (canvas.width/2) + 300, 100);
 
    // Declare a winner
    if(minku.score === 2){
        ctx.fillText("minku Wins", canvas.width/2, 300);
        gameOver = true;
    }
    if(aiPlayer.score === 2){
        ctx.fillText("AI Wins", canvas.width/2, 300);
        gameOver = true;
    }
}
 
// All the logic is here including collision detection,
// minku / AI paddle movement, keeping assets on the board
function Update(){
    if(!gameOver){
        // Handle if ball scores on the minku
        if(ball.x <= 0){
            ResetBall(aiPlayer, minku);
        }
 
        // Handle if ball scores on AI
        if(ball.x >= canvas.width - ball.width){
            ResetBall(minku, aiPlayer);
        }
 
        // Handle if ball hits the top or bottom
        if(ball.y <= 0){
            ball.moveY = DIRECTION.DOWN;
        }
        if(ball.y >= canvas.height - ball.height){
            ball.moveY = DIRECTION.UP;
        }
 
        // Move minku paddle if they are pressing down
        // buttons
        if(minku.move === DIRECTION.DOWN){
            minku.y += minku.speed;
        } else if(minku.move === DIRECTION.UP){
            minku.y -= minku.speed;
        }
 
        // If minku tries to move off the board prevent that
        if(minku.y < 0){
            minku.y = 0;
        } else if(minku.y >= (canvas.height - minku.height)){
            minku.y = canvas.height - minku.height;
        }
 
        // Add a delay and only if a current target is set move
        // the ball
        if(AddADelay() && targetForBall){
            // Move ball toward he target
            ball.moveX = targetForBall === minku ? DIRECTION.LEFT : DIRECTION.RIGHT;
            // Move either up or down to randomize ball movement
            ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
            // Start ball from the middle
            ball.y = canvas.height / 2;
 
            // Nullify target because target changes repeatedly
            // as the ball bounces
            targetForBall = null;
        }
 
        // Move ball based on moveY & moveX values
        if (ball.moveY === DIRECTION.UP){
            ball.y -= ball.speed;
        } else if (ball.moveY === DIRECTION.DOWN){
            ball.y += ball.speed;
        } 
        if (ball.moveX === DIRECTION.LEFT){
            ball.x -= ball.speed;
        } else if (ball.moveX === DIRECTION.RIGHT){
            ball.x += ball.speed;
        }
 
        // Handle AI up & down movement
        if (aiPlayer.y > ball.y - (aiPlayer.height / 2)) {
            
            if (ball.moveX === DIRECTION.RIGHT){
                aiPlayer.y -= aiPlayer.speed;
            } else {
                aiPlayer.y -= aiPlayer.speed;
            }
        }
        if (aiPlayer.y < ball.y - (aiPlayer.height / 2)) {
            if (ball.moveX === DIRECTION.RIGHT){
                aiPlayer.y += aiPlayer.speed;
            } else {
                aiPlayer.y += aiPlayer.speed;
            }
        }
 
        // If AI tries to move off the board handle that
        if(aiPlayer.y < 0){
            aiPlayer.y = 0;
        } else if(aiPlayer.y >= (canvas.height - aiPlayer.height)){
            aiPlayer.y = canvas.height - aiPlayer.height;
        }
 
        // Handle ball collision with the minku paddle
        // x represents the upper left hand position of 
        // the object. So we have to subtract the ball width
        // to check if the balls x is <= paddle x.
        // The same must be true for the minku x to have
        // a collision
        if (ball.x - ball.width <= minku.x && ball.x >= minku.x - minku.width) {
            // If also this is true for y in the upper left
            // hand corner we have a collison
            if (ball.y <= minku.y + minku.height && ball.y + ball.height >= minku.y) {
                ball.x = (minku.x + ball.width);
                // Move ball toward right of screen
                ball.moveX = DIRECTION.RIGHT;
                beepSound.play();
            }
        }
 
        // Handle ball collison with AI paddle
         if (ball.x - ball.width <= aiPlayer.x && ball.x >= aiPlayer.x - aiPlayer.width) {
            if (ball.y <= aiPlayer.y + aiPlayer.height && ball.y + ball.height >= aiPlayer.y) {
                ball.x = (aiPlayer.x - ball.width);
                ball.moveX = DIRECTION.LEFT;
                beepSound.play();
            }
        }
    }
}
 
// If we are not in play mode start the game running and loop
// through updates and draws till the end of the game
function MoveminkuPaddle(key){
    if(running === false){
        running = true;
        window.requestAnimationFrame(GameLoop);
    }
 
    // Handle up arrow and w input
    if(key.keyCode === 38 || key.keyCode === 87) minku.move = DIRECTION.UP;
 
    // Handle down arrow and s input
    if(key.keyCode === 40 || key.keyCode === 83) minku.move = DIRECTION.DOWN;
}
 
function StopminkuPaddle(evt){
    minku.move = DIRECTION.STOPPED;
}
 
// Loops constantly updating position of assets 
// while drawing them
function GameLoop(){
    Update();
    Draw();
    // Keep looping
    if(!gameOver) requestAnimationFrame(GameLoop);
}
 
function ResetBall(whoScored, whoLost){
    // Increment the player that scored
    whoScored.score++;
 
    // Reset the ball and increase speed
    let newBallSpeed = ball.speed + .2;
    ball = new Ball(newBallSpeed);
 
    // Set new target for the ball
    targetForBall = whoLost;
 
    // Reset the the delay start time
    delayAmount = (new Date()).getTime();
}
 
// Used to add a second delay after scoring
function AddADelay(){
    return ((new Date()).getTime() - delayAmount >= 1000);
}

