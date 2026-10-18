
/* ==============================
   BERRY LAND - GAME LOGIC
============================== */

document.addEventListener("DOMContentLoaded", () => {
  const levelButtons =
    document.querySelectorAll(".berry-level");

  const gameArea =
    document.getElementById("berry-game");

  const gameTitle =
    document.getElementById("berry-game-title");

  const gameMessage =
    document.getElementById("berry-game-message");

  const closeButton =
    document.getElementById("berry-close");

  // Start a level
  levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      const level = button.dataset.level;

      gameTitle.textContent = `Level ${level}`;
      gameMessage.textContent =
        "Your berry adventure begins here!";

      gameArea.hidden = false;

      gameArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  // Return to level selection
  closeButton.addEventListener("click", () => {
    gameArea.hidden = true;
    document.querySelector(".berry-levels")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  });
});
