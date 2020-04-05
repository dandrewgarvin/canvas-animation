// because this is such a verbose way of importing images, it is not ideal.
// this method required importing every single image individually, and so adding new characters is a massive problem.
// the ideal solution would be to import a single spritesheet and run calculations based on that to show only the relevant sprite in each animation frame.
const animations = {
  idle: [
    "./images/character/idle/idle_01.png",
    "./images/character/idle/idle_02.png",
    "./images/character/idle/idle_03.png",
    "./images/character/idle/idle_04.png",
  ],
  run_right: [
    "./images/character/run-right/run-right_0.png",
    "./images/character/run-right/run-right_1.png",
    "./images/character/run-right/run-right_2.png",
    "./images/character/run-right/run-right_3.png",
    "./images/character/run-right/run-right_4.png",
    "./images/character/run-right/run-right_5.png",
  ],
  run_left: [
    "./images/character/run-left/run-left_0.png",
    "./images/character/run-left/run-left_1.png",
    "./images/character/run-left/run-left_2.png",
    "./images/character/run-left/run-left_3.png",
    "./images/character/run-left/run-left_4.png",
    "./images/character/run-left/run-left_5.png",
  ],
  jump: [],
  falling: [
    "./images/character/falling/falling_1.png",
    "./images/character/falling/falling_2.png",
    "./images/character/falling/falling_3.png",
  ],
};

let activeUserAnimation = "idle"; // which animation track is running
let currentAnimationStep = undefined; // which step of the animation track is current painted

function init() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  // switch between animation tracks based on user input
  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowRight": {
        if (activeUserAnimation !== "run_right") {
          activeUserAnimation = "run_right";
        }
        break;
      }
      case "ArrowLeft": {
        if (activeUserAnimation !== "run_left") {
          activeUserAnimation = "run_left";
        }
        break;
      }
      case "ArrowUp": {
        // not current set up. no images for this.
        if (activeUserAnimation !== "jump") {
          activeUserAnimation = "jump";
        }
        break;
      }
      case "ArrowDown": {
        if (activeUserAnimation !== "falling") {
          activeUserAnimation = "falling";
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
    if (["ArrowUp"].includes(event.key)) {
      return null;
    }

    if (activeUserAnimation !== "idle") {
      activeUserAnimation = "idle";
    }
  });

  // re-paints the canvas every x miliseconds
  window.setInterval(() => {
    draw(canvas, context, getNextFrame(animations[activeUserAnimation]));
  }, 150);
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
  } else {
    // animation has reached end of loop. check to see if the animation that was running should switch back to idle
    // (this only runs on animations that don't require constant user input)
    if (["jump"].includes(activeUserAnimation)) {
      activeUserAnimation = "idle";
    }

    currentAnimationStep = 0;
  }

  return animation[currentAnimationStep];
}

// clear then paint the user into the canvas
function draw(canvas, context, frame) {
  // create user image
  const user = new Image();
  user.src = frame;

  // paint user to canvas
  user.onload = () => {
    context.clearRect(0, 0, canvas.height, canvas.width);
    context.drawImage(user, 218, 218, 64, 64);
  };
}

// kick everything off
init();
