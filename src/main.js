import { MainScene } from './scenes/mainScene';

// Get the canvas element
const canvas = document.getElementById("renderCanvas");

// Set canvas dimensions
canvas.width = window.innerWidth;    // Make canvas full window width
canvas.height = window.innerHeight;  // Make canvas full window height

// Create and render the main scene
const mainScene = new MainScene(canvas);

// The MainScene class handles its own render loop and resize event,
// so we don't need to add those here.
