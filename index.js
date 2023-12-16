let boardEle = document.getElementById("board")
const turnEle = document.getElementById("turnText")
const playsEle = document.getElementById("playText")
const infoEle = document.getElementById("info")
const gameEle = document.getElementById("game-container")
const titleEle = document.getElementById("title")
const WIDTH = 8
const HEIGHT = 10

const Game = {
  START: 0,
  PLAY: 1,
  END: 2
}

let turn = 0
let state = Game.START

let board = [
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.'],
]


let previous = null


// start of game
let placed = [0, 0];

// playing game
let selected = null;
let changeTurn = true;
let plays = 0;
let lastPlay = null;
let jumping = null;
let boulders = [false, false]



const printBoard = () => {
  for (let row of board) {
    console.log(row)
  }
  console.log(turn ? "blue" : "red", "moved")
}


const validStart = (a) => {
  return board[a[0]][a[1]] == '.' && a[0] == 9 * !turn
}

const validJump = (a, b) => {
  return (lastPlay == null || !(a[0] == lastPlay[0] && a[1] == lastPlay[1])) &&
    (jumping == null || (jumping[0] == a[0] && jumping[1] == a[1])) &&
    (a[0] == b[0] || a[1] == b[1]) &&
    (Math.abs(a[0] - b[0]) == 2 || Math.abs(a[1] - b[1]) == 2) &&
    board[b[0]][b[1]] == '.' &&
    board[(a[0] + b[0]) / 2][(a[1] + b[1]) / 2] != '.'
}

const validDash = (a, b) => {
  return (lastPlay == null || !(a[0] == lastPlay[0] && a[1] == lastPlay[1])) &&
    (jumping == null || (jumping[0] == a[0] && jumping[1] == a[1])) &&
    Math.abs(a[0] - b[0]) < 2 &&
    Math.abs(a[1] - b[1]) < 2 &&
    board[b[0]][b[1]] == '.'
}

const validBoulder = (a) => {
  return jumping == null &&
    a[0] <= 8 &&
    a[1] <= 6 &&
    board[a[0]][a[1]] == '.' &&
    board[a[0] + 1][a[1]] == '.' &&
    board[a[0]][a[1] + 1] == '.' &&
    board[a[0] + 1][a[1] + 1] == '.'
}

const setBoard = (ele, pos, symbol) => {
  board[pos[0]][pos[1]] = symbol;
  ele.className = `square ${symbol}`
}

const switchTurns = () => {
  turn = +!turn;
  turnText.innerText = turn ? "Blue" : "Red"
  lastPlay = null;
}

const endPlay = () => {
  lastPiece = null
  jumping = null
  plays += 1
  if (plays == 2) {
    switchTurns()
    plays = 0
  }
  playText.innerText = `Plays remaining: ${2 - plays}`
}

const saveBoard = () => {
  previous = {
    plays: plays,
    board: JSON.parse(JSON.stringify(board)),
    boardEle: boardEle.cloneNode(true),
    turn: turn,
    jumping: jumping?.slice(),
    lastPlay: lastPlay?.slice(),
    boulders: boulders?.slice(),
    changeTurn: changeTurn,
    placed: placed?.slice(),
    turnEle: turnEle.innerHTML,
    playsEle: playsEle.innerHTML,
    state: state,
  }
}


const undo = () => {
  if (previous == null) return;
  board = JSON.parse(JSON.stringify(previous.board))
  gameEle.removeChild(boardEle)
  boardEle = previous.boardEle
  gameEle.insertBefore(boardEle, infoEle)
  let children = boardEle.children
  for (let child of children) {
    child.onclick = clickSquare
  }
  plays = previous.plays
  turn = previous.turn
  jumping = previous.jumping?.slice()
  lastPlay = previous.lastPlay?.slice()
  boulders = previous.boulders?.slice()
  changeTurn = previous.changeTurn
  placed = previous.placed?.slice()
  turnEle.innerHTML = previous.turnEle;
  playsEle.innerHTML = previous.playsEle;
  state = previous.state;
  previous = null;
}


const clickSquare = (e) => {
  ele = e.target;
  pos = ele.id.split(" ").map(x => parseInt(x, 10))
  piece = board[pos[0]][pos[1]]
  turnSymbol = turn ? 'o' : 'x'
  console.log("Clicked", pos)

  // STARTING
  if (state == Game.START) {
    if (!validStart(pos)) {
      console.log("Invalid move");
      return;
    }
    saveBoard()
    setBoard(ele, pos, turnSymbol)
    placed[turn] += 1;
    if (turn == 1 && placed[turn] == 5) {
      state = Game.PLAY;
      turn = 1;
      plays = 1;
      console.log("Starting phase over...")
    }
    switchTurns()
  }
  // PLAYING
  else if (state == Game.PLAY) {
    if (selected == null) {
      if (piece.toLowerCase() != turnSymbol && !validBoulder(pos)) {
        console.log("Invalid move")
        return
      } else if (validBoulder(pos)) {
        saveBoard()
        setBoard(ele, pos, 'B')
        setBoard(document.getElementById(`${pos[0]} ${pos[1] + 1}`), [pos[0], pos[1] + 1], 'B')
        setBoard(document.getElementById(`${pos[0] + 1} ${pos[1]}`), [pos[0] + 1, pos[1]], 'B')
        setBoard(document.getElementById(`${pos[0] + 1} ${pos[1] + 1}`), [pos[0] + 1, pos[1] + 1], 'B')
      } else {
        selected = { ele: ele, pos: pos, piece: piece }
        console.log("selected:", selected)
        changeTurn = false;
      }
    } else {
      if (validJump(selected.pos, pos)) {
        saveBoard()
        changeTurn = false;
        if (pos[0] == 9 * turn) {
          selected.piece = selected.piece.toUpperCase();
        }
        setBoard(selected.ele, selected.pos, '.')
        setBoard(ele, pos, selected.piece)
        selected = { ele: ele, pos: pos, piece: selected.piece }
        jumping = pos;
      } else if (validDash(selected.pos, pos)) {
        saveBoard()
        if (pos[0] == 9 * turn) {
          selected.piece = selected.piece.toUpperCase();
        }
        console.log(selected, ele, pos)
        setBoard(selected.ele, selected.pos, '.')
        setBoard(ele, pos, selected.piece)
        selected = null;
        lastPlay = pos
      } else {
        console.log("Invalid move")
        selected = null;
        return
      }
    }
    if (turnSymbol.toUpperCase() == selected.piece && pos[0] == 9 * !turn) {
      titleEle.innerText = `${turn ? "Blue" : "Red"} Wins!`;
      clickSquare = () => { }
    }
    // plays and switching players
    if (changeTurn) endPlay()
    changeTurn = true;
  }

  printBoard()

}

for (let i = 0; i < HEIGHT; i++) {
  for (let j = 0; j < WIDTH; j++) {
    let square = document.createElement("div")
    square.className = "square"
    square.id = `${i} ${j}`
    square.onclick = clickSquare
    boardEle.appendChild(square);
  }
}

