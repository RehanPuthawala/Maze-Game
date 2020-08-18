const {
  Engine,
  World,
  Runner,
  Render,
  Bodies,
  MouseConstraint,
  Mouse,
} = Matter;

const engine = Engine.create();
const { world } = engine;

const width = 800;
const height = 600;

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

World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

// ?Boundaries

const Boundaries = [
  // x , y, w, h, optionObject
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  Bodies.rectangle(800, 300, 40, 600, { isStatic: true }),
];

World.add(world, Boundaries);

//? Rectangle Shape

for (let i = 0; i < 20; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 100 + 20,
        Math.random() * 100,
        {
          render: {
            lineWidth: 3,
          },
        }
      )
    );
  } else {
    World.add(
      world,
      Bodies.circle(
        Math.random() * width - 100,
        Math.random() * height - 100,
        70,
        {
          render: {
            lineWidth: 3,
          },
        }
      )
    );
  }
}
