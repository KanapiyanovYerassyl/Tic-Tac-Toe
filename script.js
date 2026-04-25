const gameBoard = (function() {
  const rows = 3;
  const columns = 3;
  const board = [];


  const generateCells = () => {
    for (let i = 0; i < rows; i++){
      board[i] = [];
      for (let j = 0; j < columns; j++){
        board[i][j] = Cell();
      }
    }
    
  }

  generateCells();

  const getBoard = () => board;


  

  const place = (row, column, player) => {
      if (row < 3 && column < 3 && board[row][column].getValue() === ""){
        board[row][column].setValue(player.value);
      }else{
        console.log("Move invalid");
        return;
      }
  }

  const printBoard = () => {
    const boardWithCellValues = board.map((row) => (
      row.map((cell) => cell.getValue())
    ))
    return boardWithCellValues;
  }

  

  const reset = () => {
    board.length = 0;
    generateCells();
  }

  return {
    reset,
    getBoard,
    place,
    printBoard,
  }

})();


function Cell(){
    let value = "";

    const setValue = (player) => {
      value = player;
    };

    const getValue = () => value;
    

    return {
      setValue,
      getValue,
    };
};


const gameController = (function(playerOneName = "Player one", playerTwoName = "Player two"){
    const board = gameBoard;
  
    const players = [
      {
        name:  playerOneName,
        value: "X",
        count: 0,
      },
      {
        name: playerTwoName,
        value: "O",
        count: 0,
      },
    ];

    const getPlayerOne = () => players[0];
    const getPlayerTwo = () => players[1];

    let activePlayer = players[0];

    const switchPlayersTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const getActivePlayer = ()  => activePlayer;
  

    const checkWinCondition = () => {
      for (let i = 0; i < 8; i++) {
            let line = null;
  
            switch (i) {
            case 0:
                line = board.getBoard()[0][0].getValue() + board.getBoard()[0][1].getValue() + board.getBoard()[0][2].getValue();
                break;
            case 1:
                line = board.getBoard()[1][0].getValue() + board.getBoard()[1][1].getValue() + board.getBoard()[1][2].getValue();
                break;
            case 2:
                line = board.getBoard()[2][0].getValue() + board.getBoard()[2][1].getValue() + board.getBoard()[2][2].getValue();
                break;
            case 3:
                line = board.getBoard()[0][0].getValue() + board.getBoard()[1][0].getValue() + board.getBoard()[2][0].getValue();
                break;
            case 4:
                line = board.getBoard()[0][1].getValue() + board.getBoard()[1][1].getValue() + board.getBoard()[2][1].getValue();
                break;
            case 5:
                line = board.getBoard()[0][2].getValue() + board.getBoard()[1][2].getValue() + board.getBoard()[2][2].getValue();
                break;
            case 6:
                line = board.getBoard()[0][0].getValue() + board.getBoard()[1][1].getValue() + board.getBoard()[2][2].getValue();
                break;
            case 7:
                line = board.getBoard()[0][2].getValue() + board.getBoard()[1][1].getValue() + board.getBoard()[2][0].getValue();
                break;
            }
            
            if (line === "XXX"  || line === "OOO") {
                return true;
              }

            
        }
    }

    const checkTieCondition = () => {
      const availableCells = board.getBoard()
      .flat()
      .filter((cell) => cell.getValue() === "")


      return availableCells.length === 0;
    }

    const printNewRound = () => {
      board.printBoard();
      console.log(`${getActivePlayer().name}'s turn`);
    }

    const restartGame = () => {
      board.reset();


      if (players[0].value === "X"){
        players[0].value = "O";
        players[1].value = "X";
      }else{
        players[0].value = "X";
        players[1].value = "O";
      }

      activePlayer = players[0];


    }

    const playRound = (row, column) => {
      printNewRound();

      console.log(
        `Dropping ${getActivePlayer().name}'s ${getActivePlayer().value} into row ${row} column ${column} cell`
      )

      board.place(row, column, getActivePlayer());

      if (checkWinCondition()){
        console.log(`${getActivePlayer().name} wins`)
        const winnerName = getActivePlayer().name;
        getActivePlayer().count++;
        restartGame();
        return { result: "win", winnerName};
      }

      if (checkTieCondition()) {
         console.log("It's a tie");
         restartGame();
         return;
      }


      switchPlayersTurn();
      printNewRound();
      

      
    }
    

    return {
      playRound,
      getActivePlayer,
      getBoard: board.getBoard,
      getPlayerOne,
      getPlayerTwo,
    }

    

})();

const screenController = (function(){
  const boardDiv = document.querySelector(".main-game-board");
  const playerTurnDiv = document.querySelector(".player-turn");
  const player1Score = document.getElementById("player1-score-span");
  const player2Score = document.getElementById("player2-score-span");
  const player1NameDisplay = document.getElementById("player1-name-display");
  const player2NameDisplay = document.getElementById("player2-name-display");
  const gameStats = document.querySelector(".main-game-stats");
  const nameInputSection = document.querySelector(".player-name-input");

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = gameController.getBoard();
    const activePlayer = gameController.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s turn`;

    player1NameDisplay.textContent = gameController.getPlayerOne().name;
    player1Score.textContent = gameController.getPlayerOne().count;
    player2NameDisplay.textContent = gameController.getPlayerTwo().name;
    player2Score.textContent = gameController.getPlayerTwo().count;

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = colIndex;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
  };

  const clickHandlerBoard = (e) => {
    const target = e.target;
    if (!target.classList.contains("cell")) return;

    const row = parseInt(target.dataset.row);
    const col = parseInt(target.dataset.column);

    const result = gameController.playRound(row, col);
    updateScreen();

    if (result === "win") {
      const winner = gameController.getPlayerOne().value === "O"
        ? gameController.getPlayerOne()
        : gameController.getPlayerTwo();
      playerTurnDiv.textContent = `${winner.name} wins! Starting new round...`;
    } else if (result === "tie") {
      playerTurnDiv.textContent = "It's a tie! Starting new round...";
    }
  };

  const startGame = () => {
    boardDiv.addEventListener("click", clickHandlerBoard);
    updateScreen();
  };

  const init = () => {
    document.getElementById("player-name-form").addEventListener("submit", function(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const playerOneName = formData.get("player1-name") || "Player 1";
      const playerTwoName = formData.get("player2-name") || "Player 2";

      gameController.getPlayerOne().name = playerOneName;
      gameController.getPlayerTwo().name = playerTwoName;

      nameInputSection.style.display = "none";
      gameStats.style.display = "flex";

      startGame();
    });
  };

  init();

  return {};
})();

