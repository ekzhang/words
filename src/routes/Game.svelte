<script lang="ts">
  import Board from "../components/Board.svelte";
  import { lettersToBoard, type BoardCell } from "../lib/board";
  import { decodeGameConfig, type GameConfig } from "../lib/urlEncoder";
  import { SHAPES } from "../lib/shapes";
  import { ensureDictionaryLoaded } from "../lib/dictionary";
  import { route } from "../router";
  import { startBackgroundMusic, stopBackgroundMusic } from "../lib/sounds";

  const encodedConfig = $derived(route.params.encodedConfig ?? "");

  let config: GameConfig | null = $state(null);
  let board: BoardCell[][] = $state([]);
  let score = $state(0);
  let foundWords: { word: string; score: number }[] = $state([]);
  let timeLeft = $state(0);
  let gameStarted = $state(false);
  let gameEnded = $state(false);
  let dictionaryLoaded = $state(false);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let copied = $state(false);

  $effect(() => {
    const decoded = decodeGameConfig(encodedConfig);
    if (decoded) {
      config = decoded;
      const shape = SHAPES[decoded.shapeId] ?? SHAPES["4x4"];
      board = lettersToBoard(decoded.letters, shape);
      timeLeft = decoded.timeLimit;
    }
    ensureDictionaryLoaded().then(() => {
      dictionaryLoaded = true;
    });
  });

  function startGame() {
    if (!config || !dictionaryLoaded) return;
    gameStarted = true;
    gameEnded = false;
    score = 0;
    foundWords = [];
    timeLeft = config.timeLimit;
    startBackgroundMusic();

    if (config.timeLimit > 0) {
      timerInterval = setInterval(() => {
        timeLeft = timeLeft - 1;
        if (timeLeft <= 0) {
          timeLeft = 0;
          endGame();
        }
      }, 1000);
    }
  }

  function endGame() {
    gameEnded = true;
    stopBackgroundMusic();
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function handleWordFound(word: string, wordScore: number) {
    if (foundWords.some((w) => w.word === word)) return;
    foundWords = [...foundWords, { word, score: wordScore }];
    score += wordScore;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  $effect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      stopBackgroundMusic();
    };
  });
</script>

<div
  class="min-h-screen bg-linear-to-br from-emerald-800 to-emerald-950 text-white p-4"
>
  {#if !config}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">Invalid Game Link</h1>
        <a href="/" class="text-emerald-300 hover:text-emerald-100 underline"
          >Create a new game</a
        >
      </div>
    </div>
  {:else if !gameStarted}
    <div class="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <h1 class="text-4xl font-bold">Word Hunt</h1>

      <div class="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
        <p class="text-emerald-200 mb-2">
          {SHAPES[config.shapeId]?.name ?? "4x4"} •
          {config.timeLimit > 0 ? formatTime(config.timeLimit) : "Unlimited"}
          {#if config.distribution && config.distribution !== "standard"}
            •
            {config.distribution === "random"
              ? "Random"
              : config.distribution === "vowel-heavy"
                ? "Vowel Heavy"
                : "Consonant Heavy"}{/if}
        </p>
        <p class="text-sm text-emerald-300/70 mb-6">
          Drag across letters to form words
        </p>

        <button
          onclick={startGame}
          disabled={!dictionaryLoaded}
          class="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 disabled:cursor-wait text-white font-bold py-4 px-12 rounded-xl text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100"
        >
          {dictionaryLoaded ? "Start Game" : "Loading..."}
        </button>
      </div>

      <button
        onclick={copyLink}
        class="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
      >
        {#if copied}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy game link to share
        {/if}
      </button>

      <a href="/" class="text-emerald-400 hover:text-white text-sm mt-4"
        >← Back to home</a
      >
    </div>
  {:else if gameEnded}
    <div class="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <div
        class="bg-white/10 backdrop-blur rounded-2xl p-8 text-center min-w-80"
      >
        <h1 class="text-3xl font-bold mb-4">Game Over!</h1>
        <p class="text-emerald-200 text-sm mb-2">Final Score</p>
        <p class="text-5xl font-bold text-emerald-300 mb-6">
          {score.toLocaleString()}
        </p>

        <p class="text-emerald-200 mb-4">{foundWords.length} words found</p>

        <div class="max-h-60 overflow-y-auto mb-6 text-left">
          {#each [...foundWords].sort((a, b) => b.score - a.score) as { word, score: wordScore } (word)}
            <div
              class="flex justify-between text-sm py-1 border-b border-white/10"
            >
              <span>{word}</span>
              <span class="text-emerald-300">+{wordScore}</span>
            </div>
          {/each}
        </div>
      </div>

      <a href="/" class="text-emerald-400 hover:text-white text-sm mt-4"
        >← Create new game</a
      >
    </div>
  {:else}
    <div class="max-w-lg mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div class="text-center flex-1">
          <p class="text-emerald-300 text-xs uppercase tracking-wide">Score</p>
          <p class="text-2xl font-bold">{score.toLocaleString()}</p>
        </div>

        {#if config.timeLimit > 0}
          <div class="text-center flex-1">
            <p class="text-emerald-300 text-xs uppercase tracking-wide">Time</p>
            <p
              class="text-2xl font-bold font-mono {timeLeft <= 10
                ? 'text-red-400 animate-pulse'
                : ''}"
            >
              {formatTime(timeLeft)}
            </p>
          </div>
        {/if}

        <div class="text-center flex-1">
          <p class="text-emerald-300 text-xs uppercase tracking-wide">Words</p>
          <p class="text-2xl font-bold">{foundWords.length}</p>
        </div>
      </div>

      <div class="mb-6 pt-8">
        <Board
          {board}
          onWordFound={handleWordFound}
          foundWords={foundWords.map((w) => w.word)}
          disabled={gameEnded}
        />
      </div>

      {#if foundWords.length > 0}
        <div
          class="bg-white/10 backdrop-blur rounded-xl p-4 max-h-48 overflow-y-auto"
        >
          <div class="flex flex-wrap gap-2">
            {#each foundWords as { word, score: wordScore } (word)}
              <span class="bg-emerald-600/50 px-2 py-1 rounded text-sm">
                {word} <span class="text-emerald-300">+{wordScore}</span>
              </span>
            {/each}
          </div>
        </div>
      {/if}

      {#if config.timeLimit === 0}
        <button
          onclick={endGame}
          class="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          End Game
        </button>
      {/if}
    </div>
  {/if}
</div>
