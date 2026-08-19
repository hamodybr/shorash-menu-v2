const I18N = {
  ar: {
    subtitle: "اكتشف منيو شوراش",
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
    subtitle: "مێنیوی شوراش ببینە",
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
    subtitle: "Discover the SHORASH menu",
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

  if (!rail) return;

  const savedScroll = rail.scrollLeft;

  rail.innerHTML = categories()
    .map(category => {

      return `
        <button
          class="sm-cat ${
            category.ar === active
              ? "active"
              : ""
          }"
          data-cat="${category.ar}">
          ${txt(category)}
        </button>
      `;

    })
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


  const options = (product.options || [])
    .map(option => {

      const optionName = txt(option);

      return `
        <div class="sm-option">

          <span>
            ${optionName}
          </span>

          <b class="sm-price">
            ${money(option.price)}
          </b>

        </div>
      `;

    })
    .join("");


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


  holder.className = "sm-lang-switch";


  holder.innerHTML = `

    <button
      type="button"
      data-lang="ar"
      class="${
        lang === "ar"
          ? "active"
          : ""
      }">
      عربي
    </button>

    <button
      type="button"
      data-lang="ku"
      class="${
        lang === "ku"
          ? "active"
          : ""
      }">
      کوردی
    </button>

    <button
      type="button"
      data-lang="en"
      class="${
        lang === "en"
          ? "active"
          : ""
      }">
      English
    </button>

  `;
}


/* ========================================
   TOP ACTIONS
======================================== */

function renderActions() {

  const holder = $("#smActions");

  if (!holder || !DB) return;


  const restaurant = DB.restaurant;


  holder.className = "sm-quick-actions";


  holder.innerHTML = `

    <a
      href="${restaurant.location || "#"}"
      target="_blank"
      rel="noopener">

      <span>📍</span>

      <b>
        ${I18N[lang].location}
      </b>

    </a>


    <a
      href="tel:${restaurant.phone || ""}">

      <span>☎</span>

      <b>
        ${I18N[lang].call}
      </b>

    </a>


    <a
      href="${restaurant.whatsapp || "#"}"
      target="_blank"
      rel="noopener">

      <span>💬</span>

      <b>
        ${I18N[lang].whatsapp}
      </b>

    </a>

  `;
}


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
    subtitle.textContent =
      I18N[lang].subtitle;
  }


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


  const location =
    $("#smFooterLocation");

  const call =
    $("#smFooterCall");

  const whatsapp =
    $("#smFooterWhatsapp");


  if (location) {
    location.href =
      restaurant.location || "#";
  }


  if (call) {
    call.href =
      "tel:" +
      (restaurant.phone || "");
  }


  if (whatsapp) {
    whatsapp.href =
      restaurant.whatsapp || "#";
  }


  /*
    SHORASH social links.
    Change these later if needed.
  */

  const facebook =
    $("#smFacebook");

  const snapchat =
    $("#smSnapchat");

  const tiktok =
    $("#smTikTok");

  const instagram =
    $("#smInstagram");


  if (facebook) {
    facebook.href =
      "https://facebook.com/shorashrest";
  }


  if (snapchat) {
    snapchat.href =
      "https://www.snapchat.com/add/shorest2000";
  }


  if (tiktok) {
    tiktok.href =
      "https://www.tiktok.com/@shorashrest";
  }


  if (instagram) {
    instagram.href =
      "https://www.instagram.com/shorashrest";
  }
}


/* ========================================
   BACKGROUND VIDEO
======================================== */

function setupBackground() {

  if (!DB) return;


  const video =
    $("#smBgVideo");


  if (!video) return;


  const url =
    DB.restaurant?.backgroundVideo;


  if (!url) return;


  video.src = url;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;


  const promise =
    video.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise.catch(() => {

      /*
        iOS may wait for the first
        user interaction.
      */

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

    topButton.classList.toggle(
      "show",
      window.scrollY > 520
    );
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
   LOAD MENU
======================================== */

async function startShorash() {

  /*
    Hide intro independently.
    This prevents a slow connection
    from leaving the splash screen
    stuck forever.
  */

  setupIntro();


  try {

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


    DB =
      await response.json();


    if (
      !DB ||
      !Array.isArray(DB.products)
    ) {

      throw new Error(
        "Invalid menu data"
      );
    }


    const cats =
      categories();


    active =
      cats[0]?.ar || "";


    setupBackground();

    setupFooter();

    applyLang();

    scrollEffects();


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


startShorash();