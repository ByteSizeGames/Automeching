const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// disable aliasing for pixel art
ctx.imageSmoothingEnabled = false;
const moneyLabel = document.getElementById("money");
const moneyPerMinuteLabel = document.getElementById("moneyPerMinute");
const begForMoneyButton = document.getElementById("begForMoney");
begForMoneyButton.addEventListener("click", function () {
  money += 1;
  collectedMoney += 1;
  updateUI();
});
const labelMiner = document.getElementById("labelMiner");
const buyMinerButton = document.getElementById("buyMiner");
buyMinerButton.addEventListener("click", function () {
  const cost = Math.round(
    BUY_MINER_BASE_COST * BUY_MINER_FACTOR ** miners.length
  );
  if (money >= cost) {
    money -= cost;
    miners.push(new Miner(worldWidth / 2, 19));
    updateUI();
  }
});
const travelSpeedLabel = document.getElementById("labelTravelSpeed");
const buyTravelSpeedButton = document.getElementById("buyTravelSpeed");
buyTravelSpeedButton.addEventListener("click", function () {
  const cost = Math.round(
    BUY_TRAVEL_SPEED_BASE_COST * BUY_TRAVEL_SPEED_FACTOR ** travelSpeedStep
  );
  if (money >= cost) {
    money -= cost;
    travelSpeedStep += 1;
    updateUI();
  }
});
const miningSpeedLabel = document.getElementById("labelMiningSpeed");
const buyMiningSpeedButton = document.getElementById("buyMiningSpeed");
buyMiningSpeedButton.addEventListener("click", function () {
  const cost = Math.round(
    BUY_MINING_SPEED_BASE_COST * BUY_MINING_SPEED_FACTOR ** miningSpeedStep
  );
  if (money >= cost) {
    money -= cost;
    miningSpeedStep += 1;
    updateUI();
  }
});
const inventorySpaceLabel = document.getElementById("labelInventorySpace");
const buyInventorySpaceButton = document.getElementById("buyInventorySpace");
buyInventorySpaceButton.addEventListener("click", function () {
  const cost = Math.round(
    BUY_INVENTORY_SPACE_BASE_COST *
      BUY_INVENTORY_SPACE_FACTOR ** inventorySpaceStep
  );
  if (money >= cost) {
    money -= cost;
    inventorySpaceStep += 1;
    updateUI();
  }
});

const BUY_MINER_BASE_COST = 100;
const BUY_MINER_FACTOR = 1.8;
const BUY_TRAVEL_SPEED_BASE_COST = 25;
const BUY_TRAVEL_SPEED_FACTOR = 1.8;
const BUY_MINING_SPEED_BASE_COST = 40;
const BUY_MINING_SPEED_FACTOR = 2;
const BUY_INVENTORY_SPACE_BASE_COST = 60;
const BUY_INVENTORY_SPACE_FACTOR = 2.5;

let maxDepthSeen = 0;
let money = 0;
let collectedMoney = money;
let lastCollectedMoney = collectedMoney;
let travelSpeedStep = 0;
let miningSpeedStep = 0;
let inventorySpaceStep = 0;
const spriteSize = 16;
const atlasSize = 256;
const worldWidth = 320;
const worldHeight = 10000;
const fps = 60;
const frameDuration = 1 / fps;

const terrainImage = new Image();
terrainImage.src = "terrain.png";
terrainImage.style.imageRendering = "pixelated";
let terrainLoaded = false;
terrainImage.onload = () => {
  terrainLoaded = true;
};

const terrainImageMini = new Image();
terrainImageMini.src = "terrain_mini.png";
terrainImageMini.style.imageRendering = "pixelated";
let terrainMiniLoaded = false;
terrainImageMini.onload = () => {
  terrainMiniLoaded = true;
};

const unitImage = new Image();
unitImage.src = "items.png";
unitImage.style.imageRendering = "pixelated";
let unitLoaded = false;
unitImage.onload = () => {
  unitLoaded = true;
};

const seed = 0; // Math.random();
noise.seed(seed);

const SPEED = 1;
const WALKING_SPEED_PER_SEC = 3;
const WALKING_SPEED_FACTOR = 1.5;
const MINING_SPEED_PER_SEC = 1;
const MINING_SPEED_FACTOR = 1.8;
const INVENTORY_SPACE = 5;
const INVENTORY_SPACE_FACTOR = 1.6;
const HARDNESS_FACTOR = 10;
const VALUE_FACTOR = 15;
const LEVEL_CHANGES = [
  { depth: 19, tile: 14, border: 0, hardness: 0 }, // Air
  { depth: 20, tile: 3, border: 0, hardness: 1 }, // Top floor
  { depth: 1000, tile: 2, border: 1200, hardness: HARDNESS_FACTOR ** 0 }, // Dirt
  { depth: 3000, tile: 0, border: 1200, hardness: HARDNESS_FACTOR ** 1 }, // Smooth Stone
  { depth: 5000, tile: 16, border: 1200, hardness: HARDNESS_FACTOR ** 2 }, // Rough Stone
  { depth: 7000, tile: 17, border: 1200, hardness: HARDNESS_FACTOR ** 3 }, // Hard Stone
  { depth: 999999, tile: 37, border: 1200, hardness: HARDNESS_FACTOR ** 4 }, // Obsidian
];
const ORE_TYPES = [
  { depth: 25, tile: 34, value: VALUE_FACTOR ** 0 }, // Coal
  { depth: 750, tile: 33, value: VALUE_FACTOR ** 1 }, // Iron
  { depth: 1500, tile: 32, value: VALUE_FACTOR ** 2 }, // Gold
  { depth: 2900, tile: 171, value: VALUE_FACTOR ** 3 }, // Emerald
  { depth: 4900, tile: 51, value: VALUE_FACTOR ** 4 }, // Ruby
  { depth: 6900, tile: 50, value: VALUE_FACTOR ** 5 }, // Diamond
  { depth: 7500, tile: 105, value: VALUE_FACTOR ** 6 }, // Glowstone
];
const DIRECTION_UP = 0;
const DIRECTION_DOWN = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_RIGHT = 3;
function directionOffset(direction) {
  switch (direction) {
    case DIRECTION_UP:
      return { dx: 0, dy: -1 };
    case DIRECTION_DOWN:
      return { dx: 0, dy: 1 };
    case DIRECTION_LEFT:
      return { dx: -1, dy: 0 };
    case DIRECTION_RIGHT:
      return { dx: 1, dy: 0 };
  }
}

function updateUI() {
  moneyLabel.textContent = `Money: $${money.toLocaleString()}`;
  labelMiner.textContent = `Miners: ${miners.length}`;
  buyMinerButton.textContent = `Buy ($${Math.round(
    BUY_MINER_BASE_COST * BUY_MINER_FACTOR ** miners.length
  ).toLocaleString()})`;
  travelSpeedLabel.textContent = `Travel Speed: ${travelSpeedStep + 1}`;
  buyTravelSpeedButton.textContent = `Buy ($${Math.round(
    BUY_TRAVEL_SPEED_BASE_COST * BUY_TRAVEL_SPEED_FACTOR ** travelSpeedStep
  ).toLocaleString()})`;
  miningSpeedLabel.textContent = `Mining Speed: ${miningSpeedStep + 1}`;
  buyMiningSpeedButton.textContent = `Buy ($${Math.round(
    BUY_MINING_SPEED_BASE_COST * BUY_MINING_SPEED_FACTOR ** miningSpeedStep
  ).toLocaleString()})`;
  inventorySpaceLabel.textContent = `Inventory Space: ${
    inventorySpaceStep + 1
  }`;
  buyInventorySpaceButton.textContent = `Buy ($${Math.round(
    BUY_INVENTORY_SPACE_BASE_COST *
      BUY_INVENTORY_SPACE_FACTOR ** inventorySpaceStep
  ).toLocaleString()})`;
}

// Generate a level based on depth and Perlin noise
const level = [];
const updatedBlocks = new Set();
let updateEverything = true;
function generateLevel() {
  for (let y = 0; y < worldHeight; y++) {
    const row = [];
    for (let x = 0; x < worldWidth; x++) {
      const depth = y;
      const reachedLevelIndex = LEVEL_CHANGES.findIndex(
        (change) => depth <= change.depth + change.border
      );
      const level = LEVEL_CHANGES[reachedLevelIndex];
      const withinBorder =
        depth >= level.depth - level.border &&
        depth <= level.depth + level.border;

      let tile = level.tile;
      let hardness = level.hardness;
      if (withinBorder) {
        const nextLevel = LEVEL_CHANGES[reachedLevelIndex + 1];
        const transition = (depth - level.depth) / level.border;
        const isNextLevel = noise.simplex2(x * 0.05, y * 0.05) < transition;
        tile = isNextLevel ? nextLevel.tile : level.tile;
        hardness = isNextLevel ? nextLevel.hardness : level.hardness;
      }

      row.push({ tile, hardness: hardness, mined: false });
    }
    level.push(row);
  }

  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      const depth = y;

      // Add ores
      for (let ore of ORE_TYPES) {
        if (depth >= ore.depth && Math.random() < 0.01) {
          level[y][x].ore = ore.tile;
          level[y][x].value = ore.value;
          // Chance to add more ore around the current tile
          while (Math.random() < 0.4) {
            const dx = Math.floor(Math.random() * 2) - 1;
            const dy = Math.floor(Math.random() * 2) - 1;
            if (
              x + dx >= 0 &&
              x + dx < worldWidth &&
              y + dy >= 0 &&
              y + dy < worldHeight
            ) {
              level[y + dy][x + dx].ore = ore.tile;
              level[y + dy][x + dx].value = ore.value;
            }
          }
        }
      }
    }
  }

  level[19][worldWidth / 2].tile = 61; // Shop
}
generateLevel();
let oreCount = 0;
for (let y = 0; y < worldHeight; y++) {
  for (let x = 0; x < worldWidth; x++) {
    if (level[y][x].ore) {
      oreCount += 1;
    }
  }
}
const grid = new Graph(level.map((row) => row.map(() => 1)));

function updateGrid(
  targetX = undefined,
  targetY = undefined,
  initialize = false
) {
  // all ores are end nodes
  for (let y = targetY || 0; y < (targetY ? targetY + 1 : worldHeight); y++) {
    for (let x = targetX || 0; x < (targetX ? targetX + 1 : worldWidth); x++) {
      const tile = level[y][x];
      if (initialize) {
        grid.grid[y][x].end = level[y][x].ore;
      }
      grid.grid[y][x].weight = tile.hardness;
    }
  }
}
updateGrid(undefined, undefined, true);

class Miner {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.inventory = [];
    this.combinedTravelTime = 0;
    this.nextTarget = undefined;
    this.nextPath = undefined;
  }

  update(diffTime) {
    this.travelSpeed =
      WALKING_SPEED_PER_SEC * WALKING_SPEED_FACTOR ** travelSpeedStep;
    this.miningSpeed =
      MINING_SPEED_PER_SEC * MINING_SPEED_FACTOR ** miningSpeedStep;

    while (diffTime > 0.0001) {
      if (
        this.inventory.length >=
        INVENTORY_SPACE * INVENTORY_SPACE_FACTOR ** inventorySpaceStep
      ) {
        diffTime = this.goSell(diffTime);
      } else {
        if (oreCount === 0) {
          this.goSell(diffTime);
          return;
        }
        diffTime = this.goToNearbyOre(diffTime);
      }
    }
  }

  goToNearbyOre(diffTime) {
    if (this.nextTarget && !level[this.nextTarget.x][this.nextTarget.y].ore) {
      // somebody else mined the ore
      this.nextTarget = undefined;
      this.nextPath = undefined;
    }

    let path =
      this.nextPath ??
      astar.search(grid, grid.grid[this.y][this.x], this.nextTarget, {
        travelSpeed:
          WALKING_SPEED_PER_SEC * WALKING_SPEED_FACTOR ** travelSpeedStep,
        miningSpeed:
          MINING_SPEED_PER_SEC * MINING_SPEED_FACTOR ** miningSpeedStep,
      });
    this.nextPath = path;
    if (!this.nextTarget && path.length) {
      this.nextTarget = path[path.length - 1];
      grid.grid[this.nextTarget.x][this.nextTarget.y].end = undefined;
    }
    if (!this.nextTarget) {
      // no more ore
      return 0;
    }
    diffTime = this.goTo(diffTime);

    if (
      this.nextTarget &&
      this.x === this.nextTarget.y &&
      this.y === this.nextTarget.x
    ) {
      this.nextTarget = undefined;
      this.nextPath = undefined;
    }
    return diffTime;
  }

  goSell(diffTime) {
    if (
      this.nextPath &&
      this.nextPath.length &&
      this.nextPath[this.nextPath.length - 1].x !== 19
    ) {
      // seems something fishy happened
      this.nextPath = undefined;
      this.nextTarget = undefined;
    }

    const path =
      this.nextPath ??
      astar.search(
        grid,
        grid.grid[this.y][this.x],
        grid.grid[19][worldWidth / 2]
      );
    this.nextPath = path;
    diffTime = this.goTo(diffTime);

    if (this.x === worldWidth / 2 && this.y === 19) {
      const totalValue = this.inventory.reduce(
        (acc, ore) => acc + ORE_TYPES.find((o) => o.tile === ore).value,
        0
      );
      money += totalValue;
      this.inventory.length = 0;
      this.nextPath = undefined;
      updateUI();
    }
  }

  goTo(diffTime) {
    const path = this.nextPath;
    const previousPos = { x: this.x, y: this.y };
    let movedOnce = false;
    while (path.length && diffTime > 0.0001) {
      const next = path.shift();
      // watch out x and y are swapped
      const targetX = next.y;
      const targetY = next.x;

      const [usedTime, again] = this.goToStep(targetX, targetY, diffTime);
      diffTime -= usedTime;
      if (again) {
        path.unshift(next);
        break;
      }
      movedOnce = true;
    }
    if (movedOnce) {
      updatedBlocks.add(previousPos);
      updatedBlocks.add({ x: this.x, y: this.y });
    }
    return diffTime;
  }

  goToStep(targetX, targetY, diffTime) {
    // const { dx, dy } = directionOffset(direction);
    // const targetX = this.x + dx;
    // const targetY = this.y + dy;
    if (
      targetX < 0 ||
      targetX >= worldWidth ||
      targetY < 0 ||
      targetY >= worldHeight
    ) {
      return [0, false];
    }
    if (this.x === targetX && this.y === targetY) {
      return [0, false];
    }

    let usedTime = 0;
    const tile = level[targetY][targetX];
    if (tile.hardness > 0) {
      const usedMiningTime = Math.min(
        diffTime,
        tile.hardness /
          (MINING_SPEED_PER_SEC * MINING_SPEED_FACTOR ** miningSpeedStep)
      );
      diffTime -= usedMiningTime;
      usedTime += usedMiningTime;
      tile.hardness -=
        usedMiningTime *
        (MINING_SPEED_PER_SEC * MINING_SPEED_FACTOR ** miningSpeedStep);
      updateGrid(targetX, targetY);
      if (tile.hardness > 0.0001) {
        return [usedTime, true];
      }
      tile.hardness = 0;

      let mined = false;
      if (targetY > LEVEL_CHANGES[0].depth) {
        tile.mined = true;
      }
      if (tile.ore) {
        this.inventory.push(tile.ore);
        collectedMoney += ORE_TYPES.find((o) => o.tile === tile.ore).value;
        tile.ore = undefined;
        oreCount -= 1;
        this.nextTarget = undefined;
        this.nextPath = undefined;
        mined = true;
      }
      updateGrid(targetX, targetY);
      updatedBlocks.add({ x: targetX, y: targetY });
      if (mined) {
        return [usedTime, false];
      }
    }

    const traveled = this.combinedTravelTime * this.travelSpeed;
    const usedTravelTime = Math.max(
      0,
      Math.min(diffTime, (1 - traveled) / this.travelSpeed)
    );
    diffTime -= usedTravelTime;
    usedTime += usedTravelTime;
    this.combinedTravelTime += usedTravelTime;
    if (this.combinedTravelTime * this.travelSpeed < 0.9999) {
      return [usedTime, true];
    }
    this.combinedTravelTime = 0;
    this.x = targetX;
    this.y = targetY;
    maxDepthSeen = Math.max(maxDepthSeen, this.y);
    return [usedTime, false];
  }
}
const miners = [new Miner(worldWidth / 2, 19)];

// Viewport settings
const MAX_ZOOM = Math.ceil((worldWidth * 40) / canvas.width);
let viewport = {
  x: 0,
  y: 10,
  tileSize: 40,
  zoom: 3,
  updateSize: function () {
    this.tileSize = 40 / this.zoom;
  },
  move: function (dx, dy) {
    this.x += dx;
    this.y += dy;

    // Ensure viewport stays within world bounds
    this.x = Math.max(
      0,
      Math.min(worldWidth - canvas.width / this.tileSize, this.x)
    );
    this.y = Math.max(
      0,
      Math.min(
        maxDepthSeen + 50,
        Math.min(worldHeight - canvas.height / this.tileSize, this.y)
      )
    );
    updateEverything = true;
  },
};
viewport.updateSize();
viewport.x = worldWidth / 2 - canvas.width / 2 / viewport.tileSize;

function drawTile(x, y, index, darken = false) {
  const useSmaller = false; //viewport.zoom >= 10;
  const image = useSmaller ? terrainImageMini : terrainImage;
  const effectiveSpriteSize = useSmaller ? 2 : spriteSize;
  const effectiveAtlasSize = useSmaller ? 32 : atlasSize;
  const cols = effectiveAtlasSize / effectiveSpriteSize;
  const sx = (index % cols) * effectiveSpriteSize;
  const sy = Math.floor(index / cols) * effectiveSpriteSize;
  const destX = Math.floor(x * viewport.tileSize);
  const destY = Math.floor(y * viewport.tileSize);
  const destSize = Math.ceil(viewport.tileSize);
  ctx.drawImage(
    image,
    sx,
    sy,
    spriteSize,
    spriteSize,
    destX,
    destY,
    destSize,
    destSize
  );

  if (index === 37 || index === 14) {
    // Obsidian is a bit too dark, so we'll draw a white overlay
    ctx.fillStyle =
      index === 37 ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(destX, destY, destSize, destSize);
  }

  if (darken) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; // Adjust the opacity as needed
    ctx.fillRect(destX, destY, destSize, destSize);
  }
}

function drawUnit(x, y, index) {
  const cols = atlasSize / spriteSize;
  const sx = (index % cols) * spriteSize;
  const sy = Math.floor(index / cols) * spriteSize;
  const destX = Math.floor(x * viewport.tileSize);
  const destY = Math.floor(y * viewport.tileSize);
  const destSize = Math.ceil(viewport.tileSize);
  ctx.drawImage(
    unitImage,
    sx,
    sy,
    spriteSize,
    spriteSize,
    destX,
    destY,
    destSize,
    destSize
  );
}

function drawLevel(targetX, targetY) {
  if (!terrainLoaded || !terrainMiniLoaded || !unitLoaded) return false;
  let startX = Math.max(0, Math.floor(viewport.x));
  let endX = Math.min(
    worldWidth,
    Math.ceil(viewport.x + canvas.width / viewport.tileSize)
  );
  let startY = Math.max(0, Math.floor(viewport.y));
  let endY = Math.min(
    worldHeight,
    Math.ceil(viewport.y + canvas.height / viewport.tileSize)
  );
  if (targetX !== undefined && targetY !== undefined) {
    startX = Math.max(0, targetX);
    endX = Math.min(worldWidth, targetX + 1);
    startY = Math.max(0, targetY);
    endY = Math.min(worldHeight, targetY + 1);
  }

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const { tile, mined, ore, value, hardness } = level[y][x];
      const blockType = mined ? tile : ore ?? tile;
      drawTile(x - viewport.x, y - viewport.y, blockType, mined);
    }
  }

  // Draw miners
  for (let miner of miners) {
    if (
      miner.x >= startX &&
      miner.x < endX &&
      miner.y >= startY &&
      miner.y < endY
    ) {
      const inventorySpace =
        INVENTORY_SPACE * INVENTORY_SPACE_FACTOR ** inventorySpaceStep;
      const type = miner.inventory.length >= inventorySpace ? 151 : 135;
      drawUnit(miner.x - viewport.x, miner.y - viewport.y, type);
    }
  }

  return true;
}

// Updated game loop to control frame rate
let lastFrameTime = 0;

function gameLoop(timestamp) {
  let elapsed = (timestamp - lastFrameTime) / 1000;
  if (elapsed > frameDuration) {
    lastFrameTime = timestamp;
    elapsed *= SPEED;
    updatedBlocks.clear();

    // Update miners
    for (let miner of miners) {
      miner.update(elapsed);
    }

    if (updateEverything) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      if (drawLevel()) {
        updateEverything = false;
      }
    } else {
      // Draw only the updated blocks
      for (let block of updatedBlocks) {
        drawLevel(block.x, block.y);
      }
    }
  }

  requestAnimationFrame(gameLoop); // Repeat the loop
}

document.addEventListener("keydown", function (event) {
  const amount = (0.4 * canvas.height) / viewport.tileSize;
  switch (event.key) {
    case "w":
      viewport.move(0, -amount);
      break;
    case "s":
      viewport.move(0, amount);
      break;
    case "a":
      viewport.move(-amount, 0);
      break;
    case "d":
      viewport.move(amount, 0);
      break;
  }
});

canvas.addEventListener("wheel", function (event) {
  const delta = Math.sign(event.deltaY);
  viewport.zoom = Math.max(1, Math.min(MAX_ZOOM, viewport.zoom + delta));
  viewport.updateSize();
  viewport.move(0, 0);
  updateEverything = true;
});

// Start the game loop
updateUI();
requestAnimationFrame(gameLoop);

let lastMPM = 0;
function updateMPM() {
  const diffMoney = collectedMoney - lastCollectedMoney;
  lastCollectedMoney = collectedMoney;
  const mpm = diffMoney * 60;
  lastMPM = lastMPM * 0.9 + mpm * 0.1;
  moneyPerMinuteLabel.textContent = `$/min: ${Math.round(
    lastMPM
  ).toLocaleString()}`;
}
setInterval(updateMPM, 1000);
