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


        return {

          id:
            product.id,

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
              product.is_available === false ||
              product.available === false ||
              product.is_active === false

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

  const restaurant = {

    name:
      settings.name_en ||
      settings.name ||
      "SHORASH REST & CAFE",

    phone:
      settings.phone ||
      "9647502662002",

    whatsapp:
      settings.whatsapp ||
      settings.whatsapp_url ||
      "https://wa.me/9647502662002",

    location:
      settings.location ||
      settings.location_url ||
      "#",

    backgroundVideo:
      settings.background_video ||
      settings.background_video_url ||
      "assets/background.mp4"

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

  setupIntro();


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

    setupBackground();

    setupFooter();

    applyLang();


    /* =========================
       GLOBAL DATABASE
    ========================= */

    window.SHORASH_DB = DB;

    window.SHORASH_LANG =
      () => lang;


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
