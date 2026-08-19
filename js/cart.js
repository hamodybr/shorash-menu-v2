(() => {
  const KEY="shorashCartV1";
  let cart=[];
  const T={
    ar:{cart:"السلة",empty:"السلة فارغة",total:"الإجمالي",continue:"متابعة الطلب",added:"تمت الإضافة للسلة"},
    ku:{cart:"سەبەتە",empty:"سەبەتە بەتاڵە",total:"کۆی گشتی",continue:"بەردەوام بە",added:"زیاد کرا"},
    en:{cart:"Cart",empty:"Your cart is empty",total:"Total",continue:"Continue order",added:"Added to cart"}
  };
  const lang=()=>window.SHORASH_LANG?window.SHORASH_LANG():(localStorage.getItem("shorashLang")||"ar");
  const tr=k=>(T[lang()]||T.ar)[k]||T.ar[k];
  const txt=o=>(o&&(o[lang()]||o.ar||o.en))||"";
  const money=n=>Number(n||0).toLocaleString("en-US")+" "+(lang()==="en"?"IQD":"د.ع");
  const load=()=>{try{cart=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{cart=[]}};
  const save=()=>{localStorage.setItem(KEY,JSON.stringify(cart));render()};
  const totals=()=>({qty:cart.reduce((s,x)=>s+x.qty,0),sum:cart.reduce((s,x)=>s+x.qty*x.price,0)});

  function ensureUI(){
    if(document.getElementById("smCartFab"))return;
    document.body.insertAdjacentHTML("beforeend",`
      <button id="smCartFab" class="sm-cart-fab" type="button"><span>🛒</span><span id="smCartFabText"></span></button>
      <div id="smCartBackdrop" class="sm-cart-backdrop"></div>
      <aside id="smCartDrawer" class="sm-cart-drawer" aria-hidden="true">
        <div class="sm-cart-handle"></div>
        <div class="sm-cart-head"><button id="smCartClose" class="sm-cart-close" type="button">×</button><h3 id="smCartTitle"></h3></div>
        <div id="smCartItems" class="sm-cart-items"></div>
        <div class="sm-cart-bottom">
          <div class="sm-cart-total-row"><span id="smCartTotalLabel"></span><b id="smCartTotal"></b></div>
          <button id="smCartContinue" class="sm-cart-continue" type="button"></button>
        </div>
      </aside>
      <div id="smCartToast" class="sm-cart-toast"></div>`);
    document.getElementById("smCartFab").onclick=()=>open(true);
    document.getElementById("smCartClose").onclick=()=>open(false);
    document.getElementById("smCartBackdrop").onclick=()=>open(false);
    document.getElementById("smCartContinue").onclick=()=>toast(lang()==="en"?"Customer details are next":lang()==="ku"?"قۆناغی داهاتوو زانیاری داواکەرە":"الخطوة التالية: معلومات الزبون");
  }

  function open(v){
    ensureUI();
    document.getElementById("smCartDrawer").classList.toggle("open",v);
    document.getElementById("smCartBackdrop").classList.toggle("open",v);
    document.getElementById("smCartDrawer").setAttribute("aria-hidden",String(!v));
    document.body.classList.toggle("sm-cart-lock",v);
  }

  function addFromButton(btn){
    const D=window.SHORASH_DB;if(!D)return;
    const p=D.products.find(x=>String(x.id)===String(btn.dataset.productId));if(!p)return;
    const oi=Number(btn.dataset.optionIndex),o=(p.options||[])[oi];if(!o)return;
    const key=`${p.id}:${oi}`,found=cart.find(x=>x.key===key);
    if(found)found.qty++;
    else cart.push({key,productId:p.id,optionIndex:oi,name:p.name,option:{ar:o.ar,ku:o.ku,en:o.en},price:Number(o.price||0),image:p.image||"",qty:1});
    save();toast(tr("added"));
  }

  function change(key,d){
    const x=cart.find(i=>i.key===key);if(!x)return;
    x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.key!==key);save();
  }
  function remove(key){cart=cart.filter(i=>i.key!==key);save()}

  function render(){
    ensureUI();
    const {qty,sum}=totals();
    document.getElementById("smCartFabText").textContent=qty?`${qty} • ${money(sum)}`:tr("cart");
    document.getElementById("smCartFab").classList.toggle("has-items",qty>0);
    document.getElementById("smCartTitle").textContent=tr("cart");
    document.getElementById("smCartTotalLabel").textContent=tr("total");
    document.getElementById("smCartTotal").textContent=money(sum);
    document.getElementById("smCartContinue").textContent=tr("continue");
    const box=document.getElementById("smCartItems");
    if(!cart.length){box.innerHTML=`<div class="sm-cart-empty"><div>🛒</div><span>${tr("empty")}</span></div>`;return}
    box.innerHTML=cart.map(x=>`
      <div class="sm-cart-item">
        <img src="${x.image}" alt="">
        <div class="sm-cart-item-info"><strong>${txt(x.name)}</strong><small>${txt(x.option)}</small><b>${money(x.price)}</b></div>
        <div class="sm-cart-qty"><button data-cart-plus="${x.key}" type="button">+</button><span>${x.qty}</span><button data-cart-minus="${x.key}" type="button">−</button></div>
        <button class="sm-cart-remove" data-cart-remove="${x.key}" type="button">×</button>
      </div>`).join("");
  }

  let timer;
  function toast(msg){
    ensureUI();const e=document.getElementById("smCartToast");e.textContent=msg;e.classList.add("show");
    clearTimeout(timer);timer=setTimeout(()=>e.classList.remove("show"),1300);
  }

  document.addEventListener("click",e=>{
    const a=e.target.closest(".sm-add-cart");if(a){e.preventDefault();addFromButton(a);return}
    const p=e.target.closest("[data-cart-plus]");if(p){change(p.dataset.cartPlus,1);return}
    const m=e.target.closest("[data-cart-minus]");if(m){change(m.dataset.cartMinus,-1);return}
    const r=e.target.closest("[data-cart-remove]");if(r){remove(r.dataset.cartRemove);return}
    if(e.target.closest(".sm-lang-btn"))setTimeout(render,40);
  });

  window.addEventListener("shorash:ready",render);
  load();ensureUI();render();
})();