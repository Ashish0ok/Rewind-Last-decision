const $ = (selector) => document.querySelector(selector);

const introPanel = $("#introPanel");
const gamePanel = $("#gamePanel");
const endingPanel = $("#endingPanel");
const startButton = $("#startButton");
const continueButton = $("#continueButton");
const choicesElement = $("#choices");
const clueBox = $("#clueBox");
const puzzleBox = $("#puzzleBox");
const codeInput = $("#codeInput");
const puzzleFeedback = $("#puzzleFeedback");
const SAVE_KEY = "rewind-last-decision-save-v1";
const TOTAL_TIME = 90;

const clueData = {
  tornNote: { title: "Torn note", text: "The first digit is the number of doors you saw on arrival." },
  wallMark: { title: "Wall marking", text: "A scratched message reads: 'The clock has no hands, but remembers 2:17.'" },
  guardLog: { title: "Guard log", text: "The log says: 'Use the arrival count, then the minute shown on the clock.'" }
};

const scenes = {
  arrival: {
    title: "The Arrival", kicker: "A strange beginning", art: "◉", artCaption: "UNKNOWN LOCATION / 02:17 AM",
    description: "You wake in a sealed station. Three doors stand in front of you: RED, BLUE and BLACK. A speaker crackles: “The exit is not always the way forward.” A torn note lies near your feet.",
    choices: [
      { label: "Inspect the torn note", next: "note", action: "inspectNote" },
      { label: "Open the RED door", next: "redTrap", action: "wrongDoor" },
      { label: "Enter the BLUE door", next: "archive", action: "blueDoor" },
      { label: "Try the BLACK door", next: "blackTrap", action: "wrongDoor" }
    ]
  },
  note: {
    title: "The Torn Note", kicker: "Clue recovered", art: "▤", artCaption: "EVIDENCE LOG / ITEM 001",
    description: "The paper is damp, but one sentence is readable: “Count what is present, not what is missing.” Three doors. Is that the whole clue, or only the beginning?",
    choices: [
      { label: "Return to the three doors", next: "arrival", action: "neutral" },
      { label: "Enter the BLUE door", next: "archive", action: "blueDoor" },
      { label: "Open the RED door", next: "redTrap", action: "wrongDoor" }
    ]
  },
  redTrap: {
    title: "The Red Room", kicker: "Decision recorded", art: "×", artCaption: "WARNING / ROUTE COMPROMISED",
    description: "The door slams shut behind you. Red lights flash and the floor begins to vibrate. A message appears: “You followed the obvious warning.” You lose one life. You can rewind to change your decision.",
    choices: [
      { label: "Try to force the emergency exit", next: "failure", action: "fatal" },
      { label: "Accept the consequence", next: "failure", action: "fatal" }
    ]
  },
  blackTrap: {
    title: "The Black Room", kicker: "Decision recorded", art: "⬟", artCaption: "WARNING / ROUTE COMPROMISED",
    description: "The black door opens into a room with no visible handle on the other side. The lights go out. A sharp tone rings through the station. You lose one life. The timeline can still be rewound.",
    choices: [
      { label: "Search for another way out", next: "failure", action: "fatal" },
      { label: "Accept the consequence", next: "failure", action: "fatal" }
    ]
  },
  archive: {
    title: "The Archive", kicker: "Look closer", art: "⌁", artCaption: "ARCHIVE FLOOR / ACCESS RESTRICTED",
    description: "The blue door leads to a dusty archive. A wall clock is frozen at 02:17. A strange mark sits beneath it, and a guard's logbook rests on a desk. The next door has a numeric keypad.",
    choices: [
      { label: "Inspect the wall marking", next: "wall", action: "inspectWall" },
      { label: "Read the guard's logbook", next: "log", action: "inspectLog" },
      { label: "Go to the keypad", next: "keypad", action: "openKeypad" },
      { label: "Return to the station", next: "arrival", action: "neutral" }
    ]
  },
  wall: {
    title: "The Wall Marking", kicker: "Clue recovered", art: "⌗", artCaption: "EVIDENCE LOG / ITEM 002",
    description: "Behind a loose panel, you find a scratched message: “The clock has no hands, but remembers 2:17.” The time may matter. You should inspect the logbook before entering the code.",
    choices: [
      { label: "Read the guard's logbook", next: "log", action: "inspectLog" },
      { label: "Return to the archive", next: "archive", action: "neutral" },
      { label: "Try the keypad now", next: "keypad", action: "openKeypad" }
    ]
  },
  log: {
    title: "The Guard's Log", kicker: "Clue recovered", art: "▥", artCaption: "EVIDENCE LOG / ITEM 003",
    description: "The final entry says: “Use the arrival count, then the minute shown on the clock.” The station had three doors. The clock reads 02:17. Combine the clues to form a five-digit code.",
    choices: [
      { label: "Go to the keypad", next: "keypad", action: "openKeypad" },
      { label: "Inspect the wall marking", next: "wall", action: "inspectWall" },
      { label: "Return to the archive", next: "archive", action: "neutral" }
    ]
  },
  keypad: {
    title: "The Exit Keypad", kicker: "Final test", art: "▦", artCaption: "EXIT ACCESS / CODE REQUIRED",
    description: "A keypad glows beside a reinforced exit. The clues point to a five-digit code. Think carefully: the door count comes first, followed by the clock's hour and minute.",
    puzzle: true,
    choices: [
      { label: "Go back and review the clues", next: "archive", action: "neutral" }
    ]
  },
  escape: {
    title: "The Exit", kicker: "Timeline corrected", art: "◇", artCaption: "EXIT ACCESS / GRANTED",
    description: "The lock clicks. The door opens onto a quiet street just before dawn. You escaped because you paid attention, gathered evidence and corrected your mistakes.",
    ending: "win",
    choices: []
  },
  failure: {
    title: "Timeline Collapse", kicker: "Simulation ended", art: "×", artCaption: "SIGNAL LOST / RUN TERMINATED",
    description: "The lights vanish. Your last decision becomes the final one. You can rewind to an earlier event if you have a timeline snapshot available.",
    ending: "lose",
    choices: []
  }
};

const initialState = () => ({
  scene: "arrival",
  clues: [],
  lives: 3,
  score: 0,
  timeLeft: TOTAL_TIME,
  decisions: [],
  history: [],
  rewindsUsed: 0,
  started: false,
  finished: false,
  lastClueMessage: ""
});

let state = initialState();
let timerId = null;
let soundEnabled = false;
let audioContext = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshot() {
  const copy = clone(state);
  copy.history = [];
  return copy;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    updateContinueButton();
  } catch (error) {
    console.warn("Could not save game progress in this browser.", error);
  }
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !scenes[parsed.scene] || !Array.isArray(parsed.history)) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function updateContinueButton() {
  const saved = loadSavedGame();
  continueButton.classList.toggle("hidden", !saved || !saved.started || saved.finished);
}

function startNewGame() {
  clearInterval(timerId);
  state = initialState();
  state.started = true;
  introPanel.classList.add("hidden");
  endingPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  render();
  saveGame();
  startTimer();
  playTone(520, 0.06);
}

function continueGame() {
  const saved = loadSavedGame();
  if (!saved) return startNewGame();
  clearInterval(timerId);
  state = saved;
  state.started = true;
  introPanel.classList.add("hidden");
  endingPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  render();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  if (!state.started || state.finished) return;
  timerId = setInterval(() => {
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    updateHUD();
    saveGame();
    if (state.timeLeft <= 0) {
      clearInterval(timerId);
      finishGame("lose", "Time Has Run Out", "The station's timer reaches zero. The timeline closes before you can find the exit.");
    }
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function updateHUD() {
  $("#timerValue").textContent = formatTime(state.timeLeft);
  $("#timerMeter").style.width = `${(state.timeLeft / TOTAL_TIME) * 100}%`;
  $("#livesValue").textContent = `${"♥ ".repeat(state.lives).trim()}${state.lives < 3 ? " · ".repeat(3 - state.lives).trim() : ""}` || "—";
  $("#scoreValue").textContent = String(state.score).padStart(4, "0");
  $("#clueCount").textContent = `${state.clues.length} / ${Object.keys(clueData).length}`;
  $("#eventCount").textContent = `${Math.max(1, state.decisions.length + 1).toString().padStart(2, "0")} EVENTS`;
  $("#rewindCount").textContent = `${state.history.length} AVAILABLE`;
  $("#rewindButton").disabled = state.history.length === 0 || state.finished;
}

function renderClues() {
  const list = $("#clueList");
  list.replaceChildren();
  if (state.clues.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No clues recovered yet.";
    list.appendChild(empty);
    return;
  }
  state.clues.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = clueData[id].title;
    list.appendChild(li);
  });
}

function renderTimeline() {
  const list = $("#timelineList");
  list.replaceChildren();
  const entries = state.decisions.slice(-5);
  if (entries.length === 0) entries.push({ title: scenes[state.scene].title, scene: state.scene });
  entries.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = `timeline-event${index === entries.length - 1 ? " active" : ""}`;
    const dot = document.createElement("span");
    const p = document.createElement("p");
    p.textContent = entry.title || scenes[entry.scene]?.title || "Unknown event";
    div.append(dot, p);
    list.appendChild(div);
  });
}

function render() {
  const scene = scenes[state.scene];
  if (!scene) return;
  $("#sceneTitle").textContent = scene.title;
  $("#sceneKicker").textContent = scene.kicker;
  $("#sceneDescription").textContent = scene.description;
  $("#sceneArt .art-index").textContent = `SCENE ${String(Object.keys(scenes).indexOf(state.scene) + 1).padStart(2, "0")}`;
  $("#sceneArt .art-symbol").textContent = scene.art;
  $("#sceneArt .art-caption").textContent = scene.artCaption;

  clueBox.classList.add("hidden");
  if (state.lastClueMessage) {
    $("#clueText").textContent = state.lastClueMessage;
    clueBox.classList.remove("hidden");
  }

  puzzleBox.classList.toggle("hidden", !scene.puzzle);
  puzzleFeedback.textContent = "";
  puzzleFeedback.className = "puzzle-feedback";
  codeInput.value = "";

  choicesElement.replaceChildren();
  scene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    const label = document.createElement("span");
    label.textContent = choice.label;
    const arrow = document.createElement("span");
    arrow.className = "choice-arrow";
    arrow.textContent = "↗";
    button.append(label, arrow);
    button.addEventListener("click", () => choose(choice));
    choicesElement.appendChild(button);
  });

  renderClues();
  renderTimeline();
  updateHUD();
  if (scene.ending) finishGame(scene.ending);
  saveGame();
}

function addClue(id) {
  const wasAlreadyCollected = state.clues.includes(id);
  if (!wasAlreadyCollected) {
    state.clues.push(id);
    state.score += 100;
  }
  state.lastClueMessage = wasAlreadyCollected
    ? `${clueData[id].title} is already in your inventory.`
    : clueData[id].text;
}

function choose(choice) {
  if (state.finished) return;
  state.history.push(snapshot());
  state.decisions.push({ scene: state.scene, title: scenes[state.scene].title, choice: choice.label });
  state.lastClueMessage = "";

  switch (choice.action) {
    case "inspectNote": addClue("tornNote"); break;
    case "inspectWall": addClue("wallMark"); break;
    case "inspectLog": addClue("guardLog"); break;
    case "wrongDoor":
      state.lives = Math.max(0, state.lives - 1);
      state.score = Math.max(0, state.score - 50);
      break;
    case "fatal":
      state.lives = 0;
      break;
    case "blueDoor":
      state.score += 25;
      break;
    case "neutral":
    case "openKeypad":
      break;
  }

  if (choice.action === "fatal" || state.lives <= 0) {
    state.scene = "failure";
  } else {
    state.scene = choice.next;
  }
  playTone(choice.action === "wrongDoor" || choice.action === "fatal" ? 180 : 440, 0.07);
  render();
}

function submitCode() {
  if (state.finished || state.scene !== "keypad") return;
  const code = codeInput.value.trim();
  if (code === "30217") {
    // The full clue chain gives 3 + 02:17. The accepted code uses the five digits 30217.
    state.history.push(snapshot());
    state.decisions.push({ scene: state.scene, title: scenes[state.scene].title, choice: "Correct code entered" });
    state.score += 500;
    state.lastClueMessage = "Code accepted. All clues aligned.";
    state.scene = "escape";
    playTone(760, 0.12);
    render();
    return;
  }

  state.history.push(snapshot());
  state.decisions.push({ scene: state.scene, title: scenes[state.scene].title, choice: "Incorrect code" });
  state.lives = Math.max(0, state.lives - 1);
  state.score = Math.max(0, state.score - 25);
  puzzleFeedback.textContent = "ACCESS DENIED — recheck your clues.";
  puzzleFeedback.className = "puzzle-feedback error";
  if (state.lives <= 0) state.scene = "failure";
  updateHUD();
  saveGame();
  playTone(140, 0.1);
  if (state.scene === "failure") render();
}

function rewind() {
  if (state.history.length === 0 || state.finished) return;
  const previous = state.history.pop();
  const remainingHistory = state.history;
  const oldRewinds = state.rewindsUsed;
  state = previous;
  state.history = remainingHistory;
  state.rewindsUsed = oldRewinds + 1;
  state.started = true;
  state.finished = false;
  state.score = Math.max(0, state.score - 10);
  state.lastClueMessage = "Timeline rewound. Previous game state restored.";
  gamePanel.classList.remove("hidden");
  endingPanel.classList.add("hidden");
  render();
  playTone(300, 0.1);
}

function finishGame(result, customTitle, customDescription) {
  if (state.finished) return;
  state.finished = true;
  clearInterval(timerId);
  gamePanel.classList.add("hidden");
  introPanel.classList.add("hidden");
  endingPanel.classList.remove("hidden");

  const won = result === "win";
  $("#endingSymbol").textContent = won ? "◇" : "×";
  $("#endingSymbol").style.color = won ? "var(--green)" : "var(--red)";
  $("#endingEyebrow").textContent = won ? "EXIT ACCESS GRANTED" : "TIMELINE CONCLUDED";
  $("#endingTitle").textContent = customTitle || (won ? "YOU ESCAPED." : "GAME OVER.");
  $("#endingDescription").textContent = customDescription || (won
    ? "You followed the evidence, corrected your mistakes and found the exit. The timeline is yours — for now."
    : "Your choices led to a dead end. Rewind the timeline in your next run, gather more clues and try a different path.");
  $("#finalScore").textContent = String(state.score).padStart(4, "0");
  $("#finalClues").textContent = `${state.clues.length} / ${Object.keys(clueData).length}`;
  $("#finalRewinds").textContent = String(state.rewindsUsed);
  $("#endingRewindButton").classList.toggle("hidden", won || state.history.length === 0);
  saveGame();
}

function resetGame() {
  clearInterval(timerId);
  try { localStorage.removeItem(SAVE_KEY); } catch (error) {}
  state = initialState();
  gamePanel.classList.add("hidden");
  endingPanel.classList.add("hidden");
  introPanel.classList.remove("hidden");
  updateContinueButton();
}

function playTone(frequency, duration) {
  if (!soundEnabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Sound is optional; the game remains playable without it.
  }
}

startButton.addEventListener("click", startNewGame);
continueButton.addEventListener("click", continueGame);
$("#rewindButton").addEventListener("click", rewind);
$("#submitCode").addEventListener("click", submitCode);
codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") submitCode();
});
$("#resetButton").addEventListener("click", resetGame);
$("#replayButton").addEventListener("click", resetGame);
$("#endingRewindButton").addEventListener("click", rewind);
$("#soundToggle").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("#soundLabel").textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
  $("#soundToggle").setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
  if (soundEnabled) playTone(520, 0.06);
});

updateContinueButton();
