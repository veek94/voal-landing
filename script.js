/**
 * script.js — ES module (Firebase v9 modular)
 * Note: This file uses async/await and Firestore modular imports.
 */

/* ===========================
   Imports (Firebase v9 modular)
   =========================== */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/* ===========================
   Config / Constants
   =========================== */
const TELEGRAM_LINK = "https://t.me/+AlyGlcpbN-E2NWU0";
const WHATSAPP_NUMBER = "2348100145204"; // used for donation quick-links

const firebaseConfig = {
  apiKey: "AIzaSyB-1TQsUTckhDdWLuXWyutIiOwycU-X2uE",
  authDomain: "solar-training-1e6be.firebaseapp.com",
  projectId: "solar-training-1e6be",
  storageBucket: "solar-training-1e6be.firebasestorage.app",
  messagingSenderId: "5892298211",
  appId: "1:5892298211:web:2e743c67f6bef3afde7cd6"
};

/* ===========================
   Helpers
   =========================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function createMessageElementIfMissing(form) {
  let msg = form.querySelector("#formMessage");
  if (!msg) {
    msg = document.createElement("p");
    msg.id = "formMessage";
    msg.setAttribute("aria-live", "polite");
    msg.style.marginTop = "12px";
    form.appendChild(msg);
  }
  return msg;
}

function showFormMessage(form, text, color = "black") {
  const msg = createMessageElementIfMissing(form);
  msg.textContent = text;
  msg.style.color = color;
}

/* A small wrapper to use SweetAlert2 if present, otherwise fallback to alert/text */
function showAlert({ icon = "info", title = "", text = "", timer = 0 } = {}) {
  if (window.Swal) {
    const opts = { icon, title, text };
    if (timer) opts.timer = timer;
    if (timer) opts.showConfirmButton = false;
    window.Swal.fire(opts);
  } else {
    // fallback
    if (icon === "success") console.log("✔️", title, text);
    else if (icon === "error") console.error("❌", title, text);
    else console.info(title, text);
    if (text) alert(`${title ? title + " — " : ""}${text}`);
  }
}

/* ===========================
   Initialize Firebase (v9)
   =========================== */
let db = null;
try {
  // safe-initialize (if multiple modules/scripts run, reuse first app)
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  db = getFirestore();
  console.log("Firebase (v9) initialized — Firestore ready.");
} catch (err) {
  console.warn("Firebase init failed or Firestore unavailable:", err);
  db = null;
}

/* ===========================
   Main DOM-ready logic
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------
     AOS init (if available)
     ---------------------------- */
  if (window.AOS && typeof window.AOS.init === "function") {
    AOS.init({ duration: 800, once: true });
  }

  /* ----------------------------
     Fill year in footer
     ---------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------
     Hamburger / mobile nav
     ---------------------------- */
  const hamburger = document.getElementById("hamburger");
  const navUl = $("nav ul");
  const navLinks = $all("nav ul li a");

  if (hamburger && navUl) {
    // set ARIA attributes for a11y
    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("aria-controls", "main-nav");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.tabIndex = 0;

    function setNavExpandedState(expanded) {
      hamburger.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (expanded) navUl.classList.add("show");
      else navUl.classList.remove("show");
      hamburger.classList.toggle("active", expanded);
    }

    hamburger.addEventListener("click", () => {
      const opened = navUl.classList.contains("show");
      setNavExpandedState(!opened);
    });

    // keyboard toggle
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hamburger.click();
      }
    });

    // Close menu when a link clicked (mobile)
    navLinks.forEach((a) => {
      a.addEventListener("click", () => {
        // for mobile the show class will be removed
        setNavExpandedState(false);
      });
    });

    // Close when clicking outside nav (optional friendly behavior)
    document.addEventListener("click", (e) => {
      const isClickInside = navUl.contains(e.target) || hamburger.contains(e.target);
      if (!isClickInside && navUl.classList.contains("show")) {
        setNavExpandedState(false);
      }
    });
  }

  /* ----------------------------
     Active nav on scroll
     ---------------------------- */
  const sections = $all("section[id]");
  function updateActiveNav() {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    sections.forEach((section) => {
      const top = section.offsetTop - 160;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute("id");
      const link = document.querySelector(`nav ul li a[href="#${id}"]`);
      if (!link) return;
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }
  window.addEventListener("scroll", updateActiveNav);
  // run once on load
  setTimeout(updateActiveNav, 200);

  /* ----------------------------
     Smooth in-page scrolling for anchor links
     ---------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ----------------------------
     Back-to-top visibility / click
     ---------------------------- */
  const backToTopAnchor = $(".back-to-top") || document.querySelector('a[href="#hero"]');
  function toggleBackToTop() {
    if (!backToTopAnchor) return;
    const show = window.scrollY > 400;
    backToTopAnchor.style.display = show ? "inline-block" : "none";
  }
  window.addEventListener("scroll", toggleBackToTop);
  toggleBackToTop();
  if (backToTopAnchor) {
    backToTopAnchor.addEventListener("click", (e) => {
      // If it's a hash anchor the smooth scroll handler will manage it,
      // but ensure default behavior is prevented for manual scroll here.
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------
     FAQ accordion (if present)
     ---------------------------- */
  const faqButtons = $all(".faq-question");
  if (faqButtons.length) {
    faqButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.parentElement;
        const expanded = btn.getAttribute("aria-expanded") === "true";
        $all(".faq-item").forEach((i) => {
          if (i !== item) {
            i.classList.remove("active");
            const q = i.querySelector(".faq-question");
            if (q) q.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("active");
        btn.setAttribute("aria-expanded", String(!expanded));
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") btn.click();
      });
    });
  }

  /* ----------------------------
     Registration form handling (regForm)
     - save to Firestore 'registrations'
     - show message then redirect to TELEGRAM_LINK
     ---------------------------- */
  const regForm =
    document.getElementById("regForm") ||
    document.getElementById("registerForm") ||
    document.getElementById("myForm");

  if (regForm) {
    createMessageElementIfMissing(regForm);

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // tolerant extraction of fields
      const nameEl =
        regForm.querySelector("#name") ||
        regForm.querySelector("#fullname") ||
        regForm.querySelector('input[name="name"]') ||
        regForm.querySelector('input[name="fullname"]');
      const phoneEl = regForm.querySelector("#phone") || regForm.querySelector('input[name="phone"]');
      const emailEl = regForm.querySelector("#email") || regForm.querySelector('input[name="email"]');
      const ageEl = regForm.querySelector("#age") || regForm.querySelector('select[name="age"]') || regForm.querySelector('input[name="age"]');

      const name = nameEl ? nameEl.value.trim() : "";
      const phone = phoneEl ? phoneEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim() : "";
      const age = ageEl ? ageEl.value.trim() : "";

      if (!name || !phone || !email) {
        showFormMessage(regForm, "⚠️ Please fill in all required fields.", "red");
        return;
      }

      showFormMessage(regForm, "⏳ Submitting registration...", "black");

      try {
        if (db) {
          await addDoc(collection(db, "registrations"), {
            name,
            phone,
            email,
            age,
            timestamp: serverTimestamp()
          });
        } else {
          console.warn("Firestore not available — skipping DB write for registration.");
        }

        // success UI (prefer Swal if available)
        showFormMessage(regForm, "✅ Registration submitted successfully! Redirecting…", "green");
        showAlert({ icon: "success", title: "Registration Successful!", text: "Redirecting you to our Telegram community…", timer: 1200 });

        // short delay then redirect to telegram (same tab)
        setTimeout(() => {
          window.location.href = TELEGRAM_LINK;
        }, 1300);

        try {
          regForm.reset();
        } catch (err) {
          // ignore
        }
      } catch (err) {
        console.error("Registration error:", err);
        showFormMessage(regForm, "❌ Error submitting registration. Try again or contact us on WhatsApp.", "red");
        showAlert({ icon: "error", title: "Error", text: "Could not save your registration. Please try again." });
      }
    });
  }

  /* ----------------------------
     Donation cards behavior
     - .donation-card elements (data-amount attribute)
     - logs donation to Firestore (best-effort), opens WhatsApp chat
     ---------------------------- */
  $all(".donation-card").forEach((card) => {
    card.addEventListener("click", async () => {
      const amountAttr = card.getAttribute("data-amount");
      if (amountAttr == null) return;

      // custom / other -> handled separately
      if (amountAttr === "0" || card.id === "donateCustom") {
        // let the donateCustom handler manage it
        return;
      }

      const amount = parseInt(amountAttr, 10) || 0;

      try {
        if (db) {
          await addDoc(collection(db, "donations"), {
            amount,
            timestamp: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Donation logging error:", err);
      }

      const message = encodeURIComponent(`I want to donate ₦${amount} to support VOAL Technology free training.`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    });
  });

  /* Custom donation card */
  const donateCustomBtn = document.getElementById("donateCustom");
  if (donateCustomBtn) {
    donateCustomBtn.addEventListener("click", async () => {
      const custom = prompt("Enter the amount you want to donate (₦):");
      if (!custom) return;
      if (isNaN(custom) || parseInt(custom, 10) <= 0) {
        alert("Please enter a valid numeric amount.");
        return;
      }
      try {
        if (db) {
          await addDoc(collection(db, "donations"), {
            amount: parseInt(custom, 10),
            timestamp: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Custom donation logging error:", err);
      }
      const message = encodeURIComponent(`I want to donate ₦${custom} to support VOAL Technology free training.`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    });
  }

  /* ----------------------------
     Make WhatsApp floating button keyboard accessible
     ---------------------------- */
  const waFloat = document.querySelector(".whatsapp-float");
  if (waFloat) {
    waFloat.setAttribute("role", "link");
    waFloat.setAttribute("tabindex", "0");
    waFloat.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        waFloat.click();
      }
    });
  }

  /* ----------------------------
     Mark external target="_blank" links with rel for safety
     ---------------------------- */
  document.querySelectorAll('a[target="_blank"]').forEach((a) => {
    a.setAttribute("rel", "noopener noreferrer");
  });

  /* ----------------------------
     Diagnostic: detect images that fail to load (useful on Vercel where case-sensitivity matters)
     - adds console warnings listing broken image src values
     ---------------------------- */
  window.addEventListener("load", () => {
    const bad = [];
    $all("img").forEach((img) => {
      // If the image failed to load (naturalWidth = 0) mark it for debugging
      if (!img.complete || img.naturalWidth === 0) {
        bad.push(img.src);
        img.dataset.loadError = "true";
        img.setAttribute("title", "Image failed to load — check path/casing");
      }
    });
    if (bad.length) {
      console.warn("Images failed to load (check file paths/casing). Examples:", bad.slice(0, 10));
    }
  });

  // end DOMContentLoaded
}); // DOMContentLoaded

/* ===========================
   Extra safety: if AOS included but DOMContentLoaded already fired earlier,
   ensure AOS also initialized (very small chance).
   =========================== */
if (window.AOS && typeof window.AOS.init === "function") {
  window.AOS.init({ duration: 800, once: true });
}
