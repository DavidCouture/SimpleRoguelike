// Select gameboard to update later
const gameBoardHTML = document.querySelector('.gameboard');
const infoBoardHMTL = document.querySelector('.infoBoard');
const statsBoardHTML = document.querySelector('.statsBoard');
const levelDisplayHTML = document.querySelector('.levelDisplay');
const maxLevelHTML = document.querySelector('.maxLevel');
const playerObjectiveHTML = document.querySelector('.playerObjective');
const newGameForm = document.querySelector('#newGameForm');
const gameLegendHTML = document.querySelector('.gameLegend');
const enemiesLegendHTML = document.querySelector('.enemiesLegend');
const commandsHTML = document.querySelector('.commands');
const resetBtnHTML = document.querySelector('#resetBtn');
const playerLevelHTML = document.querySelector('.playerLevel');
const playerCurrentHealthHTML = document.querySelector('.playerHealth');
const playerMaxHealthHTML = document.querySelector('.maxHealth');
const playerWeaponHTML = document.querySelector('.playerWeapon');
const playerAttackHTML = document.querySelector('.playerAttack');
const enemyHealthHTML = document.querySelector('.enemyHealth');
const enemyAttackHTML = document.querySelector('.enemyAttack');
const enemyNameHTML = document.querySelector('.enemyName');
const battleNotesHTML = document.querySelector('.battleNotes');
const playerActionHTML = document.querySelector('.playerAction');
const playerResultHTML = document.querySelector('.playerResult');
const enemyActionHTML = document.querySelector('.enemyAction');
const enemyResultHTML = document.querySelector('.enemyResult');
const battleInfoHTML = document.querySelector('.battleInfo');
const xpToNextLevelHTML = document.querySelector('.playerXPtoLevel');
const gameInfoHTML = document.querySelector('.gameInfo');
const gameNotesHTML = document.querySelector('.gameNotes');
const battleBoardHTML = document.querySelector('.battleBoard');

// PLACEHOLDERS
// Gameboard
const dungeonLevels = [];
const upstairsLocs = {};
const downstairsLocs = {};
const bossesLocs = {};
const treasureLoc = [];
const mandatoryWalls = {};
let boardLength = 0;
let boardHeight = 0;
let numLevels = 0;
let currentLevel = 0;
let gameState = "movement";

// PLAYER info & commands
const playerLocation = [2, 2];
let hasTreasure = false;
const playerStats = {
    "currentHealth": 10,
    "maxHealth": 10,
    "currentLevel": 1,
    "attack": 1,
    "weapon": "Dagger",
    "xpToNextLevel": 10
}
const playerCommands = {
    "move up": "w",
    "move down": "s",
    "move left": "a",
    "move right": "d"
}
const battleCommands = {
    "Melee attack": 1,
    "Run": 2
}

const choiceCommands = {
    "Yes": 1,
    "No": 2
}

// MAP & Monsters
const gameChars = {
    "wall": "#",
    "player": "@",
    "upstairs": "<",
    "downstairs": ">",
    "treasure": "$",
    "exit": "!",
    "space": ".",
    "mystery box": "?"
}

/*  Can add tiers of monsters by reorganizing this object into an object of objects, 
    with the top level object being the "level" - so higher dungeon levels pull from 
    higher monster levels (and also lower monster levels).
 */
const monsters = {
    "skeleton": {
        "symbol": "s",
        "health": 3,
        "attack": 1
    },
    "zombie": {
        "symbol": "z",
        "health": 1,
        "attack": 1
    },
    "wolf": {
        "symbol": "w",
        "health": 2,
        "attack": 1
    },
    "bear": {
        "symbol": "b",
        "health": 2,
        "attack": 2
    },
    "footsoldier": {
        "symbol": "f",
        "health": 7,
        "attack": 2
    },
    "dark imp": {
        "symbol": "i",
        "health": 6,
        "attack": 2
    },
    "gnome": {
        "symbol": "g",
        "health": 4,
        "attack": 3
    }
}
const bosses = {
    "Cyclops": {
        "symbol": "C",
        "health": 16,
        "attack": 3
    },
    "Werewolf": {
        "symbol": "W",
        "health": 25,
        "attack": 4
    },
    "Hydra": {
        "symbol": "H",
        "health": 30,
        "attack": 5
    },
    "Wyvern": {
        "symbol": "Y",
        "health": 35,
        "attack": 6
    },
    "Dragon": {
        "symbol": "D",
        "health": 40,
        "attack": 7
    },
    "Wizard": {
        "symbol": "Z",
        "health": 50,
        "attack": 8
    },
    "Necromancer": {
        "symbol": "N",
        "health": 60,
        "attack": 10 
    },
    "Demon Knight": {
        "symbol": "K",
        "health": 80,
        "attack": 8
    },
    "Archmage": {
        "symbol": "A",
        "health": 100,
        "attack": 15
    }
}

const bossHiLevDesc = [
    "Hardened",
    "Gigantic",
    "Magical",
    "Ghostly"
]

const monsterHiLevDesc = [
    "Fearsome",
    "Otherwordly",
    "Ethereal"
]

const weaponDrops = [
    "Dagger",
    "Shortsword",
    "Longsword",
    "Battle Axe",
    "Spear",
    "Mace",
    "Flail",
    "Halberd",
    "Staff",
    "Warhammer",
    "Katana",
    "Rapier",
    "Scimitar",
    "Maul",
    "Great Maul"
]

const prefixes = [
    "Sharp",
    "Tempered",
    "Magical",
    "Jagged",
    "Well-crafted",
    "Fiery",
    "Cosmic",
    "Ice-imbued",
    "Frost-imbued",
    "Thunder-imbued",
    "Darkness-imbued",
    "Light-imbued",
    "Holy",
    "Unholy",
    "Poison"
]

const knowledgeScrollText = [
    "The wise warrior knows both when to clear a level and when NOT to risk extra damage by clearing a level before fighting a powerful boss...",
    "A critical strike can change the flow of battle, making a dire situation a golden opportunity",
    "There can't possibly be cheat codes for this...right?",
    "Some monsters use Mystery Boxes to lure unsuspecting heroes into danger. Beware!",
    "Defeated enemies give their max HP as experience. Learning enemy stats will help you figure out when you'll gain a level.",
    "As you delve deeper, enemies and bosses continue to grow stronger.",
    "Rare knowledge scrolls can instantly increase your level.",
    "Some enemies absorb magic. Plan your attacks accordingly."
]

// BATTLE Handling
const battleInfo = {
    "enemyStats": {
        "name": "enemy",
        "maxHealth": 0,
        "currentHealth": 0,
        "attack": 0,
    },
    "enemyLoc": []
}

// GAME STATS
let totalSteps = 0;
let monstersDefeated = 0;
let mysterBoxesOpened = 0;
let potionsFound = 0;
let weaponsFound = 0;