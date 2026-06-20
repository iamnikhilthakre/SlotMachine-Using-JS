/*----------------------CONSTANTS-------------------*/
const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const SYMBOL_VALUES = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
};

/*----------------------STATE-------------------*/
let balance = 0;

/*----------------------DOM ELEMENTS-------------------*/
const balanceDisplay = document.getElementById('balance');
const linesDisplay = document.getElementById('lines-display');
const betDisplay = document.getElementById('bet-display');
const messageEl = document.getElementById('message');

const depositGroup = document.getElementById('deposit-group');
const linesGroup = document.getElementById('lines-group');
const betGroup = document.getElementById('bet-group');
const depositBtnGroup = document.getElementById('deposit-btn-group');
const gameBtnGroup = document.getElementById('game-btn-group');

const depositInput = document.getElementById('deposit');
const linesInput = document.getElementById('lines');
const betInput = document.getElementById('bet');

const depositBtn = document.getElementById('deposit-btn');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');

/*----------------------FUNCTIONS-------------------*/
const showMessage = (text, type = 'info') => {
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 3000);
};

const updateDisplay = () => {
  balanceDisplay.textContent = `$${balance}`;
  linesDisplay.textContent = linesInput.value;
  const betVal = parseFloat(betInput.value) || 0;
  betDisplay.textContent = `$${betVal}`;
};

const spin = () => {
  const symbols = [];
  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) {
      symbols.push(symbol);
    }
  }

  const reels = [];
  for (let i = 0; i < COLS; i++) {
    reels.push([]);
    const reelSymbols = [...symbols];
    for (let j = 0; j < ROWS; j++) {
      const randomIndex = Math.floor(Math.random() * reelSymbols.length);
      const selectedSymbol = reelSymbols[randomIndex];
      reels[i].push(selectedSymbol);
      reelSymbols.splice(randomIndex, 1);
    }
  }

  return reels;
};

const transpose = (reels) => {
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    rows.push([]);
    for (let j = 0; j < COLS; j++) {
      rows[i].push(reels[j][i]);
    }
  }
  return rows;
};

const updateReels = (reels) => {
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const symbolEl = document.getElementById(`${col}-${row}`);
      const symbol = reels[col][row];
      symbolEl.textContent = symbol;
      symbolEl.className = `symbol ${symbol}`;
    }
  }
};

const getWinnings = (rows, bet, lines) => {
  let winnings = 0;
  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    let allSame = true;
    for (const symbol of symbols) {
      if (symbol != symbols[0]) {
        allSame = false;
        break;
      }
    }
    if (allSame) {
      winnings += bet * SYMBOL_VALUES[symbols[0]];
    }
  }
  return winnings;
};

const handleDeposit = () => {
  const amount = parseFloat(depositInput.value);
  if (isNaN(amount) || amount <= 0) {
    showMessage('Please enter a valid deposit amount!', 'lose');
    return;
  }
  balance = amount;
  updateDisplay();
  
  depositGroup.style.display = 'none';
  depositBtnGroup.style.display = 'none';
  linesGroup.style.display = 'flex';
  betGroup.style.display = 'flex';
  gameBtnGroup.style.display = 'flex';
  
  showMessage(`Successfully deposited $${amount}!`, 'win');
};

const handleSpin = () => {
  const lines = parseInt(linesInput.value);
  const bet = parseFloat(betInput.value);

  if (isNaN(lines) || lines < 1 || lines > 3) {
    showMessage('Please enter 1-3 lines!', 'lose');
    return;
  }

  if (isNaN(bet) || bet <= 0 || bet > balance / lines) {
    showMessage('Invalid bet amount!', 'lose');
    return;
  }

  balance -= bet * lines;
  updateDisplay();

  const reels = spin();
  updateReels(reels);
  const rows = transpose(reels);
  const winnings = getWinnings(rows, bet, lines);
  balance += winnings;
  updateDisplay();

  if (winnings > 0) {
    showMessage(`🎉 You won $${winnings}!`, 'win');
  } else {
    showMessage('Better luck next time!', 'info');
  }

  if (balance <= 0) {
    showMessage('You ran out of money! Click Reset to play again.', 'lose');
    spinBtn.disabled = true;
  }
};

const handleReset = () => {
  balance = 0;
  updateDisplay();
  spinBtn.disabled = false;
  
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const symbolEl = document.getElementById(`${col}-${row}`);
      symbolEl.textContent = '-';
      symbolEl.className = 'symbol';
    }
  }
  
  depositGroup.style.display = 'flex';
  depositBtnGroup.style.display = 'flex';
  linesGroup.style.display = 'none';
  betGroup.style.display = 'none';
  gameBtnGroup.style.display = 'none';
  
  depositInput.value = '';
  linesInput.value = '1';
  betInput.value = '';
  
  messageEl.classList.remove('show');
};

/*----------------------EVENT LISTENERS-------------------*/
depositBtn.addEventListener('click', handleDeposit);
spinBtn.addEventListener('click', handleSpin);
resetBtn.addEventListener('click', handleReset);

linesInput.addEventListener('input', updateDisplay);
betInput.addEventListener('input', updateDisplay);

updateDisplay();
