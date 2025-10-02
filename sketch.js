let board = [];
let solution = [];
let selected = null;
let cellSize;
let invalidCells = [];
let validCells = [];
let highlightTimer = 0;
const GRID_SIZE = 9;
const CELL_PADDING = 2;
const HIGHLIGHT_DURATION = 3000; // 3초

// 체크 버튼 관련 변수
let checkButton = {
  x: 0,
  y: 0,
  width: 100,
  height: 30,
  isPressed: false
};

// 가상 키보드 관련 변수
let keyboardButtons = [];
let KEYBOARD_ROWS = 2;
let KEYBOARD_COLS = 5;
let keyboardCellSize;

function setup() {
  // 화면 방향 확인
  const isLandscape = windowWidth > windowHeight;
  
  // 기본 크기 계산
  const baseSize = min(windowWidth * 0.9, windowHeight * 0.9);
  let canvasWidth, canvasHeight;
  
  if (isLandscape) {
    // 가로 모드
    const keyboardWidth = baseSize * 0.2; // 키보드 너비
    canvasWidth = baseSize;
    canvasHeight = baseSize;
    
    // 키보드 설정 변경
    KEYBOARD_ROWS = 5;
    KEYBOARD_COLS = 2;
    keyboardCellSize = min(keyboardWidth / KEYBOARD_COLS, (baseSize * 0.8) / KEYBOARD_ROWS);
  } else {
    // 세로 모드
    const keyboardHeight = baseSize * 0.3;
    canvasWidth = baseSize;
    canvasHeight = baseSize + keyboardHeight + 50; // 50은 버튼 영역
    
    // 키보드 설정 변경
    KEYBOARD_ROWS = 2;
    KEYBOARD_COLS = 5;
    keyboardCellSize = min(baseSize / KEYBOARD_COLS, keyboardHeight / KEYBOARD_ROWS);
  }
  
  createCanvas(canvasWidth, canvasHeight);
  
  // 초기 게임 보드 생성
  initializeGame();
  
  // 셀 크기 계산 (스도쿠 보드용)
  cellSize = min((isLandscape ? baseSize * 0.75 : baseSize) / GRID_SIZE);
  
  // 체크 버튼 위치 설정
  checkButton.width = min(120, baseSize * 0.3);
  checkButton.height = 40;
  checkButton.x = (isLandscape ? baseSize * 0.3 : baseSize/2) - checkButton.width/2;
  checkButton.y = 5;
  
  // 가상 키보드 초기화
  initializeKeyboard();
}

function draw() {
  background(255);
  drawGrid();
  drawNumbers();
  drawKeyboard();
  drawCheckButton();
  
  if (selected !== null) {
    highlightSelected();
  }
  
  // 유효하지 않은 셀 표시
  if (invalidCells.length > 0 && millis() - highlightTimer < HIGHLIGHT_DURATION) {
    noStroke();
    fill(255, 0, 0, 100);
    for (let cell of invalidCells) {
      rect(cell.col * cellSize, 40 + cell.row * cellSize, cellSize, cellSize);
    }
  }
  
  // 모든 셀이 유효할 때 녹색 표시
  if (validCells.length > 0 && millis() - highlightTimer < HIGHLIGHT_DURATION) {
    noStroke();
    fill(0, 255, 0, 100);
    for (let cell of validCells) {
      rect(cell.col * cellSize, 40 + cell.row * cellSize, cellSize, cellSize);
    }
  }
}

function initializeKeyboard() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]; // 0은 지우기 기능
  let index = 0;
  
  for (let row = 0; row < KEYBOARD_ROWS; row++) {
    keyboardButtons[row] = [];
    for (let col = 0; col < KEYBOARD_COLS; col++) {
      if (index < numbers.length) {
        keyboardButtons[row][col] = numbers[index];
        index++;
      }
    }
  }
}

function drawKeyboard() {
  const boardY = 40; // CHECK 버튼 아래 공간
  const keyboardY = boardY + (GRID_SIZE * cellSize) + 20; // 스도쿠 보드 아래 여백
  const startX = (width - (KEYBOARD_COLS * keyboardCellSize)) / 2;
  
  // 키보드 배경
  fill(240);
  noStroke();
  rect(0, keyboardY - 10, width, (KEYBOARD_ROWS * keyboardCellSize) + 20, 10);
  
  for (let row = 0; row < KEYBOARD_ROWS; row++) {
    for (let col = 0; col < KEYBOARD_COLS; col++) {
      if (keyboardButtons[row][col] !== undefined) {
        const x = startX + (col * keyboardCellSize);
        const y = keyboardY + (row * keyboardCellSize);
        
        // 키 배경
        stroke(0);
        fill(255);
        rect(x, y, keyboardCellSize, keyboardCellSize, 5);
        
        // 키 텍스트
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(keyboardCellSize * 0.5);
        const number = keyboardButtons[row][col];
        text(number === 0 ? "←" : number, x + keyboardCellSize/2, y + keyboardCellSize/2);
      }
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
  const boardY = checkButton.height + 15; // CHECK 버튼 아래 공간 증가
  
  stroke(0);
  strokeWeight(1);
  
  // 스도쿠 보드 영역 이동
  push();
  translate(0, boardY);
  
  // 모든 셀 그리기
  for (let i = 0; i <= GRID_SIZE; i++) {
    // 굵은 선 (3x3 박스 구분)
    strokeWeight(i % 3 === 0 ? 3 : 1);
    
    // 수직선
    line(i * cellSize, 0, i * cellSize, GRID_SIZE * cellSize);
    // 수평선
    line(0, i * cellSize, width, i * cellSize);
  }
  
  pop();
}

function drawNumbers() {
  const boardY = checkButton.height + 15; // CHECK 버튼 아래 공간 증가
  
  textAlign(CENTER, CENTER);
  textSize(cellSize * 0.5);
  
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] !== 0) {
        fill(0);
        text(board[i][j], j * cellSize + cellSize/2, boardY + i * cellSize + cellSize/2);
      }
    }
  }
}

function highlightSelected() {
  const boardY = checkButton.height + 15; // CHECK 버튼 아래 공간 증가
  
  noStroke();
  fill(200, 200, 255, 100);
  rect(selected.col * cellSize, boardY + selected.row * cellSize, cellSize, cellSize);
}

function mousePressed() {
  handleInput(mouseX, mouseY);
}

function mouseReleased() {
  handleCheckButtonRelease(mouseX, mouseY);
}

function touchStarted() {
  if (touches.length > 0) {
    handleInput(touches[0].x, touches[0].y);
  }
  return false; // 기본 동작 방지
}

function touchEnded() {
  if (touches.length > 0) {
    handleCheckButtonRelease(touches[0].x, touches[0].y);
  } else {
    // 터치가 끝난 위치에서 처리
    handleCheckButtonRelease(mouseX, mouseY);
  }
  return false; // 기본 동작 방지
}

function drawCheckButton() {
  push();
  // 버튼 그림자
  noStroke();
  fill(0, 0, 0, 20);
  rect(checkButton.x + 2, checkButton.y + 2, checkButton.width, checkButton.height, 8);
  
  // 버튼 배경
  if (checkButton.isPressed) {
    fill(150, 170, 255);
  } else {
    fill(170, 190, 255);
  }
  stroke(100, 120, 255);
  strokeWeight(2);
  rect(checkButton.x, checkButton.y, checkButton.width, checkButton.height, 8);
  
  // 버튼 텍스트
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(20, checkButton.height * 0.6));
  text('CHECK', checkButton.x + checkButton.width/2, checkButton.y + checkButton.height/2);
  pop();
}

function handleCheckButtonPress(x, y) {
  if (x >= checkButton.x && x <= checkButton.x + checkButton.width &&
      y >= checkButton.y && y <= checkButton.y + checkButton.height) {
    checkButton.isPressed = true;
    return true;
  }
  return false;
}

function handleCheckButtonRelease(x, y) {
  if (checkButton.isPressed &&
      x >= checkButton.x && x <= checkButton.x + checkButton.width &&
      y >= checkButton.y && y <= checkButton.y + checkButton.height) {
    validateBoard();
  }
  checkButton.isPressed = false;
}

function handleInput(x, y) {
  // 체크 버튼 클릭 처리
  if (handleCheckButtonPress(x, y)) {
    return;
  }

  const boardY = checkButton.height + 15; // CHECK 버튼 아래 공간 증가
  
  // 스도쿠 보드 클릭 처리
  if (y >= boardY && y < boardY + (cellSize * GRID_SIZE)) {
    const row = floor((y - boardY) / cellSize);
    const col = floor(x / cellSize);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      if (selected && selected.row === row && selected.col === col) {
        selected = null;
      } else {
        selected = { row, col };
      }
    }
  }
  
  // 가상 키보드 클릭 처리
  const keyboardY = boardY + (GRID_SIZE * cellSize) + 20;
  const startX = (width - (KEYBOARD_COLS * keyboardCellSize)) / 2;
  
  if (y >= keyboardY && y < keyboardY + (KEYBOARD_ROWS * keyboardCellSize)) {
    const row = floor((y - keyboardY) / keyboardCellSize);
    const col = floor((x - startX) / keyboardCellSize);
    
    if (row >= 0 && row < KEYBOARD_ROWS && col >= 0 && col < KEYBOARD_COLS) {
      if (selected !== null && keyboardButtons[row][col] !== undefined) {
        const number = keyboardButtons[row][col];
        if (number === 0) {
          // 지우기 기능
          board[selected.row][selected.col] = 0;
        } else {
          board[selected.row][selected.col] = number;
        }
      }
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
