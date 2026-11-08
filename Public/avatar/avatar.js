/* MID VANILLA — Fantasy avatar wardrobe (no Firebase required yet).
   Put avatar.html, avatar.css and avatar.js together, with images/ beside them.
   Outfits are stored in this browser via localStorage. */
const ITEMS = [
  {id:'elf_ears',name:'Elf ears',category:'head',slot:'ears',layer:'front',x:50,y:15,width:31},
  {id:'cowboy_hat',name:'Cowboy hat',category:'head',slot:'hat',layer:'front',x:50,y:5,width:42},
  {id:'flower_crown',name:'Flower crown',category:'head',slot:'hat',layer:'front',x:50,y:9,width:37},
  {id:'leaf_circlet',name:'Leaf circlet',category:'head',slot:'hat',layer:'front',x:50,y:10,width:36},
  {id:'fairy_wings',name:'Fairy wings',category:'magic',slot:'back',layer:'behind',x:50,y:40,width:91},
  {id:'short_cape',name:'Short cape',category:'outfit',slot:'back',layer:'behind',x:50,y:35,width:66},
  {id:'belt_pouch',name:'Belt pouch',category:'outfit',slot:'belt',layer:'front',x:50,y:48,width:45},
  {id:'fantasy_boots',name:'Fantasy boots',category:'outfit',slot:'boots',layer:'front',x:50,y:91,width:50},
  {id:'wand',name:'Magic wand',category:'magic',slot:'hand',layer:'front',x:86,y:55,width:36}
];
const STORE_KEY='midVanillaAvatarV1';
const $=id=>document.getElementById(id);
const itemGrid=$('itemGrid'), stack=$('avatarStack'), adjustSelect=$('adjustItem');
let equipped={}, fits={}, selectedId='',filter='all';
try { const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); equipped=saved.equipped||{}; fits=saved.fits||{}; }catch(e){ /* ignore invalid saved data */ }
const defaults=id=>{const item=ITEMS.find(x=>x.id===id);return {x:item.x,y:item.y,width:item.width};};
const getFit=id=>({...defaults(id),...fits[id]});
function renderAvatar(){
  stack.querySelectorAll('.avatar-item').forEach(node=>node.remove());
  for(const item of ITEMS){
    if(equipped[item.slot]!==item.id)continue;
    const fit=getFit(item.id),img=document.createElement('img');
    img.src=`images/${item.id}.png`;img.alt='';img.className=`avatar-item ${item.layer}`;
    img.style.left=`${fit.x}%`;img.style.top=`${fit.y}%`;img.style.width=`${fit.width}%`;
    stack.appendChild(img);
  }
}
function renderGrid(){
  itemGrid.replaceChildren();
  for(const item of ITEMS.filter(i=>filter==='all'||i.category===filter)){
    const active=equipped[item.slot]===item.id;
    const btn=document.createElement('button');btn.type='button';btn.className=`item${active?' selected':''}`;
    btn.setAttribute('aria-pressed',String(active));btn.title=`${active?'Remove':'Equip'} ${item.name}`;
    const img=document.createElement('img');img.src=`images/${item.id}.png`;img.alt='';
    const title=document.createElement('span');title.textContent=item.name;btn.append(img,title);
    btn.addEventListener('click',()=>{
      if(active){delete equipped[item.slot];if(selectedId===item.id)selectedId='';}
      else{equipped[item.slot]=item.id;selectedId=item.id;}
      renderAll();
      $('saveMessage').textContent='Unsaved changes';
    });itemGrid.appendChild(btn);
  }
}
function renderControls(){
  const activeItems=ITEMS.filter(i=>equipped[i.slot]===i.id);
  if(!activeItems.some(i=>i.id===selectedId))selectedId=activeItems[0]?.id||'';
  adjustSelect.replaceChildren();
  if(!activeItems.length){const op=new Option('Equip an item first','');adjustSelect.add(op);}
  for(const item of activeItems)adjustSelect.add(new Option(item.name,item.id));
  adjustSelect.value=selectedId;
  for(const id of ['xRange','yRange','widthRange'])$(id).disabled=!selectedId;
  $('resetFitBtn').disabled=!selectedId;
  if(selectedId){const f=getFit(selectedId);$('xRange').value=f.x;$('yRange').value=f.y;$('widthRange').value=f.width;}
}
function renderAll(){renderAvatar();renderGrid();renderControls();}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  filter=btn.dataset.filter;
  document.querySelectorAll('.filter').forEach(b=>{const a=b===btn;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a));});
  renderGrid();
}));
adjustSelect.addEventListener('change',e=>{selectedId=e.target.value;renderControls();});
for(const [id,key] of [['xRange','x'],['yRange','y'],['widthRange','width']]){
  $(id).addEventListener('input',e=>{if(!selectedId)return;fits[selectedId]={...getFit(selectedId),[key]:Number(e.target.value)};renderAvatar();$('saveMessage').textContent='Unsaved changes';});
}
$('resetFitBtn').addEventListener('click',()=>{if(!selectedId)return;delete fits[selectedId];renderAll();$('saveMessage').textContent='Unsaved changes';});
$('clearBtn').addEventListener('click',()=>{equipped={};selectedId='';renderAll();$('saveMessage').textContent='Unsaved changes';});
$('saveBtn').addEventListener('click',()=>{
  try{localStorage.setItem(STORE_KEY,JSON.stringify({equipped,fits}));$('saveMessage').textContent='Outfit saved on this device! ♡';}
  catch(e){$('saveMessage').textContent='Could not save. Check your browser storage settings.';}
});
renderAll();
