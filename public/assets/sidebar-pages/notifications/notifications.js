/* PREMIUM NOTIFICATIONS JS - JOSHI CHOICE CENTER */
document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initBellAnimation();
    initTextReveal();
    initMouseReactivity();
});

/**
 * Initialize Background Particles
 */
function initParticles() {
    const container = document.getElementById('particle-container');
    const count = 40;
    
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // Random size
        const size = Math.random() * 8 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        
        // Random position
        p.style.top = `${Math.random() * 100}%`;
        p.style.left = `${Math.random() * 100}%`;
        
        container.appendChild(p);
        
        // Slow drifting animation
        gsap.to(p, {
            x: 'random(-100, 100)',
            y: 'random(-100, 100)',
            duration: 'random(10, 20)',
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

/**
 * Complex Bell Animation Sequence
 */
function initBellAnimation() {
    const bellTl = gsap.timeline({ repeat: -1 });
    
    // 1. Swing Left
    bellTl.to(".premium-bell", {
        rotation: 25,
        duration: 0.8,
        ease: "power2.inOut",
        onStart: triggerPulse
    })
    // 2. Swing Right
    .to(".premium-bell", {
        rotation: -25,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: function() {
            // Logic to move clapper slightly out of sync
            gsap.set(".bell-clapper", {
                x: this.progress() > 0.5 ? 5 : -5,
                duration: 0.1
            });
        },
        onStart: triggerPulse
    })
    // 3. Return to Center
    .to(".premium-bell", {
        rotation: 0,
        duration: 0.8,
        ease: "power2.inOut"
    })
    // 4. Pause
    .to({}, { duration: 1.5 });

    // Clapper Sync Logic
    gsap.to(".bell-clapper", {
        x: 8,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "power1.inOut"
    });
}

/**
 * Trigger Sound Wave Pulse
 */
function triggerPulse() {
    gsap.fromTo(".wave-ring", 
        { width: 60, height: 60, opacity: 0.5, borderWeight: 2 },
        { 
            width: 250, 
            height: 250, 
            opacity: 0, 
            duration: 1.5, 
            stagger: 0.2,
            ease: "power1.out"
        }
    );
}

/**
 * Staggered Text Reveal
 */
function initTextReveal() {
    const tl = gsap.timeline();
    
    tl.from(".glass-card", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out"
    })
    .from(".stagger-text", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.6")
    .from(".text-underline", {
        width: 0,
        duration: 0.6,
        ease: "power2.inOut"
    }, "-=0.4")
    .from(".coming-soon-content p", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.3")
    .from(".tag", {
        y: 10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.2");
}

/**
 * Mouse Reactivity for Particles
 */
function initMouseReactivity() {
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        gsap.to(".particle", {
            x: (i, target) => {
                const dx = mouseX - target.getBoundingClientRect().left;
                return dx * 0.05;
            },
            y: (i, target) => {
                const dy = mouseY - target.getBoundingClientRect().top;
                return dy * 0.05;
            },
            duration: 0.6,
            ease: "power2.out"
        });
        
        // Subtle card tilt
        const card = document.querySelector('.glass-card');
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        
        const tiltX = (mouseY - cardCenterY) * 0.01;
        const tiltY = (mouseX - cardCenterX) * -0.01;
        
        gsap.to(card, {
            rotationX: tiltX,
            rotationY: tiltY,
            duration: 0.5,
            ease: "power2.out"
        });
    });
}
