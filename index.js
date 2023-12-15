const boardEle = document.getElementById("board")
const turnEle = document.getElementById("turnText")
const playsEle = document.getElementById("playText")
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


// start of game
let placed = [0, 0];

// playing game
let selected = null;
let changeTurn = true;
let plays = 0;
let lastPlay = null;
let jumping = null;


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
  return !(a[0] == lastPlay[0] && a[1] == lastPlay[1]) &&
    (jumping == null || (jumping[0] == a[0] && jumping[1] == a[1])) &&
    (a[0] == b[0] || a[1] == b[1]) &&
    (Math.abs(a[0] - b[0]) == 2 || Math.abs(a[1] - b[1]) == 2) &&
    board[b[0]][b[1]] == '.' &&
    board[(a[0] + b[0]) / 2][(a[1] + b[1]) / 2] != '.'
}

const validDash = (a, b) => {
  return !(a[0] == lastPlay[0] && a[1] == lastPlay[1]) &&
    (jumping == null || (jumping[0] == a[0] && jumping[1] == a[1])) &&
    Math.abs(a[0] - b[0]) < 2 &&
    Math.abs(a[1] - b[1]) < 2 &&
    board[b[0]][b[1]] == '.'
}

const setBoard = (ele, pos, symbol) => {
  board[pos[0]][pos[1]] = symbol;
  ele.className = `square ${symbol}`
}

const switchTurns = () => {
  turn = +!turn;
  turnText.innerText = `Turn: ${turn ? "blue" : "red"}`
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
      if (piece == '.' || piece != turnSymbol) {
        console.log("Invalid move")
        return
      }
      selected = { ele: ele, pos: pos }
      console.log("selected:", selected)
      changeTurn = false;
    } else {
      if (validJump(selected.pos, pos)) {
        changeTurn = false;
        setBoard(selected.ele, selected.pos, '.')
        setBoard(ele, pos, turnSymbol)
        selected = null;
        jumping = pos;
      } else if (validDash(selected.pos, pos)) {
        setBoard(selected.ele, selected.pos, '.')
        setBoard(ele, pos, turnSymbol)
        selected = null;
        lastPlay = pos
      } else {
        console.log("Invalid move")
        selected = null;
        return
      }
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

