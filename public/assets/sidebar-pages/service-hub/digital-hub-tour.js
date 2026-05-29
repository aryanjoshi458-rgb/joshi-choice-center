/* ═══════════════════════════════════════════════════════════════
   JOSHI CHOICE CENTER — DIGITAL HUB DEMO TOUR
   Premium multi-slide tour for the Digital Hub Demo Mode
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentSlide = 0;
  let direction = 'forward'; // 'forward' | 'back'

  /* ── Slide Data ─────────────────────────────────────────────── */
  const slides = [
    /* 0 — WELCOME TO DEMO MODE */
    {
      type: 'welcome',
      icon: '🚀',
      iconBg: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(129,140,248,0.2))',
      iconBorder: 'rgba(129,140,248,0.4)',
      iconShadow: '0 12px 40px rgba(79,70,229,0.5)',
      gradient: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(99,102,241,0.08))',
      accent: '#818cf8',
      titleGradient: 'linear-gradient(135deg, #818cf8, #a5b4fc)',
      title: 'Welcome to Digital Hub\nDemo Mode!',
      desc: 'You are currently in Demo Mode. This guided tour will show you how to use the Digital Banking Hub to offer financial services directly to your customers.',
      tags: ['AEPS', 'Recharge', 'Money Transfer', 'API Settings'],
      nextLabel: 'Explore Features →'
    },
    /* 1 — AEPS (BANKING) */
    {
      icon: '🏦',
      iconBg: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(96,165,250,0.15))',
      iconBorder: 'rgba(96,165,250,0.4)',
      iconShadow: '0 12px 40px rgba(59,130,246,0.45)',
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.06))',
      accent: '#60a5fa',
      titleGradient: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
      dotBg: 'rgba(59,130,246,0.2)',
      dotBorder: 'rgba(96,165,250,0.4)',
      sectionLabel: 'Feature 01 — AEPS Banking',
      title: 'AEPS Biometric\nBanking',
      titleHighlight: 'Banking',
      desc: 'Offer Aadhaar Enabled Payment System (AEPS) services to customers using their fingerprint and Aadhaar number.',
      features: [
        'Cash Withdrawal: Help customers withdraw cash directly from their bank accounts',
        'Cash Deposit: Instantly deposit cash to supported banks',
        'Balance Enquiry & Mini Statement: Check balances in real time',
        'Hardware Support: Seamless integration with Morpho fingerprint scanners'
      ]
    },
    /* 2 — RECHARGE & BILLS */
    {
      icon: '📱',
      iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(52,211,153,0.15))',
      iconBorder: 'rgba(52,211,153,0.4)',
      iconShadow: '0 12px 40px rgba(16,185,129,0.5)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.06))',
      accent: '#34d399',
      titleGradient: 'linear-gradient(135deg, #34d399, #6ee7b7)',
      dotBg: 'rgba(16,185,129,0.2)',
      dotBorder: 'rgba(52,211,153,0.4)',
      sectionLabel: 'Feature 02 — Recharge',
      title: 'Mobile Recharge\n& Utilities',
      titleHighlight: 'Recharge',
      desc: 'Provide instant prepaid mobile recharges, DTH top-ups, and utility bill payments through a unified, fast interface.',
      features: [
        'LAPU Wallet Support: Track your B2B recharge API balance dynamically',
        'Instant Top-ups: High-speed processing for Jio, Airtel, VI, and more',
        'Smart Number Formatting: Automatically formats mobile numbers',
        'Earn steady commissions on every successful bill payment'
      ]
    },
    /* 3 — MONEY TRANSFER (DMT) */
    {
      icon: '💸',
      iconBg: 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(251,191,36,0.15))',
      iconBorder: 'rgba(251,191,36,0.4)',
      iconShadow: '0 12px 40px rgba(245,158,11,0.45)',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.06))',
      accent: '#fbbf24',
      titleGradient: 'linear-gradient(135deg, #fbbf24, #fde68a)',
      dotBg: 'rgba(245,158,11,0.2)',
      dotBorder: 'rgba(251,191,36,0.4)',
      sectionLabel: 'Feature 03 — Money Transfer',
      title: 'Domestic Money\nTransfer (DMT)',
      titleHighlight: 'Money',
      desc: 'Instantly transfer funds to any bank account in India 24x7 using IMPS and NEFT infrastructure.',
      features: [
        'Real-time account validation and fast settlement',
        'Direct beneficiary bank account transfers using Account No & IFSC',
        'Generate immediate thermal receipts for customer confidence',
        'Highly secure transactions protected by end-to-end encryption'
      ]
    },
    /* 4 — API CONFIGURATION */
    {
      icon: '⚙️',
      iconBg: 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(244,114,182,0.15))',
      iconBorder: 'rgba(244,114,182,0.4)',
      iconShadow: '0 12px 40px rgba(236,72,153,0.5)',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.06))',
      accent: '#f472b6',
      titleGradient: 'linear-gradient(135deg, #f472b6, #fbcfe8)',
      dotBg: 'rgba(236,72,153,0.2)',
      dotBorder: 'rgba(244,114,182,0.4)',
      sectionLabel: 'Feature 04 — API Config',
      title: 'Go Live with\nYour APIs',
      titleHighlight: 'APIs',
      desc: 'When you are ready to process real money, connect your own payment gateways and API providers instantly.',
      features: [
        'Razorpay Integration: Connect your Razorpay Key ID to accept real payments',
        'B2B Recharge Gateway: Plug in your third-party recharge APIs effortlessly',
        'Live Terminal Logs: Monitor all underlying API requests in real time'
      ]
    },
    /* 5 — DEMO MODE */
    {
      icon: '🎮',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      iconBorder: '#34d399',
      iconShadow: '0 12px 40px rgba(16,185,129,0.45)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.06))',
      accent: '#10b981',
      titleGradient: 'linear-gradient(135deg, #34d399, #a7f3d0)',
      dotBg: 'rgba(16,185,129,0.2)',
      dotBorder: 'rgba(52,211,153,0.4)',
      sectionLabel: 'Feature 05 — Demo Mode',
      title: 'Interactive\nDemo Mode',
      titleHighlight: 'Demo Mode',
      desc: 'The Digital Hub is currently running in a safe Demo Mode. You can test all features without making real transactions.',
      features: [
        'Mock Transactions: Perform dummy recharges and fund transfers to understand the flow',
        'Safe Environment: No real money is deducted while Demo Mode is active',
        'Switch to Live: Disable demo mode from settings when you are ready to process actual money',
        'Learn Without Risk: Familiarize yourself with the interface and receipt generation'
      ]
    },
    /* 6 — FINISH */
    {
      type: 'finish',
      icon: '🎉',
      iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(52,211,153,0.2))',
      iconBorder: 'rgba(52,211,153,0.5)',
      iconShadow: '0 12px 40px rgba(16,185,129,0.6)',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(79,70,229,0.1))',
      accent: '#34d399',
      title: 'You\'re Ready!',
      desc: 'You have completed the Digital Hub overview. Feel free to execute mock transactions in Demo Mode to get familiar with the system before going live.',
      nextLabel: '✓ Access Digital Hub'
    }
  ];

  /* ── Build main overlay DOM ─────────────────────────────────── */
  function buildDOM() {
    if (document.getElementById('jcHubTourOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'jcHubTourOverlay';
    // Re-use onboarding css classes
    overlay.className = 'jc-onboarding-overlay'; 
    
    overlay.innerHTML = `
      <div class="jc-ob-slide-wrapper">
        <!-- Header -->
        <div class="jc-ob-header">
          <div class="jc-ob-logo">
            <div class="jc-ob-logo-badge">JC</div>
            <span class="jc-ob-logo-text">Digital Banking Hub</span>
          </div>
          <button class="jc-ob-skip-btn" id="jcHubSkip">Skip Tour ✕</button>
        </div>

        <!-- Slide Card -->
        <div class="jc-ob-card" id="jcHubCard">
          <div class="jc-ob-slide-content" id="jcHubContent">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Footer -->
        <div class="jc-ob-footer">
          <div class="jc-ob-dots" id="jcHubDots"></div>
          <div class="jc-ob-nav">
            <button class="jc-ob-back-btn" id="jcHubBack" title="Back">←</button>
            <button class="jc-ob-next-btn" id="jcHubNext">
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

    // Apply base styles dynamically to overlay to match onboarding.css
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = '#060b1a';
    overlay.style.fontFamily = "'Outfit', 'Inter', sans-serif";
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';

    // Events
    document.getElementById('jcHubSkip').onclick = () => endTour(false);
    document.getElementById('jcHubBack').onclick = prevSlide;
    document.getElementById('jcHubNext').onclick = nextSlide;

    // Build dots
    buildDots();

    // Show first slide immediately
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      renderSlide(0, false);
    });
  }

  /* ── Build nav dots ─────────────────────────────────────────── */
  function buildDots() {
    const dotsEl = document.getElementById('jcHubDots');
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
    const dotsEl = document.getElementById('jcHubDots');
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.jc-ob-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.classList.toggle('done', i < idx);
    });
  }

  /* ── Render a slide's HTML ──────────────────────────────────── */
  function renderSlide(idx, animate) {
    const s = slides[idx];
    const content = document.getElementById('jcHubContent');
    const card = document.getElementById('jcHubCard');
    const nextBtn = document.getElementById('jcHubNext');
    const backBtn = document.getElementById('jcHubBack');
    if (!content || !card) return;

    // Update next button label
    if (nextBtn) {
      if (idx === slides.length - 1) {
        nextBtn.innerHTML = `${s.nextLabel || '✓ Access'}`;
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
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${s.accent};margin-bottom:14px;">Digital Hub Tutorial</div>
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
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${s.accent};margin-bottom:14px;">Demo Ready!</div>
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
    localStorage.setItem('jc_hub_tour_seen', 'true');
    if (completed) {
      launchConfetti();
    }

    const overlay = document.getElementById('jcHubTourOverlay');
    if (!overlay) return;

    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 520);
  }

  /* ── Public API ─────────────────────────────────────────────── */
  window.startDigitalHubTour = function () {
    currentSlide = 0;
    direction = 'forward';
    buildDOM();
  };

  /* ── Auto trigger ──────────────────────── */
  function tryAutoTrigger() {
    buildDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAutoTrigger);
  } else {
    tryAutoTrigger();
  }

})();
