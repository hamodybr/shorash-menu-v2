const I18N = {
  ar: {
    subtitle: "اكتشف منيو {name}",
    location: "موقعنا",
    call: "اتصال",
    whatsapp: "واتساب منيو",
    popular: "الأكثر طلباً",
    fresh: "جديد",
    hot: "حار 🌶",
    offer: "عرض",
    unavailable: "غير متوفر حالياً",
    currency: "د.ع"
  },

  ku: {
    subtitle: "مێنیوی {name} ببینە",
    location: "شوێنی مە",
    call: "پەیوەندی",
    whatsapp: "مێنیوی واتساپ",
    popular: "زۆرترین داواکراو",
    fresh: "نوێ",
    hot: "توند 🌶",
    offer: "ئۆفەر",
    unavailable: "بەردەست نییە",
    currency: "د.ع"
  },

  en: {
    subtitle: "Discover {name} Menu",
    location: "Location",
    call: "Call",
    whatsapp: "WhatsApp Menu",
    popular: "Most Popular",
    fresh: "New",
    hot: "Spicy 🌶",
    offer: "Offer",
    unavailable: "Currently unavailable",
    currency: "IQD"
  }
};


let DB = null;
let lang = localStorage.getItem("shorashLang") || "ar";
let active = "";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const safeArray=value=>{if(Array.isArray(value))return value;if(typeof value==="string"){try{const p=JSON.parse(value);return Array.isArray(p)?p:[]}catch(_){return []}}return []};
const escapeUi=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const actionLabel=(item,currentLang=lang)=>String(item?.[`label_${currentLang}`]??item?.label_ar??item?.label_en??"").trim();



function txt(obj) {
  if (!obj) return "";
  return obj[lang] || obj.ar || obj.en || "";
}


function money(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) return "";

  return (
    Number(value).toLocaleString("en-US") +
    " " +
    I18N[lang].currency
  );
}


function installMenuCardPolish(){
  if(document.getElementById("smMenuCardPolishV38"))return;

  const style=document.createElement("style");
  style.id="smMenuCardPolishV38";
  style.textContent=`
    @media(max-width:768px){
      .sm-card{
        grid-template-rows:160px !important;
        height:160px !important;
        min-height:160px !important;
        max-height:160px !important;
      }
      .sm-card .sm-img,.sm-card .sm-info{
        height:160px !important;
        min-height:160px !important;
        max-height:160px !important;
      }
      .sm-card .sm-info{padding:11px 10px !important}
      .sm-card .sm-name{font-size:14px !important;line-height:1.35 !important;margin-bottom:5px !important}
      .sm-card .sm-option{font-size:10.5px !important;line-height:1.45 !important}
      .sm-card .sm-price{font-size:11px !important;line-height:1.35 !important}
      .sm-card .sm-choose-options,.sm-card .sm-direct-add{min-height:30px !important;font-size:10px !important}
      .sm-schedule-note{margin-top:4px;font-size:8.5px;line-height:1.45;color:rgba(232,184,98,.82)}
    }
  `;
  document.head.appendChild(style);
}

function iraqMinutesNow(){
  const parts=new Intl.DateTimeFormat("en-GB",{
    timeZone:"Asia/Baghdad",
    hour:"2-digit",
    minute:"2-digit",
    hour12:false
  }).formatToParts(new Date());

  const h=Number(parts.find(p=>p.type==="hour")?.value||0);
  const m=Number(parts.find(p=>p.type==="minute")?.value||0);
  return h*60+m;
}

function timeToMinutes(value){
  const match=String(value||"").match(/^(\d{1,2}):(\d{2})/);
  if(!match)return null;
  const h=Number(match[1]),m=Number(match[2]);
  if(!Number.isFinite(h)||!Number.isFinite(m))return null;
  return h*60+m;
}

function scheduledAvailability(product){
  if(product?.availability_schedule_enabled!==true){
    return true;
  }

  const from=timeToMinutes(product.available_from);
  const to=timeToMinutes(product.available_to);

  if(from===null||to===null||from===to){
    return true;
  }

  const now=iraqMinutesNow();

  return from<to
    ? now>=from&&now<to
    : now>=from||now<to;
}

function productScheduleText(product){
  if(
    product?.availability_schedule_enabled!==true ||
    !product.available_from ||
    !product.available_to
  ) return "";

  const from=String(product.available_from).slice(0,5);
  const to=String(product.available_to).slice(0,5);

  if(lang==="en")return `Available ${from}–${to}`;
  if(lang==="ku")return `بەردەستە ${from}–${to}`;
  return `متوفر ${from}–${to}`;
}

function refreshScheduledAvailability(){
  if(!DB?.products)return;

  DB.products.forEach(product=>{
    const scheduleUnavailable=
      product.availability_schedule_enabled===true &&
      scheduledAvailability(product)===false;

    product.badges.unavailable=
      product.manualUnavailable===true ||
      scheduleUnavailable;

    product.scheduleText=
      productScheduleText(product);
  });

  render();
}


function restaurantNameForLang(targetLang=lang) {

  const restaurant =
    DB?.restaurant || {};


  if (targetLang === "ar") {
    return String(
      restaurant.nameAr ??
      restaurant.name ??
      restaurant.nameEn ??
      ""
    ).trim();
  }


  if (targetLang === "ku") {
    return String(
      restaurant.nameKu ??
      restaurant.nameAr ??
      restaurant.name ??
      restaurant.nameEn ??
      ""
    ).trim();
  }


  return String(
    restaurant.nameEn ??
    restaurant.name ??
    restaurant.nameAr ??
    ""
  ).trim();
}


function formatRestaurantTemplate(value,targetLang=lang) {

  let text =
    String(value ?? "");

  const currentName =
    restaurantNameForLang(targetLang);


  text =
    text.replaceAll(
      "{name}",
      currentName
    );


  // Backward compatibility with old saved SHORASH text.
  const oldBrandPatterns =
    targetLang === "en"
      ? [/SHORASH/gi,/Shorash/g]
      : [/شوراش/g,/شورش/g,/SHORASH/gi];


  oldBrandPatterns.forEach(pattern => {
    text =
      text.replace(
        pattern,
        currentName
      );
  });


  return text
    .replace(/\s{2,}/g," ")
    .trim();
}


/* ========================================
   CATEGORY EFFECTS
======================================== */

function effect(category) {

  const k = category?.ar || "";

  const effects = {

    "فطور صباحي": "sm-breakfast-card",

    "منسف": "sm-mansaf-card",

    "الأطباق الشرقية": "sm-eastern-card",
    "الاطباق الشرقية": "sm-eastern-card",

    "مشاوي": "sm-grill-card",

    "قلية": "sm-qalya-card",

    "الوجبات الغربية": "sm-western-card",

    "بركر": "sm-burger-card",

    "بيتزا": "sm-pizza-card",

    "السندويشات": "sm-sandwich-card",
    "سندويشات": "sm-sandwich-card",

    /* ❄️ Cold drinks */
    "مشروبات باردة": "sm-cold-card",
    "مشروبات بارده": "sm-cold-card",
    "المشروبات الباردة": "sm-cold-card",
    "المشروبات بارده": "sm-cold-card",

    "القهوة": "sm-coffee-card",

    "القهوة الباردة": "sm-icedcoffee-card",
    "القهوة بارده": "sm-icedcoffee-card",

    "موهيتو": "sm-mojito-card",

    "سموذي": "sm-smoothie-card",

    "ميلك شيك": "sm-milkshake-card",

    "حلويات": "sm-dessert-card"
  };

  return effects[k] || "";
}


/* ========================================
   CATEGORIES
======================================== */

function categories() {

  const map = new Map();

  DB.products.forEach(product => {

    if (
      !product.category ||
      !product.category.ar
    ) return;

    if (!map.has(product.category.ar)) {
      map.set(
        product.category.ar,
        product.category
      );
    }

  });

  return [...map.values()].sort(
    (a, b) =>
      Number(a.order || 999) -
      Number(b.order || 999)
  );
}


function renderCats() {

  const rail = $("#smCats");
  const sentinel = $("#smCatsSentinel");

  if (!rail) return;


  const show =
    DB?.restaurant?.display?.categoryNav !== false;


  rail.style.display =
    show
      ? ""
      : "none";


  if (sentinel && !show) {
    sentinel.style.height = "0";
  }


  if (!show) {
    rail.classList.remove("fixed");
    catsFixed = false;
    return;
  }


  const savedScroll = rail.scrollLeft;

  rail.innerHTML = categories()
    .map(category => `
      <button
        class="sm-cat ${category.ar === active ? "active" : ""}"
        data-cat="${category.ar}">
        ${txt(category)}
      </button>
    `)
    .join("");


  requestAnimationFrame(() => {
    rail.scrollLeft = savedScroll;
  });
}


/* ========================================
   BADGES
======================================== */

function badges(product) {

  const b = product.badges || {};

  let html = "";

  if (b.popular) {

    html += `
      <span class="sm-display-badge gold">
        ⭐ ${I18N[lang].popular}
      </span>
    `;

  }

  if (b.new) {

    html += `
      <span class="sm-display-badge">
        ✨ ${I18N[lang].fresh}
      </span>
    `;

  }

  if (b.hot) {

    html += `
      <span class="sm-display-badge red">
        🔥 ${I18N[lang].hot}
      </span>
    `;

  }

  if (b.offer) {

    html += `
      <span class="sm-display-badge offer">
        🏷 ${I18N[lang].offer}
      </span>
    `;

  }

  if (!html) return "";

  return `
    <div class="sm-badges">
      ${html}
    </div>
  `;
}


/* ========================================
   PRODUCT CARD
======================================== */

function productCard(product) {

  const b = product.badges || {};

  const classes = [
    "sm-card",
    "sm-reveal",
    effect(product.category),

    b.popular
      ? "sm-popular-card"
      : "",

    b.hot
      ? "sm-hot-card"
      : ""
  ]
    .filter(Boolean)
    .join(" ");


  const productOptions = product.options || [];
  const hasVariants = productOptions.length > 1;

  const options = productOptions
    .map((option, optionIndex) => {

      const optionName = txt(option);

      return `
        <div class="sm-option">
          <span>${optionName}</span>

          <div class="sm-option-buy">
            <b class="sm-price">${money(option.price)}</b>
            ${""}
          </div>
        </div>
      `;
    })
    .join("");

  const variantButton = b.unavailable ? "" : hasVariants
    ? `<button class="sm-choose-options" type="button" data-product-id="${product.id}">
         <span>+</span><b>${lang === "en" ? "Choose" : lang === "ku" ? "هەڵبژێرە" : "اختيار"}</b>
       </button>`
    : `<button class="sm-direct-add" type="button" data-product-id="${product.id}" data-option-index="0">
         <span>+</span><b>${lang === "en" ? "Add to cart" : lang === "ku" ? "زیادکردن بۆ سەبەتە" : "إضافة للسلة"}</b>
       </button>`;


  return `
    <article class="${classes}">

      ${badges(product)}

      ${
        b.unavailable
          ? `
            <div class="sm-off">
              ${I18N[lang].unavailable}
            </div>
          `
          : ""
      }

      <div class="sm-img">

        <img
          class="sm-product-image"
          data-full-image="${product.image || ""}"
          data-product-name="${txt(product.name)}"
          loading="lazy"
          decoding="async"
          src="${product.image || ""}"
          alt="${txt(product.name)}"
        >

      </div>

      <div class="sm-info">

        <div class="sm-name">
          ${txt(product.name)}
        </div>

        ${options}

        ${
          b.unavailable && product.scheduleText
            ? `<div class="sm-schedule-note">${product.scheduleText}</div>`
            : ""
        }

        ${variantButton}

      </div>

    </article>
  `;
}


/* ========================================
   MENU
======================================== */

function render() {

  const menu = $("#smMenu");

  if (!menu || !DB) return;


  const products = DB.products.filter(
    product =>
      product.category &&
      product.category.ar === active
  );


  if (!products.length) {

    menu.innerHTML = "";
    return;

  }


  menu.innerHTML = `
    <section class="sm-section">

      <h2 class="sm-section-title">
        ${txt(products[0].category)}
      </h2>

      <div class="sm-grid">

        ${products
          .map(productCard)
          .join("")}

      </div>

    </section>
  `;


  watchCards();
}


/* ========================================
   LANGUAGES
======================================== */

function renderLanguages() {

  const holder = $("#smLangs");

  if (!holder) return;


  const show =
    DB?.restaurant?.display?.languageSwitch !== false;


  holder.style.display =
    show
      ? ""
      : "none";


  if (!show) return;


  holder.className = "sm-lang-switch";


  holder.innerHTML = `

    <button
      type="button"
      data-lang="ar"
      class="${lang === "ar" ? "active" : ""}">
      عربي
    </button>

    <button
      type="button"
      data-lang="ku"
      class="${lang === "ku" ? "active" : ""}">
      کوردی
    </button>

    <button
      type="button"
      data-lang="en"
      class="${lang === "en" ? "active" : ""}">
      English
    </button>

  `;
}


/* ========================================
   TOP ACTIONS
======================================== */

function renderActions(){const holder=$("#smActions");if(!holder||!DB)return;const r=DB.restaurant||{},q=r.quickActions||{},a=[];if(q.location?.enabled!==false&&String(r.location||"").trim()&&r.location!=="#")a.push({icon:"📍",label:q.location?.label?.[lang]||I18N[lang].location,url:r.location});if(q.call?.enabled!==false&&String(r.phone||"").trim())a.push({icon:"☎",label:q.call?.label?.[lang]||I18N[lang].call,url:"tel:"+r.phone});if(q.whatsapp?.enabled!==false&&String(r.whatsapp||"").trim())a.push({icon:"💬",label:q.whatsapp?.label?.[lang]||I18N[lang].whatsapp,url:r.whatsapp});safeArray(r.customTopActions).forEach(i=>{const l=actionLabel(i),u=String(i?.url||"").trim();if(i?.enabled!==false&&l&&u)a.push({icon:String(i.icon||"🔗"),label:l,url:u})});holder.className="sm-quick-actions";holder.innerHTML=a.map(i=>`<a href="${escapeUi(i.url)}" ${/^https?:/i.test(i.url)?'target="_blank" rel="noopener"':''}><span>${escapeUi(i.icon)}</span><b>${escapeUi(i.label)}</b></a>`).join("");if(a.length){holder.style.display="grid";holder.style.gridTemplateColumns=`repeat(${a.length},minmax(0,1fr))`}else holder.style.display="none"}

/* ========================================
   APPLY LANGUAGE
======================================== */

function applyLang() {

  document.documentElement.lang = lang;

  document.documentElement.dir =
    lang === "en"
      ? "ltr"
      : "rtl";


  const subtitle = $("#smSubtitle");

  if (subtitle) {
    const customSubtitle =
      DB?.restaurant?.subtitle?.[lang];

    const sourceText =
      customSubtitle === null ||
      customSubtitle === undefined
        ? I18N[lang].subtitle
        : customSubtitle;

    subtitle.textContent =
      formatRestaurantTemplate(
        sourceText,
        lang
      );

    subtitle.style.display =
      DB?.restaurant?.display?.subtitle !== false &&
      subtitle.textContent
        ? ""
        : "none";
  }


  applyRestaurantBranding();
  updateRestaurantLanguageUI();

  renderLanguages();
  renderActions();
  renderCats();
  render();
}


/* ========================================
   CARD REVEAL
======================================== */

let observer = null;


if ("IntersectionObserver" in window) {

  observer =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "sm-visible"
            );

            observer.unobserve(
              entry.target
            );
          }

        });

      },

      {
        rootMargin:
          "0px 0px -6% 0px",

        threshold: 0.05
      }
    );
}


function watchCards() {

  $$(".sm-card:not(.watched)")
    .forEach(card => {

      card.classList.add(
        "watched"
      );


      if (observer) {

        observer.observe(card);

      } else {

        card.classList.add(
          "sm-visible"
        );
      }

    });
}


/* ========================================
   CLICK EVENTS
======================================== */

document.addEventListener(
  "click",
  event => {


    const languageButton =
      event.target.closest(
        "[data-lang]"
      );


    if (languageButton) {

      lang =
        languageButton.dataset.lang;

      localStorage.setItem(
        "shorashLang",
        lang
      );

      applyLang();

      return;
    }


    const categoryButton =
      event.target.closest(
        ".sm-cat"
      );


    if (
      categoryButton &&
      categoryButton.dataset.cat !== active
    ) {

      const rail = $("#smCats");

      const savedScroll =
        rail
          ? rail.scrollLeft
          : 0;


      active =
        categoryButton.dataset.cat;


      renderCats();
      render();


      requestAnimationFrame(() => {

        if (rail) {
          rail.scrollLeft =
            savedScroll;
        }

      });
    }

  }
);


/* ========================================
   FOOTER
======================================== */

function setupFooter() {

  if (!DB) return;


  const restaurant =
    DB.restaurant || {};

  const display =
    restaurant.display || {};

  const footer =
    document.querySelector(".sm-footer");


  if (footer) {
    footer.style.display =
      display.footer === false
        ? "none"
        : "";
  }


  const location =
    $("#smFooterLocation");

  const call =
    $("#smFooterCall");

  const whatsapp =
    $("#smFooterWhatsapp");


  const hasLocation =
    String(restaurant.location || "").trim() &&
    restaurant.location !== "#";

  const hasPhone =
    String(restaurant.phone || "").trim();

  const hasWhatsapp =
    String(restaurant.whatsappNumber || "").trim();


  if (location) {
    location.href =
      restaurant.location || "#";

    const show =
      display.footerLocationButton !== false &&
      !!hasLocation;

    location.hidden = !show;
    location.style.display = show ? "" : "none";
  }


  if (call) {
    call.href =
      "tel:" +
      (restaurant.phone || "");

    const show =
      display.footerCallButton !== false &&
      !!hasPhone;

    call.hidden = !show;
    call.style.display = show ? "" : "none";
  }


  if (whatsapp) {
    whatsapp.href =
      restaurant.whatsapp || "#";

    const show =
      display.footerWhatsappButton !== false &&
      !!hasWhatsapp;

    whatsapp.hidden = !show;
    whatsapp.style.display = show ? "" : "none";
  }


  const facebook =
    $("#smFacebook");

  const snapchat =
    $("#smSnapchat");

  const tiktok =
    $("#smTikTok");

  const instagram =
    $("#smInstagram");


  function applySocialLink(element,url,enabled) {

    if (!element) return;

    const clean =
      String(url || "").trim();

    const show =
      display.footerSocials !== false &&
      enabled !== false &&
      !!clean;

    if (show) {
      element.href = clean;
      element.hidden = false;
      element.style.display = "";
    } else {
      element.removeAttribute("href");
      element.hidden = true;
      element.style.display = "none";
    }
  }


  applySocialLink(
    facebook,
    restaurant.social?.facebook,
    restaurant.socialEnabled?.facebook
  );

  applySocialLink(
    snapchat,
    restaurant.social?.snapchat,
    restaurant.socialEnabled?.snapchat
  );

  applySocialLink(
    tiktok,
    restaurant.social?.tiktok,
    restaurant.socialEnabled?.tiktok
  );

  applySocialLink(
    instagram,
    restaurant.social?.instagram,
    restaurant.socialEnabled?.instagram
  );


  const socialsWrap =
    document.querySelector(".sm-footer-socials, .sm-footer-social");

  if (socialsWrap) {
    socialsWrap.style.display =
      display.footerSocials === false
        ? "none"
        : "";
  }
  const footerActionsParent=location?.parentElement||call?.parentElement||whatsapp?.parentElement||document.querySelector(".sm-footer-actions");
  if(footerActionsParent){footerActionsParent.querySelectorAll(".sm-custom-footer-action").forEach(el=>el.remove());safeArray(restaurant.customFooterActions).forEach(item=>{const label=actionLabel(item),url=String(item?.url||"").trim();if(item?.enabled===false||!label||!url)return;const link=document.createElement("a");link.className=(location?.className||call?.className||whatsapp?.className||"")+" sm-custom-footer-action";link.href=url;if(/^https?:/i.test(url)){link.target="_blank";link.rel="noopener"}link.innerHTML=`<span>${escapeUi(item.icon||"🔗")}</span><b>${escapeUi(label)}</b>`;footerActionsParent.appendChild(link)})}
  const socialParent=instagram?.parentElement||facebook?.parentElement||tiktok?.parentElement||snapchat?.parentElement||document.querySelector(".sm-footer-socials, .sm-footer-social");
  if(socialParent){socialParent.querySelectorAll(".sm-custom-social-link").forEach(el=>el.remove());safeArray(restaurant.customSocialLinks).forEach(item=>{const url=String(item?.url||"").trim(),name=String(item?.name||"Social").trim();if(item?.enabled===false||!url)return;const link=document.createElement("a");link.className=(instagram?.className||facebook?.className||"sm-social-link")+" sm-custom-social-link";link.href=url;link.target="_blank";link.rel="noopener";link.title=name;link.setAttribute("aria-label",name);link.innerHTML=`<span style="display:grid;place-items:center;min-width:1.25em;min-height:1.25em;font-size:1.05em;">${escapeUi(item.icon||"🔗")}</span>`;socialParent.appendChild(link)})}

}


/* ========================================
   LANGUAGE-AWARE RESTAURANT UI
======================================== */

function updateRestaurantLanguageUI() {

  if (!DB) return;

  const restaurant =
    DB.restaurant || {};

  const display =
    restaurant.display || {};


  const footerLocation =
    document.querySelector(
      ".sm-footer-location, .sm-footer-brand span"
    );

  if (footerLocation) {
    const text =
      restaurant.footerLocation?.[lang] ??
      restaurant.footerLocation?.ar ??
      "";

    footerLocation.textContent =
      text;

    footerLocation.style.display =
      display.footerLocation !== false &&
      String(text).trim()
        ? ""
        : "none";
  }


  let announcement =
    document.getElementById(
      "smAnnouncement"
    );


  if (!announcement) {

    announcement =
      document.createElement("div");

    announcement.id =
      "smAnnouncement";

    announcement.style.cssText =
      [
        "display:none",
        "width:min(calc(100% - 20px),680px)",
        "box-sizing:border-box",
        "margin:0 auto 12px",
        "padding:10px 14px",
        "border:1px solid rgba(232,184,98,.26)",
        "border-radius:13px",
        "background:rgba(27,18,10,.78)",
        "color:#e8b862",
        "font-size:12px",
        "font-weight:700",
        "line-height:1.65",
        "text-align:center",
        "backdrop-filter:blur(12px)",
        "-webkit-backdrop-filter:blur(12px)",
        "box-shadow:0 10px 30px rgba(0,0,0,.18)"
      ].join(";");


    const target =
      document.querySelector(
        ".sm-cats-wrap"
      ) ||
      document.getElementById(
        "smCatsSentinel"
      );


    if (target?.parentNode) {
      target.parentNode.insertBefore(
        announcement,
        target
      );
    } else {
      document.body.appendChild(
        announcement
      );
    }
  }


  const announcementText =
    restaurant.announcement?.[lang] ??
    restaurant.announcement?.ar ??
    "";


  const showAnnouncement =
    restaurant.announcementEnabled === true &&
    String(announcementText).trim();


  announcement.textContent =
    announcementText;

  announcement.style.display =
    showAnnouncement
      ? "block"
      : "none";
}


/* ========================================
   RESTAURANT BRANDING
======================================== */

function applyRestaurantBranding() {

  if (!DB) return;

  const restaurant =
    DB.restaurant || {};

  const display =
    restaurant.display || {};

  const currentName =
    restaurantNameForLang(lang);

  const englishName =
    restaurantNameForLang("en");


  document.title =
    currentName
      ? currentName + " — Menu"
      : "Menu";


  const logo =
    String(restaurant.logo ?? "").trim();


  [
    ...document.querySelectorAll(
      ".sm-intro-logo, #smLogo, .sm-logo img"
    )
  ].forEach(img => {

    if (!img) return;

    const show =
      display.logo !== false &&
      !!logo;

    img.style.display =
      show
        ? ""
        : "none";

    if (show) {
      img.src = logo;
      img.alt = currentName || "Restaurant";
    }
  });


  document
    .querySelectorAll(".sm-logo")
    .forEach(el => {
      el.style.display =
        display.logo !== false &&
        !!logo
          ? ""
          : "none";
    });


  const introBrand =
    document.querySelector(
      ".sm-intro-brand"
    );

  if (introBrand) {
    introBrand.textContent =
      currentName;

    introBrand.style.display =
      currentName
        ? ""
        : "none";
  }


  const menuTitle =
    document.querySelector(
      ".sm-header h1, .sm-hero h1"
    );

  if (menuTitle) {

    const genericTitle =
      lang === "ar"
        ? "المنيو"
        : lang === "ku"
          ? "مینیو"
          : "MENU";

    const title =
      currentName
        ? (
            lang === "ar"
              ? "منيو " + currentName
              : lang === "ku"
                ? "مینیوی " + currentName
                : (englishName || currentName) + " MENU"
          )
        : genericTitle;


    menuTitle.textContent =
      title;

    menuTitle.style.display =
      display.menuTitle !== false
        ? ""
        : "none";
  }


  const footerTitle =
    document.querySelector(
      ".sm-footer h2, .sm-footer-brand strong"
    );

  if (footerTitle) {
    footerTitle.textContent =
      currentName;

    footerTitle.style.display =
      display.footerBrand !== false &&
      !!currentName
        ? ""
        : "none";
  }


  const footerPhone =
    document.querySelector(
      ".sm-footer-phone, .sm-phone"
    );

  if (footerPhone) {
    const phoneText =
      footerPhone.querySelector?.("bdi") ||
      footerPhone;

    if (phoneText) {
      phoneText.textContent =
        restaurant.phone || "";
    }

    footerPhone.style.display =
      display.footerPhone !== false &&
      String(restaurant.phone || "").trim()
        ? ""
        : "none";
  }


  const footerCopy =
    document.querySelector(
      ".sm-footer-copy"
    );

  if (footerCopy) {

    footerCopy.textContent =
      currentName
        ? (
            currentName +
            " — All Rights Reserved " +
            new Date().getFullYear() +
            " ©"
          )
        : (
            "All Rights Reserved " +
            new Date().getFullYear() +
            " ©"
          );

    footerCopy.style.display =
      display.footerCopy !== false
        ? ""
        : "none";
  }


  setupFooter();
}


/* ========================================
   BACKGROUND VIDEO
======================================== */

function setupBackground() {

  if (!DB) return;


  const video =
    $("#smBgVideo");


  if (!video) return;


  const enabled =
    DB.restaurant?.display?.backgroundVideo !== false;


  const url =
    String(
      DB.restaurant?.backgroundVideo || ""
    ).trim();


  if (!enabled || !url) {
    video.pause?.();
    video.removeAttribute("src");
    video.style.display = "none";
    return;
  }


  video.style.display = "";
  video.src = url;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;


  const promise =
    video.play();


  if (
    promise &&
    typeof promise.catch === "function"
  ) {

    promise.catch(() => {

      const resume = () => {

        video
          .play()
          .catch(() => {});

        document.removeEventListener(
          "touchstart",
          resume
        );

        document.removeEventListener(
          "click",
          resume
        );
      };


      document.addEventListener(
        "touchstart",
        resume,
        {
          once: true,
          passive: true
        }
      );


      document.addEventListener(
        "click",
        resume,
        {
          once: true
        }
      );

    });
  }
}


/* ========================================
   INTRO
======================================== */

function setupIntro() {

  const intro =
    $("#smIntro");


  if (!intro) return;


  if (
    DB?.restaurant?.display?.intro === false
  ) {
    intro.style.display = "none";
    return;
  }


  const alreadySeen =
    sessionStorage.getItem(
      "shorashIntroSeen"
    );


  if (alreadySeen) {

    intro.style.display =
      "none";

    return;
  }


  sessionStorage.setItem(
    "shorashIntroSeen",
    "1"
  );


  setTimeout(() => {

    intro.classList.add(
      "hide"
    );

  }, 1450);


  setTimeout(() => {

    intro.style.display =
      "none";

  }, 2200);
}


/* ========================================
   STICKY CATEGORIES
======================================== */

let catsFixed = false;
let savedCatsX = 0;


function pinCategories() {

  const cats =
    $("#smCats");

  const sentinel =
    $("#smCatsSentinel");


  if (
    !cats ||
    !sentinel ||
    catsFixed
  ) return;


  savedCatsX =
    cats.scrollLeft;


  sentinel.style.height =
    Math.ceil(
      cats.getBoundingClientRect().height
    ) + "px";


  cats.classList.add(
    "fixed"
  );


  cats.scrollLeft =
    savedCatsX;


  catsFixed = true;
}


function unpinCategories() {

  const cats =
    $("#smCats");

  const sentinel =
    $("#smCatsSentinel");


  if (
    !cats ||
    !sentinel ||
    !catsFixed
  ) return;


  savedCatsX =
    cats.scrollLeft;


  cats.classList.remove(
    "fixed"
  );


  sentinel.style.height =
    "1px";


  cats.scrollLeft =
    savedCatsX;


  catsFixed = false;
}


/* ========================================
   SCROLL EFFECTS
======================================== */

function scrollEffects() {

  const root =
    document.documentElement;


  const max =
    root.scrollHeight -
    root.clientHeight;


  const progress =
    $("#smProgress");


  if (progress) {

    progress.style.width =
      (
        max
          ? root.scrollTop /
            max *
            100
          : 0
      ) + "%";
  }


  const sentinel =
    $("#smCatsSentinel");


  if (sentinel) {

    if (
      !catsFixed &&
      sentinel
        .getBoundingClientRect()
        .top <= 0
    ) {

      pinCategories();

    }


    if (
      catsFixed &&
      window.scrollY <=
        sentinel.offsetTop
    ) {

      unpinCategories();

    }
  }


  const topButton =
    $("#smTopBtn");


  if (topButton) {

    const allowed =
      DB?.restaurant?.display?.backToTop !== false;

    topButton.classList.toggle(
      "show",
      allowed &&
      window.scrollY > 520
    );

    if (!allowed) {
      topButton.style.display = "none";
    } else {
      topButton.style.display = "";
    }
  }
}


window.addEventListener(
  "scroll",
  scrollEffects,
  {
    passive: true
  }
);


/* ========================================
   BACK TO TOP
======================================== */

const topButton =
  $("#smTopBtn");


if (topButton) {

  topButton.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );
}


/* ========================================
   SUPABASE MENU LOADER
======================================== */

async function loadMenuFromSupabase() {

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    throw new Error("Supabase client is not available");
  }

  console.log("🔄 Loading SHORASH menu from Supabase...");


  /* =========================
     RESTAURANT SETTINGS
  ========================= */

  const {
    data: settingsData,
    error: settingsError
  } = await supabaseClient
    .from("restaurant_settings")
    .select("*")
    .order("updated_at", {
      ascending: false
    })
    .limit(1);


  if (settingsError) {
    console.warn(
      "Restaurant settings error:",
      settingsError
    );
  }


  const settings =
    settingsData?.[0] || {};


  /* =========================
     CATEGORIES
  ========================= */

  const {
    data: categoriesData,
    error: categoriesError
  } = await supabaseClient
    .from("categories")
    .select("*")
    .order("sort_order", {
      ascending: true
    });


  if (categoriesError) {
    throw categoriesError;
  }


  /* =========================
     PRODUCTS
  ========================= */

  const {
    data: productsData,
    error: productsError
  } = await supabaseClient
    .from("products")
    .select("*")
    .order("sort_order", {
      ascending: true
    });


  if (productsError) {
    throw productsError;
  }


  /* =========================
     PRODUCT OPTIONS
  ========================= */

  const {
    data: optionsData,
    error: optionsError
  } = await supabaseClient
    .from("product_options")
    .select("*")
    .order("sort_order", {
      ascending: true
    });


  if (optionsError) {
    throw optionsError;
  }


  console.log(
    "📦 Supabase data:",
    {
      categories: categoriesData?.length || 0,
      products: productsData?.length || 0,
      options: optionsData?.length || 0
    }
  );


  /* =========================
     CATEGORY MAP
  ========================= */

  const categoryMap =
    new Map();


  (categoriesData || [])
    .filter(category =>
      category.is_active !== false &&
      category.is_visible !== false
    )
    .forEach(category => {

      categoryMap.set(
        category.id,
        {
          id: category.id,

          ar:
            category.name_ar ||
            category.ar ||
            "",

          ku:
            category.name_ku ||
            category.ku ||
            category.name_ar ||
            "",

          en:
            category.name_en ||
            category.en ||
            category.name_ar ||
            "",

          order:
            category.sort_order ??
            category.order ??
            999
        }
      );

    });


  /* =========================
     OPTIONS MAP
  ========================= */

  const optionsMap =
    new Map();


  (optionsData || [])
    .forEach(option => {

      const productId =
        option.product_id;


      if (!optionsMap.has(productId)) {

        optionsMap.set(
          productId,
          []
        );

      }


      optionsMap
        .get(productId)
        .push({

          id: option.id,

          ar:
            option.name_ar ||
            option.ar ||
            "",

          ku:
            option.name_ku ||
            option.ku ||
            option.name_ar ||
            "",

          en:
            option.name_en ||
            option.en ||
            option.name_ar ||
            "",

          price:
            option.price ?? null,

          order:
            option.sort_order ??
            option.order ??
            999

        });

    });


  /* =========================
     BUILD PRODUCTS
  ========================= */

  const products =
    (productsData || [])
      .filter(product => {

        /*
          Only products connected
          to an existing category
          are displayed.
        */

        return (
          product.is_active !== false &&
          product.is_visible !== false &&
          product.category_id &&
          categoryMap.has(
            product.category_id
          )
        );

      })
      .map(product => {

        const category =
          categoryMap.get(
            product.category_id
          );


        let productOptions =
          optionsMap.get(
            product.id
          ) || [];


        productOptions =
          productOptions.sort(
            (a, b) =>
              Number(a.order || 999) -
              Number(b.order || 999)
          );


        /*
          Safety fallback:
          if a product has no option row
          but has a direct price,
          create one option for the cart.
        */

        if (
          !productOptions.length &&
          product.price !== null &&
          product.price !== undefined
        ) {

          productOptions.push({

            id:
              product.id +
              "-default",

            ar: "",

            ku: "",

            en: "",

            price:
              product.price,

            order: 1

          });

        }


        const manualUnavailable=
          product.is_available === false ||
          product.available === false;

        const scheduleUnavailable=
          product.availability_schedule_enabled === true &&
          scheduledAvailability(product) === false;


        return {

          id:
            product.id,

          manualUnavailable:
            manualUnavailable,

          availability_schedule_enabled:
            product.availability_schedule_enabled === true,

          available_from:
            product.available_from || null,

          available_to:
            product.available_to || null,

          scheduleText:
            productScheduleText(product),

          name: {

            ar:
              product.name_ar ||
              product.ar ||
              "",

            ku:
              product.name_ku ||
              product.ku ||
              product.name_ar ||
              "",

            en:
              product.name_en ||
              product.en ||
              product.name_ar ||
              ""

          },


          category:
            category,


          image:
            product.image_url ||
            product.image ||
            "",


          order:
            product.sort_order ??
            product.order ??
            999,


          badges: {

            popular:
              Boolean(
                product.is_popular ??
                product.popular
              ),

            new:
              Boolean(
                product.is_new ??
                product.new
              ),

            hot:
              Boolean(
                product.is_hot ??
                product.hot
              ),

            offer:
              Boolean(
                product.is_offer ??
                product.offer
              ),

            unavailable:
              manualUnavailable ||
              scheduleUnavailable

          },


          options:
            productOptions

        };

      })
      .sort(
        (a, b) =>
          Number(a.order || 999) -
          Number(b.order || 999)
      );


  /* =========================
     RESTAURANT OBJECT
  ========================= */

  const whatsappRaw =
    String(
      settings.whatsapp_number ||
      settings.whatsapp ||
      settings.whatsapp_url ||
      "9647502662002"
    );

  let whatsappNumber =
    whatsappRaw.replace(/\D/g,"");

  if (whatsappNumber.startsWith("00")) {
    whatsappNumber =
      whatsappNumber.slice(2);
  }

  if (/^07\d{9}$/.test(whatsappNumber)) {
    whatsappNumber =
      "964" +
      whatsappNumber.slice(1);
  }

  if (/^7\d{9}$/.test(whatsappNumber)) {
    whatsappNumber =
      "964" +
      whatsappNumber;
  }

  const value=(key,fallback="")=>{
    const v=settings[key];
    return v===null || v===undefined
      ? fallback
      : v;
  };


  const restaurant = {

    name:
      value(
        "name_en",
        value(
          "name_ar",
          value("name","")
        )
      ),

    nameAr:
      value(
        "name_ar",
        value("name","")
      ),

    nameKu:
      value("name_ku",""),

    nameEn:
      value(
        "name_en",
        value("name","")
      ),

    subtitle: {
      ar:
        value(
          "subtitle_ar",
          "اكتشف منيو {name}"
        ),

      ku:
        value(
          "subtitle_ku",
          "مینیوی {name} ببینە"
        ),

      en:
        value(
          "subtitle_en",
          "Discover {name} Menu"
        )
    },

    phone:
      value(
        "phone",
        "07502662002"
      ),

    whatsappNumber:
      whatsappNumber ||
      "",

    whatsapp:
      whatsappNumber
        ? "https://wa.me/" + whatsappNumber
        : "",

    quickActions: {
      location: {
        enabled:
          settings.top_location_enabled !== false,

        label: {
          ar:
            value(
              "top_location_label_ar",
              "موقعنا"
            ),

          ku:
            value(
              "top_location_label_ku",
              "شوێنی مە"
            ),

          en:
            value(
              "top_location_label_en",
              "Location"
            )
        }
      },

      call: {
        enabled:
          settings.top_call_enabled !== false,

        label: {
          ar:
            value(
              "top_call_label_ar",
              "اتصال"
            ),

          ku:
            value(
              "top_call_label_ku",
              "پەیوەندی"
            ),

          en:
            value(
              "top_call_label_en",
              "Call"
            )
        }
      },

      whatsapp: {
        enabled:
          settings.top_whatsapp_enabled !== false,

        label: {
          ar:
            value(
              "top_whatsapp_label_ar",
              "واتساب منيو"
            ),

          ku:
            value(
              "top_whatsapp_label_ku",
              "مێنیوی واتساپ"
            ),

          en:
            value(
              "top_whatsapp_label_en",
              "WhatsApp Menu"
            )
        }
      }
    },

    location:
      value(
        "location",
        value("location_url","#")
      ),

    footerLocation: {
      ar:
        value(
          "footer_location_ar",
          "دهوك • كوردستان"
        ),

      ku:
        value(
          "footer_location_ku",
          "دهۆک • کوردستان"
        ),

      en:
        value(
          "footer_location_en",
          "Duhok • Kurdistan"
        )
    },

    social: {
      instagram:
        value(
          "instagram_url",
          "https://www.instagram.com/shorashrest"
        ),

      facebook:
        value(
          "facebook_url",
          "https://facebook.com/shorashrest"
        ),

      tiktok:
        value(
          "tiktok_url",
          "https://www.tiktok.com/@shorashrest"
        ),

      snapchat:
        value(
          "snapchat_url",
          "https://www.snapchat.com/add/shorest2000"
        )
    },

    socialEnabled: {
      instagram:
        settings.instagram_enabled !== false,

      facebook:
        settings.facebook_enabled !== false,

      tiktok:
        settings.tiktok_enabled !== false,

      snapchat:
        settings.snapchat_enabled !== false
    },

    customSocialLinks:
      safeArray(settings.custom_social_links),

    customTopActions:
      safeArray(settings.custom_top_actions),

    customFooterActions:
      safeArray(settings.custom_footer_actions),

    display: {
      logo:
        settings.show_logo !== false,

      menuTitle:
        settings.show_menu_title !== false,

      subtitle:
        settings.show_subtitle !== false,

      languageSwitch:
        settings.show_language_switch !== false,

      categoryNav:
        settings.show_category_nav !== false,

      backToTop:
        settings.show_back_to_top !== false,

      intro:
        settings.intro_enabled !== false,

      backgroundVideo:
        settings.background_video_enabled !== false,

      footer:
        settings.show_footer !== false,

      footerBrand:
        settings.show_footer_brand !== false,

      footerLocation:
        settings.show_footer_location !== false,

      footerPhone:
        settings.show_footer_phone !== false,

      footerSocials:
        settings.show_footer_socials !== false,

      footerCopy:
        settings.show_footer_copy !== false,

      footerLocationButton:
        settings.footer_location_enabled !== false,

      footerCallButton:
        settings.footer_call_enabled !== false,

      footerWhatsappButton:
        settings.footer_whatsapp_enabled !== false
    },

    backgroundVideo:
      value(
        "background_video",
        value(
          "background_video_url",
          "assets/background.mp4"
        )
      ),

    logo:
      value(
        "logo_url",
        "assets/shorash-logo.jpeg"
      ),

    isOpen:
      settings.is_open !== false,

    ordersEnabled:
      settings.orders_enabled !== false,

    deliveryEnabled:
      settings.delivery_enabled !== false,

    pickupEnabled:
      settings.pickup_enabled !== false,

    deliveryInfoEnabled:
      settings.delivery_info_enabled !== false,

    deliveryInfo: {
      ar:
        value("delivery_info_ar",""),

      ku:
        value("delivery_info_ku",""),

      en:
        value("delivery_info_en","")
    },

    announcementEnabled:
      settings.announcement_enabled === true,

    announcement: {
      ar:
        value("announcement_ar",""),

      ku:
        value("announcement_ku",""),

      en:
        value("announcement_en","")
    },

    closedMessage: {
      ar:
        value(
          "closed_message_ar",
          "المطعم مغلق حالياً. يسعدنا استقبال طلبك عند إعادة فتح الطلبات."
        ),

      ku:
        value(
          "closed_message_ku",
          "چێشتخانەکە لە ئێستادا داخراوە."
        ),

      en:
        value(
          "closed_message_en",
          "The restaurant is currently closed."
        )
    }

  };


  return {

    restaurant,

    products

  };
}



/* ========================================
   JSON FALLBACK
======================================== */

async function loadMenuFallback() {

  console.warn(
    "⚠️ Using menu.json fallback"
  );


  const response =
    await fetch(
      "data/menu.json?v=32",
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "menu.json HTTP " +
      response.status
    );

  }


  return await response.json();

}



/* ========================================
   START SHORASH
======================================== */

async function startShorash() {

  /*
    Intro runs independently
    so it never gets stuck while
    Supabase is loading.
  */

  try {

    /* =========================
       TRY SUPABASE FIRST
    ========================= */

    try {

      DB =
        await loadMenuFromSupabase();


      console.log(
        "✅ SHORASH MENU LOADED FROM SUPABASE"
      );


    } catch (supabaseError) {

      console.error(
        "❌ Supabase menu loading failed:",
        supabaseError
      );


      /* =========================
         FALLBACK TO JSON
      ========================= */

      DB =
        await loadMenuFallback();


      console.log(
        "✅ SHORASH MENU LOADED FROM JSON FALLBACK"
      );

    }


    /* =========================
       VALIDATE DATABASE
    ========================= */

    if (
      !DB ||
      !Array.isArray(DB.products)
    ) {

      throw new Error(
        "Invalid menu data"
      );

    }


    console.log(
      "🍽 Products loaded:",
      DB.products.length
    );


    /* =========================
       FIND CATEGORIES
    ========================= */

    const cats =
      categories();


    active =
      cats[0]?.ar || "";


    console.log(
      "📂 Categories loaded:",
      cats.length
    );


    /* =========================
       INITIALIZE WEBSITE
    ========================= */

    installMenuCardPolish();

    setupIntro();

    setupBackground();

    setupFooter();

    applyRestaurantBranding();

    applyLang();


    /* =========================
       GLOBAL DATABASE
    ========================= */

    window.SHORASH_DB = DB;

    window.SHORASH_LANG =
      () => lang;


    if(!window.__shorashScheduleTimer){
      window.__shorashScheduleTimer=setInterval(
        refreshScheduledAvailability,
        60000
      );
    }


    window.dispatchEvent(
      new CustomEvent(
        "shorash:ready",
        {
          detail: {
            DB
          }
        }
      )
    );


    scrollEffects();


    console.log(
      "🚀 SHORASH MENU READY"
    );


  } catch (error) {

    console.error(
      "SHORASH MENU ERROR:",
      error
    );


    const menu =
      $("#smMenu");


    if (menu) {

      menu.innerHTML = `

        <div style="
          max-width:600px;
          margin:40px auto;
          padding:25px;
          text-align:center;
          border:1px solid #5b4024;
          border-radius:20px;
          background:rgba(10,8,6,.86);
        ">

          تعذر تحميل المنيو.

          <br><br>

          يرجى تحديث الصفحة.

        </div>

      `;

    }

  }

}


/* ========================================
   RUN
======================================== */

startShorash();
