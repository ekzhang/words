import { createRouter } from "sv-router";
import Home from "./routes/Home.svelte";
import Game from "./routes/Game.svelte";

export const { p, navigate, isActive, route } = createRouter({
  "/": Home,
  "/game/:encodedConfig": Game,
});
