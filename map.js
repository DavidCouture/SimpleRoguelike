

function pickRandEnemy(monster) {
    const keys = Object.keys(monster);
    return monster[keys[Math.floor(keys.length * Math.random())]];
}

function generateStairsLocs(levels, maxY, maxX) {
    for (let i = 0; i < levels - 1; i++) {
        const newLoc = [];
        newLoc.push(Math.floor(Math.random() * (maxY - 4)) + 2);
        newLoc.push(Math.floor(Math.random() * (maxX - 4)) + 2);
        upstairsLocs['Level' + (i+2)] = [newLoc[0], newLoc[1]];
    }
    for (let i = 0; i < levels - 1; i++) {
        const newLoc = [];
        newLoc.push(Math.floor(Math.random() * (maxY - 3)) + 2);
        newLoc.push(Math.floor(Math.random() * (maxX - 3)) + 2);
        downstairsLocs['Level' + (i+1)] = [newLoc[0], newLoc[1]];
    }
}

function generateTreasureLoc() {
    treasureLoc[0] = boardHeight - 2;
    treasureLoc[1] = boardLength - 2;
}

function generateBossLocs(levels) {
    for (let i = 0; i < levels - 1; i++) {
        const newLoc = [];
        newLoc.push([downstairsLocs[`Level${i+1}`][0], downstairsLocs[`Level${i+1}`][1]-1]);
        bossesLocs[`Level${i+1}`] = newLoc;
    }
    const newLoc = [];
    // code last boss location for the treasure guard spot (left of the treasure)
    newLoc.push([treasureLoc[0], treasureLoc[1]-1]);
    bossesLocs[`Level${levels}`] = newLoc;
}

function generateDungeon() {
    for (let i = 0; i < numLevels; i++) {
        dungeonLevels[i] = createMap(i);
    }
}

function checkForObject(level, y, x) {
    // add code here to check if a space should be stairs.
    const levelChecked = `Level${level}`;
    // console.log(bossesLocs[levelChecked][level - 1]);
    if (upstairsLocs.hasOwnProperty(levelChecked)) {
        if (upstairsLocs[levelChecked][0] == y && upstairsLocs[levelChecked][1] == x) {
            return "upstairs";
        } 
    } 
    if (downstairsLocs.hasOwnProperty(levelChecked)) {
        if (downstairsLocs[levelChecked][0] == y && downstairsLocs[levelChecked][1] == x) {
            return "downstairs";
        } 
    }
    if (bossesLocs[levelChecked][0][0] == y && bossesLocs[levelChecked][0][1] == x) {
        return "B";
    }
}

function generateMandatoryWalls() {
    for (let i = 0; i < numLevels - 1; i++) {
        const downstairsOnFloor = [downstairsLocs[`Level${i+1}`][0], downstairsLocs[`Level${i+1}`][1]];
        dungeonLevels[i][downstairsOnFloor[0] - 1][downstairsOnFloor[1]] = gameChars["wall"];
        dungeonLevels[i][downstairsOnFloor[0]][downstairsOnFloor[1] + 1] = gameChars["wall"];
        dungeonLevels[i][downstairsOnFloor[0] + 1][downstairsOnFloor[1]] = gameChars["wall"];
    }
    dungeonLevels[numLevels - 1][treasureLoc[0] - 1][treasureLoc[1]] = gameChars["wall"];
}

function createMap(levelNum) {
    const newLevel = [];
    for (let rowNum = 0; rowNum < boardHeight; rowNum++) {
        const newRow = [];
        for (let colNum = 0; colNum < boardLength; colNum++) {
            const checkWall = Math.random();
            if (rowNum == 0 || rowNum == boardHeight - 1 || colNum == 0 || colNum == boardLength - 1) {
                newRow.push(gameChars["wall"]);
            } else if (levelNum == 0 && rowNum == 1 && colNum == 1) {
                newRow.push(gameChars["exit"]);
            } else if (levelNum == 0 && rowNum == playerLocation[1] && colNum == playerLocation[0]) {
                newRow.push(gameChars["player"]);
            } else if (checkForObject(levelNum + 1, rowNum, colNum) == "downstairs") {
                newRow.push(gameChars["downstairs"]);
            } else if (checkForObject(levelNum + 1, rowNum, colNum) == "upstairs") {
                newRow.push(gameChars["upstairs"]);
            } else if (checkForObject(levelNum + 1, rowNum, colNum) == "B") {
                let tempLevelNum = levelNum;
                const bossesOptions = Object.keys(bosses);
                while (tempLevelNum >= bossesOptions.length) {
                    tempLevelNum -= bossesOptions.length;
                }
                bosses[bossesOptions[tempLevelNum]]["health"];
                bosses[bossesOptions[tempLevelNum]]["attack"];
                newRow.push(bosses[bossesOptions[tempLevelNum]]["symbol"]);
            } else if (levelNum == numLevels - 1 && rowNum == boardHeight - 2 && colNum == boardLength -2) {
                newRow.push(gameChars["treasure"]);
            } else if (checkWall < .14 && checkWall >= .13) {
                newRow.push(gameChars["mystery box"]);
            } else if (checkWall < .13 && checkWall >= .1 ) {
                newRow.push(pickRandEnemy(monsters)["symbol"]);
            }  else if (checkWall < .1) {
                newRow.push(gameChars["wall"]);
            } else {
                newRow.push(gameChars["space"]);
            }
        }
        newLevel.push(newRow);
    }
    return newLevel;
}

function showGameBoard() {
    while (gameBoardHTML.firstChild) {
        gameBoardHTML.removeChild(gameBoardHTML.firstChild);
    }  
    dungeonLevels[currentLevel].forEach(row => {
        const newSpan = document.createElement('span');
        newSpan.textContent = row.join("");
        gameBoardHTML.appendChild(newSpan);
        gameBoardHTML.appendChild(document.createElement("br"));
    })
    levelDisplayHTML.textContent = currentLevel + 1;
}

// Check a tile for its contents
function checkTile(y, x) {
    return dungeonLevels[currentLevel][y][x];
}