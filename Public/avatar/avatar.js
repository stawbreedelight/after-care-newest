
/* ==========================================
   MID VANILLA — FANTASY AVATAR CREATOR

   Male + Female avatars
   Individual skin-tone settings
   Fantasy wardrobe
   Accessory positioning
   Local browser saving
========================================== */


/* ==========================================
   FANTASY WARDROBE ITEMS
========================================== */

const ITEMS = [
  {
    id: 'elf_ears',
    name: 'Elf ears',
    category: 'head',
    slot: 'ears',
    layer: 'front',
    x: 50, y: 15, width: 31
  },
  {
    id: 'cowboy_hat',
    name: 'Cowboy hat',
    category: 'head',
    slot: 'hat',
    layer: 'front',
    x: 50, y: 5, width: 42
  },
  {
    id: 'flower_crown',
    name: 'Flower crown',
    category: 'head',
    slot: 'hat',
    layer: 'front',
    x: 50, y: 9, width: 37
  },
  {
    id: 'leaf_circlet',
    name: 'Leaf circlet',
    category: 'head',
    slot: 'hat',
    layer: 'front',
    x: 50, y: 10, width: 36
  },
  {
    id: 'fairy_wings',
    name: 'Fairy wings',
    category: 'magic',
    slot: 'back',
    layer: 'behind',
    x: 50, y: 40, width: 91
  },
  {
    id: 'short_cape',
    name: 'Short cape',
    category: 'outfit',
    slot: 'back',
    layer: 'behind',
    x: 50, y: 35, width: 66
  },
  {
    id: 'belt_pouch',
    name: 'Belt pouch',
    category: 'outfit',
    slot: 'belt',
    layer: 'front',
    x: 50, y: 48, width: 45
  },
  {
    id: 'fantasy_boots',
    name: 'Fantasy boots',
    category: 'outfit',
    slot: 'boots',
    layer: 'front',
    x: 50, y: 91, width: 50
  },
  {
    id: 'wand',
    name: 'Magic wand',
    category: 'magic',
    slot: 'hand',
    layer: 'front',
    x: 86, y: 55, width: 36
  }
];


/* ==========================================
   AVATAR IMAGE SETTINGS
========================================== */

const AVATARS = {

  male: {
    base: 'images/male-base.png',
    overlay: 'images/male-dark-skin.png'
  },

  female: {
    base: 'images/female-base.png',
    overlay: 'images/female-dark-skin.png'
  }

};


/* ==========================================
   PAGE ELEMENTS
========================================== */

const $ = id => document.getElementById(id);

const itemGrid = $('itemGrid');
const stack = $('avatarStack');
const adjustSelect = $('adjustItem');

const baseAvatar = $('baseAvatar');
const skinOverlay = $('skinOverlay');
const skinSlider = $('skinSlider');

const avatarButtons =
  document.querySelectorAll('.avatar-option');

const saveMessage = $('saveMessage');


/* ==========================================
   SAVED DATA
========================================== */

const STORE_KEY = 'midVanillaAvatarV1';

let equipped = {};
let fits = {};
let selectedId = '';
let filter = 'all';

let currentAvatar = 'male';

let skinTones = {
  male: 0,
  female: 0
};


/* LOAD SAVED SETTINGS */

try {

  const saved = JSON.parse(
    localStorage.getItem(STORE_KEY) || '{}'
  );

  equipped = saved.equipped || {};
  fits = saved.fits || {};

  if (AVATARS[saved.currentAvatar]) {
    currentAvatar = saved.currentAvatar;
  }

  if (saved.skinTones) {

    for (const type of ['male', 'female']) {

      const value = Number(
        saved.skinTones[type] ?? 0
      );

      skinTones[type] = Number.isFinite(value)
        ? Math.max(0, Math.min(100, value))
        : 0;

    }

  }

} catch (error) {

  console.warn(
    'Could not load saved avatar settings:',
    error
  );

}


/* ==========================================
   AVATAR SELECTION
========================================== */

function updateAvatarAppearance() {

  const avatar = AVATARS[currentAvatar];

  if (baseAvatar) {
    baseAvatar.src = avatar.base;
  }

  if (skinOverlay) {

    skinOverlay.src = avatar.overlay;

    skinOverlay.style.opacity =
      skinTones[currentAvatar] / 100;

  }

  if (skinSlider) {
    skinSlider.value = skinTones[currentAvatar];
  }

  avatarButtons.forEach(button => {

    const active =
      button.dataset.avatar === currentAvatar;

    button.classList.toggle('active', active);

    button.setAttribute(
      'aria-pressed',
      String(active)
    );

  });

}


/* SWITCH MALE / FEMALE */

avatarButtons.forEach(button => {

  button.addEventListener('click', () => {

    const type = button.dataset.avatar;

    if (!AVATARS[type]) return;

    currentAvatar = type;

    updateAvatarAppearance();

    saveMessage.textContent = 'Unsaved changes';

  });

});


/* ==========================================
   SKIN TONE SLIDER
========================================== */

if (skinSlider) {

  skinSlider.addEventListener('input', event => {

    const tone = Number(event.target.value);

    skinTones[currentAvatar] = tone;

    if (skinOverlay) {

      skinOverlay.style.opacity =
        tone / 100;

    }

    saveMessage.textContent = 'Unsaved changes';

  });

}


/* ==========================================
   ACCESSORY FIT SETTINGS
========================================== */

const defaults = id => {

  const item = ITEMS.find(
    item => item.id === id
  );

  return {
    x: item.x,
    y: item.y,
    width: item.width
  };

};

const getFit = id => ({
  ...defaults(id),
  ...fits[id]
});


/* ==========================================
   RENDER AVATAR ACCESSORIES
========================================== */

function renderAvatar() {

  stack.querySelectorAll('.avatar-item')
    .forEach(node => node.remove());

  for (const item of ITEMS) {

    if (equipped[item.slot] !== item.id) {
      continue;
    }

    const fit = getFit(item.id);

    const img = document.createElement('img');

    img.src = `images/${item.id}.png`;
    img.alt = '';

    img.className =
      `avatar-item ${item.layer}`;

    img.style.left = `${fit.x}%`;
    img.style.top = `${fit.y}%`;
    img.style.width = `${fit.width}%`;

    stack.appendChild(img);

  }

}


/* ==========================================
   RENDER WARDROBE GRID
========================================== */

function renderGrid() {

  itemGrid.replaceChildren();

  const visibleItems = ITEMS.filter(item =>
    filter === 'all' ||
    item.category === filter
  );

  for (const item of visibleItems) {

    const active =
      equipped[item.slot] === item.id;

    const btn = document.createElement('button');

    btn.type = 'button';

    btn.className =
      `item${active ? ' selected' : ''}`;

    btn.setAttribute(
      'aria-pressed',
      String(active)
    );

    btn.title =
      `${active ? 'Remove' : 'Equip'} ${item.name}`;

    const img = document.createElement('img');

    img.src = `images/${item.id}.png`;
    img.alt = '';

    const title = document.createElement('span');

    title.textContent = item.name;

    btn.append(img, title);

    btn.addEventListener('click', () => {

      if (active) {

        delete equipped[item.slot];

        if (selectedId === item.id) {
          selectedId = '';
        }

      } else {

        equipped[item.slot] = item.id;
        selectedId = item.id;

      }

      renderAll();

      saveMessage.textContent = 'Unsaved changes';

    });

    itemGrid.appendChild(btn);

  }

}


/* ==========================================
   POSITIONING CONTROLS
========================================== */

function renderControls() {

  const activeItems = ITEMS.filter(item =>
    equipped[item.slot] === item.id
  );

  if (!activeItems.some(item =>
    item.id === selectedId
  )) {

    selectedId = activeItems[0]?.id || '';

  }

  adjustSelect.replaceChildren();

  if (!activeItems.length) {

    const option = new Option(
      'Equip an item first',
      ''
    );

    adjustSelect.add(option);

  }

  for (const item of activeItems) {

    adjustSelect.add(
      new Option(item.name, item.id)
    );

  }

  adjustSelect.value = selectedId;

  for (const id of [
    'xRange',
    'yRange',
    'widthRange'
  ]) {

    $(id).disabled = !selectedId;

  }

  $('resetFitBtn').disabled = !selectedId;

  if (selectedId) {

    const fit = getFit(selectedId);

    $('xRange').value = fit.x;
    $('yRange').value = fit.y;
    $('widthRange').value = fit.width;

  }

}


/* ==========================================
   RENDER EVERYTHING
========================================== */

function renderAll() {

  updateAvatarAppearance();

  renderAvatar();

  renderGrid();

  renderControls();

}


/* ==========================================
   WARDROBE FILTER BUTTONS
========================================== */

document.querySelectorAll('.filter')
  .forEach(button => {

    button.addEventListener('click', () => {

      filter = button.dataset.filter;

      document.querySelectorAll('.filter')
        .forEach(other => {

          const active = other === button;

          other.classList.toggle(
            'active',
            active
          );

          other.setAttribute(
            'aria-pressed',
            String(active)
          );

        });

      renderGrid();

    });

  });


/* ==========================================
   SELECT ACCESSORY TO ADJUST
========================================== */

adjustSelect.addEventListener('change', event => {

  selectedId = event.target.value;

  renderControls();

});


/* ==========================================
   MOVE / RESIZE ACCESSORIES
========================================== */

for (const [id, key] of [

  ['xRange', 'x'],
  ['yRange', 'y'],
  ['widthRange', 'width']

]) {

  $(id).addEventListener('input', event => {

    if (!selectedId) return;

    fits[selectedId] = {

      ...getFit(selectedId),

      [key]: Number(event.target.value)

    };

    renderAvatar();

    saveMessage.textContent = 'Unsaved changes';

  });

}


/* ==========================================
   RESET ACCESSORY POSITION
========================================== */

$('resetFitBtn').addEventListener('click', () => {

  if (!selectedId) return;

  delete fits[selectedId];

  renderAll();

  saveMessage.textContent = 'Unsaved changes';

});


/* ==========================================
   REMOVE ALL ACCESSORIES
========================================== */

$('clearBtn').addEventListener('click', () => {

  equipped = {};

  selectedId = '';

  renderAll();

  saveMessage.textContent = 'Unsaved changes';

});


/* ==========================================
   SAVE COMPLETE AVATAR
========================================== */

$('saveBtn').addEventListener('click', () => {

  const data = {

    equipped,
    fits,
    currentAvatar,
    skinTones

  };

  try {

    localStorage.setItem(
      STORE_KEY,
      JSON.stringify(data)
    );

    saveMessage.textContent =
      'Avatar and outfit saved on this device! ♡';

  } catch (error) {

    saveMessage.textContent =
      'Could not save. Check browser storage settings.';

  }

});


/* ==========================================
   INITIAL PAGE LOAD
========================================== */

renderAll();
