let board = [];
let solution = [];
let selected = null;
let cellSize;
let validateButton;
let invalidCells = [];
let validCells = [];
let highlightTimer = 0;
const GRID_SIZE = 9;
const CELL_PADDING = 2;
const HIGHLIGHT_DURATION = 3000; // 3초

function setup() {
  // 캔버스 크기를 화면 크기에 맞게 설정
  const size = min(windowWidth, windowHeight) * 0.9;
  createCanvas(size, size + 50); // 버튼을 위한 추가 공간
  cellSize = width / GRID_SIZE;
  
  // 초기 게임 보드 생성
  initializeGame();
  
  // 유효성 검사 버튼 생성
  validateButton = createButton('CHECK');
  validateButton.position(width/2 - 50, height - 40);
  validateButton.size(100, 30);
  validateButton.mousePressed(validateBoard);
}

function draw() {
  background(255);
  drawGrid();
  drawNumbers();
  
  if (selected !== null) {
    highlightSelected();
  }
  
  // 유효하지 않은 셀 표시
  if (invalidCells.length > 0 && millis() - highlightTimer < HIGHLIGHT_DURATION) {
    noStroke();
    fill(255, 0, 0, 100);
    for (let cell of invalidCells) {
      rect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
    }
  }
  
  // 모든 셀이 유효할 때 녹색 표시
  if (validCells.length > 0 && millis() - highlightTimer < HIGHLIGHT_DURATION) {
    noStroke();
    fill(0, 255, 0, 100);
    for (let cell of validCells) {
      rect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
    }
  }
}

function initializeGame() {
  // 빈 보드 생성
  for (let i = 0; i < GRID_SIZE; i++) {
    board[i] = new Array(GRID_SIZE).fill(0);
    solution[i] = new Array(GRID_SIZE).fill(0);
  }
  
  // 기본 숫자 배치 (간단한 예시)
  generateSudoku();
  // 일부 숫자를 지워서 퍼즐 생성
  createPuzzle();
}

function generateSudoku() {
  // 간단한 스도쿠 생성 (실제 게임에서는 더 복잡한 알고리즘 사용)
  let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < GRID_SIZE; i++) {
    numbers = shuffle(numbers);
    for (let j = 0; j < GRID_SIZE; j++) {
      if (isValid(i, j, numbers[j])) {
        solution[i][j] = numbers[j];
      }
    }
  }
}

function createPuzzle() {
  // 솔루션을 복사하고 일부 숫자를 지움
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      board[i][j] = solution[i][j];
      if (random() > 0.5) {
        board[i][j] = 0;
      }
    }
  }
}

function isValid(row, col, num) {
  // 행 검사
  for (let x = 0; x < GRID_SIZE; x++) {
    if (solution[row][x] === num) return false;
  }
  
  // 열 검사
  for (let x = 0; x < GRID_SIZE; x++) {
    if (solution[x][col] === num) return false;
  }
  
  // 3x3 박스 검사
  let boxRow = floor(row / 3) * 3;
  let boxCol = floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (solution[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

function drawGrid() {
  stroke(0);
  strokeWeight(1);
  
  // 모든 셀 그리기
  for (let i = 0; i <= GRID_SIZE; i++) {
    // 굵은 선 (3x3 박스 구분)
    strokeWeight(i % 3 === 0 ? 3 : 1);
    
    // 수직선
    line(i * cellSize, 0, i * cellSize, height);
    // 수평선
    line(0, i * cellSize, width, i * cellSize);
  }
}

function drawNumbers() {
  textAlign(CENTER, CENTER);
  textSize(cellSize * 0.5);
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] !== 0) {
        fill(0);
        text(board[i][j], j * cellSize + cellSize/2, i * cellSize + cellSize/2);
      }
    }
  }
}

function highlightSelected() {
  noStroke();
  fill(200, 200, 255, 100);
  rect(selected.col * cellSize, selected.row * cellSize, cellSize, cellSize);
}

function mousePressed() {
  handleInput(mouseX, mouseY);
}

function touchStarted() {
  handleInput(touches[0].x, touches[0].y);
  return false; // 기본 동작 방지
}

function handleInput(x, y) {
  let row = floor(y / cellSize);
  let col = floor(x / cellSize);
  
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    if (selected && selected.row === row && selected.col === col) {
      selected = null;
    } else {
      selected = { row, col };
    }
  }
}

function keyPressed() {
  if (selected && key >= '1' && key <= '9') {
    let num = parseInt(key);
    board[selected.row][selected.col] = num;
  }
}

function isValidMove(row, col, num) {
  // 행 검사
  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== col && board[row][x] === num) return false;
  }
  
  // 열 검사
  for (let x = 0; x < GRID_SIZE; x++) {
    if (x !== row && board[x][col] === num) return false;
  }
  
  // 3x3 박스 검사
  let boxRow = floor(row / 3) * 3;
  let boxCol = floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (boxRow + i !== row && boxCol + j !== col && 
          board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

function validateBoard() {
  invalidCells = [];
  validCells = [];
  let isValid = true;
  let isBoardFull = true;
  
  // 모든 셀 검사
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === 0) {
        isBoardFull = false;
        continue;
      }
      
      // 임시로 현재 값 저장
      let currentValue = board[i][j];
      board[i][j] = 0;
      
      if (!isValidMove(i, j, currentValue)) {
        invalidCells.push({row: i, col: j});
        isValid = false;
      }
      
      // 값 복원
      board[i][j] = currentValue;
    }
  }
  
  highlightTimer = millis();
  
  if (isValid && isBoardFull) {
    // 모든 셀이 유효하고 보드가 가득 찼을 때
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        validCells.push({row: i, col: j});
      }
    }
    setTimeout(() => {
      alert("축하합니다! 퍼즐을 완성했습니다!");
    }, HIGHLIGHT_DURATION);
  }
}

function checkWin() {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] !== solution[i][j]) return false;
    }
  }
  return true;
}

// 화면 크기가 변경될 때 캔버스 크기도 조정
function windowResized() {
  const size = min(windowWidth, windowHeight) * 0.9;
  resizeCanvas(size, size);
  cellSize = width / GRID_SIZE;
}
