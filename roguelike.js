/*  DEV NOTES
    Next Steps:
    1. DONE!
    2. DONE!
    3. DONE!
    4. Refine monster spawns
        a) more weak monsters than strong monsters
        b) make monsters more difficult as levels progress
        c) add monster movement
        d) add floor traps?
    5. Add player stats:
        a) DONE!
        b) attacks/spells
    6. Debugging/Error-proofing
        a) ensure each map is playable (i.e. stairs accessible)
        b) ensure up, down, treasure, etc. don't spawn on same location on same floor
    7. DONE!
    8. Add player dashboard:
        a) personal stats:(health, inventory)
        b) level stats: (current dungeon level, num of final level, steps taken?, monsters defeated?)
    9. DONE!
    10. Add a key on the main screen to know what the symbols mean.
    11. Make an "endless" mode.
    12. DONE!
    13. Enemies should get harder every 3 flights of stairs
    14. Fix the grammar for battle w/ enemies whose names start with vowels.
    15. Once the treasure is grabbed:
        a) redraw the floors above the player
        b) spawn new monsters
        c) All upstairs should be forced boss encounters (like downstairs already is)
        d) Final boss at the exit
        e) Add some lore text
*/

// GENERATION FUNCTIONS
function generateLegend(commandList, domObject, reverse = false) {
    const newUL = document.createElement("ul");
    for (const [key, value] of Object.entries(commandList)) {
        const newLi = document.createElement("li");
        if (reverse) {
            newLi.innerHTML = `${key.padEnd(20, ".")} : ${value}`
        }
        else {
            newLi.innerHTML = `${value} : ${key}`
        }
        newUL.appendChild(newLi);
    }
    newUL.classList.add("legendList");
    domObject.appendChild(newUL);
    domObject.classList.remove("hidden");
}

// GAME EXECUTION
newGameForm.elements.makeNewGame.addEventListener("click", e => {
    e.preventDefault();
    boardLength = Number(newGameForm.elements.numCols.value);
    boardHeight = Number(newGameForm.elements.numRows.value);
    numLevels = Number(newGameForm.elements.numLevels.value);
    maxLevelHTML.innerHTML = numLevels;
    generateStairsLocs(numLevels, boardHeight, boardLength);
    generateTreasureLoc();
    generateBossLocs(numLevels);
    generateDungeon();
    generateMandatoryWalls();
    showGameBoard();
    generateLegend(gameChars, gameLegendHTML);
    generateLegend(generateEnemiesList(monsters), enemiesLegendHTML);
    generateLegend(generateEnemiesList(bosses), enemiesLegendHTML);
    generateLegend(playerCommands, commandsHTML);
    playerObjectiveHTML.innerHTML = "Find the treasure!";
    displayPlayerStats();
    gameBoardHTML.classList.remove("intro");
    statsBoardHTML.classList.remove("hidden");
    newGameForm.classList.add("hidden");
    commandsHTML.classList.remove("hidden");
    gameLegendHTML.classList.add("dispInlineBlock");
    enemiesLegendHTML.classList.add("dispInlineBlock");
    document.addEventListener("keyup", handleInput);
    resetBtnHTML.classList.remove("hidden");
})

function displayPlayerStats() {
    playerLevelHTML.textContent = playerStats["currentLevel"];
    playerCurrentHealthHTML.textContent = playerStats["currentHealth"];
    playerMaxHealthHTML.textContent = playerStats["maxHealth"];
    playerWeaponHTML.textContent = playerStats["weapon"];
    playerAttackHTML.textContent = playerStats["attack"];
    xpToNextLevelHTML.textContent = playerStats["xpToNextLevel"];
}

// MOVE THE PLAYER
// Check keyboard input
function handleInput(e) {
    if (gameState == "movement") {
        infoBoardHMTL.classList.add("hidden");
        battleNotesHTML.textContent = "";
        const moveKey = {"KeyW": [0, -1], "KeyA": [-1, 0], "KeyS": [0, 1], "KeyD": [1, 0]};
        if (e.code == "KeyW") {
            const intendedMove = moveKey[e.code];
            newTile = checkTile(playerLocation[1]+intendedMove[1], playerLocation[0]+intendedMove[0]);
            tryPlayerMove(newTile, intendedMove);
        } else if (e.code == "KeyA") {
            const intendedMove = moveKey[e.code];
            newTile = checkTile(playerLocation[1]+intendedMove[1], playerLocation[0]+intendedMove[0]);
            tryPlayerMove(newTile, intendedMove);
        } else if (e.code == "KeyS") {
            const intendedMove = moveKey[e.code];
            newTile = checkTile(playerLocation[1]+intendedMove[1], playerLocation[0]+intendedMove[0]);
            tryPlayerMove(newTile, intendedMove);
        } else if (e.code == "KeyD") {
            const intendedMove = moveKey[e.code];
            newTile = checkTile(playerLocation[1]+intendedMove[1], playerLocation[0]+intendedMove[0]);
            tryPlayerMove(newTile, intendedMove);
        } else {
            return;
        }
    } else if (gameState == "battle") {
        handleBattle(e);
    } else if (gameState == "dialogue") {
        handleDialogue(e);
    }
}

// Move the player to a free space
function tryPlayerMove(toNewTile, intendedMove) {
    if (toNewTile == gameChars["space"]) {
        dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["space"];
        playerLocation[0] += intendedMove[0];
        playerLocation[1] += intendedMove[1];
        dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["player"];
        totalSteps++;
        moveEnemies();    
    } else if (toNewTile == gameChars["downstairs"]) {
        moveFloors("down");
        totalSteps++;
    } else if (toNewTile == gameChars["upstairs"]) {
        moveFloors("up");
        totalSteps++;
    } else if (toNewTile == gameChars["treasure"]) {
        dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["space"];
        playerLocation[0] += intendedMove[0];
        playerLocation[1] += intendedMove[1];
        dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["player"];
        hasTreasure = true;
        playerObjectiveHTML.innerHTML = "Escape the dungeon!";
    } else if (toNewTile == gameChars["exit"]) {
        if (hasTreasure) {
            processEndGame("win");
            return;
        } else {
            console.log("You need to find the treasure before you can leave!");
            return;
        }
    } else if (toNewTile == gameChars["mystery box"]) {
        dungeonLevels[currentLevel][playerLocation[1] + intendedMove[1]][playerLocation[0] + intendedMove[0]] = gameChars["space"];
        showGameBoard();
        processMysteryBox(playerLocation[1] + intendedMove[1], playerLocation[0] + intendedMove[0]);
    } else {
        for (monster in monsters) {
            if (toNewTile == monsters[monster]["symbol"]) {
                enterBattle(monsters, monster, [playerLocation[0]+intendedMove[0], playerLocation[1]+intendedMove[1]], "monster", "player");
                return;
            }
        }
        for (boss in bosses) {
            if (toNewTile == bosses[boss]["symbol"]) {
                enterBattle(bosses, boss, [playerLocation[0]+intendedMove[0], playerLocation[1]+intendedMove[1]], "boss", "player");
                return;
            }
        }
        console.log(`There is a ${toNewTile} blocking the path!`);
        return;
    }
    showGameBoard();
}

// END the game
function processEndGame(result) {
    const endMsg = document.createElement("h2");
    if (result == "win") {
        while (gameBoardHTML.firstChild) {
            gameBoardHTML.removeChild(gameBoardHTML.firstChild);
        }
        endMsg.innerHTML = "Congratulations! You win!";
        const kingsMessage = document.createElement("p");
        kingsMessage.textContent = `Upon your return from the dungeon, the King immediately summons you to the main hall.
                                    King: "This is marvelous indeed! We knew only you had the courage to take on that Level ${numLevels} ${Object.keys(bosses)[(numLevels - 1) % Object.keys(bosses).length]}
                                    all by yourself. And I see you've become stronger, too, by ${playerStats["currentLevel"] - 1} level${playerStats["currentLevel"] > 2? "s" : ""}.
                                    Rest well, mighty hero. You've earned it."`;
        const statsMessage = document.createElement("p");
        statsMessage.textContent = `And let it be recorded in the scrolls the details of your journey.`;
        const statsList = {
            "Steps taken": totalSteps + 1,
            "Monsters defeated": monstersDefeated,
            "Mystery Boxes opened": mysterBoxesOpened,
            "Potions found": potionsFound,
            "Weapons found": weaponsFound
        }
        statsBoardHTML.classList.add("hidden");
        infoBoardHMTL.classList.add("hidden");
        gameLegendHTML.classList.add("hidden");
        gameLegendHTML.classList.remove("dispInlineBlock");
        enemiesLegendHTML.classList.add("hidden");
        enemiesLegendHTML.classList.remove("dispInlineBlock");
        gameBoardHTML.appendChild(endMsg);
        gameBoardHTML.appendChild(kingsMessage);
        gameBoardHTML.appendChild(statsMessage);
        generateLegend(statsList, gameBoardHTML, true); // make new function to display keys/values reversed.
    } else if (result == "lose") {
        battleNotesHTML.textContent = `You were defeated by the ${battleInfo["enemyStats"]["name"]}!`
        playerObjectiveHTML.textContent = "Rest in peace...or start a new game.";
    } else {
        return;
    }
    gameState = "over";
    commandsHTML.classList.add("hidden");
    resetBtnHTML.textContent = "Play Again";
}

// Move the player to a new floor
function moveFloors(direction) {
    dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["space"];
    if (direction == "down") {
        currentLevel += 1;
        playerLocation[1] = upstairsLocs[`Level${currentLevel + 1}`][0];
        playerLocation[0] = upstairsLocs[`Level${currentLevel + 1}`][1] + 1;
    } else if (direction == "up") {
        currentLevel -= 1;
        playerLocation[1] = downstairsLocs[`Level${currentLevel + 1}`][0];
        playerLocation[0] = downstairsLocs[`Level${currentLevel + 1}`][1] - 1;   
    } else {
        return;
    }
    dungeonLevels[currentLevel][playerLocation[1]][playerLocation[0]] = gameChars["player"];
    return;
}

function moveEnemies () {
    // Loop through current level game board.
    let rowNum = 0;
    let tileNum = 0;
    const excludedTiles = [];
    dungeonLevels[currentLevel].forEach(row => {
        row.forEach(tile => {
            for (monster in monsters) {
                let onExcludedTile = false;
                excludedTiles.forEach(excludedTile => {
                    if (excludedTile[0] == rowNum && excludedTile[1] == tileNum) {
                        onExcludedTile = true;
                        return;
                    }
                })
                if (onExcludedTile == false && tile == monsters[monster]["symbol"]) {
                    const moveDirection = String(Math.floor(Math.random() * 6) + 1);
                    switch (moveDirection) {
                        case "1":
                            // move up
                            if (checkTile(rowNum - 1, tileNum) == ".") {
                                processMonsterMove(checkTile(rowNum, tileNum), [rowNum, tileNum], [rowNum - 1, tileNum])
                                excludedTiles.push([rowNum - 1, tileNum]);
                            } else if (checkTile(rowNum - 1, tileNum) == "@") {
                                enterBattle(monsters, monster, [tileNum, rowNum], "monster", "enemy");                            
                            }
                            break;
                        case "2":
                            // move down
                            if (checkTile(rowNum + 1, tileNum) == ".") {
                                processMonsterMove(checkTile(rowNum, tileNum), [rowNum, tileNum], [rowNum + 1, tileNum])
                                excludedTiles.push([rowNum + 1, tileNum]);
                            } else if (checkTile(rowNum - 1, tileNum) == "@") {
                                enterBattle(monsters, monster, [tileNum, rowNum], "monster", "enemy");                            
                            }
                             break;
                        case "3":
                            // move left
                            if (checkTile(rowNum, tileNum - 1) == ".") {
                                processMonsterMove(checkTile(rowNum, tileNum), [rowNum, tileNum], [rowNum, tileNum - 1])
                                excludedTiles.push([rowNum, tileNum - 1]);
                            } else if (checkTile(rowNum, tileNum - 1) == "@") {
                                enterBattle(monsters, monster, [tileNum, rowNum], "monster", "enemy");                            
                            }
                            break;
                        case "4":
                            // move right
                            if (checkTile(rowNum, tileNum + 1) == ".") {
                                processMonsterMove(checkTile(rowNum, tileNum), [rowNum, tileNum], [rowNum, tileNum + 1])
                                excludedTiles.push([rowNum, tileNum + 1]);
                            } else if (checkTile(rowNum, tileNum + 1) == "@") {
                                enterBattle(monsters, monster, [tileNum, rowNum], "monster", "enemy");                            
                            }
                            break
                        default:
                            // doesn't move (happens if a 5 or 6 is rolled)
                    }
                }
            }
            tileNum += 1;
        })
        rowNum += 1;
        tileNum = 0;
    })
}

function checkPotionDrops(foundPotion) {
    if (Math.random() > .85 || foundPotion) {
        const potionValue = 5 + Math.floor(currentLevel / 3);
        if (playerStats["currentHealth"] == playerStats["maxHealth"]) {
            battleNotesHTML.textContent += " You found a healing potion, but you're already at max health, so it had no effect.";
        } else if (playerStats["currentHealth"] < playerStats["maxHealth"] - potionValue) {
            battleNotesHTML.textContent += ` You found a healing potion, and you recovered ${potionValue} health!`;
            playerStats["currentHealth"] += potionValue;
        } else {
            battleNotesHTML.textContent += " You found a healing potion. You are now fully healed!";
            playerStats["currentHealth"] = playerStats["maxHealth"];
        }
        playerCurrentHealthHTML.textContent = playerStats['currentHealth'];
        potionsFound++;
    }
}

function checkWeaponDrops(foundWeapon) {
    if (Math.random() > .95 || foundWeapon) {
        const newWeapon = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${weaponDrops[Math.floor(Math.random() * weaponDrops.length)]}`;
        battleNotesHTML.textContent += ` As luck would have it, you found a shiny new ${newWeapon}! You pick it up and use it as your new weapon.`;
        playerStats["weapon"] = newWeapon;
        playerStats["attack"] += 1;
        displayPlayerStats();
        weaponsFound++;
    }
}

function playerLevelUp(fromScroll) {
    playerStats["currentLevel"] += 1;
    if (fromScroll) {
        playerStats["xpToNextLevel"] = playerStats["currentLevel"] * 10;
    } else {
        playerStats["xpToNextLevel"] = playerStats["currentLevel"] * 10 + playerStats["xpToNextLevel"];
    }
    playerStats["maxHealth"] += 2;
    playerStats["currentHealth"] = playerStats["maxHealth"];
    playerStats["attack"] += 1;
    displayPlayerStats();
}

function processMonsterMove(monster, oldSpace, newSpace) {
    dungeonLevels[currentLevel][oldSpace[0]][oldSpace[1]] = "."
    dungeonLevels[currentLevel][newSpace[0]][newSpace[1]] = monster;
}

function generateEnemiesList(enemies) {
    const enemiesLegend = {};
    for (enemy in enemies) {
        enemiesLegend[enemy] = enemies[enemy]["symbol"];
    }
    return enemiesLegend;
}

function processMysteryBox(rowNum, colNum) {
    mysterBoxesOpened++;
    enterGameDialogue();
    const mysteryValue = Math.random();
    if (mysteryValue > .95) {
        // Find weapon
        checkWeaponDrops(true);
        gameNotesHTML.textContent = battleNotesHTML.textContent;
    } else if (mysteryValue > .9) {
        // Find potion
        checkPotionDrops(true);
        gameNotesHTML.textContent = battleNotesHTML.textContent;
    } else if (mysteryValue > .65) {
        // Find scroll of knowledge
        const scrollContentsChecker = Math.random();
        let scrollContent = "";
        gameNotesHTML.textContent = "You found a scroll of knowledge!";
        if (scrollContentsChecker > .95) {
            scrollContent = " As you read the scroll, you become filled with ancient knowledge of battle and tactics. Your level advances by 1!";
            playerLevelUp(true);
        } else if (scrollContentsChecker > .25) {
            scrollContent = ` It reads: "${knowledgeScrollText[Math.floor(Math.random() * knowledgeScrollText.length)]}"`;
        } else {
            scrollContent = " Unfortunately, you can't decipher its glyphs...";
        }
        gameNotesHTML.textContent += scrollContent;
    } else if (mysteryValue > .05) {
        gameNotesHTML.textContent = "The box was empty!";
    } else {
        // Ambushed by a hiding monster!
        const ambusher = Object.keys(monsters)[Math.floor(Math.random() * Object.keys(monsters).length)];
        dungeonLevels[currentLevel][rowNum][colNum] = monsters[ambusher]["symbol"];
        showGameBoard();
        enterBattle(monsters, ambusher, [colNum, rowNum], "monster", "ambusher");
        return;
    }
    commandsHTML.removeChild(commandsHTML.children[1]);
    const newCommands = {"next...": "1"};
    generateLegend(newCommands, commandsHTML);
}

function enterGameDialogue() {
    infoBoardHMTL.classList.remove("hidden");
    gameInfoHTML.classList.remove("hidden");
    gameNotesHTML.classList.remove("hidden");
    battleBoardHTML.classList.add("hidden");
    gameState = "dialogue";
}

function handleDialogue(e) {
    if (e.code == "Digit1") {
        gameState = "movement";
        infoBoardHMTL.classList.add("hidden");
        gameInfoHTML.classList.add("hidden");
        gameNotesHTML.textContent = "";
        commandsHTML.removeChild(commandsHTML.children[1]);
        generateLegend(playerCommands, commandsHTML);
    }
}

// ERROR CHECKING
function errorCheck() {
    let gameError = false;
    // Prevent stairs from stacking on each other or player
    // Prevent stairs from being surrounded by walls
    // Prevent treasure from being surrounded by walls
}