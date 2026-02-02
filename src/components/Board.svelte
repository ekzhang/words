<script lang="ts">
  import { isValidWord } from "../lib/dictionary";
  import { getWordScore } from "../lib/scoring";
  import {
    isAdjacent,
    isDiagonalAdjacent,
    isOrthogonalAdjacent,
    type BoardCell,
  } from "../lib/board";

  interface Props {
    board: BoardCell[][];
    onWordFound: (word: string, score: number) => void;
    foundWords: string[];
    disabled?: boolean;
  }

  let { board, onWordFound, foundWords, disabled = false }: Props = $props();

  let selectedPath: BoardCell[] = $state([]);
  let isDragging = $state(false);
  let boardEl: HTMLElement | null = $state(null);

  const currentWord = $derived(selectedPath.map((c) => c.letter).join(""));
  const isValid = $derived(isValidWord(currentWord));
  const isAlreadyFound = $derived(foundWords.includes(currentWord));

  function getCellKey(cell: BoardCell): string {
    return `${cell.row}-${cell.col}`;
  }

  function isSelected(cell: BoardCell): boolean {
    return selectedPath.some((c) => c.row === cell.row && c.col === cell.col);
  }

  function canSelect(cell: BoardCell): boolean {
    if (!cell.active || isSelected(cell)) return false;
    if (selectedPath.length === 0) return true;
    return isAdjacent(selectedPath[selectedPath.length - 1], cell);
  }

  function handleCellSelect(cell: BoardCell) {
    if (!isDragging || disabled) return;

    // Check if going back to previous cell (undo)
    if (selectedPath.length >= 2) {
      const prevCell = selectedPath[selectedPath.length - 2];
      if (prevCell.row === cell.row && prevCell.col === cell.col) {
        selectedPath = selectedPath.slice(0, -1);
        return;
      }
    }

    if (canSelect(cell)) {
      selectedPath = [...selectedPath, cell];
    }
  }

  function handleStart(cell: BoardCell, e: MouseEvent | TouchEvent) {
    if (disabled || !cell.active) return;
    e.preventDefault();
    isDragging = true;
    selectedPath = [cell];
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (isValid) {
      const score = getWordScore(currentWord.length);
      onWordFound(currentWord, score);
    }

    selectedPath = [];
  }

  function getTileCenter(cell: BoardCell): { x: number; y: number } | null {
    const el = document.querySelector(
      `[data-cell="${cell.row}-${cell.col}"]`,
    ) as HTMLElement;
    if (!el || !boardEl) return null;
    const rect = el.getBoundingClientRect();
    const boardRect = boardEl.getBoundingClientRect();
    return {
      x: rect.left - boardRect.left + rect.width / 2,
      y: rect.top - boardRect.top + rect.height / 2,
    };
  }

  function getPathD(): string {
    if (selectedPath.length < 2) return "";
    const points = selectedPath.map(getTileCenter).filter(Boolean) as {
      x: number;
      y: number;
    }[];
    if (points.length < 2) return "";
    return (
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")
    );
  }

  function getCellAtPoint(clientX: number, clientY: number): BoardCell | null {
    const el = document.elementFromPoint(clientX, clientY);
    const cellAttr = el?.closest("[data-cell]")?.getAttribute("data-cell");
    if (cellAttr) {
      const [row, col] = cellAttr.split("-").map(Number);
      return board[row]?.[col] ?? null;
    }
    return null;
  }

  function getDistanceToCenter(
    cell: BoardCell,
    clientX: number,
    clientY: number,
  ): number {
    if (!boardEl) return Infinity;
    const center = getTileCenter(cell);
    if (!center) return Infinity;
    const boardRect = boardEl.getBoundingClientRect();
    const absX = boardRect.left + center.x;
    const absY = boardRect.top + center.y;
    return Math.hypot(clientX - absX, clientY - absY);
  }

  function handlePointerMove(clientX: number, clientY: number) {
    if (!isDragging || disabled) return;

    const exactCell = getCellAtPoint(clientX, clientY);
    if (!exactCell) return;

    if (selectedPath.length === 0) {
      handleCellSelect(exactCell);
      return;
    }

    const lastCell = selectedPath[selectedPath.length - 1];
    const distToCenter = getDistanceToCenter(exactCell, clientX, clientY);

    // Check for undo (going back to previous cell)
    if (selectedPath.length >= 2) {
      const prevCell = selectedPath[selectedPath.length - 2];
      if (
        exactCell.row === prevCell.row &&
        exactCell.col === prevCell.col &&
        (isDiagonalAdjacent(lastCell, exactCell) || distToCenter < 50)
      ) {
        handleCellSelect(exactCell);
        return;
      }
    }

    // For diagonal moves: any overlap triggers
    if (isDiagonalAdjacent(lastCell, exactCell)) {
      handleCellSelect(exactCell);
      return;
    } else if (isOrthogonalAdjacent(lastCell, exactCell)) {
      // For horizontal/vertical moves: require being somewhat close to center
      // This prevents corner clips from triggering
      const distToCenter = getDistanceToCenter(exactCell, clientX, clientY);
      if (distToCenter < 50) {
        handleCellSelect(exactCell);
      }
    } else {
      // Not adjacent
      return;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    handlePointerMove(e.clientX, e.clientY);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  }
</script>

<svelte:window onmouseup={handleEnd} ontouchend={handleEnd} />

<div
  bind:this={boardEl}
  class="board relative select-none touch-none"
  style="--cols: {board[0]?.length ?? 4}; --rows: {board.length}"
  role="grid"
  tabindex="0"
  onmousemove={handleMouseMove}
  ontouchmove={handleTouchMove}
>
  <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
    {#if selectedPath.length >= 2}
      <path
        d={getPathD()}
        stroke={isValid && !isAlreadyFound ? "#ffffff" : "#ff0000"}
        stroke-width="20"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        opacity="0.4"
      />
    {/if}
  </svg>

  <div
    class="grid gap-1 sm:gap-1.5"
    style="grid-template-columns: repeat(var(--cols), 1fr);"
  >
    {#each board as row, i (i)}
      {#each row as cell (getCellKey(cell))}
        {#if cell.active}
          <button
            data-cell="{cell.row}-{cell.col}"
            class="tile aspect-square flex items-center justify-center text-4xl sm:text-5xl font-bold rounded-lg transition-all duration-150 select-none
              {isSelected(cell)
              ? isValid
                ? isAlreadyFound
                  ? 'bg-yellow-500 text-white shadow-lg scale-[1.025]'
                  : 'bg-green-500 text-white shadow-lg scale-[1.025]'
                : 'bg-amber-100 text-amber-900 shadow-lg scale-[1.025]'
              : 'bg-amber-50 text-amber-900 shadow-md hover:shadow-lg'}"
            onmousedown={(e) => handleStart(cell, e)}
            ontouchstart={(e) => handleStart(cell, e)}
            {disabled}
          >
            {cell.letter}
          </button>
        {:else}
          <div class="aspect-square"></div>
        {/if}
      {/each}
    {/each}
  </div>

  {#if currentWord.length >= 2}
    <div
      class="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold text-lg whitespace-nowrap
      {isValid
        ? isAlreadyFound
          ? 'bg-yellow-500 text-white'
          : 'bg-green-500 text-white'
        : 'bg-gray-700 text-white'}"
    >
      {currentWord}
      {#if isValid && !isAlreadyFound}
        <span class="ml-2 text-green-200"
          >+{getWordScore(currentWord.length)}</span
        >
      {:else if isAlreadyFound}
        <span class="ml-2 text-yellow-200">already found</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .board {
    max-width: min(90vw, 420px);
    margin: 0 auto;
  }

  .tile {
    min-width: 60px;
    min-height: 60px;
    border: 2px solid rgba(180, 140, 100, 0.3);
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .tile:hover:not(:disabled) {
    animation: wiggle 0.3s ease-in-out;
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-3deg);
    }
    75% {
      transform: rotate(3deg);
    }
  }

  @media (min-width: 640px) {
    .tile {
      min-width: 70px;
      min-height: 70px;
    }
  }
</style>
