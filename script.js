const assistantRoutes = [
  {
    keywords: ["beer", "wine"],
    response: "Beer and wine have their own page. Taking you there now.",
    href: "beer-wine.html"
  },
  {
    keywords: ["soda", "beverage", "drink", "drinks"],
    response: "Soda and beverage items are on the drink page. Taking you there now.",
    href: "soda-beverage.html"
  },
  {
    keywords: ["candy", "sweet", "sweets"],
    response: "Candy has its own page. Taking you there now.",
    href: "candy.html"
  },
  {
    keywords: ["energy", "red bull", "monster"],
    response: "Energy drinks are on their own page. Taking you there now.",
    href: "energy-drinks.html"
  },
  {
    keywords: ["snack", "snacks", "chips"],
    response: "Snacks have their own page. Taking you there now.",
    href: "snacks.html"
  },
  {
    keywords: ["special", "specials", "discount", "deal", "deals", "grocery", "ice cream"],
    response: "This week's specials page shows store picks like grocery and ice cream items. Taking you there now.",
    href: "specials.html"
  },
  {
    keywords: ["hours", "open", "close", "time"],
    response: "Liberty Oil Inc is open every day from 7:00 AM to 12:00 AM."
  },
  {
    keywords: ["phone", "call", "number"],
    response: "You can call Liberty Oil Inc at (760) 754-8045.",
    action: { label: "Call Now", href: "tel:+17607548045" }
  },
  {
    keywords: ["address", "location", "directions", "map"],
    response: "Liberty Oil Inc is at 1943 S Coast Hwy, Oceanside, CA 92054.",
    action: {
      label: "Get Directions",
      href: "https://www.google.com/maps/search/?api=1&query=1943+S+Coast+Hwy+Oceanside+CA+92054"
    }
  }
];

const languageOptions = [
  ["en", "English"], ["es", "Spanish"], ["ar", "Arabic"], ["fr", "French"], ["zh-CN", "Chinese (Simplified)"],
  ["af", "Afrikaans"], ["sq", "Albanian"], ["am", "Amharic"], ["hy", "Armenian"], ["az", "Azerbaijani"],
  ["eu", "Basque"], ["be", "Belarusian"], ["bn", "Bengali"], ["bs", "Bosnian"], ["bg", "Bulgarian"],
  ["ca", "Catalan"], ["ceb", "Cebuano"], ["ny", "Chichewa"], ["co", "Corsican"], ["hr", "Croatian"],
  ["cs", "Czech"], ["da", "Danish"], ["nl", "Dutch"], ["eo", "Esperanto"], ["et", "Estonian"],
  ["tl", "Filipino"], ["fi", "Finnish"], ["fy", "Frisian"], ["gl", "Galician"], ["ka", "Georgian"],
  ["de", "German"], ["el", "Greek"], ["gu", "Gujarati"], ["ht", "Haitian Creole"], ["ha", "Hausa"],
  ["haw", "Hawaiian"], ["iw", "Hebrew"], ["hi", "Hindi"], ["hmn", "Hmong"], ["hu", "Hungarian"],
  ["is", "Icelandic"], ["ig", "Igbo"], ["id", "Indonesian"], ["ga", "Irish"], ["it", "Italian"],
  ["ja", "Japanese"], ["jw", "Javanese"], ["kn", "Kannada"], ["kk", "Kazakh"], ["km", "Khmer"],
  ["rw", "Kinyarwanda"], ["ko", "Korean"], ["ku", "Kurdish"], ["ky", "Kyrgyz"], ["lo", "Lao"],
  ["la", "Latin"], ["lv", "Latvian"], ["lt", "Lithuanian"], ["lb", "Luxembourgish"], ["mk", "Macedonian"],
  ["mg", "Malagasy"], ["ms", "Malay"], ["ml", "Malayalam"], ["mt", "Maltese"], ["mi", "Maori"],
  ["mr", "Marathi"], ["mn", "Mongolian"], ["my", "Myanmar"], ["ne", "Nepali"], ["no", "Norwegian"],
  ["or", "Odia"], ["ps", "Pashto"], ["fa", "Persian"], ["pl", "Polish"], ["pt", "Portuguese"],
  ["pa", "Punjabi"], ["ro", "Romanian"], ["ru", "Russian"], ["sm", "Samoan"], ["gd", "Scots Gaelic"],
  ["sr", "Serbian"], ["st", "Sesotho"], ["sn", "Shona"], ["sd", "Sindhi"], ["si", "Sinhala"],
  ["sk", "Slovak"], ["sl", "Slovenian"], ["so", "Somali"], ["su", "Sundanese"], ["sw", "Swahili"],
  ["sv", "Swedish"], ["tg", "Tajik"], ["ta", "Tamil"], ["tt", "Tatar"], ["te", "Telugu"],
  ["th", "Thai"], ["tr", "Turkish"], ["tk", "Turkmen"], ["uk", "Ukrainian"], ["ur", "Urdu"],
  ["ug", "Uyghur"], ["uz", "Uzbek"], ["vi", "Vietnamese"], ["cy", "Welsh"], ["xh", "Xhosa"],
  ["yi", "Yiddish"], ["yo", "Yoruba"], ["zu", "Zulu"]
].map(([code, label]) => ({ code, label }));

let currentLanguage = localStorage.getItem("liberty-language") || "en";
let translateReady = false;
let pendingLanguageCode = currentLanguage;

function injectAssistant() {
  const shell = document.createElement("section");
  shell.className = "assistant-shell";
  shell.innerHTML = `
    <button class="assistant-toggle" type="button" aria-expanded="false">
      <span class="assistant-toggle-icon" aria-hidden="true">AI</span>
      <span class="assistant-toggle-label">Ask Liberty Assistant</span>
    </button>
    <div class="assistant-panel" aria-live="polite">
      <h3>Liberty Assistant</h3>
      <p>Ask about beer and wine, soda, candy, energy drinks, snacks, specials, hours, or directions.</p>
      <div class="assistant-chips">
        <button class="assistant-chip" type="button" data-question="Do you have soda?">Soda</button>
        <button class="assistant-chip" type="button" data-question="Where are the snacks?">Snacks</button>
        <button class="assistant-chip" type="button" data-question="Show me the specials">Specials</button>
      </div>
      <form class="assistant-form">
        <input type="text" name="question" placeholder="Ask a question..." aria-label="Ask Liberty Assistant a question">
        <div class="assistant-actions">
          <button class="button button-primary" type="submit">Ask</button>
        </div>
      </form>
      <div class="assistant-response">
        <strong>Ready to help.</strong> Ask about categories, hours, or directions.
      </div>
    </div>
  `;
  document.body.appendChild(shell);

  const toggle = shell.querySelector(".assistant-toggle");
  const form = shell.querySelector(".assistant-form");
  const input = shell.querySelector("input");
  const response = shell.querySelector(".assistant-response");

  toggle.addEventListener("click", () => {
    const isOpen = shell.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      input.focus();
    }
  });

  shell.querySelectorAll(".assistant-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.question || "";
      handleAssistantQuestion(input.value, response);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAssistantQuestion(input.value, response);
  });
}

function initMobileNav() {
  const nav = document.querySelector(".nav");
  const navLinks = nav?.querySelector(".nav-links");
  if (!nav || !navLinks) {
    return;
  }

  const toggle = document.createElement("button");
  toggle.className = "nav-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  toggle.innerHTML = `<span class="nav-toggle-lines" aria-hidden="true"></span>`;
  nav.insertBefore(toggle, navLinks);

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function injectLanguageSwitcher() {
  const nav = document.querySelector(".nav");
  if (!nav || nav.querySelector(".lang-switcher")) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "lang-switcher notranslate";
  switcher.setAttribute("translate", "no");
  switcher.innerHTML = `
    <button class="lang-toggle notranslate" type="button" aria-expanded="false" translate="no">
      <span>Language</span>
      <span class="lang-current"></span>
    </button>
    <div class="lang-menu notranslate" translate="no">
      <input class="lang-search notranslate" type="text" placeholder="Search language..." aria-label="Search language" translate="no">
      <div class="lang-list notranslate" translate="no"></div>
    </div>
  `;

  const navLinks = nav.querySelector(".nav-links");
  nav.insertBefore(switcher, navLinks);

  const toggle = switcher.querySelector(".lang-toggle");
  const menu = switcher.querySelector(".lang-menu");
  const search = switcher.querySelector(".lang-search");
  const list = switcher.querySelector(".lang-list");
  const currentLabel = switcher.querySelector(".lang-current");

  const renderLanguages = (filter = "") => {
    const filterLower = filter.trim().toLowerCase();
    const current = languageOptions.find((language) => language.code === currentLanguage) || languageOptions[0];
    currentLabel.textContent = current.label;

    const sorted = [
      current,
      ...languageOptions.filter((language) => language.code !== current.code)
    ].filter((language) => language.label.toLowerCase().includes(filterLower));

    list.innerHTML = sorted.map((language) => `
      <button class="lang-option notranslate ${language.code === currentLanguage ? "active" : ""}" type="button" data-lang="${language.code}" translate="no">
        <span>${language.label}</span>
        <span class="lang-check">${language.code === currentLanguage ? "✓" : ""}</span>
      </button>
    `).join("");

    list.querySelectorAll(".lang-option").forEach((option) => {
      option.addEventListener("click", () => {
        setLanguage(option.dataset.lang || "en");
        switcher.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  };

  renderLanguages();

  toggle.addEventListener("click", () => {
    const isOpen = switcher.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      search.focus();
    }
  });

  search.addEventListener("input", () => renderLanguages(search.value));

  document.addEventListener("click", (event) => {
    if (!switcher.contains(event.target)) {
      switcher.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function ensureGoogleTranslateHost() {
  if (!document.getElementById("google_translate_element")) {
    const host = document.createElement("div");
    host.id = "google_translate_element";
    host.style.display = "none";
    document.body.appendChild(host);
  }
}

function loadGoogleTranslate() {
  ensureGoogleTranslateHost();

  window.googleTranslateElementInit = function googleTranslateElementInit() {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: languageOptions.map((language) => language.code).join(",")
        },
        "google_translate_element"
      );
      translateReady = true;
      applyGoogleLanguage(pendingLanguageCode);
    }
  };

  if (!document.querySelector('script[data-google-translate="true"]')) {
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.dataset.googleTranslate = "true";
    document.body.appendChild(script);
  }
}

function waitForTranslateCombo(callback, tries = 40) {
  const combo = document.querySelector(".goog-te-combo");
  if (combo) {
    callback(combo);
    return;
  }
  if (tries <= 0) {
    return;
  }
  window.setTimeout(() => waitForTranslateCombo(callback, tries - 1), 250);
}

function applyGoogleLanguage(languageCode) {
  if (!translateReady) {
    pendingLanguageCode = languageCode;
    return;
  }

  waitForTranslateCombo((combo) => {
    combo.value = languageCode;
    combo.dispatchEvent(new Event("change"));
  });

  document.documentElement.lang = languageCode === "ar" ? "ar" : languageCode;
  document.documentElement.dir = languageCode === "ar" ? "rtl" : "ltr";
}

function setLanguage(languageCode) {
  currentLanguage = languageCode;
  pendingLanguageCode = languageCode;
  localStorage.setItem("liberty-language", languageCode);
  applyGoogleLanguage(languageCode);
  const currentLabel = document.querySelector(".lang-current");
  const current = languageOptions.find((language) => language.code === languageCode);
  if (currentLabel && current) {
    currentLabel.textContent = current.label;
  }
  const list = document.querySelector(".lang-list");
  if (list) {
    const search = document.querySelector(".lang-search");
    const filter = search ? search.value : "";
    document.querySelector(".lang-switcher")?.remove();
    injectLanguageSwitcher();
    const newSearch = document.querySelector(".lang-search");
    if (newSearch) {
      newSearch.value = filter;
      newSearch.dispatchEvent(new Event("input"));
    }
  }
}

function initClickBursts() {
  const burstTargets = document.querySelectorAll(".category-card, .gallery-card-link");
  burstTargets.forEach((target) => {
    const burst = document.createElement("span");
    burst.className = "click-burst";
    for (let i = 0; i < 9; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      burst.appendChild(piece);
    }
    target.appendChild(burst);

    const playBurst = () => {
      target.classList.remove("burst-active");
      void target.offsetWidth;
      target.classList.add("burst-active");
      window.setTimeout(() => {
        target.classList.remove("burst-active");
      }, 760);
    };

    target.addEventListener("click", playBurst);
  });
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".hero-copy, .hero-card, .section-heading, .category-card, .delivery-panel, .about-copy, .about-panel, .gallery-card, .special-card, .testimonial-card, .site-footer"
  );

  if (!targets.length) {
    return;
  }

  targets.forEach((target) => target.classList.add("reveal-3d"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  targets.forEach((target) => observer.observe(target));
}

const discountWheelSlices = [
  {
    type: "three",
    label: "$3 off",
    code: "89036",
    title: "$3 off",
    terms: "$3 off is only valid on purchases of $30 or more.",
    image: "assets/discount-89036-3-off.jpeg",
    fileName: "liberty-oil-3-off.jpeg"
  },
  {
    type: "one",
    label: "$1 off",
    code: "5272",
    title: "$1 off",
    terms: "$1 off is only valid on purchases of $20 or more.",
    image: "assets/discount-5272-1-off.png",
    fileName: "liberty-oil-1-off.png"
  },
  {
    type: "three",
    label: "$3 off",
    code: "89036",
    title: "$3 off",
    terms: "$3 off is only valid on purchases of $30 or more.",
    image: "assets/discount-89036-3-off.jpeg",
    fileName: "liberty-oil-3-off.jpeg"
  },
  {
    type: "one",
    label: "$1 off",
    code: "5272",
    title: "$1 off",
    terms: "$1 off is only valid on purchases of $20 or more.",
    image: "assets/discount-5272-1-off.png",
    fileName: "liberty-oil-1-off.png"
  },
  {
    type: "three",
    label: "$3 off",
    code: "89036",
    title: "$3 off",
    terms: "$3 off is only valid on purchases of $30 or more.",
    image: "assets/discount-89036-3-off.jpeg",
    fileName: "liberty-oil-3-off.jpeg"
  },
  {
    type: "again",
    label: "Spin Again"
  },
  {
    type: "one",
    label: "$1 off",
    code: "5272",
    title: "$1 off",
    terms: "$1 off is only valid on purchases of $20 or more.",
    image: "assets/discount-5272-1-off.png",
    fileName: "liberty-oil-1-off.png"
  }
];

const discountWinningIndexes = discountWheelSlices
  .map((slice, index) => ({ slice, index }))
  .filter((entry) => entry.slice.type !== "again");

function initDiscountWheel() {
  const storageKey = "libertyDiscountWheelResult";
  if (localStorage.getItem(storageKey) || document.querySelector(".discount-popup")) {
    return;
  }

  const popup = document.createElement("section");
  popup.className = "discount-popup";
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-label", "Discount mystery spin wheel");
  popup.innerHTML = `
    <div class="discount-card">
      <button class="discount-close" type="button" aria-label="Close discount popup">&times;</button>
      <div class="discount-intro">
        <span class="discount-kicker">Liberty Oil Inc</span>
        <h2>Discount Mystery Wheel</h2>
        <p>Spin once for a surprise coupon to use in store.</p>
      </div>
      <div class="wheel-stage">
        <span class="wheel-pointer" aria-hidden="true"></span>
        <div class="discount-wheel" aria-hidden="true">
          ${discountWheelSlices.map((slice, index) => `
            <span class="wheel-label wheel-label-${index}">
              <small>Discount Mystery</small>
            </span>
          `).join("")}
        </div>
        <button class="spin-button" type="button">SPIN</button>
      </div>
      <div class="discount-rules">
        <p><strong>$1 off</strong> is only valid on purchases of $20 or more.</p>
        <p><strong>$3 off</strong> is only valid on purchases of $30 or more.</p>
      </div>
      <div class="discount-result" hidden></div>
    </div>
  `;
  document.body.appendChild(popup);
  document.body.classList.add("discount-open");

  const wheel = popup.querySelector(".discount-wheel");
  const spinButton = popup.querySelector(".spin-button");
  const resultBox = popup.querySelector(".discount-result");
  const closeButton = popup.querySelector(".discount-close");

  const closePopup = () => {
    popup.remove();
    document.body.classList.remove("discount-open");
  };

  closeButton.addEventListener("click", closePopup);

  spinButton.addEventListener("click", () => {
    if (spinButton.disabled) {
      return;
    }

    const winning = discountWinningIndexes[Math.floor(Math.random() * discountWinningIndexes.length)];
    const selected = winning.slice;
    const sliceDegrees = 360 / discountWheelSlices.length;
    const centerAngle = (winning.index * sliceDegrees) + (sliceDegrees / 2);
    const finalRotation = (360 * 6) + (360 - centerAngle);

    spinButton.disabled = true;
    spinButton.textContent = "SPINNING";
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({
        type: selected.type,
        code: selected.code,
        claimedAt: new Date().toISOString()
      }));

      resultBox.hidden = false;
      resultBox.innerHTML = `
        <div class="discount-win">
          <span class="discount-win-pill">You won</span>
          <h3>${selected.title}</h3>
          <p>${selected.terms}</p>
          <p class="discount-code">Coupon code: <strong>${selected.code}</strong></p>
          <img src="${selected.image}" alt="${selected.title} coupon barcode code ${selected.code}">
          <div class="discount-result-actions">
            <a class="button button-primary" href="${selected.image}" download="${selected.fileName}">Save / Download Photo</a>
            <a class="button button-secondary" href="${selected.image}" target="_blank" rel="noreferrer">Open Image</a>
          </div>
          <p class="discount-save-note">On iPhone, tap Open Image, then press and hold the photo to save it.</p>
        </div>
      `;
      spinButton.textContent = "USED";
    }, 4400);
  });
}

function handleAssistantQuestion(question, responseEl) {
  const cleanQuestion = question.trim().toLowerCase();
  if (!cleanQuestion) {
    responseEl.innerHTML = "<strong>Try a question.</strong> Ask about beer and wine, soda, candy, snacks, energy drinks, specials, hours, or directions.";
    return;
  }

  const languageCommand = cleanQuestion.match(/(?:change|switch|translate).*(?:language|to)\s+(.+)/i);
  if (languageCommand) {
    const requested = languageCommand[1].trim().toLowerCase();
    const found = languageOptions.find((language) => language.label.toLowerCase() === requested || language.label.toLowerCase().includes(requested));
    if (found) {
      setLanguage(found.code);
      responseEl.innerHTML = `<strong>Liberty Assistant:</strong> Changing the language to ${found.label}.`;
      return;
    }
  }

  const match = assistantRoutes.find((entry) =>
    entry.keywords.some((keyword) => cleanQuestion.includes(keyword))
  );

  if (!match) {
    responseEl.innerHTML = "<strong>I can help with store questions.</strong> Try asking about beer and wine, soda, candy, snacks, energy drinks, specials, hours, or directions.";
    return;
  }

  let actionMarkup = "";
  if (match.action) {
    const isExternal = match.action.href.startsWith("http");
    const target = isExternal ? ' target="_blank"' : "";
    const rel = isExternal ? ' rel="noreferrer"' : "";
    actionMarkup = `<div class="assistant-actions" style="margin-top: 0.8rem;"><a class="button button-secondary" href="${match.action.href}"${target}${rel}>${match.action.label}</a></div>`;
  }

  responseEl.innerHTML = `<strong>Liberty Assistant:</strong> ${match.response}${actionMarkup}`;

  if (match.href) {
    window.setTimeout(() => {
      window.location.href = match.href;
    }, 420);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  injectLanguageSwitcher();
  loadGoogleTranslate();
  initDiscountWheel();
  injectAssistant();
  initClickBursts();
  initScrollReveal();
  applyGoogleLanguage(currentLanguage);
});
