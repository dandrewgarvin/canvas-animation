// because this is such a verbose way of importing images, it is not ideal.
// this method required importing every single image individually, and so adding new characters is a massive problem.
// the ideal solution would be to import a single spritesheet and run calculations based on that to show only the relevant sprite in each animation frame.
const animations = {
  character: "./images/character/sheets/zeus.png",
  idle: [
    [0, 0, 47, 47],
    [48, 0, 47, 47],
    [96, 0, 47, 47],
    [144, 0, 47, 47],
  ],
  run_right: [
    [0, 47, 47, 47],
    [48, 47, 47, 47],
    [96, 47, 47, 47],
    [144, 47, 47, 47],
    [0, 95, 47, 47],
    [48, 95, 47, 47],
  ],
  run_left: [
    [96, 95, 47, 47],
    [144, 95, 47, 47],
    [0, 143, 47, 47],
    [48, 143, 47, 47],
    [96, 143, 47, 47],
    [144, 143, 47, 47],
  ],
  falling: [
    [48, 527, 47, 47],
    [96, 527, 47, 47],
    [144, 527, 47, 47],
  ],
  taunt: [
    [0, 191, 47, 47],
    [48, 191, 47, 47],
    [96, 191, 47, 47],
  ],
  death: [
    [0, 479, 47, 47],
    [48, 479, 47, 47],
    [96, 479, 47, 47],
    [144, 479, 47, 47],
    [0, 527, 47, 47],
  ],
};

const animationRate = 150;
let activeUserAnimation = "idle"; // which animation track is running
let currentAnimationStep = undefined; // which step of the animation track is current painted
const screen = {
  height: 500,
  width: 500,
};

const background = {
  x: 0,
  y: 0,
  height: 350,
  width: 1080,
};

const character = {
  x: 0,
  y: 335,
  height: 96,
  width: 96,
  movementSpeed: 24,
};

function init() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  // switch between animation tracks based on user input
  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowRight": {
        if (activeUserAnimation !== "run_right") {
          activeUserAnimation = "run_right";
          currentAnimationStep = undefined;
        }
        break;
      }
      case "ArrowLeft": {
        if (activeUserAnimation !== "run_left") {
          activeUserAnimation = "run_left";
          currentAnimationStep = undefined;
        }
        break;
      }
      case "ArrowDown": {
        if (activeUserAnimation !== "falling") {
          activeUserAnimation = "falling";
          currentAnimationStep = undefined;
        }
        break;
      }
      case "t": {
        if (activeUserAnimation !== "taunt") {
          activeUserAnimation = "taunt";
          currentAnimationStep = undefined;
        }
        break;
      }
      case " ": {
        if (activeUserAnimation !== "death") {
          activeUserAnimation = "death";
          currentAnimationStep = undefined;
        }
        break;
      }
      default:
        return null;
    }
  });

  // when the user lets go of a key, generally we want to switch back to the idle animation
  window.addEventListener("keyup", (event) => {
    // these keys will have animations that auto-end, and don't require the user to hold down their key
    if (["ArrowUp", "t", " "].includes(event.key)) {
      return null;
    }

    if (activeUserAnimation !== "idle") {
      activeUserAnimation = "idle";
    }
  });

  // re-paints the canvas every x miliseconds
  window.setInterval(() => {
    draw(
      canvas,
      context,
      getNextFrame(animations[activeUserAnimation]),
      moveCharacter()
    );
  }, animationRate);
}

// find out which frame needs to run next based on which animation is current running
function getNextFrame(animation) {
  // this is the first frame after a page load
  if (currentAnimationStep === undefined) {
    currentAnimationStep = 0;
    return animation[currentAnimationStep];
  }

  // iterate through all possible animation frames, starting back at the beginning when we reach the end
  if (currentAnimationStep + 1 < animation.length) {
    currentAnimationStep += 1;
    return animation[currentAnimationStep];
  } else {
    // animation has reached end of loop. check to see if the animation that was running should switch back to idle
    // (this only runs on animations that don't require constant user input)
    if (["jump", "taunt", "death"].includes(activeUserAnimation)) {
      activeUserAnimation = "idle";
    }

    currentAnimationStep = 0;
    return animations[activeUserAnimation][currentAnimationStep];
  }
}

// move the character along the X axis
function moveCharacter() {
  switch (activeUserAnimation) {
    case "run_right":
      if (character.x + character.movementSpeed >= screen.width / 2) {
        character.x = screen.width / 2;

        if (
          background.width - background.x >=
          screen.width + character.movementSpeed
        ) {
          background.x += character.movementSpeed;
        }
      } else {
        character.x += character.movementSpeed;
      }
      break;
    case "run_left":
      if (character.x - character.movementSpeed <= 0) {
        character.x = 0;
      } else {
        character.x -= character.movementSpeed;
      }
      break;
    default:
      return null;
  }
}

// clear then paint the user into the canvas
function draw(canvas, context, frame) {
  const bg = new Image();
  bg.src = "./images/landscape/snow-mountains-long.png";

  bg.onload = () => {
    context.clearRect(0, 0, canvas.height, canvas.width);
    context.drawImage(
      bg,
      background.x,
      background.y,
      background.width,
      background.height,
      0,
      0,
      screen.width * 5,
      screen.height * 2
    );
  };

  // create user image
  const user = new Image();
  user.src = animations.character;

  // paint user to canvas
  user.onload = () => {
    context.drawImage(
      user,
      ...frame,
      character.x,
      character.y,
      character.width,
      character.height
    );
  };
}

// kick everything off
init();
