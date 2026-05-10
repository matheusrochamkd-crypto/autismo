document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Focus the first input if it's the form section
        if (targetId === '#inscricao') {
          setTimeout(() => {
            const firstInput = targetElement.querySelector('input');
            if (firstInput) firstInput.focus();
          }, 800);
        }
      }
    });
  });

  // Form submission handler
  const form = document.getElementById('registration-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const whatsapp = document.getElementById('whatsapp').value;
      
      // Basic validation
      if (!name || !whatsapp) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Change button state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      
      // Simulate API call
      setTimeout(() => {
        submitBtn.textContent = 'INSCRIÇÃO CONFIRMADA!';
        submitBtn.style.backgroundColor = 'var(--color-green)';
        submitBtn.style.color = 'white';
        
        // Form reset
        form.reset();
        
        // Revert button after 3 seconds
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.backgroundColor = 'var(--color-yellow)';
          submitBtn.style.color = '#1a1a1a';
        }, 3000);
        
      }, 1500);
    });
  }
  
  // Input mask for WhatsApp (simple format: (XX) XXXXX-XXXX)
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function(e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Simple scroll animation observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply initial hidden state and observe elements
  const animateElements = document.querySelectorAll('.about-card, .speaker-content, .location-wrapper, .form-wrapper');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

  // Custom cinematic video player
  const videoWrapper = document.getElementById('videoWrapper');
  const videoPoster = document.getElementById('videoPoster');
  const playBtn = document.getElementById('playBtn');
  const venueVideo = document.getElementById('venueVideo');

  if (videoWrapper && venueVideo) {
    const startVideo = () => {
      venueVideo.src = 'video executive Gastronomia.mp4';
      venueVideo.load();
      venueVideo.play().catch(() => {});
      videoPoster.classList.add('is-hidden');
      // Show native controls after play
      venueVideo.setAttribute('controls', '');
    };

    playBtn.addEventListener('click', startVideo);
    videoPoster.addEventListener('click', startVideo);
  }
});
