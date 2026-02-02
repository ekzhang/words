export function getWordScore(wordLength: number): number {
  switch (wordLength) {
    case 3:
      return 100;
    case 4:
      return 400;
    case 5:
      return 800;
    case 6:
      return 1400;
    case 7:
      return 1800;
    default:
      if (wordLength >= 8) {
        return 2200 + (wordLength - 8) * 400;
      }
      return 0;
  }
}
