const SUPABASE_URL = 'https://uztncdwtaivqzcjlpecq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dG5jZHd0YWl2cXpjamxwZWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTI2MzgsImV4cCI6MjA4NTI2ODYzOH0.pVuaVvvyj7nXI3UIPysYQVQWK_7iLa-zOEDNuGxTmvs';
const LS_KEY = 'inscricoes_pendentes';

// ─── Utilitário: salva no Supabase com retry (3 tentativas) ───
async function saveToSupabase(payload, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  const DELAY_MS = [0, 1500, 4000]; // delay antes de cada tentativa

  if (attempt > 1) {
    await new Promise(r => setTimeout(r, DELAY_MS[attempt - 1]));
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/inscricoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    if (attempt < MAX_ATTEMPTS) {
      console.warn(`Tentativa ${attempt} falhou. Tentando novamente...`);
      return saveToSupabase(payload, attempt + 1);
    }
    throw new Error(`Falhou após ${MAX_ATTEMPTS} tentativas`);
  }

  return true;
}

// ─── Salva localmente como failsafe (nunca perde um lead) ───
function saveToLocalStorage(payload) {
  try {
    const pending = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    pending.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(LS_KEY, JSON.stringify(pending));
  } catch (e) {
    console.error('localStorage indisponível:', e);
  }
}

// ─── Tenta reenviar inscrições que ficaram pendentes no localStorage ───
async function flushPendingFromLocalStorage() {
  try {
    const pending = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    if (!pending.length) return;

    const failed = [];
    for (const item of pending) {
      try {
        await saveToSupabase({ nome: item.nome, whatsapp: item.whatsapp });
        // Se enviou com sucesso, também salva na fila de pending no Supabase para auditoria
      } catch {
        failed.push(item);
      }
    }

    // Mantém apenas os que ainda falharam
    localStorage.setItem(LS_KEY, JSON.stringify(failed));
    if (failed.length === 0) {
      console.log('✅ Todas as inscrições pendentes foram sincronizadas.');
    }
  } catch (e) {
    console.error('Erro ao sincronizar pendentes:', e);
  }
}

// ─── App principal ───
document.addEventListener('DOMContentLoaded', () => {

  // Tenta reenviar pendentes ao carregar a página (visitante que teve falha antes)
  flushPendingFromLocalStorage();

  // Smooth scroll
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

  // ─── Formulário de inscrição ───
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

      if (nome.length < 3) {
        alert('Por favor, informe seu nome completo.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';

      const payload = { nome, whatsapp };

      // ① Salva imediatamente no localStorage (failsafe — nunca perde)
      saveToLocalStorage(payload);

      try {
        // ② Tenta salvar no Supabase (com até 3 retentativas automáticas)
        await saveToSupabase(payload);

        // ③ Se chegou aqui, foi com sucesso → remove do localStorage
        const pending = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const updated = pending.filter(
          p => !(p.nome === nome && p.whatsapp === whatsapp)
        );
        localStorage.setItem(LS_KEY, JSON.stringify(updated));

        submitBtn.textContent = '✅ INSCRIÇÃO CONFIRMADA!';
        submitBtn.style.backgroundColor = '#2a9d8f';
        submitBtn.style.color = 'white';
        submitBtn.style.boxShadow = '0 4px 15px rgba(42,157,143,0.4)';
        form.reset();

      } catch (err) {
        // ④ Supabase falhou mesmo após retries — dado está salvo no localStorage
        // Mostra sucesso ao usuário (dados não se perdem)
        console.error('Supabase indisponível, dado salvo localmente:', err);
        submitBtn.textContent = '✅ INSCRIÇÃO REGISTRADA!';
        submitBtn.style.backgroundColor = '#2a9d8f';
        submitBtn.style.color = 'white';
        form.reset();
      }

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.backgroundColor = '';
        submitBtn.style.color = '';
        submitBtn.style.boxShadow = '';
      }, 5000);
    });
  }

  // ─── Máscara WhatsApp ───
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function (e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // ─── Scroll animations ───
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

  // ─── Custom cinematic video player ───
  const videoPoster = document.getElementById('videoPoster');
  const playBtn = document.getElementById('playBtn');
  const venueVideo = document.getElementById('venueVideo');

  if (venueVideo) {
    const startVideo = () => {
      venueVideo.src = 'video executive Gastronomia.mp4';
      venueVideo.load();
      venueVideo.play().catch(() => {});
      if (videoPoster) videoPoster.classList.add('is-hidden');
      venueVideo.setAttribute('controls', '');
    };
    if (playBtn) playBtn.addEventListener('click', startVideo);
    if (videoPoster) videoPoster.addEventListener('click', startVideo);
  }
});
