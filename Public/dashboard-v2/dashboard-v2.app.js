
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
        playerOneName &&
        savedUID === user.uid &&
        savedUsername
    ) {
        playerOneName.textContent = savedUsername;
    } else if (playerOneName) {
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

        if (playerTwoName) {

            playerTwoName.textContent =
                data.connected
                    ? (data.partnerUsername || "Partner")
                    : "Not Connected";

        }

    } catch (error) {

        console.error(
            "Unable to load partner connection:",
            error
        );

        if (playerTwoName) {
            playerTwoName.textContent =
                "Partner Unavailable";
        }

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

    if (relationshipLevel) {
        relationshipLevel.textContent =
            demoRelationship.level;
    }

    if (relationshipLevelName) {
        relationshipLevelName.textContent =
            demoRelationship.levelName;
    }

    const progress = Math.min(
        100,
        Math.max(
            0,
            (demoRelationship.xp /
                demoRelationship.xpNeeded) * 100
        )
    );

    if (xpProgressFill) {
        xpProgressFill.style.width =
            progress + "%";
    }

    if (xpProgressText) {
        xpProgressText.textContent =
            demoRelationship.xp +
            " / " +
            demoRelationship.xpNeeded +
            " XP";
    }

    if (gamesCompleted) {
        gamesCompleted.textContent =
            demoRelationship.games;
    }

    if (datesCompleted) {
        datesCompleted.textContent =
            demoRelationship.dates;
    }

    if (badgesEarned) {
        badgesEarned.textContent =
            demoRelationship.badges;
    }

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
========================================== */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            if (dashboardMessage) {
                dashboardMessage.textContent =
                    "Notifications are coming soon ♡";
            }

        }
    );

}


/* ==========================================
   DISPLAY SAVED FANTASY AVATAR
========================================== */

function loadDashboardAvatar() {

    const container =
        document.getElementById("playerOneAvatar");

    if (!container) return;

    const STORE_KEY = "midVanillaAvatarV1";

    let saved;

    try {

        saved = JSON.parse(
            localStorage.getItem(STORE_KEY) || "null"
        );

    } catch (error) {

        console.error(
            "Unable to read saved avatar:",
            error
        );

        return;

    }

    container.replaceChildren();

    if (!saved) {

        container.textContent =
            "Create your avatar ✦";

        return;

    }

    const avatarType =
        saved.currentAvatar === "female"
            ? "female"
            : "male";

    const imageFolder = "/avatar/images/";

    /* ADD AN IMAGE LAYER */

    function addLayer(filename, zIndex, opacity = 1) {

        if (!filename) return;

        const img = document.createElement("img");

        img.src = imageFolder + filename;
        img.alt = "";

        img.style.position = "absolute";
        img.style.inset = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";

        img.style.zIndex = String(zIndex);
        img.style.opacity = String(opacity);

        img.onerror = () => img.remove();

        container.appendChild(img);

    }


    /* SAVED ITEMS */

    const equipped = saved.equipped || {};
    const face = saved.faceSelections || {};


    /* WINGS BEHIND BODY */

    if (
        Object.values(equipped).includes("fairy_wings")
    ) {
        addLayer("fairy_wings.png", 1);
    }


    /* BASE AVATAR */

    addLayer(
        `${avatarType}-base.png`,
        2
    );


    /* SKIN TONE */

    const rawSkinTone =
        Number(saved.skinTones?.[avatarType] ?? 0);

    const skinTone = Number.isFinite(rawSkinTone)
        ? Math.max(0, Math.min(100, rawSkinTone))
        : 0;

    addLayer(
        `${avatarType}-dark-skin.png`,
        3,
        skinTone / 100
    );


    /* EYES AND LIPS */

    addLayer(
        face.eyes || "eyes-brown.png",
        4
    );

    addLayer(
        face.lips || "Closed-lips.png",
        5
    );


    /* BOOTS AND BELT */

    if (
        Object.values(equipped).includes("fantasy_boots")
    ) {
        addLayer("fantasy_boots.png", 6);
    }

    if (
        Object.values(equipped).includes("belt_pouch")
    ) {
        addLayer("belt_pouch.png", 7);
    }


    /* CAPE */

    if (
        Object.values(equipped).includes("short_cape")
    ) {
        addLayer("short_cape.png", 8);
    }


    /* HAIR */

    addLayer(
        face.hair || "blonde-short-hair.png",
        9
    );


    /* ELF EARS */

    if (
        Object.values(equipped).includes("elf_ears")
    ) {
        addLayer("elf_ears.png", 10);
    }


    /* HATS AND CROWNS */

    const hat = equipped.hat;

    if (
        [
            "cowboy_hat",
            "flower_crown",
            "leaf_circlet"
        ].includes(hat)
    ) {
        addLayer(`${hat}.png`, 11);
    }


    /* WAND IN FRONT */

    if (
        Object.values(equipped).includes("wand")
    ) {
        addLayer("wand.png", 12);
    }

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

        if (dashboard) {
            dashboard.hidden = false;
        }

        if (loadingMessage) {
            loadingMessage.hidden = true;
        }

        /* LOAD SAVED AVATAR */

        try {
            loadDashboardAvatar();
        } catch (error) {
            console.error(
                "Avatar display failed:",
                error
            );
        }

        /* LOAD PARTNER INFORMATION */

        await loadPartnerConnection(user);

    },

    (error) => {

        console.error(
            "Dashboard V2 authentication failed:",
            error
        );

        if (loadingMessage) {
            loadingMessage.textContent =
                "Unable to open your world. Please refresh.";
        }

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

            if (dashboardMessage) {
                dashboardMessage.textContent =
                    "Logging out...";
            }

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
                    error
                );

                if (dashboardMessage) {
                    dashboardMessage.textContent =
                        "Unable to log out. Please try again.";
                }

                logoutButton.disabled = false;

            }

        }

    );

}
