/*
RULES:

*/

function movePlayer(team, goalk, pid, ballx, bally, ballvx, ballvy, players) {
	if (goalk) {
		let vx = 0, vy = bally-players[pid].y;
		return {vx, vy};
	}
	return {
		vx: random(min(ballx-players[pid].x, 5)),
		vy: random(min(bally-players[pid].y, 5))
	}
}




























// Ground dimension
const maxX = 800, maxY = 400;
// Diameter of the ball and player
const dia = 20;

let nPlayers = 6;
let friction = -0.9;
let players = [];
let ball;

let team1score = 0, team2score = 0;

function setup() {
	createCanvas(maxX, maxY);
	resetGame();
}

function resetGame() {
	players[0] = new Player(10 + dia/2, height/2, dia, 0, players, 0, 1);
	players[1] = new Player(width/4, height/3, dia, 1, players, 0, 0);
	players[2] = new Player(width/4, 2*height/3, dia, 2, players, 0, 0);
	players[3] = new Player(width-10-dia/2, height/2, dia, 3, players, 1, 1);
	players[4] = new Player(3*width/4, height/3, dia, 4, players, 1, 0);
	players[5] = new Player(3*width/4, 2*height/3, dia, 5, players, 1, 0);
	ball = new Ball(maxX/2, maxY/2, dia, 10, players);
}

function draw() {
	drawStadium();

	// The players
	players.forEach(player => {
		player.collide();
		player.move();
		player.display();
  	});
  	// The ball
  	ball.collide();
  	ball.move();
  	ball.display();
}

/* The ball */
class Ball {
  constructor(xin, yin, din, idin, oin) {
    this.vx = min(this.vx, 6);
    this.vx = max(this.vx, -6);
    this.x = xin;
    this.y = yin;
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
  }

  collide() {
    for (let i = 0; i < nPlayers; i++) {
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      if (distance <= minDist+1) {
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - this.others[i].x);
        let ay = (targetY - this.others[i].y);
        this.vx -= ax;
        this.vy -= ay;
      }
    }
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    // GOAL
    if (this.x-this.diameter/2 <= 1 && this.y-this.diameter/4 >= 161 && this.y+this.diameter/4 <= height-161) {
    	++team2score;
    	console.log({team2score})
    	this.x = width/2;
    	this.y = height/2;
    	this.vx = this.vy = 0;
    	resetGame();
    } else if (this.x+this.diameter/2 >= width-1 && this.y-this.diameter/4 >= 161 && this.y+this.diameter/4 <= height-161) {
    	++team1score;
    	console.log({team1score})
    	this.x = width/2;
    	this.y = height/2;
    	this.vx = this.vy = 0;
    	resetGame();
    }

    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      this.vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      this.vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= friction;
    }

    this.vx = min(this.vx, 6);
    this.vx = max(this.vx, -6);
    this.vy = min(this.vy, 6);
    this.vy = max(this.vy, -6);
  }

  display() {
  	noStroke();
  	fill(0);
    circle(this.x, this.y, this.diameter);
  }
}

/* Player object */
class Player {
  constructor(xin, yin, din, idin, oin, team, goalk) {
    this.x = xin;
    this.y = yin;
    this.maxSpeed = 5;
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
    this.team = team;
    this.goalk = goalk;
  }

  collide() {
  	// Collision with other players
    for (let i = this.id + 1; i < nPlayers; i++) {
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      if (distance <= minDist) {
      	this.vx = 0;
        this.vy = 0;
        this.others[i].vx = 0;
        this.others[i].vy = 0;
      }
      if (distance <= 1.5*minDist) {
        this.vx = min(this.vx, 0.1);
        this.vy = min(this.vy, 0.1);
        this.others[i].vx = min(this.others[i].vx, 0.1);
        this.others[i].vy = min(this.others[i].vy, 0.1);
      }
    }
  }

  move() {
  	const playerdet = [];
  	for (let i = 0; i < 6; ++i) {
  		playerdet[i] = {
  			x: players[i].x,
  			y: players[i].y,
  			vx: players[i].vx,
  			vy: players[i].vy
  		};
  	}
  	let {vx, vy} = movePlayer(this.team, this.goalk, this.id, ball.x, ball.y, ball.vx, ball.vy, playerdet);
  	if (vx > 5) vx = 5;
  	else if (vx < -5) vx = -5;
  	if (vy > 5) vy = 5;
  	else if (vy < -5) vy = -5;
  	this.vx = vx; this.vy = vy;

    this.x += this.vx;
    this.y += this.vy;

    if (this.goalk == 1) {
    	if (this.team == 0) {
		    if (this.x + this.diameter / 2 > 90) {
		      this.x = 90 - this.diameter / 2;
		    } else if (this.x - this.diameter / 2 < 0) {
		      this.x = this.diameter / 2;
		    }
		    if (this.y + this.diameter / 2 > height-100) {
		      this.y = height-100 - this.diameter / 2;
		    } else if (this.y - this.diameter / 2 < 100) {
		      this.y = 100 + this.diameter / 2;
		    }
		} else {
		    if (this.x + this.diameter / 2 > width) {
		      this.x = width - this.diameter / 2;
		    } else if (this.x - this.diameter / 2 < width-90) {
		      this.x = width-90 + this.diameter / 2;
		    }
		    if (this.y + this.diameter / 2 > height-100) {
		      this.y = height-100 - this.diameter / 2;
		    } else if (this.y - this.diameter / 2 < 100) {
		      this.y = 100 + this.diameter / 2;
		    }
		}
	} else {
		if (this.x + this.diameter / 2 > width) {
	      this.x = width - this.diameter / 2;
	    } else if (this.x - this.diameter / 2 < 0) {
	      this.x = this.diameter / 2;
	    }
	    if (this.y + this.diameter / 2 > height) {
	      this.y = height - this.diameter / 2;
	    } else if (this.y - this.diameter / 2 < 0) {
	      this.y = this.diameter / 2;
	    }
	}
  }

  display() {
  	noStroke();
  	this.team == 1 ? fill(255, 0, 0) : fill(0, 0, 255);
    circle(this.x, this.y, this.diameter);
  }
}

function drawStadium() {
	// Set background
	background(99, 201, 0);

	stroke(255);
	noFill();

	// Centre line
	line(maxX/2, 0, maxX/2, maxY);
	// Centre circle
	circle(maxX/2, maxY/2, 90);

	// Right goal outer line
	line(maxX, 100, maxX-90, 100);
	line(maxX, maxY-100, maxX-90, maxY-100);
	line(maxX-90, 100, maxX-90, maxY-100);
	// Right goal inner line
	line(maxX, 160, maxX-35, 160);
	line(maxX, maxY-160, maxX-35, maxY-160);
	line(maxX-35, 160, maxX-35, maxY-160);
	// Right goal arc
	arc(maxX-90, maxY/2, 75, 75, PI/2, 3*PI/2);

	// Left goal outer line
	line(0, 100, 90, 100);
	line(0, maxY-100, 90, maxY-100);
	line(90, 100, 90, maxY-100);
	// Left goal inner line
	line(0, 160, 35, 160);
	line(0, maxY-160, 35, maxY-160);
	line(35, 160, 35, maxY-160);
	// Left goal arc
	arc(90, maxY/2, 75, 75, 3*PI/2, PI/2);

	// Ground outline
	stroke(0);
	line(0, 0, maxX, 0);
	line(maxX, 0, maxX, maxY);
	line(maxX, maxY, 0, maxY);
	line(0, maxY, 0, 0);

	// Score
	textSize(48);
	noStroke();
	fill(0, 102, 153, 100);
	text(team1score.toString(), 5, height/2+15);
	text(team2score.toString(), width-30, height/2+15);
}