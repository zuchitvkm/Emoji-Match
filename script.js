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
    card.type = 'button';
    card.innerHTML = `<span class="emoji">${cards[i].emoji}</span>`;
    card.addEventListener('click', onCardClick);
    grid.appendChild(card);
  }
}

const FLIP_ANIMATION_DURATION_MS = 700;
let animating = false;
let matchSound = null;

function playMatchSound() {
  if (!matchSound) {
    matchSound = new Audio('https://cdn.jsdelivr.net/gh/saintplay/audio@main/ding.mp3');
  }
  matchSound.currentTime = 0;
  matchSound.play();
}

function showConfettiBurst(x, y, emoji = '🎉') {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  document.body.appendChild(confetti);
  for (let i = 0; i < 12; i++) {
    const span = document.createElement('span');
    span.className = 'confetti-emoji';
    span.textContent = emoji;
    const angle = (Math.PI * 2 * i) / 12;
    const radius = 120 + Math.random() * 40;
    span.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
    span.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
    confetti.appendChild(span);
  }
  confetti.style.left = `${x}px`;
  confetti.style.top = `${y}px`;
  setTimeout(() => confetti.remove(), 1200);
}

function onCardClick(e) {
  if (animating) return;
  if (!gameStarted) startTimer();
  const cardEl = e.currentTarget;
  const id = +cardEl.dataset.id;
  if (flipped.length === 2 || cards[id].matched || flipped.includes(id)) return;
  cardEl.classList.add('flipping');
  animating = true;
  setTimeout(() => {
    cardEl.classList.remove('flipping');
    cardEl.classList.add('flipped');
    flipped.push(id);
    animating = false;
    if (flipped.length === 2) {
      moves++;
      movesSpan.textContent = moves;
      const [id1, id2] = flipped;
      if (cards[id1].emoji === cards[id2].emoji) {
        cards[id1].matched = cards[id2].matched = true;
        document.querySelector(`[data-id='${id1}']`).classList.add('matched');
        document.querySelector(`[data-id='${id2}']`).classList.add('matched');
        matched.push(id1, id2);
        // Celebration effect
        const rect1 = document.querySelector(`[data-id='${id1}']`).getBoundingClientRect();
        const rect2 = document.querySelector(`[data-id='${id2}']`).getBoundingClientRect();
        showConfettiBurst((rect1.left+rect1.right)/2, (rect1.top+rect1.bottom)/2, cards[id1].emoji);
        showConfettiBurst((rect2.left+rect2.right)/2, (rect2.top+rect2.bottom)/2, cards[id2].emoji);
        playMatchSound();
        flipped = [];
        if (matched.length === cards.length) {
          setTimeout(endGame, 800);
        }
      } else {
        animating = true;
        setTimeout(() => {
          document.querySelector(`[data-id='${id1}']`).classList.remove('flipped');
          document.querySelector(`[data-id='${id2}']`).classList.remove('flipped');
          flipped = [];
          animating = false;
        }, FLIP_ANIMATION_DURATION_MS);
      }
    }
  }, 180);
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
  // Celebration for win
  const gridRect = grid.getBoundingClientRect();
  showConfettiBurst((gridRect.left+gridRect.right)/2, gridRect.top+40, '🎉');
  playMatchSound();
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
