# Rewind: The Last Decision

**Rewind: The Last Decision** is a browser-based interactive mystery game made as a group project using HTML, CSS and Vanilla JavaScript.

The idea for the project was inspired by the survival and decision-based games seen in *Alice in Borderland*. Instead of making a normal static webpage, we wanted to create something where the user actually takes part in the story. The choices made by the player can change what happens next, and the rewind feature gives the player a chance to go back and try a different decision.

## What is the game about?

The player moves through different situations, looks for clues, solves puzzles and makes decisions. Some choices can lead to different paths and endings.

The main idea is simple:

**Make a decision → see what happens → learn from it → rewind if needed → try another path.**

## Main Features

- Interactive story with different scenes
- Choice-based gameplay
- Clue collection
- Puzzle and code-based challenges
- Timer
- Lives and score system
- Multiple possible endings
- Rewind system to return to a previous game state
- Dynamic content updates using JavaScript
- Game progress handling through browser local storage
- Dark, cinematic interface
- Responsive layout for different screen sizes

## Technologies Used

- **HTML5** – structure of the webpage and game interface
- **CSS3** – layout, styling, animations, transitions and responsive design
- **Vanilla JavaScript** – game logic, choices, scenes, timer, score, lives, clues and rewind system
- **DOM Manipulation** – updating the interface according to the current game state
- **Local Storage** – storing relevant game progress in the browser
- **Visual Studio Code** – used for development and editing the project files

No frameworks, backend server or database are required.

## Project Structure

```text
rewind-game/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### File Description

**index.html**  
Contains the main structure of the game interface.

**style.css**  
Contains the visual design, layout, buttons, animations, transitions and responsive styling.

**script.js**  
Contains the main game logic, including scenes, choices, clues, puzzles, timer, lives, score, rewind history and endings.

**README.md**  
Contains information about the project and how to use it.

## How to Run

No installation or setup is required.

1. Download or clone the repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.
4. Click **Start Game** and begin playing.

For development, the project can also be opened in **Visual Studio Code** and run using a local development extension such as Live Server.

## How the Rewind System Works

The rewind feature is one of the main parts of the project.

Before important decisions are made, the game keeps the required information about the current state of the game. These previous states are stored in a history list.

When the player chooses to rewind, the game restores an earlier state and updates the screen. This allows the player to make a different choice without restarting the whole game.

In simple terms:

```text
Current Game State
       ↓
Save Previous State
       ↓
Player Makes a Choice
       ↓
Story Continues
       ↓
Player Uses Rewind
       ↓
Previous State Restored
       ↓
Different Choice
```

## Project Goal

The main goal of this project is to show how HTML, CSS and JavaScript can be combined to create a complete interactive browser application instead of only a static webpage.

While developing the project, we worked with concepts such as:

- HTML structure
- CSS layouts and animations
- JavaScript functions
- Objects and arrays
- DOM manipulation
- Event handling
- Conditional logic
- Game state management
- Dynamic content
- Browser local storage

## Inspiration

The concept of the project is inspired by the survival and decision-making style of **Alice in Borderland**. However, the story, characters, game structure and implementation of this project are our own.

## Future Improvements

Some features that could be added in future versions are:

- More chapters and story paths
- More puzzles and clues
- Additional endings
- Sound effects and background music
- More detailed animations
- Difficulty levels
- Achievement system
- More save slots
- Improved mobile interface

## Project Status

**Current Status:** Working front-end prototype / mini project

The main gameplay system, interface and core interactive features have been implemented using client-side technologies.

## Team Project

This project was developed as a group project for **Client Side Web Technologies**.

---

Made with HTML, CSS and JavaScript.
