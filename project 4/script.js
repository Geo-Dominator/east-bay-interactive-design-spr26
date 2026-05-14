function preload() {
  // Preload images for training animations
  pettingAnimation = loadImage("img/PettingAnimation.gif");
  feedingAnimation = loadImage("img/FeedingAnimation.gif");
  combingAnimation = loadImage("img/CombingAnimation.gif");
  sleepingAnimation = loadImage("img/SleepingAnimation.gif");
  idleAnimation = loadImage("img/IdleAnimation.gif");

  //preload images for racing segment
  BackgroundImg = loadImage("img/room.PNG")
  RaceImg = loadImage("img/racetrack.PNG")
  Dog1Img = loadImage("img/RunningPug.gif")
  Dog2Img = loadImage("img/RunningPom.gif")
  Dog3Img = loadImage("img/RunningAnimation.gif")
  Dog4Img = loadImage("img/RunningShiba.gif")
}

// DOG TRAINING SEGMENT

let dogTraining = true;

let pet = false;
let feed = false;
let bath = false;
let rest = false;

let petPoints = 1;
let feedPoints = 1;
let bathPoints = 1;
let restPoints = 1;

// DOG RACE SEGMENT
//friendship = random chance at x2 speed boost
//health = base speed
//dexterity = chance to prevent 1/2 speed penalty
//endurance = how long speed boost/penalty lasts

let dogRace = false;
let horseRace = false;

dog1Friendship = 5;
dog1Health = 3;
dog1Dexterity = 2;
dog1Endurance = 4;

dog2Friendship = 3;
dog2Health = 5;
dog2Dexterity = 6;
dog2Endurance = 4;

dog3Friendship = petPoints;
dog3Health = feedPoints;
dog3Dexterity = bathPoints;
dog3Endurance = restPoints;

dog4Friendship = 6;
dog4Health = 8;
dog4Dexterity = 7;
dog4Endurance = 9;

// DOG RACE VARIABLES
let raceStarted = false;
let raceCountdownFrames = 180; // 3 seconds at 60fps
let raceWinner = null;
let dog1Progress = 0;
let dog2Progress = 0;
let dog3Progress = 0;
let dog4Progress = 0;
let raceFinished = false;

// Track boost/penalty state for each dog
let dog1Boost = { active: false, duration: 0, multiplier: 1 };
let dog2Boost = { active: false, duration: 0, multiplier: 1 };
let dog3Boost = { active: false, duration: 0, multiplier: 1 };
let dog4Boost = { active: false, duration: 0, multiplier: 1 };

let dog1Penalty = { active: false, duration: 0 };
let dog2Penalty = { active: false, duration: 0 };
let dog3Penalty = { active: false, duration: 0 };
let dog4Penalty = { active: false, duration: 0 };

// Boost/penalty cooldown
let dog1BoostCooldown = 0;
let dog2BoostCooldown = 0;
let dog3BoostCooldown = 0;
let dog4BoostCooldown = 0;

let dog1PenaltyCooldown = 0;
let dog2PenaltyCooldown = 0;
let dog3PenaltyCooldown = 0;
let dog4PenaltyCooldown = 0;

function initDogRace() {
  raceStarted = false;
  raceCountdownFrames = 180;
  raceWinner = null;
  dog1Progress = 0;
  dog2Progress = 0;
  dog3Progress = 0;
  dog4Progress = 0;
  raceFinished = false;

  dog1Boost = { active: false, duration: 0, multiplier: 1 };
  dog2Boost = { active: false, duration: 0, multiplier: 1 };
  dog3Boost = { active: false, duration: 0, multiplier: 1 };
  dog4Boost = { active: false, duration: 0, multiplier: 1 };

  dog1Penalty = { active: false, duration: 0 };
  dog2Penalty = { active: false, duration: 0 };
  dog3Penalty = { active: false, duration: 0 };
  dog4Penalty = { active: false, duration: 0 };

  dog1BoostCooldown = 0;
  dog2BoostCooldown = 0;
  dog3BoostCooldown = 0;
  dog4BoostCooldown = 0;

  dog1PenaltyCooldown = 0;
  dog2PenaltyCooldown = 0;
  dog3PenaltyCooldown = 0;
  dog4PenaltyCooldown = 0;
}

function updateDogSpeed(
  dogNum,
  dogHealth,
  dogFriendship,
  dogDexterity,
  dogEndurance,
  boostState,
  penaltyState,
  boostCooldown,
  penaltyCooldown,
) {
  let baseSpeed = 0.15 + dogHealth * 0.1;
  let currentSpeed = baseSpeed;

  // Apply boost if active
  if (boostState.active) {
    currentSpeed *= boostState.multiplier;
    boostState.duration--;
    if (boostState.duration <= 0) {
      boostState.active = false;
      boostState.multiplier = 1;
    }
  }

  // Apply penalty if active
  if (penaltyState.active) {
    currentSpeed *= 0.5;
    penaltyState.duration--;
    if (penaltyState.duration <= 0) {
      penaltyState.active = false;
    }
  }

  // Random boost chance based on friendship (every frame, 1 in (30 - friendship))
  if (!boostState.active && boostCooldown <= 0) {
    let boostChance = 1 / (30 - dogFriendship);
    if (random(1) < boostChance) {
      boostState.active = true;
      boostState.multiplier = 2;
      boostState.duration = 60 + dogEndurance * 8; // longer boost with high endurance
      boostCooldown = 120; // cooldown before next boost can occur
    }
  }
  if (boostCooldown > 0) boostCooldown--;

  // Random penalty chance based on dexterity (every frame, 1 in (40 - dexterity*2))
  if (!penaltyState.active && penaltyCooldown <= 0) {
    let penaltyChance = 1 / (40 - dogDexterity * 2);
    if (random(1) < penaltyChance) {
      penaltyState.active = true;
      penaltyState.duration = 45 - dogEndurance * 4; // shorter penalty with high endurance
      penaltyCooldown = 100;
    }
  }
  if (penaltyCooldown > 0) penaltyCooldown--;

  return { speed: currentSpeed, boostCooldown, penaltyCooldown };
}

//toggle game modes with spacebar

function keyPressed() {
  if (key === " " && dogTraining == true) {
    dogTraining = false;
    dogRace = true;
    initDogRace();
  } else if (key === " " && dogRace == true) {
    dogRace = false;
    dogTraining = true;
  }
}

// how many frames the current action has been held
let holdFrames = 0;

function setup() {
  createCanvas(500, 500);
  textSize(16);
}

function draw() {
  image(BackgroundImg,0,0,500,500);

  if (dogTraining) {
    image(BackgroundImg,0,0,500,500);
    // determine which action is active based on arrow keys
    pet = keyIsDown(UP_ARROW);
    feed = keyIsDown(DOWN_ARROW);
    bath = keyIsDown(RIGHT_ARROW);
    rest = keyIsDown(LEFT_ARROW);

    // if any action is active, increment hold counter; otherwise reset
    if (pet || feed || bath || rest) {
      holdFrames += 2;
    } else {
      holdFrames = Math.max(holdFrames - 1, 0);
    }
    console.log(`Hold frames: ${holdFrames}`);

    // every 360 frames (~3 seconds at 60fps) while held, add a point to the active action
    if (holdFrames > 0 && holdFrames >= 360) {
      if (pet) {
        petPoints++;
        holdFrames = 0;
      }
      if (feed) {
        feedPoints++;
        holdFrames = 0;
      }
      if (bath) {
        bathPoints++;
        holdFrames = 0;
      }
      if (rest) {
        restPoints++;
        holdFrames = 0;
      }
    }

    // draw the colored square depending on active state
    if (pet) {
      image(pettingAnimation, 150, 150, 200, 200);
    } else if (feed) {
      image(feedingAnimation, 150, 150, 200, 200);
    } else if (bath) {
      image(combingAnimation, 150, 150, 200, 200);
    } else if (rest) {
      image(sleepingAnimation, 150, 150, 200, 200);
    } else {
      image(idleAnimation, 150, 150, 200, 200);
    }
    // Progress bar
    const barX = 150;
    const barY = 150 + 200 + 10;
    const barW = 200;
    const barH = 16;

    const progress = constrain(holdFrames / 360, 0, 1);

    stroke(200);
    noFill();
    rect(barX, barY, barW, barH);

    noStroke();
    fill(50, 150, 250);
    rect(barX, barY, barW * progress, barH);

    fill(255);
    textAlign(CENTER, CENTER);
    text(`${Math.round(progress * 100)}%`, barX + barW / 2, barY + barH / 2);
    textAlign(LEFT, BASELINE);

    // UI: show points
    fill(0);
    text(`Pet: ${petPoints}`, 10, 20);
    text(`Feed: ${feedPoints}`, 10, 40);
    text(`Bath: ${bathPoints}`, 100, 20);
    text(`Rest: ${restPoints}`, 100, 40);

  } else if (dogRace) {
    image(RaceImg,0,0,500,500)
    // Update dog3's stats from training points
    dog3Friendship = petPoints;
    dog3Health = feedPoints;
    dog3Dexterity = bathPoints;
    dog3Endurance = restPoints;

    // Handle countdown
    if (!raceStarted) {
      raceCountdownFrames--;
      if (raceCountdownFrames <= 0) {
        raceStarted = true;
      }

      // Draw countdown
      fill(0);
      textSize(48);
      textAlign(CENTER, CENTER);
      let countdownNum = ceil(raceCountdownFrames / 60);
      if (countdownNum > 0) {
        text(countdownNum, width / 2, height / 2);
      } else {
        text("GO!", width / 2, height / 2);
      }
      textSize(16);
      textAlign(LEFT, BASELINE);
      return;
    }

    // Race is running
    if (!raceFinished) {
      // Update speeds and progress for each dog
      let result1 = updateDogSpeed(
        1,
        dog1Health,
        dog1Friendship,
        dog1Dexterity,
        dog1Endurance,
        dog1Boost,
        dog1Penalty,
        dog1BoostCooldown,
        dog1PenaltyCooldown,
      );
      dog1BoostCooldown = result1.boostCooldown;
      dog1PenaltyCooldown = result1.penaltyCooldown;
      dog1Progress += result1.speed;

      let result2 = updateDogSpeed(
        2,
        dog2Health,
        dog2Friendship,
        dog2Dexterity,
        dog2Endurance,
        dog2Boost,
        dog2Penalty,
        dog2BoostCooldown,
        dog2PenaltyCooldown,
      );
      dog2BoostCooldown = result2.boostCooldown;
      dog2PenaltyCooldown = result2.penaltyCooldown;
      dog2Progress += result2.speed;

      let result3 = updateDogSpeed(
        3,
        dog3Health,
        dog3Friendship,
        dog3Dexterity,
        dog3Endurance,
        dog3Boost,
        dog3Penalty,
        dog3BoostCooldown,
        dog3PenaltyCooldown,
      );
      dog3BoostCooldown = result3.boostCooldown;
      dog3PenaltyCooldown = result3.penaltyCooldown;
      dog3Progress += result3.speed;

      let result4 = updateDogSpeed(
        4,
        dog4Health,
        dog4Friendship,
        dog4Dexterity,
        dog4Endurance,
        dog4Boost,
        dog4Penalty,
        dog4BoostCooldown,
        dog4PenaltyCooldown,
      );
      dog4BoostCooldown = result4.boostCooldown;
      dog4PenaltyCooldown = result4.penaltyCooldown;
      dog4Progress += result4.speed;

      // Check for winner (first to reach 400)
      const finishLine = 400;
      if (dog1Progress >= finishLine) {
        raceWinner = 1;
        raceFinished = true;
      } else if (dog2Progress >= finishLine) {
        raceWinner = 2;
        raceFinished = true;
      } else if (dog3Progress >= finishLine) {
        raceWinner = 3;
        raceFinished = true;
      } else if (dog4Progress >= finishLine) {
        raceWinner = 4;
        raceFinished = true;
      }
    }

    // Draw race
    const trackY = [110, 180, 250, 320];
    const trackHeight = 40;
    const finishLine = 400;

    const dogNames = ["Dog 1", "Dog 2", "You", "Dog 4"];
    const dogColors = [
      [255, 100, 100],
      [100, 255, 100],
      [255, 200, 100],
      [150, 100, 255],
    ];

    // Draw tracks and dogs
    for (let i = 0; i < 4; i++) {
      let progress = [dog1Progress, dog2Progress, dog3Progress, dog4Progress][
        i
      ];

      // Track background
      fill(240, 0);
      stroke(100, 0);
      rect(50, trackY[i], finishLine, trackHeight);

      // Finish line
      stroke(0, 0);
      strokeWeight(3);
      line(
        50 + finishLine,
        trackY[i],
        50 + finishLine,
        trackY[i] + trackHeight,
      );
      strokeWeight(1);

      // Dog position (as image)
      const dogImages = [Dog1Img, Dog2Img, Dog3Img, Dog4Img];
      image(
        dogImages[i],
        50 + constrain(progress, 0, finishLine) - 15,
        trackY[i] + trackHeight / 2 - 15,
        30,
        30,
      );

      // Dog name and stats
      fill(0);
      text(dogNames[i], 5, trackY[i] + 15);

      // Boost/penalty indicator
      let boostObj = [dog1Boost, dog2Boost, dog3Boost, dog4Boost][i];
      let penaltyObj = [dog1Penalty, dog2Penalty, dog3Penalty, dog4Penalty][i];

      if (boostObj.active) {
        fill(255, 200, 0);
        text(
          "BOOST",
          50 + constrain(progress, 0, finishLine) - 20,
          trackY[i] - 5,
        );
      }
      if (penaltyObj.active) {
        fill(255, 0, 0);
        text(
          "SLOW",
          50 + constrain(progress, 0, finishLine) - 15,
          trackY[i] - 5,
        );
      }
    }

    // Draw result
    if (raceFinished) {
      fill(0, 0, 0, 150);
      rect(0, 0, width, height);

      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);

      if (raceWinner === 3) {
        text("YOU WIN! Your dog is a champion!", width / 2, height / 2 - 30);
        fill(255, 200, 0);
        textSize(24);
        text("Press GO to return to training", width / 2, height / 2 + 30);
      } else {
        text("YOU LOST!", width / 2, height / 2 - 30);
        fill(200);
        textSize(16);
        text(`Dog ${raceWinner} won the race`, width / 2, height / 2);
        fill(255, 200, 0);
        textSize(24);
        text("Press GO to return to training", width / 2, height / 2 + 60);
      }

      textSize(16);
      textAlign(LEFT, BASELINE);
    }
  }
}
