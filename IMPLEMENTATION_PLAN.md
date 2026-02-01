# Word Hunt Game - Implementation Plan

## Overview
A "Word Hunt" style word game built with Vite + Svelte where players drag across letters to form words.

## Core Features

### 1. Game Board
- Default 4x4 grid of letter tiles
- Support for custom sizes (5x5) and non-square shapes
- Letters generated with weighted distribution (more common letters appear more often)
- Visual feedback: tiles highlight green when forming a valid word

### 2. Word Selection Mechanics
- Click/touch and drag to select letters
- Valid selections: horizontal, vertical, and diagonal adjacent tiles
- Cannot reuse the same tile in one word
- Path must be contiguous (each letter adjacent to the previous)
- Visual line connecting selected letters

### 3. Word Validation
- Minimum 3 letters required
- Must be valid Scrabble dictionary word
- Use `an-array-of-english-words` npm package for validation

### 4. Scoring System
```
3 letters: 100 points
4 letters: 400 points
5 letters: 800 points
6 letters: 1,400 points
7 letters: 1,800 points
8+ letters: 2,200 points (+ bonus for longer)
```

### 5. Game Timer
- Configurable time limit (default: 90 seconds)
- Visual countdown display
- Game ends when timer reaches 0

## UI/UX Flow

### Landing Screen (`/`)
- Game title and logo
- "New Game" button → creates default 4x4, 90-second game
- "Custom Game" button → opens customization modal

### Custom Game Modal
Options:
- **Board Shape**: Visual selector
  - 4x4 (default)
  - 5x5
  - Cross shape
  - Diamond shape
  - Custom shapes
- **Time Limit**: 60s, 90s, 120s, 180s, unlimited
- **Letter Distribution**:
  - Standard (weighted by English frequency)
  - Random (uniform)
  - Vowel-heavy
  - Consonant-heavy

### Game Screen (`/game/:encodedData`)
- Board display with letter tiles
- Score display
- Timer countdown
- Found words list (scrollable)
- Current word being selected

### Results Screen
- Final score
- All words found
- "Play Again" button
- "Share" button (copy link)

## Technical Implementation

### URL Encoding
Game state encoded in URL for sharing:
```javascript
const gameState = {
  board: [[letter, ...], ...],  // 2D array of letters
  shape: "4x4" | "5x5" | "cross" | "diamond" | [...],
  timeLimit: 90,
  seed: 12345  // for reproducibility
};
// Compress with pako (gzip), then base64url encode
```

### File Structure
```
src/
├── App.svelte              # Main app with routing
├── routes/
│   ├── Home.svelte         # Landing page
│   └── Game.svelte         # Game screen
├── components/
│   ├── Board.svelte        # Game board component
│   ├── Tile.svelte         # Individual letter tile
│   ├── Timer.svelte        # Countdown timer
│   ├── ScoreDisplay.svelte # Score & found words
│   ├── CustomGameModal.svelte # Customization UI
│   └── ShapeSelector.svelte # Visual shape picker
├── lib/
│   ├── dictionary.js       # Word validation
│   ├── boardGenerator.js   # Letter generation
│   ├── scoring.js          # Score calculation
│   ├── urlEncoder.js       # Game state encoding/decoding
│   └── shapes.js           # Board shape definitions
└── styles/
    └── global.css          # Global styles
```

### Key Algorithms

#### Letter Generation
Weighted distribution based on English letter frequency:
```javascript
const letterWeights = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3,
  H: 6.1, R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4,
  W: 2.4, F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0,
  K: 0.8, J: 0.15, X: 0.15, Q: 0.10, Z: 0.07
};
```

#### Adjacency Check
```javascript
function isAdjacent(pos1, pos2) {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}
```

### Mobile Considerations
- Touch events for drag selection
- Prevent scroll while selecting
- Large touch targets (min 44px)
- Responsive layout
- Visual feedback on touch

### Styling Theme
- Clean, modern design
- Green color scheme (like the reference image)
- Smooth animations for selection
- Drop shadows on tiles
- Gradient backgrounds

## Implementation Order

1. ✅ Project setup (Vite + Svelte)
2. [ ] Dictionary integration
3. [ ] Basic board component with letter generation
4. [ ] Tile selection mechanics (mouse + touch)
5. [ ] Word validation and scoring
6. [ ] Timer component
7. [ ] Game state management
8. [ ] URL encoding/decoding
9. [ ] SPA routing
10. [ ] Landing page & custom game modal
11. [ ] Shape customization
12. [ ] Polish: animations, styling, mobile optimization
13. [ ] Results screen and sharing

## Dependencies
- `svelte` - UI framework
- `vite` - Build tool
- `@sveltejs/vite-plugin-svelte` - Vite integration
- `an-array-of-english-words` - Dictionary for validation
- `pako` - Gzip compression for URL encoding
