/* ═══════════════════════════════════════════════════════════════
   JOSHI CHOICE CENTER — FULL-SCREEN ONBOARDING SLIDESHOW v3.0
   Premium multi-slide tour — no spotlight, self-contained UI
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentSlide = 0;
  let direction = 'forward'; // 'forward' | 'back'

  /* ── Slide Data ─────────────────────────────────────────────── */
  const slides = [
    /* 0 — WELCOME */
    {
      type: 'welcome',
      icon: '👋',
      iconBg: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(129,140,248,0.2))',
      iconBorder: 'rgba(129,140,248,0.4)',
      iconShadow: '0 12px 40px rgba(79,70,229,0.5)',
      gradient: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(99,102,241,0.08))',
      accent: '#818cf8',
      titleGradient: 'linear-gradient(135deg, #818cf8, #a5b4fc)',
      title: 'Welcome to\nJoshi Choice Center!',
      desc: 'A complete business management solution designed for CSC / Digital Seva Centers. Take this quick 2-minute tour to explore all the features of the software.',
      tags: ['Dashboard', 'Cash Register', 'Transactions', 'Reports', 'Customers'],
      nextLabel: 'Start Tour →'
    },
    /* 1 — DASHBOARD */
    {
      icon: '📊',
      iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(96,165,250,0.15))',
      iconBorder: 'rgba(96,165,250,0.4)',
      iconShadow: '0 12px 40px rgba(59,130,246,0.45)',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.06))',
      accent: '#60a5fa',
      titleGradient: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
      dotBg: 'rgba(59,130,246,0.2)',
      dotBorder: 'rgba(96,165,250,0.4)',
      sectionLabel: 'Feature 01 — Dashboard',
      title: 'Smart\nDashboard',
      titleHighlight: 'Dashboard',
      desc: 'Get a complete real-time overview of your business in one place — transactions, commission earnings, cash register, and quick access to all features.',
      features: [
        'View today\'s total transaction count and commission earned',
        'Cash Register (Galla) — track daily opening, closing & history',
        'Instant alerts for pending payments',
        'Quick Launch Center — navigate to any feature in one click',
        'Quick Notes — save reminders and important information'
      ]
    },
    /* 2 — NEW CUSTOMER / SERVICES */
    {
      icon: '⚡',
      iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(251,191,36,0.15))',
      iconBorder: 'rgba(251,191,36,0.4)',
      iconShadow: '0 12px 40px rgba(245,158,11,0.45)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.06))',
      accent: '#fbbf24',
      titleGradient: 'linear-gradient(135deg, #fbbf24, #fde68a)',
      dotBg: 'rgba(245,158,11,0.2)',
      dotBorder: 'rgba(251,191,36,0.4)',
      sectionLabel: 'Feature 02 — Services',
      title: 'New Customer &\nDigital Hub',
      titleHighlight: 'Digital Hub',
      desc: 'Register customer transactions across Banking, Insurance, Aadhaar, PAN, and 50+ digital services — all from a single, unified interface.',
      features: [
        'Banking — Cash Withdrawal, Deposit, Transfer, AEPS',
        'Insurance — LIC, Health, and Vehicle premium payments',
        'Government — Aadhaar update, PAN card, Passport services',
        'Utility — Electricity, Gas, Water & Mobile recharge',
        'Automatic commission calculation with instant receipt print'
      ]
    },
    /* 3 — GALLA REGISTER */
    {
      icon: '🏦',
      iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(52,211,153,0.15))',
      iconBorder: 'rgba(52,211,153,0.4)',
      iconShadow: '0 12px 40px rgba(16,185,129,0.5)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.06))',
      accent: '#34d399',
      titleGradient: 'linear-gradient(135deg, #34d399, #6ee7b7)',
      dotBg: 'rgba(16,185,129,0.2)',
      dotBorder: 'rgba(52,211,153,0.4)',
      sectionLabel: 'Feature 03 — Cash Register',
      title: 'Daily Cash\nRegister',
      titleHighlight: 'Cash\nRegister',
      desc: 'Track your shop\'s daily cash drawer with precision. From opening balance to expected closing cash and commission — everything is calculated automatically.',
      features: [
        'Opening Cash: enter the cash on hand at the start of the day',
        'Cash In: total cash received from customers (deposits & charges)',
        'Cash Out: total cash paid out to customers (withdrawals)',
        'Expected Balance = Opening Cash + Cash In − Cash Out',
        'Commission earnings are tracked separately for accuracy'
      ]
    },
    /* 4 — CUSTOMER DIRECTORY */
    {
      icon: '👥',
      iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(167,139,250,0.15))',
      iconBorder: 'rgba(167,139,250,0.4)',
      iconShadow: '0 12px 40px rgba(139,92,246,0.5)',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.06))',
      accent: '#a78bfa',
      titleGradient: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
      dotBg: 'rgba(139,92,246,0.2)',
      dotBorder: 'rgba(167,139,250,0.4)',
      sectionLabel: 'Feature 04 — Customers',
      title: 'Customer\nDirectory',
      titleHighlight: 'Directory',
      desc: 'Maintain a complete database of all registered customers. Manage transaction history, profile details, and pending payments from a single location.',
      features: [
        'Customer profile — name, mobile number, Aadhaar & photo',
        'Full transaction history accessible in one click',
        'Track and manage outstanding pending payments',
        'Advanced customer search and filter options'
      ]
    },
    /* 5 — REPORTS & EXPENSES */
    {
      icon: '📈',
      iconBg: 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(244,114,182,0.15))',
      iconBorder: 'rgba(244,114,182,0.4)',
      iconShadow: '0 12px 40px rgba(236,72,153,0.5)',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.06))',
      accent: '#f472b6',
      titleGradient: 'linear-gradient(135deg, #f472b6, #fbcfe8)',
      dotBg: 'rgba(236,72,153,0.2)',
      dotBorder: 'rgba(244,114,182,0.4)',
      sectionLabel: 'Feature 05 — Reports',
      title: 'Reports &\nExpenses',
      titleHighlight: 'Reports',
      desc: 'Get a complete financial picture of your business. View daily, weekly, and monthly earnings alongside expenses in a professional analytics dashboard.',
      features: [
        'Daily, weekly & monthly commission reports',
        'Service-wise breakdown — identify your top-performing services',
        'Log and track business expenses — rent, utilities & miscellaneous',
        'Net Profit = Total Commission − Total Expenses',
        'Export data to CSV and print reports directly'
      ]
    },
    /* 6 — PRINT & SETTINGS */
    {
      icon: '⚙️',
      iconBg: 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(34,211,238,0.15))',
      iconBorder: 'rgba(34,211,238,0.4)',
      iconShadow: '0 12px 40px rgba(6,182,212,0.5)',
      gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.06))',
      accent: '#22d3ee',
      titleGradient: 'linear-gradient(135deg, #22d3ee, #67e8f9)',
      dotBg: 'rgba(6,182,212,0.2)',
      dotBorder: 'rgba(34,211,238,0.4)',
      sectionLabel: 'Feature 06 — More',
      title: 'Print Receipt\n& Settings',
      titleHighlight: 'Settings',
      desc: 'Print professional thermal receipts and fully customize the software to suit your business — configure commission rates, shop details, themes, and more.',
      features: [
        'Thermal 80mm / A4 receipt printing with QR code support',
        'Configure service-wise commission rates',
        'Customize shop name, address, and logo',
        'Switch between Dark and Light themes',
        'Enable or disable individual dashboard widgets'
      ]
    },
    /* 7 — AURA AI ASSISTANT */
    {
      icon: '🤖',
      iconBg: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(167,139,250,0.15))',
      iconBorder: 'rgba(167,139,250,0.4)',
      iconShadow: '0 12px 40px rgba(139,92,246,0.5)',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.06))',
      accent: '#a78bfa',
      titleGradient: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
      dotBg: 'rgba(139,92,246,0.2)',
      dotBorder: 'rgba(167,139,250,0.4)',
      sectionLabel: 'Feature 07 — Aura AI',
      title: 'Aura Smart\nAI Assistant',
      titleHighlight: 'AI Assistant',
      desc: 'Meet Aura, your smart AI companion built directly into the software. Interact via voice or chat to get instant support, learn features, and automate actions.',
      features: [
        'Voice-Text Sync: ask questions and listen to Aura speak the answer',
        'Comprehensive Knowledge Base: learn how to reset, print, or use shortcuts',
        'Aura Design System UI: premium floating chat panel with fluid typography',
        'Accessibility & Speed: toggle panels instantly via shortcut keys'
      ]
    },
    /* 8 — HIGH SECURITY */
    {
      icon: '🔒',
      iconBg: 'linear-gradient(135deg, rgba(239,68,68,0.35), rgba(248,113,113,0.15))',
      iconBorder: 'rgba(248,113,113,0.4)',
      iconShadow: '0 12px 40px rgba(239,68,68,0.5)',
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(248,113,113,0.06))',
      accent: '#ef4444',
      titleGradient: 'linear-gradient(135deg, #ef4444, #fca5a5)',
      dotBg: 'rgba(239,68,68,0.2)',
      dotBorder: 'rgba(248,113,113,0.4)',
      sectionLabel: 'Feature 08 — Security',
      title: 'High-Level\nSecurity',
      titleHighlight: 'Security',
      desc: 'Your business data and customer information are protected with enterprise-grade security measures and robust access controls.',
      features: [
        'Data Encryption: All sensitive information is encrypted locally before storage',
        'Auto-Backup System: Automatic daily backups prevent data loss',
        'Secure Login: PIN protection and local authentication required for access',
        'Offline Mode: Data stays completely on your computer with zero cloud exposure'
      ]
    },
    /* 9 — CUSTOMIZATION */
    {
      icon: '🎨',
      iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(251,191,36,0.15))',
      iconBorder: 'rgba(251,191,36,0.4)',
      iconShadow: '0 12px 40px rgba(245,158,11,0.45)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.06))',
      accent: '#f59e0b',
      titleGradient: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
      dotBg: 'rgba(245,158,11,0.2)',
      dotBorder: 'rgba(251,191,36,0.4)',
      sectionLabel: 'Feature 09 — Customization',
      title: 'Complete\nCustomization',
      titleHighlight: 'Customization',
      desc: 'Tailor the software exactly to your preferences. Change themes, configure shortcuts, and set up your own workflow rules.',
      features: [
        'Theme Engine: Choose from over 10 premium Dark and Light mode themes',
        'Custom Shortcuts: Bind specific actions to your preferred keyboard shortcuts',
        'Flexible UI: Reorder dashboard widgets and sidebars according to your daily needs',
        'Personalized Receipts: Add your own logo, shop name, and custom footer messages'
      ]
    },
    /* 10 — LANGUAGE SUPPORT */
    {
      icon: '🌐',
      iconBg: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(56,189,248,0.15))',
      iconBorder: 'rgba(56,189,248,0.4)',
      iconShadow: '0 12px 40px rgba(14,165,233,0.45)',
      gradient: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.06))',
      accent: '#0ea5e9',
      titleGradient: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)',
      dotBg: 'rgba(14,165,233,0.2)',
      dotBorder: 'rgba(56,189,248,0.4)',
      sectionLabel: 'Feature 10 — Language',
      title: 'Bilingual\nExperience',
      titleHighlight: 'Bilingual',
      desc: 'Work in the language you are most comfortable with. Easily toggle the entire software interface between English and Hindi.',
      features: [
        'Hindi Support: Full translation of the dashboard, settings, and receipts into Hindi',
        'English Mode: Standard professional English layout for universal use',
        'Instant Toggle: Switch languages on the fly without losing any data or reloading',
        'Customer Friendly: Print receipts in the local language for better customer understanding'
      ]
    },
    /* 11 — FINISH */
    {
      type: 'finish',
      icon: '🎉',
      iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(52,211,153,0.2))',
      iconBorder: 'rgba(52,211,153,0.5)',
      iconShadow: '0 12px 40px rgba(16,185,129,0.6)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(79,70,229,0.1))',
      accent: '#34d399',
      title: 'You\'re All Set!',
      desc: 'You have successfully completed the Joshi Choice Center tour. You are now ready to use all features of the software with confidence.\n\nFor any queries, refer to the Help section in Settings.',
      nextLabel: '✓ Go to Dashboard'
    }
  ];

  /* ── Build main overlay DOM ─────────────────────────────────── */
  function buildDOM() {
    if (document.getElementById('jcOnboardingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'jcOnboardingOverlay';

    overlay.innerHTML = `
      <div class="jc-ob-slide-wrapper">
        <!-- Header -->
        <div class="jc-ob-header">
          <div class="jc-ob-logo">
            <div class="jc-ob-logo-badge">JC</div>
            <span class="jc-ob-logo-text">Joshi Choice Center</span>
          </div>
          <button class="jc-ob-skip-btn" id="jcObSkip">Skip Tour ✕</button>
        </div>

        <!-- Slide Card -->
        <div class="jc-ob-card" id="jcObCard">
          <div class="jc-ob-slide-content" id="jcObContent">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Footer -->
        <div class="jc-ob-footer">
          <div class="jc-ob-dots" id="jcObDots"></div>
          <div class="jc-ob-nav">
            <button class="jc-ob-back-btn" id="jcObBack" title="Wapas">←</button>
            <button class="jc-ob-next-btn" id="jcObNext">
              Next
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Events
    document.getElementById('jcObSkip').onclick = () => endTour(false);
    document.getElementById('jcObBack').onclick = prevSlide;
    document.getElementById('jcObNext').onclick = nextSlide;

    // Build dots
    buildDots();

    // Show first slide immediately
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      renderSlide(0, false);
    });
  }

  /* ── Build nav dots ─────────────────────────────────────────── */
  function buildDots() {
    const dotsEl = document.getElementById('jcObDots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'jc-ob-dot';
      d.onclick = () => {
        direction = i > currentSlide ? 'forward' : 'back';
        goToSlide(i);
      };
      dotsEl.appendChild(d);
    });
  }

  /* ── Update dot states ──────────────────────────────────────── */
  function updateDots(idx) {
    document.querySelectorAll('.jc-ob-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.classList.toggle('done', i < idx);
    });
  }

  /* ── Render a slide's HTML ──────────────────────────────────── */
  function renderSlide(idx, animate) {
    const s = slides[idx];
    const content = document.getElementById('jcObContent');
    const card = document.getElementById('jcObCard');
    const nextBtn = document.getElementById('jcObNext');
    const backBtn = document.getElementById('jcObBack');
    if (!content || !card) return;

    // Update next button label
    if (nextBtn) {
      if (idx === slides.length - 1) {
        nextBtn.innerHTML = `${s.nextLabel || '✓ Dashboard Par Jaayein'}`;
        nextBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
        nextBtn.style.boxShadow = '0 4px 20px rgba(16,185,129,0.4)';
      } else {
        nextBtn.innerHTML = `${s.nextLabel || 'Next'} <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
        nextBtn.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)';
        nextBtn.style.boxShadow = '0 4px 20px rgba(79,70,229,0.4)';
      }
    }
    if (backBtn) backBtn.disabled = (idx === 0);

    // Build HTML
    let html = '';

    if (s.type === 'welcome') {
      html = `
        <div style="width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 40px;text-align:center;background:${s.gradient};">
          <div class="jc-ob-icon-circle" style="--icon-bg:${s.iconBg};--icon-border:${s.iconBorder};--icon-shadow:${s.iconShadow};background:${s.iconBg};border:1px solid ${s.iconBorder};box-shadow:${s.iconShadow};width:90px;height:90px;font-size:2.8rem;margin-bottom:28px;">${s.icon}</div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${s.accent};margin-bottom:14px;">Software Tutorial — Quick Tour</div>
          <h2 style="font-size:2rem;font-weight:800;color:#fff;margin:0 0 14px;line-height:1.2;white-space:pre-line;">${s.title}</h2>
          <p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin:0 0 28px;max-width:520px;">${s.desc}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
            ${s.tags.map(t => `<span class="jc-ob-tag">${t}</span>`).join('')}
          </div>
        </div>
      `;
    } else if (s.type === 'finish') {
      html = `
        <div style="width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 40px;text-align:center;background:${s.gradient};">
          <div style="width:90px;height:90px;border-radius:50%;background:${s.iconBg};border:1px solid ${s.iconBorder};box-shadow:${s.iconShadow};display:flex;align-items:center;justify-content:center;font-size:2.8rem;margin-bottom:28px;animation:iconBounce 3s ease-in-out infinite;">${s.icon}</div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${s.accent};margin-bottom:14px;">Tour Complete!</div>
          <h2 style="font-size:2rem;font-weight:800;color:#fff;margin:0 0 14px;">${s.title}</h2>
          <p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin:0 0 8px;max-width:520px;white-space:pre-line;">${s.desc}</p>
        </div>
      `;
    } else {
      // Feature slides — two-column layout
      const titleParts = s.title.split('\n');
      const highlightWord = s.titleHighlight ? s.titleHighlight.split('\n')[0] : '';
      const titleHTML = titleParts.map(part =>
        highlightWord && part.includes(highlightWord)
          ? part.replace(highlightWord, `<span style="background:${s.titleGradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${highlightWord}</span>`)
          : part
      ).join('<br>');

      html = `
        <!-- LEFT -->
        <div class="jc-ob-left" style="--slide-gradient:${s.gradient};">
          <div style="position:absolute;inset:0;background:${s.gradient};z-index:0;"></div>
          <div class="jc-ob-left-divider"></div>
          <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
            <div style="width:100px;height:100px;border-radius:50%;background:${s.iconBg};border:1px solid ${s.iconBorder};box-shadow:${s.iconShadow};display:flex;align-items:center;justify-content:center;font-size:3rem;margin-bottom:22px;animation:iconBounce 3s ease-in-out infinite;">${s.icon}</div>
            <div style="font-size:0.72rem;font-weight:700;color:${s.accent};text-transform:uppercase;letter-spacing:1px;text-align:center;opacity:0.8;">${s.sectionLabel}</div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="jc-ob-right">
          <div class="jc-ob-slide-num" style="color:${s.accent};--slide-accent:${s.accent};">${s.sectionLabel}</div>
          <h3 class="jc-ob-slide-title">${titleHTML}</h3>
          <p class="jc-ob-slide-desc">${s.desc}</p>
          <div class="jc-ob-features">
            ${s.features.map((f, fi) => `
              <div class="jc-ob-feature-item">
                <div style="width:18px;height:18px;border-radius:50%;background:${s.dotBg};border:1px solid ${s.dotBorder};display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;color:${s.accent};flex-shrink:0;margin-top:2px;">${fi + 1}</div>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Animate out old content then swap
    if (animate) {
      const exitClass = direction === 'forward' ? 'slide-exit-left' : 'slide-exit-right';
      const enterClass = direction === 'forward' ? 'slide-enter-right' : 'slide-enter-left';

      card.classList.add(exitClass);
      card.addEventListener('animationend', function handler() {
        card.classList.remove(exitClass);
        content.innerHTML = html;
        card.classList.add(enterClass);
        card.addEventListener('animationend', function h2() {
          card.classList.remove(enterClass);
          card.removeEventListener('animationend', h2);
        }, { once: true });
        card.removeEventListener('animationend', handler);
      }, { once: true });
    } else {
      content.innerHTML = html;
    }

    updateDots(idx);
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  function goToSlide(idx) {
    if (idx < 0 || idx >= slides.length) return;
    currentSlide = idx;
    renderSlide(idx, true);
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      direction = 'forward';
      goToSlide(currentSlide + 1);
    } else {
      endTour(true);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      direction = 'back';
      goToSlide(currentSlide - 1);
    }
  }

  /* ── Confetti ────────────────────────────────────────────────── */
  function launchConfetti() {
    const colors = ['#4f46e5', '#818cf8', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ec4899', '#06b6d4', '#a78bfa'];
    for (let i = 0; i < 90; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'jc-confetti';
        p.style.cssText = `
          left: ${Math.random() * 100}vw;
          top: -12px;
          width: ${6 + Math.random() * 8}px;
          height: ${6 + Math.random() * 8}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
          animation-duration: ${1.8 + Math.random() * 2.2}s;
          animation-delay: ${Math.random() * 0.6}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 5000);
      }, i * 28);
    }
  }

  /* ── End tour ────────────────────────────────────────────────── */
  function endTour(completed) {
    // Always mark as seen — prevents auto-trigger on refresh regardless of skip or finish
    localStorage.setItem('jc_tour_seen', 'true');

    if (completed) {
      localStorage.setItem('jc_tour_completed', 'true');
      launchConfetti();
    }

    // Remove the tour-active class from document element to reveal dashboard content
    document.documentElement.classList.remove('tour-active');

    const overlay = document.getElementById('jcOnboardingOverlay');
    if (!overlay) return;

    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      if (completed && !window.location.pathname.includes("dashboard.html")) {
        window.location.href = "dashboard.html";
      }
    }, 520);
  }

  /* ── Public API ─────────────────────────────────────────────── */
  // Manual start — only used by Help menu (always force-shows)
  window.startDashboardTour = function () {
    buildDOM();
  };

  // Called by Help → Software Tour — clears seen flag so it can show again
  window.resetDashboardTour = function () {
    localStorage.removeItem('jc_tour_seen');
    const old = document.getElementById('jcOnboardingOverlay');
    if (old) old.remove();
    buildDOM();
  };

  /* ── Auto trigger — first install only ──────────────────────── */
  function tryAutoTrigger() {
    // Show only if tour has NEVER been seen (not skipped, not completed)
    if (localStorage.getItem('jc_tour_seen') === 'true') return;
    if (localStorage.getItem('jc_tour_completed') === 'true') return;
    buildDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoTrigger);
  } else {
    tryAutoTrigger();
  }

})();
