// *-------------- Matter Js Code ------------------------- //

const { Engine, World, Runner, Render, Bodies, Body, Events } = Matter;

const engine = Engine.create();
const { world } = engine;
// world.gravity.y = 0

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: 600,
    height: 600,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// *--------------------- Maze Class -------------------- //

class Maze {
  constructor(rows, columns, World, world) {
    this.rows = rows;
    (this.columns = columns), (this.mainWorld = World), (this.world = world);
    this.width = window.innerWidth;
    this.height = window.innerWidth;
    this.cellWidth = this.width / this.column;
    this.cellHeight = this.heigth / this.rows;
    this.boundaries = [
      // x , y, w, h, optionObject
      Bodies.rectangle(this.width / 2, 0, this.width, 7, { isStatic: true }),
      Bodies.rectangle(0, this.height / 2, 7, this.height, { isStatic: true }),
      Bodies.rectangle(this.width / 2, this.height, this.width, 7, {
        isStatic: true,
      }),
      Bodies.rectangle(this.width, this.height / 2, 7, this.height, {
        isStatic: true,
      }),
    ];

    this.mainWorld.add(this.world, this.boundaries);

    this.gridArr = Array(this.rows)
      .fill(null)
      .map(() => Array(this.columns).fill(false));

    this.verticalsArr = Array(this.rows)
      .fill(null)
      .map(() => Array(this.columns - 1).fill(false));

    this.horizontalsArr = Array(this.rows - 1)
      .fill(null)
      .map(() => Array(this.columns).fill(false));

    this.startRow = Math.floor(Math.random() * this.rows);
    this.startColumn = Math.floor(Math.random() * this.columns);

    // ? Dispalying Target or Goal
    this.target = Bodies.rectangle(
      this.width - this.cellWidth / 2,
      this.height - this.cellHeight / 2,
      this.cellWidth * 0.7,
      this.cellHeight * 0.7,
      {
        isStatic: true,
        label: "target",
        render: {
          fillStyle: "springgreen",
        },
      }
    );
    this.mainWorld.add(this.world, this.target);

    // ? Displaying character
    this.characterRadius = Math.min(this.cellWidth / 4, this.cellHeight / 4);
    this.character = Bodies.circle(
      this.cellWidth / 2,
      this.cellHeight / 2,
      this.characterRadius,
      {
        label: "character",
        render: {
          fillStyle: "blue",
        },
      }
    );

    this.mainWorld.add(this.world, character);

    // *------------ Keyboard Event Listener ------------- //
    document.addEventListener("keypress", (event) => {
      this.onKeyPress(event);
    });

    // *------------ Win Condition ------------- //
    Events.on(engine, "collisionStart", (event) => {
      this.winCondition(event);
    });
  }

  shuffleArr(arr) {
    let arrLength = arr.length;

    while (arrLength > 0) {
      let randomIdx = Math.floor(Math.random() * arrLength);
      arrLength--;

      let temp = arr[arrLength];
      arr[arrLength] = arr[randomIdx];
      arr[randomIdx] = temp;
    }

    return arr;
  }

  recursion(row, column) {
    // Mark this cell as visited
    this.gridArr[row][column] = true;

    //Collect All Posible Neighbours
    const neighbours = this.shuffleArr([
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
        nextRow >= this.rows ||
        nextColumn < 0 ||
        nextColumn >= this.columns
      ) {
        continue;
      }

      // if neighbour is visited go to next neighobour
      if (this.gridArr[nextRow][nextColumn]) {
        continue;
      }

      //Remove Walls from neighbours
      if (direction === "Left") {
        this.verticalsArr[row][column - 1] = true;
      } else if (direction === "Right") {
        this.verticalsArr[row][column] = true;
      } else if (direction === "Above") {
        this.horizontalsArr[row - 1][column] = true;
      } else if (direction === "Down") {
        this.horizontalsArr[row][column] = true;
      } else {
        throw Error("Something is Wrong");
      }

      this.recursion(nextRow, nextColumn);
    }
  }

  drawHorizontalWall() {
    this.horizontalsArr.forEach((row, rowIdx) => {
      row.forEach((open, columnIdx) => {
        if (open) {
          return;
        }

        const horizontalWalls = Bodies.rectangle(
          columnIdx * this.cellWidth + this.cellWidth / 2,
          rowIdx * this.cellHeight + this.cellHeight,
          this.cellWidth,
          5,
          {
            label: "wall",
            isStatic: true,
            render: {
              fillStyle: "sandybrown",
            },
          }
        );

        this.mainWorld.add(world, horizontalWalls);
      });
    });
  }

  drawVerticalWall() {
    this.verticalsArr.forEach((row, rowIdx) => {
      row.forEach((open, columnIdx) => {
        if (open) {
          return;
        }

        const verticalWalls = Bodies.rectangle(
          columnIdx * this.cellWidth + this.cellWidth,
          rowIdx * this.cellHeight + this.cellHeight / 2,
          5,
          this.cellHeight,
          {
            label: "wall",
            isStatic: true,
            render: {
              fillStyle: "sandybrown",
            },
          }
        );

        this.mainWorld.add(world, verticalWalls);
      });
    });
  }

  //*------------------------- Handling Keyboard Events ------------------------------------------------------ //

  onKeyPress(event) {
    const { x, y } = this.character.velocity;

    if (event.key === "ArrowUp") {
      Body.setVelocity(this.character, { x, y: y - 5 });
    } else if (event.key === "ArrowDown") {
      Body.setVelocity(this.character, { x, y: y + 5 });
    } else if (event.key === "ArrowRight") {
      Body.setVelocity(this.character, { x: x + 5, y });
    } else if (event.key === "ArrowLeft") {
      Body.setVelocity(this.character, { x: x - 5, y });
    }
  }

  winCondition(event) {
    let bodies = ["target", "character"];
    event.pairs.forEach((collision) => {
      if (
        bodies.includes(collision.bodyA.label) &&
        bodies.includes(collision.bodyB.label)
      ) {
        document.querySelector(".winner-overlay").classList.remove("hidden");
        this.world.gravity.y = 1;
        this.world.bodies.forEach((shape) => {
          if (shape.label === "wall") {
            Body.setStatic(shape, false);
          }
        });
      }
    });
  }
}

const maze = new Maze(10, 6, World, world);

maze.recursion();
maze.drawHorizontalWall();
maze.drawVerticalWall();
console.log(maze);
