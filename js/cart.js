(() => {
  const KEY="shorashCartV1";
  let cart=[];
  const T={
    ar:{cart:"السلة",empty:"السلة فارغة",total:"الإجمالي",continue:"متابعة الطلب",added:"تمت الإضافة للسلة",choose:"اختر النوع",add:"إضافة للسلة",close:"إغلاق",clear:"إفراغ السلة",clearConfirm:"هل تريد إفراغ السلة بالكامل؟",checkout:"إكمال الطلب",name:"الاسم",phone:"رقم الهاتف",orderType:"نوع الطلب",delivery:"توصيل",pickup:"استلام من المطعم",address:"العنوان",location:"الموقع",getLocation:"تحديد موقعي",notes:"ملاحظات الطلب (اختياري)",review:"مراجعة الطلب",send:"إرسال الطلب عبر WhatsApp",required:"يرجى إكمال الحقول المطلوبة",locationOk:"تم تحديد الموقع",locationFail:"تعذر تحديد الموقع",back:"رجوع"},
    ku:{cart:"سەبەتە",empty:"سەبەتە بەتاڵە",total:"کۆی گشتی",continue:"بەردەوام بە",added:"زیاد کرا",choose:"جۆر هەڵبژێرە",add:"زیادکردن بۆ سەبەتە",close:"داخستن",clear:"بەتاڵکردنەوەی سەبەتە",clearConfirm:"دڵنیایت لە بەتاڵکردنەوەی تەواوی سەبەتە؟",checkout:"تەواوکردنی داواکاری",name:"ناو",phone:"ژمارەی مۆبایل",orderType:"جۆری داواکاری",delivery:"گەیاندن",pickup:"وەرگرتن لە چێشتخانە",address:"ناونیشان",location:"شوێن",getLocation:"شوێنم دیاری بکە",notes:"تێبینی (ئارەزوومەندانە)",review:"پێداچوونەوە",send:"ناردنی داواکاری بە WhatsApp",required:"تکایە خانە پێویستەکان پڕ بکەرەوە",locationOk:"شوێن دیاری کرا",locationFail:"نەتوانرا شوێن دیاری بکرێت",back:"گەڕانەوە"},
    en:{cart:"Cart",empty:"Your cart is empty",total:"Total",continue:"Continue order",added:"Added to cart",choose:"Choose an option",add:"Add to cart",close:"Close",clear:"Clear cart",clearConfirm:"Clear the entire cart?",checkout:"Checkout",name:"Name",phone:"Phone number",orderType:"Order type",delivery:"Delivery",pickup:"Pickup",address:"Address",location:"Location",getLocation:"Use my location",notes:"Order notes (optional)",review:"Review order",send:"Send order via WhatsApp",required:"Please complete the required fields",locationOk:"Location captured",locationFail:"Could not get location",back:"Back"}
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
        <div class="sm-cart-head"><button id="smCartClose" class="sm-cart-close" type="button">×</button><h3 id="smCartTitle"></h3><button id="smCartClear" class="sm-cart-clear" type="button"></button></div>
        <div id="smCartItems" class="sm-cart-items"></div>
        <div class="sm-cart-bottom"><div class="sm-cart-total-row"><span id="smCartTotalLabel"></span><b id="smCartTotal"></b></div><button id="smCartContinue" class="sm-cart-continue" type="button"></button></div>
      </aside>
      <div id="smCartToast" class="sm-cart-toast"></div>
      <div id="smCheckoutBackdrop" class="sm-checkout-backdrop"></div>
      <section id="smCheckoutSheet" class="sm-checkout-sheet" aria-hidden="true">
        <div class="sm-checkout-handle"></div>
        <div class="sm-checkout-head"><button id="smCheckoutClose" type="button">×</button><h3 id="smCheckoutTitle"></h3></div>
        <div class="sm-checkout-body">
          <label><span id="smNameLabel"></span><input id="smCustomerName" autocomplete="name"></label>
          <label><span id="smPhoneLabel"></span><input id="smCustomerPhone" type="tel" inputmode="tel" autocomplete="tel"></label>
          <div class="sm-checkout-label" id="smTypeLabel"></div>
          <div class="sm-order-types"><button type="button" data-order-type="delivery" class="active" id="smDeliveryBtn"></button><button type="button" data-order-type="pickup" id="smPickupBtn"></button></div>
          <div id="smDeliveryFields">
            <label><span id="smAddressLabel"></span><input id="smCustomerAddress" autocomplete="street-address"></label>
            <button id="smGetLocation" class="sm-location-btn" type="button">📍 <span></span></button>
            <div id="smLocationStatus" class="sm-location-status"></div>
          </div>
          <label><span id="smNotesLabel"></span><textarea id="smCustomerNotes" rows="3"></textarea></label>
          <div class="sm-checkout-review"><h4 id="smReviewLabel"></h4><div id="smCheckoutSummary"></div><div class="sm-checkout-review-total"><span id="smCheckoutTotalLabel"></span><b id="smCheckoutTotal"></b></div></div>
        </div>
        <div class="sm-checkout-actions"><button id="smSendWhatsApp" type="button"></button></div>
      </section>
      <div id="smChoiceBackdrop" class="sm-choice-backdrop"></div>
      <div id="smChoiceSheet" class="sm-choice-sheet" aria-hidden="true"><div class="sm-choice-handle"></div><div class="sm-choice-head"><button id="smChoiceClose" type="button">×</button><div><small id="smChoiceLabel"></small><h3 id="smChoiceTitle"></h3></div></div><div id="smChoiceList" class="sm-choice-list"></div></div>
      <div id="smImageViewer" class="sm-image-viewer" aria-hidden="true"><button id="smImageClose" type="button">×</button><img id="smImageFull" alt=""><div id="smImageCaption"></div></div>`);
    document.getElementById("smCartFab").onclick=()=>open(true);
    document.getElementById("smCartClose").onclick=()=>open(false);
    document.getElementById("smCartBackdrop").onclick=()=>open(false);
    document.getElementById("smCartClear").onclick=()=>{if(!cart.length)return;if(confirm(tr("clearConfirm"))){cart=[];save();toast(tr("clear"))}};
    document.getElementById("smCartContinue").onclick=()=>{if(!cart.length)return;open(false);checkoutOpen(true)};
    document.getElementById("smCheckoutClose").onclick=()=>checkoutOpen(false);
    document.getElementById("smCheckoutBackdrop").onclick=()=>checkoutOpen(false);
    document.querySelectorAll("[data-order-type]").forEach(b=>b.onclick=()=>setOrderType(b.dataset.orderType));
    document.getElementById("smGetLocation").onclick=getCustomerLocation;
    document.getElementById("smSendWhatsApp").onclick=sendWhatsApp;
    document.getElementById("smChoiceClose").onclick=()=>choiceOpen(false);
    document.getElementById("smChoiceBackdrop").onclick=()=>choiceOpen(false);
    document.getElementById("smImageClose").onclick=closeImage;
    document.getElementById("smImageViewer").addEventListener("click",e=>{if(e.target.id==="smImageViewer")closeImage()});
  }
  function lock(){document.body.classList.toggle("sm-cart-lock",!!document.querySelector('.sm-cart-drawer.open,.sm-choice-sheet.open,.sm-image-viewer.open,.sm-checkout-sheet.open'))}
  function open(v){ensureUI();document.getElementById("smCartDrawer").classList.toggle("open",v);document.getElementById("smCartBackdrop").classList.toggle("open",v);document.getElementById("smCartDrawer").setAttribute("aria-hidden",String(!v));lock()}
  let orderType="delivery", customerLocation="";
  function checkoutOpen(v){ensureUI();const sh=document.getElementById("smCheckoutSheet"),bd=document.getElementById("smCheckoutBackdrop");sh.classList.toggle("open",v);bd.classList.toggle("open",v);sh.setAttribute("aria-hidden",String(!v));if(v)renderCheckout();lock()}
  function setOrderType(type){orderType=type;document.querySelectorAll("[data-order-type]").forEach(b=>b.classList.toggle("active",b.dataset.orderType===type));document.getElementById("smDeliveryFields").hidden=type!=="delivery"}
  function getCustomerLocation(){if(!navigator.geolocation){toast(tr("locationFail"));return}const b=document.getElementById("smGetLocation");b.disabled=true;navigator.geolocation.getCurrentPosition(pos=>{customerLocation=`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;document.getElementById("smLocationStatus").textContent="✓ "+tr("locationOk");b.disabled=false},()=>{toast(tr("locationFail"));b.disabled=false},{enableHighAccuracy:true,timeout:10000,maximumAge:60000})}
  function renderCheckout(){const {sum}=totals();document.getElementById("smCheckoutTitle").textContent=tr("checkout");document.getElementById("smNameLabel").textContent=tr("name")+" *";document.getElementById("smPhoneLabel").textContent=tr("phone")+" *";document.getElementById("smTypeLabel").textContent=tr("orderType");document.getElementById("smDeliveryBtn").textContent=tr("delivery");document.getElementById("smPickupBtn").textContent=tr("pickup");document.getElementById("smAddressLabel").textContent=tr("address")+" *";document.querySelector("#smGetLocation span").textContent=tr("getLocation");document.getElementById("smNotesLabel").textContent=tr("notes");document.getElementById("smReviewLabel").textContent=tr("review");document.getElementById("smCheckoutTotalLabel").textContent=tr("total");document.getElementById("smCheckoutTotal").textContent=money(sum);document.getElementById("smSendWhatsApp").textContent="🟢 "+tr("send");document.getElementById("smCheckoutSummary").innerHTML=cart.map(x=>`<div class="sm-review-item"><span>${x.qty}× ${txt(x.name)} <small>${txt(x.option)}</small></span><b>${money(x.qty*x.price)}</b></div>`).join("");setOrderType(orderType)}
  function sendWhatsApp(){const name=document.getElementById("smCustomerName").value.trim(),phone=document.getElementById("smCustomerPhone").value.trim(),address=document.getElementById("smCustomerAddress").value.trim(),notes=document.getElementById("smCustomerNotes").value.trim();if(!name||!phone||(orderType==="delivery"&&!address)){toast(tr("required"));return}const {sum}=totals(),id="SH-"+new Date().toISOString().slice(2,10).replaceAll("-","")+"-"+String(Date.now()).slice(-5);let lines=[`🍽️ SHORASH REST & CAFE`,`🧾 Order: ${id}`,``,`👤 ${tr("name")}: ${name}`,`📞 ${tr("phone")}: ${phone}`,`🚚 ${tr("orderType")}: ${tr(orderType)}`];if(orderType==="delivery"){lines.push(`📍 ${tr("address")}: ${address}`);if(customerLocation)lines.push(`🗺️ ${tr("location")}: ${customerLocation}`)}lines.push(``,`────────────`);cart.forEach((x,i)=>lines.push(`${i+1}. ${txt(x.name)} — ${txt(x.option)} ×${x.qty} — ${money(x.qty*x.price)}`));lines.push(`────────────`,`💰 ${tr("total")}: ${money(sum)}`);if(notes)lines.push(`📝 ${tr("notes")}: ${notes}`);const url=`https://wa.me/9647502662002?text=${encodeURIComponent(lines.join("\n"))}`;window.location.href=url}
  function choiceOpen(v){ensureUI();document.getElementById("smChoiceSheet").classList.toggle("open",v);document.getElementById("smChoiceBackdrop").classList.toggle("open",v);document.getElementById("smChoiceSheet").setAttribute("aria-hidden",String(!v));lock()}

  function addItem(p,oi){const o=(p.options||[])[oi];if(!o)return;const key=`${p.id}:${oi}`,found=cart.find(x=>x.key===key);if(found)found.qty++;else cart.push({key,productId:p.id,optionIndex:oi,name:p.name,option:{ar:o.ar,ku:o.ku,en:o.en},price:Number(o.price||0),image:p.image||"",qty:1});save();toast(tr("added"))}
  function addFromButton(btn){const D=window.SHORASH_DB;if(!D)return;const p=D.products.find(x=>String(x.id)===String(btn.dataset.productId));if(!p)return;addItem(p,Number(btn.dataset.optionIndex))}
  function showChoices(productId){const D=window.SHORASH_DB;if(!D)return;const p=D.products.find(x=>String(x.id)===String(productId));if(!p)return;ensureUI();document.getElementById("smChoiceLabel").textContent=tr("choose");document.getElementById("smChoiceTitle").textContent=txt(p.name);document.getElementById("smChoiceList").innerHTML=(p.options||[]).map((o,i)=>`<button class="sm-choice-option" type="button" data-choice-product="${p.id}" data-choice-index="${i}"><span>${txt(o)}</span><b>${money(o.price)}</b><i>+</i></button>`).join("");choiceOpen(true)}
  function showImage(img){ensureUI();const v=document.getElementById("smImageViewer"),full=document.getElementById("smImageFull");full.src=img.dataset.fullImage||img.src;full.alt=img.alt||"";document.getElementById("smImageCaption").textContent=img.dataset.productName||img.alt||"";v.classList.add("open");v.setAttribute("aria-hidden","false");lock()}
  function closeImage(){const v=document.getElementById("smImageViewer");if(!v)return;v.classList.remove("open");v.setAttribute("aria-hidden","true");lock()}
  function change(key,d){const x=cart.find(i=>i.key===key);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.key!==key);save()}
  function remove(key){cart=cart.filter(i=>i.key!==key);save()}
  function render(){ensureUI();const {qty,sum}=totals();document.getElementById("smCartFabText").textContent=qty?`${qty} • ${money(sum)}`:tr("cart");document.getElementById("smCartFab").classList.toggle("has-items",qty>0);document.getElementById("smCartTitle").textContent=tr("cart");document.getElementById("smCartTotalLabel").textContent=tr("total");document.getElementById("smCartTotal").textContent=money(sum);document.getElementById("smCartContinue").textContent=tr("continue");const clearBtn=document.getElementById("smCartClear");clearBtn.textContent=tr("clear");clearBtn.disabled=!cart.length;const box=document.getElementById("smCartItems");if(!cart.length){box.innerHTML=`<div class="sm-cart-empty"><div>🛒</div><span>${tr("empty")}</span></div>`;return}box.innerHTML=cart.map(x=>`<div class="sm-cart-item"><img src="${x.image}" alt=""><div class="sm-cart-item-info"><strong>${txt(x.name)}</strong><small>${txt(x.option)}</small><b>${money(x.price)}</b></div><div class="sm-cart-qty"><button data-cart-plus="${x.key}" type="button">+</button><span>${x.qty}</span><button data-cart-minus="${x.key}" type="button">−</button></div><button class="sm-cart-remove" data-cart-remove="${x.key}" type="button">×</button></div>`).join("")}
  let timer;function toast(msg){ensureUI();const e=document.getElementById("smCartToast");e.textContent=msg;e.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>e.classList.remove("show"),1300)}
  document.addEventListener("click",e=>{const a=e.target.closest(".sm-add-cart,.sm-direct-add");if(a){e.preventDefault();addFromButton(a);return}const choose=e.target.closest(".sm-choose-options");if(choose){e.preventDefault();showChoices(choose.dataset.productId);return}const choice=e.target.closest("[data-choice-product]");if(choice){const D=window.SHORASH_DB,p=D&&D.products.find(x=>String(x.id)===String(choice.dataset.choiceProduct));if(p){addItem(p,Number(choice.dataset.choiceIndex));choiceOpen(false)}return}const image=e.target.closest(".sm-product-image");if(image){showImage(image);return}const p=e.target.closest("[data-cart-plus]");if(p){change(p.dataset.cartPlus,1);return}const m=e.target.closest("[data-cart-minus]");if(m){change(m.dataset.cartMinus,-1);return}const r=e.target.closest("[data-cart-remove]");if(r){remove(r.dataset.cartRemove);return}if(e.target.closest("[data-lang]"))setTimeout(render,40)});
  document.addEventListener("dblclick",e=>{if(e.target.closest("button,.sm-product-image"))e.preventDefault()},{passive:false});
  window.addEventListener("shorash:ready",render);load();ensureUI();render();
})();
