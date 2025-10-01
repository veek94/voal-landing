
// script.js — Unified site interactivity (compatible with Firebase v8 global SDK)
// Save as script.js and include with <script src="script.js"></script> before </body>
'use strict';

(function () {
  // ----- Configuration -----
  const TELEGRAM_LINK = 'https://t.me/+AlyGlcpbN-E2NWU0';
  const WHATSAPP_NUMBER = '2348100145204'; // used for donation quick-links

  // If you already initialize firebase in <head>, we won't re-initialize.
  // But include same config in case it's not initialized yet.
  const firebaseConfig = {
    apiKey: "AIzaSyB-1TQsUTckhDdWLuXWyutIiOwycU-X2uE",
    authDomain: "solar-training-1e6be.firebaseapp.com",
    projectId: "solar-training-1e6be",
    storageBucket: "solar-training-1e6be.firebasestorage.app",
    messagingSenderId: "5892298211",
    appId: "1:5892298211:web:2e743c67f6bef3afde7cd6"
  };

  // ----- Utilities -----
  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $all(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  function createMessageElementIfMissing(form) {
    let msg = form.querySelector('#formMessage');
    if (!msg) {
      msg = document.createElement('p');
      msg.id = 'formMessage';
      msg.setAttribute('aria-live', 'polite');
      msg.style.marginTop = '12px';
      form.appendChild(msg);
    }
    return msg;
  }

  function showFormMessage(form, text, color = 'black') {
    const msg = createMessageElementIfMissing(form);
    msg.textContent = text;
    msg.style.color = color;
  }

  // ----- Firebase init (v8 global) -----
  let firestoreAvailable = false;
  try {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase global SDK not found. Firestore logging will be skipped.');
    } else {
      // avoid double-init
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }
      if (firebase.firestore) {
        window._voal_db = firebase.firestore();
        firestoreAvailable = true;
      } else {
        console.warn('firebase.firestore not available.');
      }
    }
  } catch (err) {
    console.error('Firebase init error:', err);
    firestoreAvailable = false;
  }

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {

    // -------------------------
    // AOS (if included)
    // -------------------------
    if (window.AOS) {
      AOS.init({ duration: 800, once: true });
    }

    // -------------------------
    // Hamburger / mobile nav
    // -------------------------
    const hamburger = document.getElementById('hamburger');
    const navUl = $('nav ul');
    const navLinks = $all('nav ul li a');

    if (hamburger && navUl) {
      hamburger.addEventListener('click', () => {
        navUl.classList.toggle('show');
        hamburger.classList.toggle('active');
      });

      // keyboard accessibility
      hamburger.setAttribute('role', 'button');
      hamburger.setAttribute('tabindex', '0');
      hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') hamburger.click();
      });
    }

    navLinks.forEach(a => {
      a.addEventListener('click', () => {
        if (navUl && navUl.classList.contains('show')) {
          navUl.classList.remove('show');
          if (hamburger) hamburger.classList.remove('active');
        }
      });
    });

    // -------------------------
    // Active nav on scroll
    // -------------------------
    const sections = $all('section[id]');
    function updateActiveNav() {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      sections.forEach(section => {
        const top = section.offsetTop - 160;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`nav ul li a[href="#${id}"]`);
        if (!link) return;
        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // -------------------------
    // Smooth anchor scrolling for in-page links
    // -------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        // Allow external anchors (if element missing) to work normally
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        } // else let it behave
      });
    });

    // -------------------------
    // Back to top visibility (handles button id/back-to-top OR .back-to-top anchor)
    // -------------------------
    const backToTopButton = document.getElementById('backToTop') || $('.back-to-top');
    function toggleBackToTop() {
      if (!backToTopButton) return;
      const show = window.scrollY > 400;
      if (show) backToTopButton.style.display = 'inline-block';
      else backToTopButton.style.display = 'none';
    }
    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();

    if (backToTopButton) {
      backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // -------------------------
    // FAQ accordion (if using .faq-question style)
    // -------------------------
    const faqButtons = $all('.faq-question');
    if (faqButtons.length) {
      faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.parentElement;
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          // Close others
          $all('.faq-item').forEach(i => {
            if (i !== item) {
              i.classList.remove('active');
              const q = i.querySelector('.faq-question');
              if (q) q.setAttribute('aria-expanded', 'false');
            }
          });
          item.classList.toggle('active');
          btn.setAttribute('aria-expanded', String(!expanded));
        });
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') btn.click();
        });
      });
    }

    // -------------------------
    // Registration form handling
    // -------------------------
    // Support multiple possible IDs (regForm / registerForm / myForm)
    const regForm = document.getElementById('regForm') || document.getElementById('registerForm') || document.getElementById('myForm');
    if (regForm) {
      // Ensure a message element exists
      createMessageElementIfMissing(regForm);

      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Attempt to extract fields (tolerant to your form structure)
        const nameEl = regForm.querySelector('#name') || regForm.querySelector('#fullname') || regForm.querySelector('input[name="name"]') || regForm.querySelector('input[name="fullname"]');
        const phoneEl = regForm.querySelector('#phone') || regForm.querySelector('input[name="phone"]');
        const emailEl = regForm.querySelector('#email') || regForm.querySelector('input[name="email"]');
        // age: could be select or input
        const ageEl = regForm.querySelector('#age') || regForm.querySelector('select[name="age"]') || regForm.querySelector('input[name="age"]');

        const name = nameEl ? nameEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const age = ageEl ? ageEl.value.trim() : '';

        if (!name || !phone || !email) {
          showFormMessage(regForm, '⚠️ Please fill in all required fields.', 'red');
          return;
        }

        showFormMessage(regForm, '⏳ Submitting registration...', 'black');

        // Save to Firestore if available; otherwise skip saving but still redirect.
        try {
          if (firestoreAvailable && window._voal_db) {
            await window._voal_db.collection('registrations').add({
              name, phone, email, age,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
          } else {
            console.warn('Firestore not available: registration will not be logged to DB.');
          }

          // success UI
          showFormMessage(regForm, '✅ Registration submitted successfully! Redirecting…', 'green');

          // Redirect to Telegram reliably
          setTimeout(() => {
            window.location.href = TELEGRAM_LINK;
          }, 1300);

          // reset form
          try { regForm.reset(); } catch (err) { /* noop */ }
        } catch (err) {
          console.error('Registration error:', err);
          showFormMessage(regForm, '❌ Error submitting registration. Try again or contact us on WhatsApp.', 'red');
        }
      });
    } // end regForm

    // -------------------------
    // Donation quick flow (donation-card elements)
    // -------------------------
    $all('.donation-card').forEach(card => {
      card.addEventListener('click', async () => {
        const amount = card.getAttribute('data-amount');
        if (!amount) return;

        // If amount is "0" this probably means "Other / custom"
        if (amount === '0' || card.id === 'donateCustom') {
          // handled later
          return;
        }

        // Try to log donation to firestore (best-effort)
        try {
          if (firestoreAvailable && window._voal_db) {
            await window._voal_db.collection('donations').add({
              amount: parseInt(amount, 10) || 0,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Donation logging error:', err);
        }

        const message = encodeURIComponent(`I want to donate ₦${amount} to support VOAL Technology free training.`);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
      });
    });

    // custom donation card button
    const donateCustomBtn = document.getElementById('donateCustom');
    if (donateCustomBtn) {
      donateCustomBtn.addEventListener('click', async () => {
        const custom = prompt('Enter amount you want to donate (₦):');
        if (!custom) return;
        if (isNaN(custom) || parseInt(custom, 10) <= 0) {
          alert('Please enter a valid numeric amount.');
          return;
        }

        try {
          if (firestoreAvailable && window._voal_db) {
            await window._voal_db.collection('donations').add({
              amount: parseInt(custom, 10),
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Custom donation logging error:', err);
        }

        const message = encodeURIComponent(`I want to donate ₦${custom} to support VOAL Technology free training.`);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
      });
    }

    // -------------------------
    // Donation buttons / donateCustom fallback for other markup (if .donation-grid uses clickable divs)
    // -------------------------
    // already handled with .donation-card above

    // -------------------------
    // Make sure WhatsApp floating button is keyboard accessible
    // -------------------------
    const waFloat = document.querySelector('.whatsapp-float') || document.querySelector('.whatsapp-float-btn') || document.querySelector('a.whatsapp-float');
    if (waFloat) {
      waFloat.setAttribute('role', 'link');
      waFloat.setAttribute('tabindex', '0');
      waFloat.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') waFloat.click();
      });
    }

    // -------------------------
    // Defensive: ensure any inline contact links open in new tab when external
    // -------------------------
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
      a.setAttribute('rel', 'noopener noreferrer');
    });

    // Done DOMContentLoaded
  }); // DOMContentLoaded

})(); // IIFE

AOS.init({
  once: true, // animation happens only once
});



hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active'); // Animate hamburger
  navMenu.classList.toggle('show');     // Show/hide nav links
});

