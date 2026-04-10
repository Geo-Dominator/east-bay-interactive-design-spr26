let bubbles = [];
var health = 50;
var maxHealth = 500;

function setup() {
  createCanvas(600, 600);

  for (let i = 0; i < 1; i++) {
    let b = new Bubble(300, 300, 150);
    bubbles.push(b);
  }
}

function mousePressed() {
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].click(mouseX, mouseY);
  }
}

function draw() {
  background(0);
  console.log(health);
  if (health == maxHealth) {
    background("lime");
    fill("lime");
  } else if (health == 0) {
  } else {
    //health++;
  }

  stroke(0);
  strokeWeight(4);
  noFill();
  rect(10, 10, 200, 20);

  noStroke();
  rect(10, 10, map(health, 0, maxHealth, 0, 200), 20);

  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].show();
    bubbles[i].move();
  }
}

class Bubble {
  constructor(tempX, tempY, tempR, tempRed, tempBlue, tempGreen) {
    this.x = tempX;
    this.y = tempY;
    this.r = tempR;
  }

  click(pX, pY) {
    let d = dist(pX, pY, this.x, this.y);

    if (d < this.r) {
      print("Clicked on Bubble");
      health = health + 10;
    }
  }

  move() {
    this.x = this.x + random(-5, 5);
    this.y = this.y + random(-5, 5);

    if (this.x > width - this.r) {
      this.x = width - this.r;
    } else if (this.x < this.r) {
      this.x = this.r;
    }

    if (this.y > height - this.r) {
      this.y = height - this.r;
    } else if (this.y < this.r) {
      this.y = this.r;
    }
  }

  show() {
    stroke("royalblue");
    strokeWeight(30);
    if (health == maxHealth) {
      fill(255, 0, 0);
    } else {
      fill(0);
    }
    ellipse(this.x, this.y, this.r * 2);
  }
}
