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

// const animationRate = 150;
let activeUserAnimation = "idle"; // which animation track is running
let currentAnimationStep = undefined; // which step of the animation track is current painted

const screen = {
  height: 512,
  width: 512,
};

const background = {
  x: 0,
  y: 0,
  height: 256,
  width: 512,
  grid: [
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        src: "./images/landscape/Tileset.png",
        height: 32,
        width: 32,
        x: 32,
        y: 0,
      },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        src: "./images/landscape/Tileset.png",
        height: 32,
        width: 32,
        x: 32,
        y: 0,
      },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        src: "./images/landscape/Tileset.png",
        height: 32,
        width: 32,
        x: 32,
        y: 0,
      },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        src: "./images/landscape/Tileset.png",
        height: 32,
        width: 32,
        x: 32,
        y: 0,
      },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
  ],
};

const world = {
  characterPosition: 256,
  columns: background.grid.length,
};

const character = {
  x: 0,
  y: 202,
  height: 64,
  width: 64,
  movementSpeed: 24,
  previousX: 0,
  previousY: 0,
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
  handleDraw(canvas, context);
}

const framerate = 8;
let currentFrame = 0;

function handleDraw(canvas, context) {
  window.requestAnimationFrame(async () => {
    if (currentFrame >= framerate) {
      currentFrame = 0;
      await draw(
        canvas,
        context,
        getNextFrame(animations[activeUserAnimation]),
        moveCharacter()
      );

      handleDraw(canvas, context);
    } else {
      currentFrame += 1;
      handleDraw(canvas, context);
    }
  });
  // }, animationRate);
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

function generateColumn() {
  const tiles = [
    {
      src: "./images/landscape/Tileset.png",
      height: 32,
      width: 32,
      x: 32,
      y: 0,
    },
    {
      src: "./images/landscape/Tileset.png",
      height: 32,
      width: 32,
      x: 288,
      y: 32,
    },
    {
      src: "./images/landscape/Tileset.png",
      height: 32,
      width: 32,
      x: 224,
      y: 32,
    },
    {
      src: "./images/landscape/Tileset.png",
      height: 32,
      width: 32,
      x: 0,
      y: 0,
    },
    {
      src: "./images/landscape/Tileset.png",
      height: 32,
      width: 32,
      x: 0,
      y: 96,
    },
  ];

  const tile = Math.floor(Math.random() * tiles.length);

  const column = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    tiles[tile],
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  background.grid.push(column);
  world.columns += 1;
}

// move the character along the X axis
function moveCharacter() {
  switch (activeUserAnimation) {
    case "run_right":
      world.characterPosition += character.movementSpeed;
      if (character.x + character.movementSpeed >= screen.width / 2) {
        character.previousX = character.x;
        character.x = screen.width / 2;

        if (world.columns * 32 <= world.characterPosition) {
          generateColumn();
        }

        console.log("background", background);
        console.log("screen", screen);
        console.log("world", world);

        if (
          background.width - background.x >=
          screen.width + character.movementSpeed
        ) {
          background.x += character.movementSpeed;
        }
      } else {
        character.previousX = character.x;
        character.x += character.movementSpeed;
      }
      break;
    case "run_left":
      world.characterPosition -= character.movementSpeed;
      if (character.x - character.movementSpeed <= 0) {
        character.previousX = character.x;
        character.x = 0;
      } else {
        character.previousX = character.x;
        character.x -= character.movementSpeed;
      }
      break;
    case "idle":
      character.previousX = character.x;
    default:
      return null;
  }
}

// clear then paint the user into the canvas
async function draw(canvas, context, frame) {
  // create user image
  const user = new Image();
  user.src = animations.character;

  // paint user to canvas
  user.onload = () => {
    context.clearRect(
      character.previousX,
      character.y,
      character.width,
      character.height
    );

    context.drawImage(
      user,
      ...frame,
      character.x,
      character.y,
      character.width,
      character.height
    );
  };

  background.grid
    .slice(
      world.characterPosition / 32 / 2,
      world.characterPosition / 32 / 2 + 12
    )
    .forEach((bg, column) => {
      bg.forEach((item, index) => {
        if (item) {
          context.clearRect(item.x, item.y, item.width, item.height);

          const tile = new Image();
          tile.src = item.src;

          tile.onload = () => {
            context.drawImage(
              tile,
              item.x,
              item.y,
              item.width,
              item.height,
              item.width * column,
              item.height * index,
              item.width,
              item.height
            );
          };
        }
      });
    });
}

// kick everything off
init();
