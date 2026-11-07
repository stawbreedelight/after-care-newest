
/* ==========================================
   MID VANILLA DASHBOARD V2
   COUPLES RPG DASHBOARD
========================================== */

/* FIREBASE AUTHENTICATION */

import { auth } from "../date-planner/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* ==========================================
   PAGE ELEMENTS
========================================== */

const dashboard =
    document.getElementById("dashboardV2");

const loadingMessage =
    document.getElementById("loadingMessage");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const logoutButton =
    document.getElementById("logoutButton");

const notificationButton =
    document.getElementById("notificationButton");


/* RELATIONSHIP ELEMENTS */

const playerOneName =
    document.getElementById("playerOneName");

const playerTwoName =
    document.getElementById("playerTwoName");

const relationshipLevel =
    document.getElementById("relationshipLevel");

const relationshipLevelName =
    document.getElementById("relationshipLevelName");

const xpProgressFill =
    document.getElementById("xpProgressFill");

const xpProgressText =
    document.getElementById("xpProgressText");

const gamesCompleted =
    document.getElementById("gamesCompleted");

const datesCompleted =
    document.getElementById("datesCompleted");

const badgesEarned =
    document.getElementById("badgesEarned");


/* ==========================================
   LUCIDE ICONS
========================================== */

function initializeIcons() {

    if (window.lucide) {
        window.lucide.createIcons();
        return;
    }

    window.addEventListener(
        "load",
        () => {
            if (window.lucide) {
                window.lucide.createIcons();
            }
        },
        { once: true }
    );

}


/* ==========================================
   DISPLAY USERNAME
========================================== */

function displayUsername(user) {

    const savedUID =
        sessionStorage.getItem("midVanillaUID");

    const savedUsername =
        sessionStorage.getItem("midVanillaUsername");

    if (
        savedUID === user.uid &&
        savedUsername
    ) {
        playerOneName.textContent = savedUsername;
    } else {
        playerOneName.textContent = "You";
    }

}


/* ==========================================
   LOAD PARTNER CONNECTION
========================================== */

async function loadPartnerConnection(user) {

    try {

        const token = await user.getIdToken();

        const response = await fetch(
            "https://auth.midvanilla.com/partner/status",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Partner connection unavailable"
            );
        }

        const data = await response.json();

        if (data.connected) {

            playerTwoName.textContent =
                data.partnerUsername || "Partner";

        } else {

            playerTwoName.textContent =
                "Not Connected";

        }

    } catch (error) {

        console.error(
            "Unable to load partner connection:",
            error.name
        );

        playerTwoName.textContent =
            "Partner Unavailable";

    }

}


/* ==========================================
   RELATIONSHIP LEVELS
   TEMPORARY DEMO VALUES
========================================== */

const demoRelationship = {

    level: 1,

    levelName: "The New Adventurers",

    xp: 0,

    xpNeeded: 100,

    games: 0,

    dates: 0,

    badges: 0

};


function displayRelationshipProgress() {

    relationshipLevel.textContent =
        demoRelationship.level;

    relationshipLevelName.textContent =
        demoRelationship.levelName;

    const progress =
        Math.min(
            100,
            Math.max(
                0,
                (
                    demoRelationship.xp /
                    demoRelationship.xpNeeded
                ) * 100
            )
        );

    xpProgressFill.style.width =
        progress + "%";

    xpProgressText.textContent =
        demoRelationship.xp +
        " / " +
        demoRelationship.xpNeeded +
        " XP";

    gamesCompleted.textContent =
        demoRelationship.games;

    datesCompleted.textContent =
        demoRelationship.dates;

    badgesEarned.textContent =
        demoRelationship.badges;

}


/* ==========================================
   RELATIONSHIP SKILLS
   TEMPORARY DEMO VALUES
========================================== */

const demoSkills = {

    time: {
        level: 1,
        progress: 0
    },

    connection: {
        level: 1,
        progress: 0
    },

    communication: {
        level: 1,
        progress: 0
    },

    intimacy: {
        level: 1,
        progress: 0
    },

    support: {
        level: 1,
        progress: 0
    },

    trust: {
        level: 1,
        progress: 0
    },

    playfulness: {
        level: 1,
        progress: 0
    }

};


function displayRelationshipSkills() {

    document.querySelectorAll(
        ".skill-item"
    ).forEach(skillElement => {

        const skillName =
            skillElement.dataset.skill;

        const skillData =
            demoSkills[skillName];

        if (!skillData) return;

        const progressBar =
            skillElement.querySelector(
                ".skill-bar > div"
            );

        const levelLabel =
            skillElement.querySelector(
                ".skill-level"
            );

        if (progressBar) {
            progressBar.style.width =
                skillData.progress + "%";
        }

        if (levelLabel) {
            levelLabel.textContent =
                "Lv. " + skillData.level;
        }

    });

}


/* ==========================================
   NOTIFICATIONS
   FUTURE FEATURE
========================================== */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            dashboardMessage.textContent =
                "Notifications are coming soon ♡";

        }
    );

}


/* ==========================================
   CHECK LOGIN STATUS
========================================== */

onAuthStateChanged(
    auth,

    async (user) => {

        if (!user || user.isAnonymous) {

            window.location.replace(
                "../login.html"
            );

            return;
        }

        /* USER IS AUTHENTICATED */

        displayUsername(user);

        displayRelationshipProgress();

        displayRelationshipSkills();

        initializeIcons();

        /* SHOW DASHBOARD */

        dashboard.hidden = false;

        loadingMessage.hidden = true;

        /* LOAD PARTNER INFORMATION */

        await loadPartnerConnection(user);

    },

    (error) => {

        console.error(
            "Dashboard V2 authentication failed:",
            error.code || error.name
        );

        loadingMessage.textContent =
            "Unable to open your world. Please refresh.";

    }
);


/* ==========================================
   LOG OUT
========================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",

        async () => {

            logoutButton.disabled = true;

            dashboardMessage.textContent =
                "Logging out...";

            try {

                await signOut(auth);

                sessionStorage.removeItem(
                    "midVanillaUID"
                );

                sessionStorage.removeItem(
                    "midVanillaUsername"
                );

                window.location.replace(
                    "../login.html"
                );

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error.code || error.name
                );

                dashboardMessage.textContent =
                    "Unable to log out. Please try again.";

                logoutButton.disabled = false;

            }

        }
    );

}
