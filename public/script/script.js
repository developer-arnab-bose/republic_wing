// --- FIRE PARTICLE SYSTEM ---
const canvas = document.getElementById('fireCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight; // Make sure height is correct
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 2; // Random drift left/right
    this.vy = Math.random() * -3 - 1;    // Upward speed
    this.size = Math.random() * 3 + 1;
    this.alpha = 1;
    // Fire colors: Yellow -> Orange -> Red
    this.color = `hsl(${Math.random() * 40 + 10}, 100%, 50%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.015; // Fade out
    // Reset if faded out
    if (this.alpha <= 0) {
      this.reset();
    }
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 100;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * -3 - 1;
    this.alpha = 1;
  }
}

// Create particles
for (let i = 0; i < 100; i++) {
  particles.push(new Particle());
}

function animateFire() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateFire);
}

animateFire();


document.addEventListener('DOMContentLoaded', () => {
  // --- Observer for Reveal Animations ---
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.body.classList.add('js-loaded');
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const menu = document.getElementById('mobile-menu');
      if (menu) menu.classList.toggle('open');
    });
  }

  // --- Contact Form Logic ---
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('successMessage');
  const contactBtn = document.getElementById('submitBtn');
  const termsCheckbox = document.getElementById('terms');

  if (contactForm && contactSuccess && contactBtn && termsCheckbox) {
    // Toggle Button State
    const toggleSubmit = () => {
      contactBtn.disabled = !termsCheckbox.checked;
      if (termsCheckbox.checked) {
        contactBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        contactBtn.classList.add('hover:-translate-y-1');
      } else {
        contactBtn.classList.add('opacity-50', 'cursor-not-allowed');
        contactBtn.classList.remove('hover:-translate-y-1');
      }
    };

    termsCheckbox.addEventListener('change', toggleSubmit);
    toggleSubmit(); // Initial check

    // Submit Handler
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const originalText = contactBtn.innerText;
      contactBtn.innerText = 'SENDING...';
      contactBtn.disabled = true;
      contactBtn.classList.add('opacity-70', 'cursor-not-allowed');

      const formDatas = $(e.target).serialize();

      $.ajax({
        url: "/contact",
        method: "POST",
        data: formDatas,
        processData: false,
        success: function (res) {
          if (res === "200") {
            setTimeout(() => {
              // Fade out form
              contactForm.style.opacity = '0';
              contactForm.reset();
              setTimeout(() => {
                contactForm.classList.add('hidden');
                contactSuccess.classList.remove('hidden');
                // Trigger fade in
                requestAnimationFrame(() => {
                  contactSuccess.classList.remove('opacity-0');
                });
                contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 500);
            }, 1500);
          } else {
            alert("Check Your input field");
            e.target.reset();
          }
        },
        error: function (err) {
          console.error(err);
        }
      });
    });

    // Global Reset Function for "Close" Button
    window.resetContactForm = function () {
      contactSuccess.classList.add('opacity-0');
      setTimeout(() => {
        contactSuccess.classList.add('hidden');
        contactForm.reset();
        contactBtn.innerText = 'SEND MESSAGE';
        // Reset terms and button state
        termsCheckbox.checked = false;
        toggleSubmit();

        contactForm.classList.remove('hidden');
        requestAnimationFrame(() => {
          contactForm.style.opacity = '1';
        });
      }, 500);
    };

    // OTP Button Logic
    window.sendOtp = function () {
      const emailInput = document.getElementById('contactEmail');
      const otpBtn = document.getElementById('otpBtn');
      const emailOtp = document.querySelector("#emailOtp");

      if (emailInput.checkValidity() && emailInput.value) {
        const originalText = otpBtn.innerText;
        otpBtn.innerText = 'Sending...';
        otpBtn.disabled = true;
        emailInput.disabled = true;
        $.ajax({
          url: "/otpGen",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ email: emailInput.value }),
          success: function (res) {
            if (res === "200") {
              // Simulate API call
              setTimeout(() => {
                emailOtp.disabled = false
                otpBtn.innerText = 'OTP Sent';
                otpBtn.classList.add('text-green-400', 'border-green-500/50');
                setTimeout(() => {
                  otpBtn.innerText = 'Resend OTP';
                  otpBtn.disabled = false;
                  otpBtn.classList.remove('text-green-400', 'border-green-500/50');
                }, 60000); // 30s cooldown
              }, 1500);
            } else {
              alert("Check Your input field");
              e.target.reset();
            }
          }
        });

      } else {
        emailInput.reportValidity();
      }
    };
  }

  // --- Feedback Form Logic ---
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackSuccess = document.getElementById('feedbackSuccess');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackText = document.getElementById('feedbackText');
  const serviceRatingInput = document.getElementById('service-rating');
  const designRatingInput = document.getElementById('design-rating');
  const serviceRatingBox = document.getElementById('serviceRatingBox');
  const designRatingBox = document.getElementById('designRatingBox');

  if (feedbackForm && feedbackSuccess && feedbackBtn) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validation
      let isValid = true;

      if (!serviceRatingInput.value) {
        serviceRatingBox.classList.add('border-red-500', 'bg-red-500/10');
        isValid = false;
      } else {
        serviceRatingBox.classList.remove('border-red-500', 'bg-red-500/10');
      }

      if (!designRatingInput.value) {
        designRatingBox.classList.add('border-red-500', 'bg-red-500/10');
        isValid = false;
      } else {
        designRatingBox.classList.remove('border-red-500', 'bg-red-500/10');
      }

      if (!feedbackText.value.trim()) {
        feedbackText.classList.add('border-red-500', 'bg-red-500/10');
        isValid = false;
      } else {
        feedbackText.classList.remove('border-red-500', 'bg-red-500/10');
      }

      if (!isValid) {
        feedbackBtn.classList.add('animate-pulse', 'bg-red-500');
        setTimeout(() => feedbackBtn.classList.remove('animate-pulse', 'bg-red-500'), 500);
        return;
      }

      feedbackBtn.innerText = 'SENDING...';
      feedbackBtn.disabled = true;
      feedbackBtn.style.opacity = '0.7';

      $.ajax({
        url: "/review",
        method: "POST",
        data: $(e.target).serialize(),
        processData: false,
        success: function (res) {
          if (res == "200") {
            setTimeout(() => {
              feedbackForm.style.opacity = '0';
              setTimeout(() => {
                feedbackForm.classList.add('hidden');
                feedbackSuccess.classList.remove('hidden');
                requestAnimationFrame(() => {
                  feedbackSuccess.classList.remove('opacity-0');
                });
              }, 500);
            }, 1500);
          } else {
            alert("Check Your input field");
            e.target.reset();
          }
        }

      });
    });

    // Global Reset Function for Feedback
    window.resetFeedbackForm = function () {
      feedbackSuccess.classList.add('opacity-0');
      setTimeout(() => {
        feedbackSuccess.classList.add('hidden');
        feedbackForm.reset();
        feedbackBtn.innerText = 'SUBMIT FEEDBACK';
        feedbackBtn.disabled = false;
        feedbackBtn.style.opacity = '1';

        // Clear stars
        document.querySelectorAll('.star-rating i').forEach(s => {
          s.classList.remove('fas', 'text-yellow-400');
          s.classList.add('far');
        });

        // Clear errors
        if (serviceRatingBox) serviceRatingBox.classList.remove('border-red-500', 'bg-red-500/10');
        if (designRatingBox) designRatingBox.classList.remove('border-red-500', 'bg-red-500/10');
        if (feedbackText) feedbackText.classList.remove('border-red-500', 'bg-red-500/10');

        feedbackForm.classList.remove('hidden');
        requestAnimationFrame(() => {
          feedbackForm.style.opacity = '1';
        });
      }, 500);
    };
  }

  // --- Star Rating Logic ---
  document.querySelectorAll('.star-rating').forEach(ratingContainer => {
    const stars = ratingContainer.querySelectorAll('i');
    const input = document.getElementById(ratingContainer.dataset.target);
    if (!input) return;

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = star.dataset.value;
        input.value = value;

        // Clear error on select
        const parentBox = ratingContainer.parentElement; // simplistic check
        if (ratingContainer.id === 'serviceRatingBox' || parentBox.id === 'serviceRatingBox') {
          document.getElementById('serviceRatingBox')?.classList.remove('border-red-500', 'bg-red-500/10');
        }
        if (ratingContainer.id === 'designRatingBox' || parentBox.id === 'designRatingBox') {
          document.getElementById('designRatingBox')?.classList.remove('border-red-500', 'bg-red-500/10');
        }

        stars.forEach(s => {
          if (s.dataset.value <= value) {
            s.classList.remove('far'); s.classList.add('fas', 'text-yellow-400');
          } else {
            s.classList.remove('fas', 'text-yellow-400'); s.classList.add('far');
          }
        });
      });
      star.addEventListener('mouseenter', () => {
        const value = star.dataset.value;
        stars.forEach(s => {
          if (s.dataset.value <= value) { s.classList.add('text-yellow-400'); } else { s.classList.remove('text-yellow-400'); }
        });
      });
      star.addEventListener('mouseleave', () => {
        const currentValue = input.value || 0;
        stars.forEach(s => {
          if (s.dataset.value > currentValue) { s.classList.remove('text-yellow-400'); } else { if (currentValue > 0) s.classList.add('text-yellow-400'); }
        });
      });
    });
  });

  // --- Review Modal Logic ---
  const reviewModal = document.getElementById('reviewModal');
  if (reviewModal) {
    window.openReviewModal = function () {
      reviewModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    window.closeReviewModal = function () {
      reviewModal.classList.remove('active');
      document.body.style.overflow = '';
    };
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) { closeReviewModal(); }
    });
  }
});

// Helper for inline onclicks in nav (if DOMContentLoaded hasn't fired yet or scope issues)
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}