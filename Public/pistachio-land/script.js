
/* =========================
   PISTACHIO LAND LEVELS
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const levelButtons =
        document.querySelectorAll(".level-button");

    const gameSection =
        document.getElementById("pistachio-game");

    const gameTitle =
        document.getElementById("game-title");

    const gameDescription =
        document.getElementById("game-description");

    const closeButton =
        document.getElementById("close-game");

    levelButtons.forEach(button => {

        button.addEventListener("click", () => {

            const level = button.dataset.level;

            gameTitle.textContent = `Level ${level}`;

            gameDescription.textContent =
                "Your magical pistachio adventure is coming soon!";

            gameSection.hidden = false;

            gameSection.scrollIntoView({
                behavior: "smooth"
            });

        });

    });

    closeButton.addEventListener("click", () => {

        gameSection.hidden = true;

        document.querySelector(".pistachio-levels")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});
