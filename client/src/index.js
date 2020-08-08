import Phaser from "phaser";
import gamePhase1 from "./scenes/gamePhase1.js"
import gamePhase2 from "./scenes/gamePhase2.js"
import punish from "./scenes/punish.js"
import toPunish from "./scenes/toPunish.js"

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1400,
  height: 900,
  scene: [gamePhase1, punish, toPunish, gamePhase2]
};

const game = new Phaser.Game(config);
