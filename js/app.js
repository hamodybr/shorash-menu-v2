
const I18N={
 ar:{subtitle:'اكتشف منيو شوراش',location:'موقعنا',call:'اتصال',whatsapp:'واتساب منيو',soon:'السعر يضاف قريباً',currency:'د.ع'},
 ku:{subtitle:'مێنیوی شوراش ببینە',location:'شوێنی مە',call:'پەیوەندی',whatsapp:'مێنیوی واتساپ',soon:'نرخ بەم زووانە زیاد دەکرێت',currency:'د.ع'},
 en:{subtitle:'Discover the SHORASH menu',location:'Location',call:'Call',whatsapp:'WhatsApp Menu',soon:'Price coming soon',currency:'IQD'}
};
let DB,lang=localStorage.getItem('shorashLang')||'ar',active='';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function txt(o){return (o&&o[lang])||(o&&o.ar)||''}
function money(v){return v?Number(v).toLocaleString('en-US')+' '+I18N[lang].currency:I18N[lang].soon}
function cats(){
 const map=new Map();
 DB.products.forEach(p=>{const k=p.category.ar||p.category.en;if(!map.has(k))map.set(k,p.category)});
 return [...map.values()].sort((a,b)=>a.order-b.order);
}
function renderCats(){
 $('#cats').innerHTML=cats().map(c=>`<button class="cat ${c.ar===active?'active':''}" data-cat="${c.ar}">${txt(c)}</button>`).join('');
}
function render(){
 const arr=DB.products.filter(p=>!active||p.category.ar===active);
 $('#menu').innerHTML=arr.length?`<section><h2 class="section-title">${txt(arr[0].category)}</h2><div class="grid">${arr.map(p=>`
 <article class="card"><img class="photo" loading="lazy" src="${p.image}" alt="${txt(p.name)}">
 <div class="info"><div class="name">${txt(p.name)}</div>
 ${p.options.some(o=>o.price)?p.options.map(o=>`<div class="option"><span>${txt(o)}</span><b class="price">${money(o.price)}</b></div>`).join(''):`<div class="soon">${I18N[lang].soon}</div>`}
 </div></article>`).join('')}</div></section>`:'';
}
function applyLang(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';
 $('#subtitle').textContent=I18N[lang].subtitle;
 $$('[data-t]').forEach(x=>x.textContent=I18N[lang][x.dataset.t]);
 $$('.lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
 renderCats();render();
}
document.addEventListener('click',e=>{
 if(e.target.matches('.lang button')){lang=e.target.dataset.lang;localStorage.setItem('shorashLang',lang);applyLang()}
 if(e.target.matches('.cat')){active=e.target.dataset.cat;renderCats();render()}
});
fetch('data/menu.json').then(r=>r.json()).then(d=>{
 DB=d; const r=d.restaurant;
 $('#location').href=$('#flocation').href=r.location;$('#call').href=$('#fcall').href='tel:'+r.phone;
 $('#whatsapp').href=$('#fwhatsapp').href=r.whatsapp;
 const cs=cats();active=cs.length?cs[0].ar:'';applyLang();
}).catch(()=>$('#menu').innerHTML='<div class="loading">Could not load menu.json</div>');
addEventListener('scroll',()=>{const d=document.documentElement,m=d.scrollHeight-d.clientHeight;$('#progress').style.width=(m?d.scrollTop/m*100:0)+'%'},{passive:true});
setTimeout(()=>$('#intro').classList.add('hide'),1100);
