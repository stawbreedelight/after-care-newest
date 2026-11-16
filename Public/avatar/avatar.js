/* MID VANILLA — full-canvas wardrobe. All PNGs use identical canvas alignment. */

/* The file names below are the ones you already use. To add a shirt or pants
   later, add an actual image and register it with slot: 'shirt' or 'pants'. */
const ITEMS = [
  { id: 'elf_ears', name: 'Elf ears', category: 'head', slot: 'ears', z: 90 },
  { id: 'cowboy_hat', name: 'Cowboy hat', category: 'head', slot: 'hat', z: 100 },
  { id: 'flower_crown', name: 'Flower crown', category: 'head', slot: 'hat', z: 100 },
  { id: 'leaf_circlet', name: 'Leaf circlet', category: 'head', slot: 'hat', z: 100 },
  { id: 'fairy_wings', name: 'Fairy wings', category: 'magic', slot: 'wings', z: 10 },
  { id: 'short_cape', name: 'Short cape', category: 'outfit', slot: 'cape', z: 70 },
  { id: 'belt_pouch', name: 'Belt pouch', category: 'outfit', slot: 'belt', z: 75 },
  { id: 'fantasy_boots', name: 'Fantasy boots', category: 'outfit', slot: 'boots', z: 50 },
  { id: 'wand', name: 'Magic wand', category: 'magic', slot: 'hand', z: 110 }
];
// More slots, once images exist:
// { id: 'my_pants', name: 'Pants', category: 'outfit', slot: 'pants', z: 51 },
// { id: 'my_shirt', name: 'Shirt', category: 'outfit', slot: 'shirt', z: 60 },

const AVATARS = {
  male: { base: 'images/male-base.png', overlay: 'images/male-dark-skin.png' },
  female: { base: 'images/female-base.png', overlay: 'images/female-dark-skin.png' }
};

const FACE_OPTIONS = {
  hair: [
    { name: 'Short Blonde', file: 'blonde-short-hair.png' },
    { name: 'Short Wavy Blonde', file: 'blonde-short-wavy-hair.png' },
    { name: 'Long Wavy Blonde', file: 'blonde-long-wavy-hair.png' }
  ],
  eyes: [
    { name: 'Brown Eyes', file: 'eyes-brown.png' },
    { name: 'Green Eyes', file: 'eyes-green.png' },
    { name: 'Blue Eyes', file: 'eyes-blue.png' }
  ],
  lips: [
    { name: 'Closed Lips', file: 'closed-lips.png' },
    { name: 'Small Closed Lips', file: 'closed-small-lips.png' },
    { name: 'Closed Smile', file: 'closed-smile.png' },
    { name: 'Open Smile', file: 'open-smile.png' },
    { name: 'Open Smile With Teeth', file: 'open-teeth.png' }
  ]
};

const $ = id => document.getElementById(id);
const stack = $('avatarStack');
const itemGrid = $('itemGrid');
const baseAvatar = $('baseAvatar');
const skinOverlay = $('skinOverlay');
const skinSlider = $('skinSlider');
const saveMessage = $('saveMessage');
const STORE_KEY = 'midVanillaAvatarV1';

let equipped = {};
let currentAvatar = 'male';
let skinTones = { male: 0, female: 0 };
let faceSelections = {
  hair: 'blonde-short-hair.png', eyes: 'eyes-brown.png', lips: 'Closed-lips.png'
};
let filter = 'all';

function clampTone(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
}

/* Migrate old slot names to new independent wing/cape slots. */
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  if (saved && typeof saved === 'object') {
    const oldEquipped = saved.equipped || {};
    for (const item of ITEMS) {
      if (oldEquipped[item.slot] === item.id ||
          (item.id === 'fairy_wings' && oldEquipped.back === item.id) ||
          (item.id === 'short_cape' && oldEquipped.back === item.id)) {
        equipped[item.slot] = item.id;
      }
    }
    if (Object.hasOwn(AVATARS, saved.currentAvatar)) currentAvatar = saved.currentAvatar;
    for (const type of ['male', 'female']) skinTones[type] = clampTone(saved.skinTones?.[type]);
    for (const type of ['hair', 'eyes', 'lips']) {
      const chosen = saved.faceSelections?.[type];
      if (FACE_OPTIONS[type].some(option => option.file === chosen)) faceSelections[type] = chosen;
    }
  }
} catch (error) {
  console.warn('Saved avatar could not be loaded', error);
}

/* Use the real base image aspect ratio so identical canvases stay aligned. */
function syncCanvasRatio() {
  if (baseAvatar.naturalWidth && baseAvatar.naturalHeight) {
    stack.style.aspectRatio = `${baseAvatar.naturalWidth} / ${baseAvatar.naturalHeight}`;
  }
}
baseAvatar.addEventListener('load', syncCanvasRatio);
if (baseAvatar.complete) syncCanvasRatio();

function updateAppearance() {
  baseAvatar.src = AVATARS[currentAvatar].base;
  skinOverlay.src = AVATARS[currentAvatar].overlay;
  skinOverlay.style.opacity = String(skinTones[currentAvatar] / 100);
  skinSlider.value = String(skinTones[currentAvatar]);
  document.querySelectorAll('.avatar-option').forEach(button => {
    const active = button.dataset.avatar === currentAvatar;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('eyesLayer').src = `images/${faceSelections.eyes}`;
  $('lipsLayer').src = `images/${faceSelections.lips}`;
  $('hairLayer').src = `images/${faceSelections.hair}`;
}

function renderEquipped() {
  stack.querySelectorAll('.avatar-item').forEach(image => image.remove());
  for (const item of ITEMS) {
    if (equipped[item.slot] !== item.id) continue;
    const image = document.createElement('img');
    image.className = 'avatar-item';
    image.src = `images/${item.id}.png`;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.style.zIndex = String(item.z);
    stack.appendChild(image);
  }
}

/* Crop thumbnails to actual nontransparent artwork on a canvas.
   This does NOT alter or resize equipped avatar images. */
const thumbnailCache = new Map();
const thumbnailRequests = new Map();
function getThumbnail(id, callback) {
  if (thumbnailCache.has(id)) { callback(thumbnailCache.get(id)); return; }
  if (thumbnailRequests.has(id)) { thumbnailRequests.get(id).push(callback); return; }
  thumbnailRequests.set(id, [callback]);
  const source = new Image();
  source.onload = () => {
    let result = source.src;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(source, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const w = canvas.width, h = canvas.height;
      let left = w, top = h, right = -1, bottom = -1;
      // Ignore tiny almost-transparent antialiasing pixels.
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 20) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }
      if (right >= left) {
        const imageW = right - left + 1, imageH = bottom - top + 1;
        const pad = Math.max(imageW, imageH) * 0.1;
        const output = document.createElement('canvas');
        output.width = 320;
        output.height = 240;
        const outputCtx = output.getContext('2d');
        const scale = Math.min(output.width / (imageW + 2 * pad), output.height / (imageH + 2 * pad));
        const drawW = imageW * scale, drawH = imageH * scale;
        outputCtx.drawImage(source, left, top, imageW, imageH,
          (output.width - drawW) / 2, (output.height - drawH) / 2, drawW, drawH);
        result = output.toDataURL('image/png');
      }
    } catch (error) {
      console.warn(`Thumbnail crop unavailable for ${id}`, error);
    }
    thumbnailCache.set(id, result);
    thumbnailRequests.get(id).forEach(cb => cb(result));
    thumbnailRequests.delete(id);
  };
  source.onerror = () => {
    const fallback = `images/${id}.png`;
    thumbnailCache.set(id, fallback);
    thumbnailRequests.get(id).forEach(cb => cb(fallback));
    thumbnailRequests.delete(id);
  };
  source.src = `images/${id}.png`;
}

function renderGrid() {
  itemGrid.replaceChildren();
  for (const item of ITEMS.filter(entry => filter === 'all' || entry.category === filter)) {
    const active = equipped[item.slot] === item.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `item${active ? ' selected' : ''}`;
    button.title = `${active ? 'Remove' : 'Equip'} ${item.name}`;
    button.setAttribute('aria-pressed', String(active));
    const picture = document.createElement('div');
    picture.className = 'item-thumbnail';
    const image = document.createElement('img');
    image.src = `images/${item.id}.png`;
    image.alt = '';
    getThumbnail(item.id, url => { image.src = url; });
    picture.appendChild(image);
    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = item.name;
    button.append(picture, name);
    button.addEventListener('click', () => {
      if (equipped[item.slot] === item.id) delete equipped[item.slot];
      else equipped[item.slot] = item.id;
      renderEquipped();
      renderGrid();
      markUnsaved();
    });
    itemGrid.appendChild(button);
  }
}

function populateFaceSelect(type) {
  const select = $(`${type}Select`);
  select.replaceChildren();
  for (const option of FACE_OPTIONS[type]) select.add(new Option(option.name, option.file));
  select.value = faceSelections[type];
  select.addEventListener('change', () => {
    faceSelections[type] = select.value;
    updateAppearance();
    markUnsaved();
  });
}
function markUnsaved() { saveMessage.textContent = 'Unsaved changes'; }

for (const type of ['hair', 'eyes', 'lips']) populateFaceSelect(type);

document.querySelectorAll('.avatar-option').forEach(button => {
  button.addEventListener('click', () => {
    if (!Object.hasOwn(AVATARS, button.dataset.avatar)) return;
    currentAvatar = button.dataset.avatar;
    updateAppearance();
    markUnsaved();
  });
});
skinSlider.addEventListener('input', () => {
  skinTones[currentAvatar] = clampTone(skinSlider.value);
  skinOverlay.style.opacity = String(skinTones[currentAvatar] / 100);
  markUnsaved();
});
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    renderGrid();
  });
});
$('clearBtn').addEventListener('click', () => {
  equipped = {};
  renderEquipped();
  renderGrid();
  markUnsaved();
});
$('saveBtn').addEventListener('click', () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ equipped, currentAvatar, skinTones, faceSelections }));
    saveMessage.textContent = 'Avatar and outfit saved on this device! ♡';
  } catch (error) {
    saveMessage.textContent = 'Could not save. Check browser storage settings.';
  }
});

updateAppearance();
renderEquipped();
renderGrid();
