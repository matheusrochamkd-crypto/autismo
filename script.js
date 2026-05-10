const SUPABASE_URL = 'https://uztncdwtaivqzcjlpecq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dG5jZHd0YWl2cXpjamxwZWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTI2MzgsImV4cCI6MjA4NTI2ODYzOH0.pVuaVvvyj7nXI3UIPysYQVQWK_7iLa-zOEDNuGxTmvs';

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (targetId === '#inscricao') {
          setTimeout(() => {
            const firstInput = targetElement.querySelector('input');
            if (firstInput) firstInput.focus();
          }, 800);
        }
      }
    });
  });

  // Form submission → salva no Supabase
  const form = document.getElementById('registration-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('name').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();

      if (!nome || !whatsapp) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/inscricoes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ nome, whatsapp })
        });

        if (!res.ok) throw new Error('Erro ao salvar inscrição');

        submitBtn.textContent = '✅ INSCRIÇÃO CONFIRMADA!';
        submitBtn.style.backgroundColor = '#2a9d8f';
        submitBtn.style.color = 'white';
        form.reset();

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
        }, 4000);

      } catch (err) {
        console.error(err);
        submitBtn.textContent = '❌ Erro. Tente novamente.';
        submitBtn.style.backgroundColor = '#d90429';
        submitBtn.style.color = 'white';
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
        }, 3000);
      }
    });
  }

  // Máscara WhatsApp
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function (e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Scroll animations
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.about-card, .speaker-content, .location-wrapper, .form-wrapper').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

  // Custom cinematic video player
  const videoPoster = document.getElementById('videoPoster');
  const playBtn = document.getElementById('playBtn');
  const venueVideo = document.getElementById('venueVideo');

  if (venueVideo) {
    const startVideo = () => {
      venueVideo.src = 'video executive Gastronomia.mp4';
      venueVideo.load();
      venueVideo.play().catch(() => {});
      videoPoster.classList.add('is-hidden');
      venueVideo.setAttribute('controls', '');
    };
    if (playBtn) playBtn.addEventListener('click', startVideo);
    if (videoPoster) videoPoster.addEventListener('click', startVideo);
  }
});
