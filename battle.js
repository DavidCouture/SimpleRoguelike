// BATTLE HANDLING SECTION
function handleBattle(e) {
    if (e.code == "Digit1") {
        fightMonster();
        processEnemyTurn();
    } else if (e.code == "Digit2") {
        fleeFromMonster();
    }
}

function fightMonster() {
    playerActionHTML.textContent = `You attack with your ${playerStats["weapon"]}!`;
    const toHit = Math.random();
        if (toHit > .95) {
            playerResultHTML.textContent = `Critical hit! You did ${playerStats['attack'] * 2} damage!`;
            battleInfo["enemyStats"]["currentHealth"] -= playerStats['attack'] * 2;
            enemyHealthHTML.textContent = battleInfo["enemyStats"]["currentHealth"];
        } else if (toHit > .05) {
            playerResultHTML.textContent = `You did ${playerStats['attack']} damage!`;
            battleInfo["enemyStats"]["currentHealth"] -= playerStats['attack'];
            enemyHealthHTML.textContent = battleInfo["enemyStats"]["currentHealth"];
        } else {
            playerResultHTML.textContent = `But the ${battleInfo["enemyStats"]["name"]} avoided the attack!`;
        }  
}

function fleeFromMonster() {
    playerActionHTML.textContent = "You tried running away...";
    const fleeAttempt = Math.random();
    if (fleeAttempt >= .25) {
        battleNotesHTML.textContent = `You fled from the ${battleInfo["enemyStats"]["name"]}.`;
        endBattle();
    } else {
        playerResultHTML.textContent = "But you couldn't escape!";
        processEnemyTurn();
    }
}

function endBattle() {
    gameState = "movement";
    commandsHTML.removeChild(commandsHTML.children[1]);
    playerActionHTML.textContent = "";
    playerResultHTML.textContent = "";
    enemyActionHTML.textContent = "";
    enemyResultHTML.textContent = "";
    generateLegend(playerCommands, commandsHTML);
    battleInfoHTML.classList.add("hidden");
}

function processEnemyTurn() {
    if (battleInfo["enemyStats"]["currentHealth"] <= 0) {
        battleNotesHTML.textContent = `You defeated the ${battleInfo['enemyStats']['name']}!`;
        dungeonLevels[currentLevel][battleInfo['enemyLoc'][1]][battleInfo['enemyLoc'][0]] = gameChars['space'];
        playerStats["xpToNextLevel"] -= battleInfo["enemyStats"]["maxHealth"];
        xpToNextLevelHTML.textContent = playerStats["xpToNextLevel"];
        if (playerStats["xpToNextLevel"] <= 0) {
            battleNotesHTML.textContent += " Congratulations, you gained a level!";
            playerLevelUp();
        }
        showGameBoard();
        endBattle();
        checkPotionDrops();
        checkWeaponDrops();
        monstersDefeated++;
    } else {
        enemyActionHTML.textContent = `You were attacked by the ${battleInfo['enemyStats']['name']}!`;
        const toHit = Math.random();
        if (toHit > .5) {
            enemyResultHTML.textContent = `You took ${battleInfo['enemyStats']['attack']} damage!`;
            playerStats['currentHealth'] -= battleInfo['enemyStats']['attack'];
            playerCurrentHealthHTML.textContent = playerStats['currentHealth'];
        } else {
            enemyResultHTML.textContent = `You avoided the attack!`;
        }
        if (playerStats['currentHealth'] <= 0) {
            processEndGame('lose');
        }
    }
    return;
}

function enterBattle(enemies, enemy, enemyLoc, enemyType, aggressor) {
    gameNotesHTML.classList.add("hidden");
    const enemyMod = [0, 0]
    if (enemyType == "monster") {
        let tempLevelNum = currentLevel;
        while (tempLevelNum >= 3) {
            enemyMod[0] += 5;
            enemyMod[1] += 2;
            tempLevelNum -= 3;
        }
    } else if (enemyType == "boss") {
        let tempLevelNum = currentLevel;
        while (tempLevelNum >= Object.keys(bosses).length) {
            enemyMod[0] += 30;
            enemyMod[1] += 10;
            tempLevelNum -= Object.keys(bosses).length;
        }
    } else {
        console.log("Invalid enemy type.");
        return;
    }
    if (aggressor == "player") {
        battleNotesHTML.textContent = `You are about to fight a ${enemy}!`;
    } else if (aggressor == "enemy") {
        battleNotesHTML.textContent = `You are being attacked by a ${enemy}!`;
    } else if (aggressor == "ambusher") {
        battleNotesHTML.textContent = `You were ambushed by a hiding ${enemy}!`;
    }
    battleInfo["enemyStats"]["name"] = enemy;
    battleInfo["enemyStats"]["maxHealth"] = enemies[enemy]["health"] + enemyMod[0];
    battleInfo["enemyStats"]["currentHealth"] = enemies[enemy]["health"] + enemyMod[0];
    battleInfo["enemyStats"]["attack"] = enemies[enemy]["attack"] + enemyMod[1];
    battleInfo['enemyLoc'][1] = enemyLoc[1];
    battleInfo['enemyLoc'][0] = enemyLoc[0];
    enemyHealthHTML.textContent = battleInfo["enemyStats"]["currentHealth"];
    enemyAttackHTML.textContent = battleInfo["enemyStats"]["attack"];
    enemyNameHTML.textContent = enemy;
    gameState = "battle";
    infoBoardHMTL.classList.remove("hidden");
    commandsHTML.removeChild(commandsHTML.children[1]);
    generateLegend(battleCommands, commandsHTML);
    battleBoardHTML.classList.remove("hidden");
    battleInfoHTML.classList.remove("hidden");
}

function defeatText(enemyType, enemy) {
    if (enemy) {
        if (enemyType == "monster") {
            return monsters[enemy]["defeatText"];
        } else if (enemyType == "boss") {
            return bosses[enemy]["defeatText"];
        }
    } else {
        return `You were defeated by the ${battleInfo["enemyStats"]["name"]}!`;
    }
}