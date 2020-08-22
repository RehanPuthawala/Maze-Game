const { Engine, World, Runner, Render, Bodies, Body, Events } = Matter;

const engine = Engine.create();
const { world } = engine;
// world.gravity.y = 0;

const width = window.innerWidth;
const height = window.innerHeight;
const rows = 20;
const columns = 35;
const cellWidth = width / columns;
const cellHeight = height / rows;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// ?Boundaries

const Boundaries = [
  // x , y, w, h, optionObject
  Bodies.rectangle(width / 2, 0, width, 7, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 7, height, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 7, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 7, height, { isStatic: true }),
];

World.add(world, Boundaries);

//*------------------------- Maze Generation ------------------------------------------------------ //

// ? Shuffle Function

const shuffle = (arr) => {
  let arrLength = arr.length;

  while (arrLength > 0) {
    let randomIdx = Math.floor(Math.random() * arrLength);
    arrLength--;

    let temp = arr[arrLength];
    arr[arrLength] = arr[randomIdx];
    arr[randomIdx] = temp;
  }

  return arr;
};

//? Grid Array

const grid = Array(rows)
  .fill(null)
  .map(() => Array(columns).fill(false));

//? Verticle Array

const verticals = Array(rows)
  .fill(null)
  .map(() => Array(columns - 1).fill(false));

//? Horizontals Array

const horizontals = Array(rows - 1)
  .fill(null)
  .map(() => Array(columns).fill(false));

//? Recursion Function

const startRow = Math.floor(Math.random() * rows);
const startColumn = Math.floor(Math.random() * columns);

const recursion = (row, column) => {
  // Mark this cell as visited
  grid[row][column] = true;

  //Collect All Posible Neighbours
  const neighbours = shuffle([
    [row - 1, column, "Above"],
    [row, column + 1, "Right"],
    [row + 1, column, "Down"],
    [row, column - 1, "Left"],
  ]);

  // for Each Neighbours...
  for (let neighbour of neighbours) {
    const [nextRow, nextColumn, direction] = neighbour;

    // IF neighbour is on boundary go to next neighbour
    if (
      nextRow < 0 ||
      nextRow >= rows ||
      nextColumn < 0 ||
      nextColumn >= columns
    ) {
      continue;
    }

    // if neighbour is visited go to next neighobour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //Remove Walls from neighbours
    if (direction === "Left") {
      verticals[row][column - 1] = true;
    } else if (direction === "Right") {
      verticals[row][column] = true;
    } else if (direction === "Above") {
      horizontals[row - 1][column] = true;
    } else if (direction === "Down") {
      horizontals[row][column] = true;
    } else {
      throw Error("Something is Wrong");
    }

    recursion(nextRow, nextColumn);
  }
};

recursion(startRow, startColumn);

//? Drawing Horizontals Walls on Canvas
horizontals.forEach((row, rowIdx) => {
  row.forEach((open, columnIdx) => {
    if (open) {
      return;
    }

    const horizontalWalls = Bodies.rectangle(
      columnIdx * cellWidth + cellWidth / 2,
      rowIdx * cellHeight + cellHeight,
      cellWidth,
      5,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "sandybrown",
        },
      }
    );

    World.add(world, horizontalWalls);
  });
});

//? Drawing Verticals walls on Canvas
verticals.forEach((row, rowIdx) => {
  row.forEach((open, columnIdx) => {
    if (open) {
      return;
    }

    const verticalWalls = Bodies.rectangle(
      columnIdx * cellWidth + cellWidth,
      rowIdx * cellHeight + cellHeight / 2,
      5,
      cellHeight,
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "sandybrown",
        },
      }
    );

    World.add(world, verticalWalls);
  });
});

//? Displaying Target or Goal

const target = Bodies.rectangle(
  width - cellWidth / 2,
  height - cellHeight / 2,
  cellWidth * 0.7,
  cellHeight * 0.7,
  {
    isStatic: true,
    label: "target",
    render: {
      fillStyle: "springgreen",
    },
  }
);
World.add(world, target);

//? Displaying Character

const characterRadius = Math.min(cellWidth / 4, cellHeight / 4);
const character = Bodies.circle(
  cellWidth / 2,
  cellHeight / 2,
  characterRadius,
  {
    label: "character",
    render: {
      fillStyle: "tomato",
    },
  }
);

World.add(world, character);

//*------------------------- Handling Keyboard Events ------------------------------------------------------ //

document.addEventListener("keydown", (event) => {
  const { x, y } = character.velocity;

  if (event.key === "ArrowUp") {
    Body.setVelocity(character, { x, y: y - 5 });
  } else if (event.key === "ArrowDown") {
    Body.setVelocity(character, { x, y: y + 5 });
  } else if (event.key === "ArrowRight") {
    Body.setVelocity(character, { x: x + 5, y });
  } else if (event.key === "ArrowLeft") {
    Body.setVelocity(character, { x: x - 5, y });
  }
});

//? Wun condition

Events.on(engine, "collisionStart", (event) => {
  let bodies = ["target", "character"];
  event.pairs.forEach((collision) => {
    if (
      bodies.includes(collision.bodyA.label) &&
      bodies.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      document.querySelector(".winner-overlay").classList.remove("hidden");
      world.bodies.forEach((shape) => {
        if (shape.label === "wall") {
          Body.setStatic(shape, false);
        }
      });
    }
  });
});
