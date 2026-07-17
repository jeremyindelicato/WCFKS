const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const previewCanvas = document.querySelector("#previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const W = 1280;
const H = 760;
const PREVIEW_W = 720;
const PREVIEW_H = 720;

const els = {
  menuScreen: document.querySelector("#menuScreen"),
  selectionScreen: document.querySelector("#selectionScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  creditsScreen: document.querySelector("#creditsScreen"),
  endScreen: document.querySelector("#endScreen"),
  playButton: document.querySelector("#playButton"),
  creditsButton: document.querySelector("#creditsButton"),
  backToMenu: document.querySelector("#backToMenu"),
  backToMenuFromSelection: document.querySelector("#backToMenuFromSelection"),
  backToMenuFromEnd: document.querySelector("#backToMenuFromEnd"),
  restartGame: document.querySelector("#restartGame"),
  cards: document.querySelector("#playerCards"),
  selectionName: document.querySelector("#selectionName"),
  selectionCountry: document.querySelector("#selectionCountry"),
  selectionFlag: document.querySelector("#selectionFlag"),
  selectionTagline: document.querySelector("#selectionTagline"),
  selectionMove: document.querySelector("#selectionMove"),
  selectionPower: document.querySelector("#selectionPower"),
  selectionCurve: document.querySelector("#selectionCurve"),
  selectionComposure: document.querySelector("#selectionComposure"),
  selectionPowerBar: document.querySelector("#selectionPowerBar"),
  selectionCurveBar: document.querySelector("#selectionCurveBar"),
  selectionComposureBar: document.querySelector("#selectionComposureBar"),
  playerNameInput: document.querySelector("#playerNameInput"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  attempts: document.querySelector("#attempts"),
  timer: document.querySelector("#timer"),
  comboDisplay: document.querySelector("#comboDisplay"),
  comboValue: document.querySelector("#comboValue"),
  specialGaugeFill: document.querySelector("#specialGaugeFill"),
  specialUsageText: document.querySelector("#specialUsageText"),
  timingGauge: document.querySelector("#timingGauge"),
  gaugeNeedle: document.querySelector("#gaugeNeedle"),
  gaugeType: document.querySelector("#gaugeType"),
  gaugeValue: document.querySelector("#gaugeValue"),
  shoot: document.querySelector("#shoot"),
  reset: document.querySelector("#reset"),
  random: document.querySelector("#randomPlayer"),
  mobileShoot: document.querySelector("#mobileShoot"),
  enterGame: document.querySelector("#enterGame"),
  changePlayer: document.querySelector("#changePlayer"),
  goalPopup: document.querySelector("#goalPopup"),
  goalPopupMove: document.querySelector("#goalPopupMove"),
  soClosePopup: document.querySelector("#soClosePopup"),
  endPlayerName: document.querySelector("#endPlayerName"),
  endScore: document.querySelector("#endScore"),
  endGoals: document.querySelector("#endGoals"),
  endAccuracy: document.querySelector("#endAccuracy"),
  endMaxCombo: document.querySelector("#endMaxCombo"),
  endSoClose: document.querySelector("#endSoClose"),
  endSpecialUsed: document.querySelector("#endSpecialUsed"),
  countdownDisplay: document.querySelector("#countdownDisplay"),
  countdownValue: document.querySelector("#countdownValue"),
  postMessage: document.querySelector("#postMessage"),
  muteButton: document.querySelector("#muteButton"),
  gaugePerfectMarker: document.querySelector(".gauge-marker-perfect"),
};

const scene = {
  vanishingX: 610,
  goalLineY: 404,
  wallX: 650,
  wallFootY: 500,
};
const goal = { x: 520, y: 232, w: 390, h: 158 };
const spot = { x: 690, y: 628 };
const target = { x: goal.x + 48, y: goal.y + 62 };
const aimBounds = {
  left: goal.x - goal.w / 2 - 180,
  right: goal.x + goal.w / 2 + 180,
  top: goal.y - 70,
  bottom: goal.y + goal.h + 75,
};
const keys = new Set();
const SELECTION_FRAME = {
  ronaldo: 6,
  messi: 6,
  mbappe: 6,
  vinicius: 6,
  yamal: 6,
  salah: 6,
};

function configureCanvasQuality() {
  const deviceScale = window.devicePixelRatio || 1;
  const gameScale = clamp(deviceScale, 1.25, 1.5);
  const previewScale = clamp(deviceScale, 1.5, 2);

  canvas.width = Math.round(W * gameScale);
  canvas.height = Math.round(H * gameScale);
  ctx.setTransform(gameScale, 0, 0, gameScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  previewCanvas.width = Math.round(PREVIEW_W * previewScale);
  previewCanvas.height = Math.round(PREVIEW_H * previewScale);
  previewCtx.setTransform(previewScale, 0, 0, previewScale, 0, 0);
  previewCtx.imageSmoothingEnabled = true;
  previewCtx.imageSmoothingQuality = "high";
}

const PLAYERS = [
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    code: "POR",
    country: "Portugal",
    flag: "assets/flag/Portugal.png",
    short: "Cristiano Ronaldo",
    tagline: "Puissance brute, trajectoire imprévisible.",
    main: "#b9152c",
    second: "#0a7f4f",
    trim: "#f5d36b",
    hair: "#191919",
    skin: "#d8a474",
    pattern: "slash",
    stats: { power: 96, curve: 86, composure: 94, keeperFear: 0.18 },
    signature: "Fúria de Madeira",
  },
  {
    id: "messi",
    name: "Lionel Messi",
    code: "ARG",
    country: "Argentine",
    flag: "assets/flag/argentina.png",
    short: "Lionel Messi",
    tagline: "Précision chirurgicale, courbe parfaite.",
    main: "#9eddff",
    second: "#f8fbff",
    trim: "#1f2a48",
    hair: "#4b2b1f",
    skin: "#d8aa7c",
    pattern: "stripes",
    stats: { power: 86, curve: 96, composure: 91, keeperFear: 0.12 },
    signature: "Courbe Silencieuse",
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    code: "FRA",
    country: "France",
    flag: "assets/flag/france.png",
    short: "Kylian Mbappé",
    tagline: "Vitesse d'exécution, effet de surprise.",
    main: "#243d86",
    second: "#f5f7ff",
    trim: "#df3345",
    hair: "#111111",
    skin: "#8c5a3f",
    pattern: "pin",
    stats: { power: 90, curve: 86, composure: 90, keeperFear: 0.16 },
    signature: "Pas content ?",
  },
  {
    id: "vinicius",
    name: "Vinicius Jr",
    code: "BRA",
    country: "Brésil",
    flag: "assets/flag/Brasil.png",
    short: "Vinicius JR.",
    tagline: "Feinte de hanche, coup du foulard.",
    main: "#f3d638",
    second: "#1f8d48",
    trim: "#173b8f",
    hair: "#101010",
    skin: "#7b4a31",
    pattern: "chevron",
    stats: { power: 86, curve: 87, composure: 88, keeperFear: 0.14 },
    signature: "Tir Samba",
  },
  {
    id: "yamal",
    name: "Lamine Yamal",
    code: "ESP",
    country: "Espagne",
    flag: "assets/flag/Spain.png",
    short: "Lamine Yamal",
    tagline: "Insouciance juvénile, audace créative.",
    main: "#c81e32",
    second: "#f2cf45",
    trim: "#263f85",
    hair: "#161616",
    skin: "#9a6444",
    pattern: "waves",
    stats: { power: 84, curve: 92, composure: 91, keeperFear: 0.11 },
    signature: "Llama de La Masia",
  },
  {
    id: "salah",
    name: "Mohamed Salah",
    code: "EGY",
    country: "Égypte",
    flag: "assets/flag/Egypt.png",
    short: "Mohamed Salah",
    tagline: "Effet enveloppant, piqué de faucon.",
    main: "#c51f2d",
    second: "#ffffff",
    trim: "#111111",
    hair: "#1b1410",
    skin: "#9c6848",
    pattern: "bands",
    stats: { power: 84, curve: 94, composure: 85, keeperFear: 0.13 },
    signature: "Frappe Pharaonique",
  },
];

const ballFrames = Array.from({ length: 8 }, (_, index) => {
  const image = new Image();
  image.src = `assets/ball/frames/ball-${String(index + 1).padStart(2, "0")}.png`;
  return image;
});

const playerFrames = Object.create(null);
const playerBackFrames = Object.create(null);
const playerLeftBackFrames = Object.create(null);
const selectionCelebrations = Object.fromEntries(
  ["ronaldo", "messi", "mbappe", "vinicius", "salah"].map((id) => {
    const image = new Image();
    image.decoding = "async";
    image.src = `assets/players/${id}/selection-celebration.png?v=1`;
    return [id, image];
  }),
);

function loadFrameSet(id, type = "front") {
  const folder = type === "leftBack" ? "left-back-frames" : type === "back" ? "back-frames" : "frames";
  const prefix = type === "leftBack" ? `${id}-left-back` : type === "back" ? `${id}-back` : id;
  return Array.from({ length: 8 }, (_, index) => {
    const image = new Image();
    image.decoding = "async";
    image.src = `assets/players/${id}/${folder}/${prefix}-${String(index + 1).padStart(2, "0")}.png`;
    return image;
  });
}

function ensurePlayerFrames(id) {
  if (!playerFrames[id]) playerFrames[id] = loadFrameSet(id);
  if (!playerBackFrames[id]) playerBackFrames[id] = loadFrameSet(id, "back");
  if (isLeftFooted(id) && !playerLeftBackFrames[id]) playerLeftBackFrames[id] = loadFrameSet(id, "leftBack");
}

const keeperFrames = Array.from({ length: 8 }, (_, index) => {
  const image = new Image();
  image.src = `assets/keepers/courtois/frames/courtois-${String(index + 1).padStart(2, "0")}.png`;
  return image;
});

const stadiumImage = new Image();
stadiumImage.src = "assets/stadium/wlc-stadium-day.png?v=1";

const goalImage = new Image();
goalImage.src = "assets/goal/wlc-goal.png?v=1";

const wallImages = {
  idle: new Image(),
  jump: new Image(),
};
wallImages.idle.src = "assets/wall/wall-idle.png?v=2";
wallImages.jump.src = "assets/wall/wall-jump.png?v=2";

const playerSongs = {
  ronaldo: new Audio("assets/sound/ronaldo-song.mp3"),
  messi: new Audio("assets/sound/messi-song.mp3"),
  mbappe: new Audio("assets/sound/mbappe-song.mp3"),
  vinicius: new Audio("assets/sound/vinicius-song.mp3"),
  yamal: new Audio("assets/sound/yamal-song.mp3"),
  salah: new Audio("assets/sound/salah-song.mp3"),
};

// Configuration des audios en boucle
Object.values(playerSongs).forEach(audio => {
  audio.loop = true;
  audio.volume = 0.3;
});

const whistleSound = new Audio("assets/sound/referee-whistle.mp3");
whistleSound.volume = 0.5;

const ballKickLow = new Audio("assets/sound/ball-kick-low.mp3");
ballKickLow.volume = 0.6;

const ballKickHigh = new Audio("assets/sound/ball-kick-high.mp3");
ballKickHigh.volume = 0.6;

const poteauSound = new Audio("assets/sound/poteau.mp3");
poteauSound.volume = 0.7;

let currentPlayingSong = null;
let isMusicMuted = false;

const state = {
  selected: 0,
  screen: "menu",
  playerName: "",
  score: 0,
  streak: 0,
  attempts: 0,
  phase: "aim",
  ball: null,
  keeper: { x: goal.x, y: goal.y + goal.h - 14, diveX: 0, reaction: 0 },
  meter: { value: 0, direction: 1, power: null, curve: null },
  inputLockUntil: 0,
  specialMoveAvailable: false,
  specialMoveUsed: false,
  specialGauge: 0,
  specialUsageCount: 0,
  maxSpecialUsage: 2,
  combo: 0,
  maxCombo: 0,
  consecutiveGoals: 0,
  totalGoals: 0,
  totalShots: 0,
  perfectShots: 0,
  soCloseCount: 0,
  gameTime: 180,
  gameStartTime: null,
  gameTimeRemaining: 180,
  countdownActive: false,
  aimTime: 0,
  wallJump: 0,
  shake: 0,
  flash: 0,
  message: "Vise la lucarne et déclenche le tir",
  particles: [],
  last: performance.now(),
  comboFlash: 0,
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  const value = clamp(t, 0, 1);
  return value * value * (3 - 2 * value);
}

function player() {
  return PLAYERS[state.selected];
}

function isLeftFooted(id = player().id) {
  return id === "messi" || id === "yamal" || id === "salah";
}

function buildCards() {
  els.cards.innerHTML = "";
  PLAYERS.forEach((p, index) => {
    const card = document.createElement("button");
    card.className = "player-card";
    card.type = "button";
    card.setAttribute("aria-label", `${p.name}, ${p.country}`);
    card.innerHTML = `
      <span class="avatar">
        <img src="assets/players/${p.id}/frames/${p.id}-01.png" alt="" />
      </span>
      <span class="card-flag"><img src="${p.flag}" alt="${p.country}" /></span>
      <strong>${p.short}</strong>
    `;
    card.addEventListener("click", () => selectPlayer(index));
    els.cards.append(card);
  });
}

function handlePlayerMusic(playerId) {
  // Arrêter la musique actuelle si elle existe
  if (currentPlayingSong) {
    currentPlayingSong.pause();
    currentPlayingSong.currentTime = 0;
    currentPlayingSong = null;
  }

  // Démarrer la musique du joueur si elle existe et que le son n'est pas coupé
  if (playerSongs[playerId] && !isMusicMuted) {
    currentPlayingSong = playerSongs[playerId];
    currentPlayingSong.play().catch(e => {
      console.warn("Autoplay bloqué:", e);
    });
  }
}

function toggleMute() {
  isMusicMuted = !isMusicMuted;

  // Mettre à jour l'icône du bouton
  const muteIcon = els.muteButton.querySelector(".mute-icon");
  muteIcon.textContent = isMusicMuted ? "🔇" : "🔊";
  els.muteButton.classList.toggle("muted", isMusicMuted);

  // Arrêter la musique si on mute
  if (isMusicMuted && currentPlayingSong) {
    currentPlayingSong.pause();
    currentPlayingSong.currentTime = 0;
    currentPlayingSong = null;
  }
  // Relancer la musique si on démute
  else if (!isMusicMuted && state.screen === "selection") {
    const p = player();
    handlePlayerMusic(p.id);
  }
}

function selectPlayer(index) {
  state.selected = index;
  const p = player();
  ensurePlayerFrames(p.id);
  els.selectionName.textContent = p.name;
  els.selectionCountry.textContent = p.code;
  els.selectionFlag.src = p.flag;
  els.selectionFlag.alt = p.country;
  els.selectionTagline.textContent = p.tagline;
  els.selectionMove.textContent = p.signature;
  els.selectionPower.textContent = p.stats.power;
  els.selectionCurve.textContent = p.stats.curve;
  els.selectionComposure.textContent = p.stats.composure;
  els.selectionPowerBar.value = p.stats.power;
  els.selectionCurveBar.value = p.stats.curve;
  els.selectionComposureBar.value = p.stats.composure;
  [...els.cards.children].forEach((card, i) => card.classList.toggle("active", i === index));
  state.message = `${p.signature} prêt`;

  // Gérer la musique du joueur
  handlePlayerMusic(p.id);
}

function showMenu() {
  state.screen = "menu";
  els.menuScreen.classList.remove("is-hidden");
  els.selectionScreen.classList.add("is-hidden");
  els.gameScreen.classList.add("is-hidden");
  els.creditsScreen.classList.add("is-hidden");

  // Arrêter la musique lors du retour au menu
  if (currentPlayingSong) {
    currentPlayingSong.pause();
    currentPlayingSong.currentTime = 0;
    currentPlayingSong = null;
  }
}

function showSelection() {
  state.screen = "selection";
  els.menuScreen.classList.add("is-hidden");
  els.selectionScreen.classList.remove("is-hidden");
  els.gameScreen.classList.add("is-hidden");
  els.creditsScreen.classList.add("is-hidden");
}

function startCountdown() {
  state.countdownActive = true;
  let count = 3;
  els.countdownValue.textContent = count;
  els.countdownDisplay.style.opacity = "1";

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      els.countdownValue.textContent = count;
    } else if (count === 0) {
      els.countdownValue.textContent = "GO!";
      // Jouer le son du sifflet
      whistleSound.currentTime = 0;
      whistleSound.play().catch(e => {
        console.warn("Whistle sound blocked:", e);
      });
    } else {
      clearInterval(countdownInterval);
      els.countdownDisplay.style.opacity = "0";
      state.countdownActive = false;
      startGameTimer();
    }
  }, 1000);
}

function showGame() {
  const playerName = els.playerNameInput.value.trim();
  state.playerName = playerName || "Joueur";

  try {
    localStorage.setItem("wcfks_playerName", state.playerName);
  } catch (e) {
    console.warn("LocalStorage not available:", e);
  }

  state.screen = "game";
  els.menuScreen.classList.add("is-hidden");
  els.selectionScreen.classList.add("is-hidden");
  els.gameScreen.classList.remove("is-hidden");
  els.creditsScreen.classList.add("is-hidden");
  els.endScreen.classList.add("is-hidden");

  // Arrêter la musique lors de l'entrée en jeu
  if (currentPlayingSong) {
    currentPlayingSong.pause();
    currentPlayingSong.currentTime = 0;
    currentPlayingSong = null;
  }

  resetSeries();
  startCountdown();
}

function startGameTimer() {
  state.gameStartTime = performance.now();
  state.gameTimeRemaining = state.gameTime;
}

function showCredits() {
  state.screen = "credits";
  els.menuScreen.classList.add("is-hidden");
  els.selectionScreen.classList.add("is-hidden");
  els.gameScreen.classList.add("is-hidden");
  els.creditsScreen.classList.remove("is-hidden");
  els.endScreen.classList.add("is-hidden");
}

function showEndScreen() {
  state.screen = "end";
  els.menuScreen.classList.add("is-hidden");
  els.selectionScreen.classList.add("is-hidden");
  els.gameScreen.classList.add("is-hidden");
  els.creditsScreen.classList.add("is-hidden");
  els.endScreen.classList.remove("is-hidden");

  // Remplir les statistiques
  els.endPlayerName.textContent = state.playerName || "Joueur";
  els.endScore.textContent = state.score;
  els.endGoals.textContent = state.totalGoals;
  const accuracy = state.totalShots > 0 ? Math.round((state.totalGoals / state.totalShots) * 100) : 0;
  els.endAccuracy.textContent = `${accuracy}%`;
  els.endMaxCombo.textContent = `x${state.maxCombo}`;
  els.endSoClose.textContent = state.soCloseCount;
  els.endSpecialUsed.textContent = state.specialUsageCount;
}

function resetSeries() {
  state.score = 0;
  state.streak = 0;
  state.attempts = 0;
  state.phase = "aim";
  state.ball = null;
  state.specialMoveAvailable = false;
  state.specialMoveUsed = false;
  state.specialGauge = 0;
  state.specialUsageCount = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.consecutiveGoals = 0;
  state.totalGoals = 0;
  state.totalShots = 0;
  state.perfectShots = 0;
  state.soCloseCount = 0;
  state.gameStartTime = null;
  state.gameTimeRemaining = state.gameTime;
  resetShotSequence();
  state.message = "3 minutes pour marquer un maximum !";
  state.particles = [];
  els.goalPopup.classList.remove("show");
  if (els.soClosePopup) els.soClosePopup.classList.remove("show");
  updateHud();
}

function resetShotSequence() {
  state.meter.value = 0;
  state.meter.direction = 1;
  state.meter.power = null;
  state.meter.curve = null;
  els.timingGauge.dataset.stage = "hidden";
  els.timingGauge.style.setProperty("--meter-position", "0");
  els.gaugeType.textContent = "Puissance";
  els.gaugeValue.textContent = "--";
  els.shoot.textContent = "Démarrer";
  els.mobileShoot.textContent = "Action";

  // Randomiser la position du marqueur parfait (jaune)
  // Position aléatoire entre 20% et 50% (laisse de la place pour la largeur du marqueur)
  const randomPosition = 20 + Math.random() * 30;
  if (els.gaugePerfectMarker) {
    els.gaugePerfectMarker.style.left = `${randomPosition}%`;
  }
}

function updateHud() {
  els.score.textContent = state.score;
  els.streak.textContent = state.totalGoals;
  els.attempts.textContent = state.attempts;

  // Mise à jour du timer
  const minutes = Math.floor(state.gameTimeRemaining / 60);
  const seconds = Math.floor(state.gameTimeRemaining % 60);
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (els.timer) {
    els.timer.textContent = timeText;

    // Alerte visuelle quand il reste moins de 30 secondes
    const timerContainer = els.timer.closest('.score-item');
    if (timerContainer) {
      if (state.gameTimeRemaining <= 30 && state.gameTimeRemaining > 0) {
        timerContainer.classList.add('timer-warning');
      } else {
        timerContainer.classList.remove('timer-warning');
      }
    }
  }

  // Mise à jour du combo
  const comboText = state.combo > 0 ? `x${state.combo}` : "x1";
  els.comboValue.textContent = comboText;
  els.comboDisplay.dataset.combo = state.combo;

  // Mise à jour de la jauge spéciale
  els.specialGaugeFill.style.width = `${state.specialGauge}%`;
  els.specialUsageText.textContent = `${state.specialUsageCount}/${state.maxSpecialUsage}`;

  // Gestion du statut de la jauge spéciale
  const gaugeContainer = document.querySelector("#specialGaugeContainer");
  if (state.specialMoveAvailable) {
    gaugeContainer.classList.add("ready");
  } else {
    gaugeContainer.classList.remove("ready");
  }
}

function showGoalPopup(signature) {
  els.goalPopupMove.textContent = signature;
  els.goalPopup.classList.remove("show");
  void els.goalPopup.offsetWidth;
  els.goalPopup.classList.add("show");
}

function showSoClosePopup() {
  const soClosePopup = document.querySelector("#soClosePopup");
  if (soClosePopup) {
    soClosePopup.classList.remove("show");
    void soClosePopup.offsetWidth;
    soClosePopup.classList.add("show");
  }
}

function showPostMessage(message) {
  els.postMessage.textContent = message;
  els.postMessage.classList.remove("show");
  void els.postMessage.offsetWidth;
  els.postMessage.classList.add("show");

  setTimeout(() => {
    els.postMessage.classList.remove("show");
  }, 2000);
}

function handleShotInput() {
  if (state.countdownActive) return;
  const now = performance.now();
  if (now < state.inputLockUntil) return;
  state.inputLockUntil = now + 160;
  if (state.phase === "flight" || state.phase === "result" || state.phase === "over") return;

  if (state.phase === "aim") {
    state.phase = "power";
    state.meter.value = 0;
    state.meter.direction = 1;
    els.timingGauge.dataset.stage = "power";
    els.gaugeType.textContent = "Puissance";
    els.gaugeValue.textContent = "--";
    els.shoot.textContent = "Bloquer";
    state.message = "Jauge de puissance";
    return;
  }

  if (state.phase === "power") {
    state.meter.power = Math.round(45 + state.meter.value * 55);
    els.gaugeValue.textContent = state.meter.power;
    state.phase = "curve";
    state.meter.value = 0.5;
    state.meter.direction = 1;
    els.timingGauge.dataset.stage = "curve";
    els.gaugeType.textContent = "Effet";
    els.gaugeValue.textContent = "--";
    els.shoot.textContent = "Frapper";
    state.message = "Jauge d'effet";
    return;
  }

  if (state.phase === "curve") {
    const footDirection = isLeftFooted() ? -1 : 1;
    state.meter.curve = Math.round((state.meter.value * 2 - 1) * 100 * footDirection);
    els.gaugeValue.textContent = formatCurve(state.meter.curve);
    launchShot();
  }
}

function formatCurve(value) {
  if (Math.abs(value) < 5) return "0";
  return `${value < 0 ? "G" : "D"} ${Math.abs(value)}`;
}

function launchShot() {
  const p = player();
  const power = (state.meter.power ?? 72) / 100;
  const curve = (state.meter.curve ?? 0) / 100;
  const lift = clamp(0.48 + (p.stats.composure - 75) / 120 + (1 - power) * 0.1, 0.46, 0.78);
  const talent = (p.stats.power * power + p.stats.curve * Math.abs(curve) + p.stats.composure * lift) / 300;
  const aimNoise = (1 - talent) * 52;
  const liveTarget = movingTargetPosition();
  const aimX = liveTarget.x + (Math.random() - 0.5) * aimNoise;
  const aimY = liveTarget.y + (Math.random() - 0.5) * aimNoise * 0.72;
  const leftPost = goal.x - goal.w / 2;
  const rightPost = goal.x + goal.w / 2;
  const nearestPost = Math.abs(aimX - leftPost) < Math.abs(aimX - rightPost) ? leftPost : rightPost;
  const postSide = nearestPost < goal.x ? -1 : 1;
  const postDistance = Math.abs(aimX - nearestPost);
  const hitsPost = postDistance < 19 && aimY > goal.y + 18 && aimY < goal.y + goal.h - 18;
  const hitsCrossbar = Math.abs(aimY - goal.y) < 15 && aimX > leftPost + 15 && aimX < rightPost - 15;
  const approachesFromInside = postSide < 0 ? aimX >= nearestPost - 5 : aimX <= nearestPost + 5;
  const postHit = hitsPost
    ? {
        x: nearestPost,
        y: aimY,
        side: postSide,
        type: "poteau",
        inward: approachesFromInside,
        reboundX: nearestPost - postSide * (approachesFromInside ? 54 : -38),
        reboundY: clamp(aimY + 12, goal.y + 30, goal.y + goal.h - 32),
        triggered: false,
      }
    : hitsCrossbar
    ? {
        x: aimX,
        y: goal.y,
        side: 0,
        type: "transversale",
        inward: false,
        reboundX: aimX,
        reboundY: goal.y + 45,
        triggered: false,
      }
    : null;
  const wallHeight = 0.38 + lift * 0.38;
  const speed = 0.92 + power * 0.38;

  state.attempts += 1;
  state.totalShots += 1;
  state.phase = "flight";
  els.timingGauge.dataset.stage = "hidden";
  els.shoot.textContent = "En jeu";
  state.wallJump = 1;
  state.shake = 10 + power * 10;
  state.flash = 0.9;
  state.message = p.signature.toUpperCase();

  // Son de frappe selon la puissance
  if (power > 0.6) {
    ballKickHigh.currentTime = 0;
    ballKickHigh.play().catch(e => console.warn("Kick sound blocked:", e));
  } else {
    ballKickLow.currentTime = 0;
    ballKickLow.play().catch(e => console.warn("Kick sound blocked:", e));
  }

  // Gardien adaptatif : devient plus réactif selon le score/combo
  const adaptiveBonus = state.combo * 0.04 + (state.totalGoals / 20) * 0.08;
  state.keeper.reaction = clamp(0.55 - p.stats.keeperFear + Math.random() * 0.28 - adaptiveBonus, 0.12, 0.75);
  state.keeper.diveX = clamp((aimX - goal.x) / (goal.w / 2), -1, 1);
  state.ball = {
    t: 0,
    speed,
    sx: spot.x,
    sy: spot.y,
    ex: aimX,
    ey: aimY,
    curve: curve * (95 + p.stats.curve * 0.8),
    lift: wallHeight,
    spin: 0,
    postHit,
    result: null,
  };
  burst(spot.x, spot.y - 36, p.main, 26);
  updateHud();
}

function finishShot() {
  const b = state.ball;
  const p = player();
  const mouth = {
    left: goal.x - goal.w / 2 + 26,
    right: goal.x + goal.w / 2 - 26,
    top: goal.y + 26,
    bottom: goal.y + goal.h - 28,
  };
  const wallY = lerp(spot.y, goal.y + goal.h, 0.56);
  const wallArc = spot.y - wallY;
  const clearedWall = b.lift > 0.47 || Math.abs(b.curve) > 75;
  const finalX = b.postHit ? b.postHit.reboundX : b.ex;
  const finalY = b.postHit ? b.postHit.reboundY : b.ey;
  const onTarget = finalX > mouth.left && finalX < mouth.right && finalY > mouth.top && finalY < mouth.bottom;
  const keeperReach = onTarget
    && !b.postHit
    && Math.abs(finalX - (goal.x + state.keeper.diveX * 145)) < 55 + state.keeper.reaction * 45
    && finalY > goal.y + 52;
  let scored = onTarget && clearedWall && !keeperReach;

  if (finalY < mouth.top + 18 && b.lift > 0.78) scored = false;
  if (!clearedWall && Math.abs(finalX - goal.x) < 190 && wallArc < 0) scored = false;
  if (b.postHit && !b.postHit.inward) scored = false;

  if (scored) {
    // Système de combo
    state.consecutiveGoals += 1;
    state.totalGoals += 1;
    state.combo = Math.min(5, Math.floor(state.consecutiveGoals / 1));
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    // Score avec multiplicateur
    const baseScore = 100 + Math.round((p.stats.curve + p.stats.power) / 2);
    const comboMultiplier = state.combo;
    const earnedScore = baseScore * comboMultiplier;
    state.score += earnedScore;
    state.streak += 1;

    // Remplir la jauge spéciale
    state.specialGauge = Math.min(100, state.specialGauge + 20);
    if (state.specialGauge >= 100 && state.specialUsageCount < state.maxSpecialUsage) {
      state.specialMoveAvailable = true;
    }

    // Animation combo
    state.comboFlash = 1;

    if (b.postHit) {
      const hitType = b.postHit.type === "transversale" ? "Transversale rentrante" : "Poteau rentrant";
      state.message = `${hitType} ! ${p.signature}`;
      showPostMessage(hitType + " !");
    } else {
      state.message = `But ! ${p.signature}`;
    }
    state.flash = 1;
    burst(finalX, finalY, p.trim, 54);
    showGoalPopup(p.signature);
  } else {
    // Réinitialiser le combo
    state.consecutiveGoals = 0;
    state.combo = 0;

    // Détection "So Close!" - près du poteau
    const leftPost = goal.x - goal.w / 2;
    const rightPost = goal.x + goal.w / 2;
    const nearLeftPost = Math.abs(finalX - leftPost) < 35;
    const nearRightPost = Math.abs(finalX - rightPost) < 35;
    const inHeightRange = finalY > goal.y && finalY < goal.y + goal.h;

    if ((nearLeftPost || nearRightPost) && inHeightRange && !onTarget) {
      state.soCloseCount += 1;
      state.message = "So Close!";
      showSoClosePopup();
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      state.message = keeperReach ? "Arrêt du gardien" : onTarget ? "Le mur détourne" : "Hors cadre";
    }

    state.streak = 0;
    burst(finalX, finalY, "#ffffff", 18);
  }

  b.result = scored ? "goal" : "miss";
  state.phase = "result";
  setTimeout(() => {
    state.ball = null;
    // Ne pas redémarrer si le temps est écoulé
    if (state.gameTimeRemaining > 0) {
      state.phase = "aim";
      resetShotSequence();
      state.message = "Replace ta cible";
    }
  }, 1050);
  updateHud();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 80 + Math.random() * 330;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.4 + Math.random() * 0.55,
      age: 0,
      color,
    });
  }
}

function update(dt) {
  state.aimTime += dt;
  state.wallJump = Math.max(0, state.wallJump - dt * 2.2);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 1.8);
  state.comboFlash = Math.max(0, state.comboFlash - dt * 2.5);

  // Mise à jour du timer
  if (state.gameStartTime && state.phase !== "over") {
    const elapsed = (performance.now() - state.gameStartTime) / 1000;
    state.gameTimeRemaining = Math.max(0, state.gameTime - elapsed);

    // Fin du temps
    if (state.gameTimeRemaining <= 0 && state.phase !== "over") {
      state.phase = "over";
      state.gameTimeRemaining = 0;
      state.message = `Temps écoulé ! Score final : ${state.score}`;
      setTimeout(() => showEndScreen(), 800);
    }

    updateHud();
  }

  if (state.phase === "power" || state.phase === "curve") {
    const meterSpeed = state.phase === "power" ? 1.28 : 1.05;
    state.meter.value += state.meter.direction * dt * meterSpeed;
    if (state.meter.value >= 1) {
      state.meter.value = 1;
      state.meter.direction = -1;
    } else if (state.meter.value <= 0) {
      state.meter.value = 0;
      state.meter.direction = 1;
    }
    els.timingGauge.style.setProperty("--meter-position", String(state.meter.value * 100));
  }

  if (state.phase === "flight" && state.ball) {
    const b = state.ball;
    b.t = clamp(b.t + dt * b.speed, 0, 1);
    b.spin += dt * (8 + Math.abs(b.curve) * 0.05);
    if (b.postHit && !b.postHit.triggered && b.t >= 0.78) {
      b.postHit.triggered = true;
      state.shake = Math.max(state.shake, 7);
      state.flash = Math.max(state.flash, 0.32);
      burst(b.postHit.x, b.postHit.y, "#ffffff", 24);

      // Son du poteau/transversale
      poteauSound.currentTime = 0;
      poteauSound.play().catch(e => console.warn("Poteau sound blocked:", e));

      // Afficher le message de poteau/transversale
      if (b.postHit.type === "transversale") {
        showPostMessage("Transversale !");
      } else if (b.postHit.type === "poteau") {
        showPostMessage("Poteau !");
      }
    }
    if (b.t >= 1) finishShot();
  }

  state.particles = state.particles.filter((particle) => {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 360 * dt;
    return particle.age < particle.life;
  });
}

function movingTargetPosition() {
  const active = state.phase === "aim" || state.phase === "power" || state.phase === "curve";
  if (!active) return { x: target.x, y: target.y };
  const x = target.x + Math.sin(state.aimTime * 1.7) * 14 + Math.sin(state.aimTime * 3.9) * 5;
  const y = target.y + Math.cos(state.aimTime * 1.35) * 9;
  return {
    x: clamp(x, aimBounds.left, aimBounds.right),
    y: clamp(y, aimBounds.top, aimBounds.bottom),
  };
}

function ballPosition() {
  if (!state.ball) return null;
  const b = state.ball;
  const t = b.t;
  let x;
  let y;
  if (b.postHit) {
    const impactT = 0.78;
    if (t < impactT) {
      const u = t / impactT;
      const ease = 1 - Math.pow(1 - u, 2.2);
      x = lerp(b.sx, b.postHit.x, ease) + Math.sin(u * Math.PI) * b.curve;
      y = lerp(b.sy, b.postHit.y, ease) - Math.sin(u * Math.PI) * (170 * b.lift);
    } else {
      const u = smoothstep((t - impactT) / (1 - impactT));
      x = lerp(b.postHit.x, b.postHit.reboundX, u);
      y = lerp(b.postHit.y, b.postHit.reboundY, u) - Math.sin(u * Math.PI) * 12;
    }
  } else {
    const ease = 1 - Math.pow(1 - t, 2.2);
    x = lerp(b.sx, b.ex, ease) + Math.sin(t * Math.PI) * b.curve;
    y = lerp(b.sy, b.ey, ease) - Math.sin(t * Math.PI) * (170 * b.lift);
  }
  const scale = lerp(1.1, 0.38, t);
  return { x, y, scale, spin: b.spin };
}

function draw() {
  const shakeX = (Math.random() - 0.5) * state.shake;
  const shakeY = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.clearRect(-40, -40, W + 80, H + 80);
  drawStadium();
  drawGoal();
  drawKeeper();
  drawWall();
  drawShooter();
  drawTarget();
  drawBall();
  drawParticles();
  drawMangaOverlay();
  ctx.restore();
}

function drawPreview() {
  const p = player();
  const w = PREVIEW_W;
  const h = PREVIEW_H;
  previewCtx.clearRect(0, 0, w, h);

  previewCtx.strokeStyle = "rgba(41,215,255,0.16)";
  previewCtx.lineWidth = 2;
  for (let i = 0; i < 24; i += 1) {
    const a = (i / 24) * Math.PI * 2;
    previewCtx.beginPath();
    previewCtx.moveTo(w / 2, h * 0.56);
    previewCtx.lineTo(w / 2 + Math.cos(a) * 600, h * 0.56 + Math.sin(a) * 460);
    previewCtx.stroke();
  }

  const frame = playerSelectionSprite(p.id);
  if (frame) {
    const maxWidth = w * 0.68;
    const maxHeight = h * 0.7;
    const scale = Math.min(maxWidth / frame.naturalWidth, maxHeight / frame.naturalHeight);
    const width = frame.naturalWidth * scale;
    const height = frame.naturalHeight * scale;
    previewCtx.drawImage(frame, w / 2 - width / 2, h * 0.88 - height, width, height);
  } else {
    drawPreviewFallback(p, w, h);
  }

  // Ligne jaune supprimée
}

function drawPreviewFallback(p, w, h) {
  previewCtx.save();
  previewCtx.translate(w / 2, h * 0.64);
  previewCtx.scale(3.1, 3.1);
  previewCtx.fillStyle = "rgba(0,0,0,0.28)";
  previewCtx.beginPath();
  previewCtx.ellipse(0, 52, 32, 10, 0, 0, Math.PI * 2);
  previewCtx.fill();
  previewCtx.fillStyle = p.main;
  previewCtx.beginPath();
  previewCtx.moveTo(-28, -12);
  previewCtx.quadraticCurveTo(0, -28, 28, -12);
  previewCtx.lineTo(22, 36);
  previewCtx.quadraticCurveTo(0, 48, -22, 36);
  previewCtx.closePath();
  previewCtx.fill();
  previewCtx.strokeStyle = p.trim;
  previewCtx.lineWidth = 3;
  previewCtx.stroke();
  previewCtx.fillStyle = p.skin;
  previewCtx.beginPath();
  previewCtx.arc(0, -32, 17, 0, Math.PI * 2);
  previewCtx.fill();
  previewCtx.fillStyle = p.hair;
  previewCtx.beginPath();
  previewCtx.ellipse(-2, -43, 18, 12, -0.18, Math.PI, Math.PI * 2);
  previewCtx.fill();
  previewCtx.restore();
}

function drawStadium() {
  if (stadiumImage.complete && stadiumImage.naturalWidth > 0) {
    ctx.drawImage(stadiumImage, 0, 0, W, H);
    ctx.fillStyle = "rgba(7,18,28,0.08)";
    ctx.fillRect(0, 0, W, H);
    drawPitchDepth();
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#10172a");
  sky.addColorStop(0.35, "#121d30");
  sky.addColorStop(1, "#173824");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(6,9,15,0.72)";
  ctx.fillRect(0, 0, W, 115);
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 61) % W;
    const y = 18 + ((i * 37) % 72);
    ctx.fillStyle = i % 3 === 0 ? "rgba(69,225,255,0.8)" : "rgba(255,215,102,0.62)";
    ctx.fillRect(x, y, 4, 4);
  }

  const grass = ctx.createLinearGradient(0, 230, 0, H);
  grass.addColorStop(0, "#1e5739");
  grass.addColorStop(1, "#2d7d3d");
  ctx.fillStyle = grass;
  ctx.beginPath();
  ctx.moveTo(60, H);
  ctx.lineTo(360, 235);
  ctx.lineTo(920, 235);
  ctx.lineTo(W - 60, H);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 9; i += 1) {
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(240 + i * 92, 250);
    ctx.lineTo(120 + i * 130, H);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(238,246,255,0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(spot.x - 265, H);
  ctx.lineTo(goal.x - goal.w * 0.45, goal.y + goal.h);
  ctx.moveTo(spot.x + 265, H);
  ctx.lineTo(goal.x + goal.w * 0.45, goal.y + goal.h);
  ctx.stroke();
}

function drawPitchDepth() {
  ctx.save();

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scene.vanishingX - 128, scene.goalLineY);
  ctx.lineTo(184, H);
  ctx.moveTo(scene.vanishingX + 128, scene.goalLineY);
  ctx.lineTo(1080, H);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(scene.vanishingX - 206, scene.goalLineY + 22);
  ctx.quadraticCurveTo(scene.vanishingX, scene.goalLineY + 68, scene.vanishingX + 206, scene.goalLineY + 22);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.beginPath();
  ctx.ellipse(spot.x, spot.y + 5, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGoal() {
  if (goalImage.complete && goalImage.naturalWidth > 0) {
    const visualWidth = goal.w + 42;
    const visualHeight = visualWidth * (goalImage.naturalHeight / goalImage.naturalWidth);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(goal.x, scene.goalLineY + 5, goal.w * 0.48, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(
      goalImage,
      goal.x - visualWidth / 2,
      scene.goalLineY - visualHeight * 0.82,
      visualWidth,
      visualHeight,
    );
    ctx.restore();
    return;
  }

  const gx = goal.x - goal.w / 2;
  const gy = goal.y;
  ctx.save();

  ctx.fillStyle = "rgba(4,10,24,0.42)";
  ctx.fillRect(gx + 8, gy + 8, goal.w - 16, goal.h - 10);

  ctx.strokeStyle = "rgba(41,215,255,0.34)";
  ctx.lineWidth = 13;
  ctx.strokeRect(gx - 3, gy - 3, goal.w + 6, goal.h + 6);

  ctx.strokeStyle = "#f7f9ff";
  ctx.lineWidth = 8;
  ctx.strokeRect(gx, gy, goal.w, goal.h);

  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(208,230,255,0.5)";
  for (let x = gx + 25; x < gx + goal.w; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x - 22, gy + goal.h);
    ctx.stroke();
  }
  for (let y = gy + 21; y < gy + goal.h; y += 21) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx + goal.w, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffcf33";
  ctx.fillRect(gx - 6, gy - 6, 18, 6);
  ctx.fillRect(gx + goal.w - 12, gy - 6, 18, 6);
  ctx.restore();
}

function drawWall() {
  const isJumping = state.wallJump > 0.08;
  const frame = isJumping ? wallImages.jump : wallImages.idle;
  if (frame.complete && frame.naturalWidth > 0) {
    const wallCenterX = scene.wallX;
    const width = 240;
    const height = width * (frame.naturalHeight / frame.naturalWidth);
    const x = wallCenterX - width / 2;
    const footY = scene.wallFootY;
    const y = footY - height - (isJumping ? 18 : 0);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(wallCenterX, footY + 6, 112, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(frame, x, y, width, height);
    ctx.restore();
    return;
  }

  const baseY = 430 - Math.sin(state.wallJump * Math.PI) * 26;
  for (let i = 0; i < 5; i += 1) {
    const x = W / 2 - 112 + i * 56;
    drawAnimeFigure({
      x,
      y: baseY,
      scale: 0.78,
      main: "#121826",
      second: "#f3f6ff",
      trim: "#45e1ff",
      skin: "#c89066",
      hair: "#111111",
      pattern: i % 2 ? "pin" : "bands",
      pose: "wall",
    });
  }
}

function drawKeeper() {
  const k = state.keeper;
  const baseX = k.x - 50;
  const footY = scene.goalLineY - 4;
  const readyHeight = 102;
  const readyCenterY = footY - readyHeight / 2 + Math.sin(state.aimTime * 2.4) * 1.2;
  const readyFrame = keeperFrames[0];
  const alertFrame = keeperFrames[1];

  drawKeeperShadow(baseX, footY, 34);

  if (state.ball) {
    const reaction = Math.max(0.12, k.reaction);
    const anticipation = smoothstep((state.ball.t / reaction - 0.52) / 0.48);
    if (state.ball.t <= reaction) {
      drawKeeperPose(readyFrame, baseX, readyCenterY, readyHeight, { alpha: 1 - anticipation });
      drawKeeperPose(alertFrame, baseX, readyCenterY - 1, 104, { alpha: anticipation });
      return;
    }

    const dive = smoothstep((state.ball.t - reaction) / (1 - reaction));
    const direction = k.diveX < 0 ? -1 : 1;
    const lowShot = state.ball.ey > goal.y + goal.h * 0.58;
    const centerX = baseX + k.diveX * (lowShot ? 96 : 112) * dive;
    const centerY = readyCenterY + (lowShot ? 18 : -24) * dive;
    const actionFrame = lowShot ? keeperFrames[7] : keeperFrames[3];
    const actionHeight = lerp(readyHeight, lowShot ? 88 : 106, dive);
    const rotation = direction * (lowShot ? 0.12 : 0.82) * dive;
    const blend = smoothstep(dive / 0.28);

    drawKeeperPose(alertFrame, baseX, readyCenterY - 1, 104, { alpha: 1 - blend });
    drawKeeperPose(actionFrame, centerX, centerY, actionHeight, {
      alpha: blend,
      flipX: direction < 0,
      rotation,
    });
    return;
  }

  if (readyFrame?.complete && readyFrame.naturalWidth > 0) {
    drawKeeperPose(readyFrame, baseX, readyCenterY, readyHeight);
    return;
  }

  drawAnimeFigure({ x: baseX, y: k.y, scale: 0.9, main: "#f5d51f", second: "#1b1424", trim: "#d51f3f", skin: "#d8aa7c", hair: "#4b2b1f", pattern: "chevron", pose: "keeper" });
}

function drawShooter() {
  const p = player();
  const leftFooted = isLeftFooted(p.id);
  const side = leftFooted ? 1 : -1;
  const runProgress = state.phase === "flight" && state.ball
    ? smoothstep(clamp(state.ball.t / 0.42, 0, 1))
    : state.phase === "result"
      ? 1
      : 0;
  const runUpOffset = state.phase === "flight" && state.ball
    ? lerp(112, 72, clamp(state.ball.t / 0.58, 0, 1))
    : state.phase === "result"
      ? 70
      : 112;
  const shooterX = spot.x + side * runUpOffset;
  const shooterFootY = lerp(spot.y + 42, spot.y + 16, runProgress);
  const frame = playerBackSpriteFor(p.id);
  if (frame) {
    const height = state.phase === "flight" ? 192 : state.phase === "result" ? 184 : 178;
    drawSpriteFigure(frame, shooterX, shooterFootY, height);
    return;
  }
  drawAnimeFigure({
    x: spot.x + side * 104,
    y: shooterFootY - 22,
    scale: 1.18,
    flipX: leftFooted,
    main: p.main,
    second: p.second,
    trim: p.trim,
    skin: p.skin,
    hair: p.hair,
    pattern: p.pattern,
    pose: state.phase === "flight" ? "strike" : "ready",
  });
}

function playerSpriteFor(id, pose) {
  const frames = playerFrames[id];
  if (!frames) return null;
  const indexByPose = {
    idle: 0,
    ready: 1,
    run1: 2,
    run2: 3,
    windup: 4,
    strike: 5,
    celebrate: 6,
    side: 7,
  };
  const frame = frames[indexByPose[pose] ?? 0];
  return frame?.complete && frame.naturalWidth > 0 ? frame : null;
}

function playerSelectionSprite(id) {
  const celebration = selectionCelebrations[id];
  if (celebration?.complete && celebration.naturalWidth > 0) return celebration;
  const frames = playerFrames[id];
  const frame = frames?.[SELECTION_FRAME[id] ?? 6];
  return frame?.complete && frame.naturalWidth > 0 ? frame : null;
}

function playerBackSpriteFor(id) {
  const frames = isLeftFooted(id) && playerLeftBackFrames[id] ? playerLeftBackFrames[id] : playerBackFrames[id];
  if (!frames) return null;
  let index = 1;
  if (state.phase === "flight" && state.ball) {
    if (state.ball.t < 0.18) index = 2;
    else if (state.ball.t < 0.36) index = 3;
    else if (state.ball.t < 0.58) index = 4;
    else index = 5;
  } else if (state.phase === "result") {
    index = state.ball?.result === "goal" ? 7 : 6;
  } else if (state.phase === "over") {
    index = 7;
  }
  const frame = frames[index];
  return frame?.complete && frame.naturalWidth > 0 ? frame : null;
}

function drawSpriteFigure(frame, footX, footY, height, flipX = false) {
  const ratio = frame.naturalWidth / frame.naturalHeight;
  const width = height * ratio;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(footX + (flipX ? -10 : 10), footY + 4, width * 0.28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(footX, 0);
  ctx.scale(flipX ? -1 : 1, 1);
  ctx.drawImage(frame, -width / 2, footY - height, width, height);
  ctx.restore();
}

function drawKeeperShadow(centerX, footY, radius) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(centerX, footY + 5, radius, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawKeeperPose(frame, centerX, centerY, height, options = {}) {
  if (!frame?.complete || frame.naturalWidth <= 0) return;
  const {
    alpha = 1,
    flipX = false,
    rotation = 0,
  } = options;
  const ratio = frame.naturalWidth / frame.naturalHeight;
  const width = height * ratio;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.scale(flipX ? -1 : 1, 1);
  ctx.drawImage(frame, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawAnimeFigure(opts) {
  const { x, y, scale: s, flipX = false, main, second, trim, skin, hair, pattern, pose } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -s : s, s);
  if (pose === "dive") ctx.rotate(state.keeper.diveX * 0.4);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 52, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const kick = pose === "strike" ? 16 : 0;
  const arm = pose === "wall" ? -18 : pose === "keeper" ? -30 : -8;
  ctx.strokeStyle = skin;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(-34, arm);
  ctx.moveTo(18, -2);
  ctx.lineTo(34, arm);
  ctx.moveTo(-10, 36);
  ctx.lineTo(-14 - kick, 64);
  ctx.moveTo(10, 36);
  ctx.lineTo(20 + kick, 62 - kick);
  ctx.stroke();

  ctx.fillStyle = main;
  roundedBody();
  ctx.fill();
  drawKitPattern(pattern, second, trim);
  ctx.strokeStyle = trim;
  ctx.lineWidth = 3;
  roundedBody();
  ctx.stroke();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -32, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(-2, -43, 18, 12, -0.18, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#10141d";
  ctx.beginPath();
  ctx.ellipse(-6, -32, 2.4, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -32, 2.4, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundedBody() {
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.quadraticCurveTo(0, -28, 28, -12);
  ctx.lineTo(22, 36);
  ctx.quadraticCurveTo(0, 48, -22, 36);
  ctx.closePath();
}

function drawKitPattern(pattern, second, trim) {
  ctx.save();
  roundedBody();
  ctx.clip();
  ctx.fillStyle = second;
  ctx.strokeStyle = second;
  ctx.lineWidth = 5;
  if (pattern === "stripes") {
    for (let x = -24; x <= 24; x += 16) ctx.fillRect(x, -26, 8, 75);
  } else if (pattern === "slash") {
    ctx.rotate(-0.65);
    ctx.fillRect(-42, -6, 84, 11);
  } else if (pattern === "pin") {
    ctx.lineWidth = 2;
    for (let x = -18; x <= 18; x += 9) {
      ctx.beginPath();
      ctx.moveTo(x, -22);
      ctx.lineTo(x, 42);
      ctx.stroke();
    }
  } else if (pattern === "chevron") {
    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.lineTo(0, 14);
    ctx.lineTo(28, -6);
    ctx.stroke();
  } else if (pattern === "waves") {
    for (let y = -18; y < 38; y += 14) {
      ctx.beginPath();
      ctx.moveTo(-30, y);
      ctx.bezierCurveTo(-10, y - 12, 10, y + 12, 30, y);
      ctx.stroke();
    }
  } else if (pattern === "bands") {
    ctx.fillRect(-32, -2, 64, 9);
    ctx.fillStyle = trim;
    ctx.fillRect(-32, 11, 64, 7);
  }
  ctx.restore();
}

function drawTarget() {
  if (state.phase !== "aim" && state.phase !== "power" && state.phase !== "curve") return;
  const liveTarget = movingTargetPosition();
  const insideGoal = liveTarget.x > goal.x - goal.w / 2
    && liveTarget.x < goal.x + goal.w / 2
    && liveTarget.y > goal.y
    && liveTarget.y < goal.y + goal.h;
  ctx.save();
  ctx.strokeStyle = insideGoal ? "#ffd766" : "#ff526d";
  ctx.lineWidth = 2;

  // Cercle extérieur avec animation
  const radius = 20 + Math.sin(performance.now() / 160) * 3;
  ctx.beginPath();
  ctx.arc(liveTarget.x, liveTarget.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Petit point central
  ctx.fillStyle = insideGoal ? "#ffd766" : "#ff526d";
  ctx.beginPath();
  ctx.arc(liveTarget.x, liveTarget.y, 2, 0, Math.PI * 2);
  ctx.fill();

  // Paramètres des lignes de visée externes
  const outerStart = radius + 4;
  const outerEnd = radius + 12;

  // Lignes externes uniquement
  // Ligne horizontale gauche
  ctx.beginPath();
  ctx.moveTo(liveTarget.x - outerEnd, liveTarget.y);
  ctx.lineTo(liveTarget.x - outerStart, liveTarget.y);
  ctx.stroke();

  // Ligne horizontale droite
  ctx.beginPath();
  ctx.moveTo(liveTarget.x + outerStart, liveTarget.y);
  ctx.lineTo(liveTarget.x + outerEnd, liveTarget.y);
  ctx.stroke();

  // Ligne verticale haut
  ctx.beginPath();
  ctx.moveTo(liveTarget.x, liveTarget.y - outerEnd);
  ctx.lineTo(liveTarget.x, liveTarget.y - outerStart);
  ctx.stroke();

  // Ligne verticale bas
  ctx.beginPath();
  ctx.moveTo(liveTarget.x, liveTarget.y + outerStart);
  ctx.lineTo(liveTarget.x, liveTarget.y + outerEnd);
  ctx.stroke();

  ctx.restore();
}

function drawBall() {
  const pos = ballPosition();
  const x = pos?.x || spot.x;
  const y = pos?.y || spot.y;
  const s = pos?.scale || 1;
  const frameIndex = pos ? Math.abs(Math.floor(pos.spin * 1.35)) % ballFrames.length : 0;
  const frame = ballFrames[frameIndex];

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y + 14 * s, 21 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  if (frame?.complete && frame.naturalWidth > 0) {
    const size = 62 * s;
    ctx.drawImage(frame, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.translate(x, y);
    ctx.rotate(pos?.spin || 0);
    ctx.scale(s, s);
    ctx.fillStyle = "#f8fbff";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#182032";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, 10, -0.7, 0.7);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (state.ball) {
    ctx.save();
    ctx.strokeStyle = `rgba(69,225,255,${0.26 + state.ball.t * 0.42})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(spot.x, spot.y);
    const mid = ballPosition();
    ctx.quadraticCurveTo(W / 2 + state.ball.curve * 0.8, 420 - state.ball.lift * 120, mid.x, mid.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const a = 1 - p.age / p.life;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2 + a * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMangaOverlay() {
  const p = player();
  ctx.save();
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.18})`;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.strokeStyle = state.phase === "flight" ? "rgba(255,255,255,0.24)" : "rgba(69,225,255,0.12)";
  ctx.lineWidth = state.phase === "flight" ? 3 : 1.5;
  for (let i = 0; i < 26; i += 1) {
    const a = (i / 26) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 + Math.cos(a) * 90, H / 2 + Math.sin(a) * 40);
    ctx.lineTo(W / 2 + Math.cos(a) * 820, H / 2 + Math.sin(a) * 520);
    ctx.stroke();
  }

  // Textes supprimés - interface minimaliste
  // ctx.fillStyle = "rgba(7,10,18,0.72)";
  // ctx.fillRect(0, H - 78, W, 78);
  // ctx.fillStyle = "#ffcf33";
  // ctx.font = "900 24px Inter, sans-serif";
  // ctx.textAlign = "left";
  // ctx.fillText(state.message, 34, H - 42);
  // ctx.fillStyle = "#29d7ff";
  // ctx.font = "800 15px Inter, sans-serif";
  // ctx.fillText(`${p.name} · ${p.code} · ${p.signature}`, 34, H - 18);
  ctx.restore();
}

function setTargetFromEvent(event) {
  if (state.phase !== "aim") return;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * W;
  const y = ((event.clientY - rect.top) / rect.height) * H;
  target.x = clamp(x, aimBounds.left, aimBounds.right);
  target.y = clamp(y, aimBounds.top, aimBounds.bottom);
}

function loop(now) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;
  if (state.screen === "game") {
    update(dt);
    draw();
  }
  if (state.screen === "selection") drawPreview();
  requestAnimationFrame(loop);
}

canvas.addEventListener("pointermove", setTargetFromEvent);
canvas.addEventListener("pointerdown", setTargetFromEvent);
canvas.addEventListener("dblclick", handleShotInput);

document.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key === " " && state.screen === "game") {
    event.preventDefault();
    if (event.repeat) return;
    handleShotInput();
  }
  const step = event.shiftKey ? 16 : 7;
  if (event.key === "ArrowLeft") target.x = clamp(target.x - step, aimBounds.left, aimBounds.right);
  if (event.key === "ArrowRight") target.x = clamp(target.x + step, aimBounds.left, aimBounds.right);
  if (event.key === "ArrowUp") target.y = clamp(target.y - step, aimBounds.top, aimBounds.bottom);
  if (event.key === "ArrowDown") target.y = clamp(target.y + step, aimBounds.top, aimBounds.bottom);
});
document.addEventListener("keyup", (event) => keys.delete(event.key));

els.playButton.addEventListener("click", showSelection);
els.creditsButton.addEventListener("click", showCredits);
els.backToMenu.addEventListener("click", showMenu);
els.backToMenuFromSelection.addEventListener("click", showMenu);
if (els.backToMenuFromEnd) {
  els.backToMenuFromEnd.addEventListener("click", showMenu);
}
if (els.restartGame) {
  els.restartGame.addEventListener("click", showGame);
}
els.shoot.addEventListener("click", handleShotInput);
els.mobileShoot.addEventListener("click", handleShotInput);
els.random.addEventListener("click", () => {
  // Animation de roulette avec ralentissement progressif
  const finalIndex = Math.floor(Math.random() * PLAYERS.length);
  let currentIndex = state.selected;
  let spinCount = 0;
  const totalSpins = 15;

  // Désactiver le bouton pendant l'animation
  els.random.disabled = true;

  function spin() {
    if (spinCount >= totalSpins) {
      selectPlayer(finalIndex);
      els.random.disabled = false;
      return;
    }

    // Ralentissement progressif : l'intervalle augmente à chaque tour
    const delay = 50 + spinCount * 30;

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % PLAYERS.length;
      selectPlayer(currentIndex);
      spinCount++;
      spin();
    }, delay);
  }

  spin();
});
els.enterGame.addEventListener("click", showGame);
els.muteButton.addEventListener("click", toggleMute);
els.changePlayer.addEventListener("click", showSelection);

buildCards();
configureCanvasQuality();
selectPlayer(4);
updateHud();
drawPreview();

try {
  const savedName = localStorage.getItem("wcfks_playerName");
  if (savedName) {
    els.playerNameInput.value = savedName;
    state.playerName = savedName;
  }
} catch (e) {
  console.warn("LocalStorage not available:", e);
}

requestAnimationFrame(loop);
