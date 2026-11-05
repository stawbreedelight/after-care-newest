
/* ==============================
   VANILLA LAND
============================== */

document.addEventListener("DOMContentLoaded", () => {

    const gameLinks =
        document.querySelectorAll(".game-link");

    gameLinks.forEach((link) => {

        link.addEventListener("click", () => {

            link.classList.add("game-selected");

        });

    });

});
