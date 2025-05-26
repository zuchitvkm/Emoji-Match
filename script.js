// Emoji themes
const THEMES = {
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🦄','🐔','🐧'],
  food: ['🍎','🍌','🍇','🍉','🍓','🍒','🍑','🍍','🥝','🍅','🥑','🍆','🥕','🌽','🍔','🍟','🍕','🍩'],
  flags: ['🇺🇸','🇬🇧','🇨🇦','🇫🇷','🇩🇪','🇯🇵','🇰🇷','🇮🇳','🇧🇷','🇦🇺','🇮🇹','🇪🇸','🇷🇺','🇲🇽','🇨🇳','🇿🇦','🇸🇪','🇳🇴']
};
const DIFFICULTY = {
  easy: 4,
  medium: 6
};
let gridSize = DIFFICULTY.easy;
let themeName = 'animals';
let theme = THEMES[themeName];
let cards = [];
let flipped = [];
let matched = [];
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

const grid = document.getElementById('card-grid');
const movesSpan = document.getElementById('moves');
const timerSpan = document.getElementById('timer');
const winMessage = document.getElementById('win-message');
const restartBtn = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');
const themeSpan = document.getElementById('theme');

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickTheme() {
  const keys = Object.keys(THEMES);
  themeName = keys[Math.floor(Math.random() * keys.length)];
  theme = THEMES[themeName];
  themeSpan.textContent = `Theme: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`;
}

function setupGrid() {
  grid.innerHTML = '';
  matched = [];
  flipped = [];
  moves = 0;
  movesSpan.textContent = moves;
  winMessage.classList.add('hidden');
  pickTheme();
  const numPairs = (gridSize * gridSize) / 2;
  let emojis = shuffle(theme.slice(0, numPairs).concat(theme.slice(0, numPairs)));
  cards = emojis.map((emoji, idx) => ({ id: idx, emoji, matched: false }));
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  for (let i = 0; i < cards.length; i++) {
    const card = document.createElement('button');
    card.className = 'card';
    card.dataset.id = i;
    card.type = 'button'; // Ensure it behaves as a button
    card.innerHTML = `<span class="emoji">${cards[i].emoji}</span>`;
    card.addEventListener('click', onCardClick);
    grid.appendChild(card);
  }
}

function onCardClick(e) {
  if (!gameStarted) startTimer();
  const cardEl = e.currentTarget;
  const id = +cardEl.dataset.id;
  if (flipped.length === 2 || cards[id].matched || flipped.includes(id)) return;
  cardEl.classList.add('flipped');
  flipped.push(id);
  if (flipped.length === 2) {
    moves++;
    movesSpan.textContent = moves;
    const [id1, id2] = flipped;
    if (cards[id1].emoji === cards[id2].emoji) {
      cards[id1].matched = cards[id2].matched = true;
      document.querySelector(`[data-id='${id1}']`).classList.add('matched');
      document.querySelector(`[data-id='${id2}']`).classList.add('matched');
      matched.push(id1, id2);
      flipped = [];
      if (matched.length === cards.length) {
        endGame();
      }
    } else {
      setTimeout(() => {
        document.querySelector(`[data-id='${id1}']`).classList.remove('flipped');
        document.querySelector(`[data-id='${id2}']`).classList.remove('flipped');
        flipped = [];
      }, 800);
    }
  }
}

function startTimer() {
  gameStarted = true;
  timer = 0;
  timerSpan.textContent = '0:00';
  timerInterval = setInterval(() => {
    timer++;
    const min = Math.floor(timer / 60);
    const sec = timer % 60;
    timerSpan.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  winMessage.classList.remove('hidden');
  gameStarted = false;
}

function restartGame() {
  clearInterval(timerInterval);
  timer = 0;
  timerSpan.textContent = '0:00';
  gameStarted = false;
  setupGrid();
}

difficultySelect.addEventListener('change', (e) => {
  gridSize = DIFFICULTY[e.target.value];
  restartGame();
});
restartBtn.addEventListener('click', restartGame);

// Initial setup
setupGrid();
