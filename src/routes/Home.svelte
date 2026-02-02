<script lang="ts">
  import {
    generateBoard,
    boardToLetters,
    type LetterDistribution,
  } from "../lib/board";
  import { encodeGameConfig } from "../lib/urlEncoder";
  import { SHAPES } from "../lib/shapes";
  import { navigate } from "../router";

  let showCustom = $state(false);
  let selectedShape = $state<string>("4x4");
  let timeLimit = $state(90);
  let distribution = $state<LetterDistribution>("standard");

  const timeLimitOptions = [
    { value: 30, label: "0:30" },
    { value: 60, label: "1:00" },
    { value: 90, label: "1:30" },
    { value: 120, label: "2:00" },
    { value: 0, label: "∞" },
  ];

  const distributionOptions: { value: LetterDistribution; label: string }[] = [
    { value: "standard", label: "Standard" },
    { value: "random", label: "Random" },
    { value: "vowel-heavy", label: "Vowel Heavy" },
    { value: "consonant-heavy", label: "Consonant Heavy" },
  ];

  function createGame(
    shapeId: string = "4x4",
    time: number = 90,
    dist: LetterDistribution = "standard",
  ) {
    const shape = SHAPES[shapeId];
    const board = generateBoard(shape, dist);
    const letters = boardToLetters(board);

    const config = {
      letters,
      shapeId,
      timeLimit: time,
      distribution: dist,
    };

    const encoded = encodeGameConfig(config);
    navigate("/game/:encodedConfig", { params: { encodedConfig: encoded } });
  }

  function quickPlay() {
    createGame("4x4", 90, "standard");
  }

  function createCustomGame() {
    createGame(selectedShape, timeLimit, distribution);
  }
</script>

<div
  class="min-h-screen bg-linear-to-br from-emerald-800 to-emerald-950 text-white px-4 py-8 md:py-12 flex flex-col items-center justify-center"
>
  <div class="text-center mb-12">
    <h1 class="text-5xl sm:text-6xl font-bold mb-4 tracking-tight">
      Word Hunt
    </h1>
    <p class="text-emerald-200 text-lg">Find words by connecting letters</p>
  </div>

  <div class="flex flex-col gap-4 w-full max-w-sm">
    <button
      onclick={quickPlay}
      class="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
    >
      New Game
    </button>

    <button
      onclick={() => (showCustom = !showCustom)}
      class="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-all"
    >
      {showCustom ? "Hide Options" : "Custom Game"}
    </button>
  </div>

  {#if showCustom}
    <div class="mt-8 bg-white/10 backdrop-blur rounded-2xl p-6 w-full max-w-sm">
      <h2 class="text-lg font-semibold mb-4">Game Options</h2>

      <fieldset class="mb-6">
        <legend class="block text-emerald-200 text-sm mb-2">Board Shape</legend>
        <div class="grid grid-cols-3 gap-2">
          {#each Object.values(SHAPES) as shape (shape.id)}
            <button
              onclick={() => (selectedShape = shape.id)}
              class="p-2 rounded-lg transition-all text-xs
                {selectedShape === shape.id
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100'}"
            >
              <div class="mb-1 flex justify-center">
                <div
                  class="grid gap-px"
                  style="grid-template-columns: repeat({shape.grid[0]
                    .length}, 6px);"
                >
                  {#each shape.grid.flat() as active, i (i)}
                    <div
                      class="w-1.5 h-1.5 rounded-sm {active
                        ? 'bg-current'
                        : 'bg-transparent'}"
                    ></div>
                  {/each}
                </div>
              </div>
              {shape.name}
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset class="mb-6">
        <legend class="block text-emerald-200 text-sm mb-2">Time Limit</legend>
        <div class="flex gap-2 flex-wrap">
          {#each timeLimitOptions as opt (opt.value)}
            <button
              onclick={() => (timeLimit = opt.value)}
              class="px-4 py-2 rounded-lg transition-all
                {timeLimit === opt.value
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100'}"
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset class="mb-6">
        <legend class="block text-emerald-200 text-sm mb-2"
          >Letter Distribution</legend
        >
        <div class="grid grid-cols-2 gap-2">
          {#each distributionOptions as opt (opt.value)}
            <button
              onclick={() => (distribution = opt.value)}
              class="px-3 py-2 rounded-lg transition-all text-sm
                {distribution === opt.value
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100'}"
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </fieldset>

      <button
        onclick={createCustomGame}
        class="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-xl transition-all"
      >
        Create Game
      </button>
    </div>
  {/if}

  <div class="mt-12 text-center text-emerald-300/70 text-sm max-w-sm">
    <h3 class="font-semibold text-emerald-200 mb-2">How to Play</h3>
    <p>
      Drag your finger or mouse across adjacent letters to form words. Words
      must be at least 3 letters long.
    </p>
  </div>
</div>
