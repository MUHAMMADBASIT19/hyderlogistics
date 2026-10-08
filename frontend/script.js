(function () {
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');

  if (!form) return;

  const rules = {
    name:    v => v.trim().length >= 2 || 'Enter your full name.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
    phone:   v => /^[+\d][\d\s()-]{6,17}$/.test(v.trim()) || 'Enter a valid phone number.',
    service: v => v !== '' || 'Choose a service.',
    origin:  v => v.trim().length >= 2 || 'Enter the origin port.',
    dest:    v => v.trim().length >= 2 || 'Enter the destination port.',
    message: v => v.trim().length >= 10 || 'Add a few details about your cargo (at least 10 characters).'
  };

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const wrap = field.closest('.field');
    const msg = wrap ? wrap.querySelector('.error') : null;
    const ok = result === true;

    if (wrap) wrap.classList.toggle('invalid', !ok);
    field.setAttribute('aria-invalid', String(!ok));
    if (msg) msg.textContent = ok ? '' : result;
    return ok;
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const wrap = field.closest('.field');
      if (wrap && wrap.classList.contains('invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (status) {
      status.className = 'form-status';
      status.textContent = '';
    }

    const fields = [...form.querySelectorAll('input, select, textarea')];
    const results = fields.map(validateField);
    const firstBad = fields[results.indexOf(false)];

    if (firstBad) {
      firstBad.focus();
      if (status) status.textContent = 'Please correct the highlighted fields.';
      return;
    }

    // Backend Connection
    const data = Object.fromEntries(new FormData(form).entries());

    if (status) {
      status.className = 'form-status loading';
      status.textContent = 'Submitting your request... Please wait.';
    }

    try {
     const response = await fetch('https://hyderlogistics.vercel.app/api/quote', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (status) {
          status.className = 'form-status success ok';
          status.textContent = 'Thank you! Your quote request has been sent successfully.';
        }
        form.reset();

        setTimeout(() => {
          if (status) status.textContent = '';
        }, 5000);
      } else {
        if (status) {
          status.className = 'form-status error';
          status.textContent = result.message || 'Failed to send request. Please try again.';
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (status) {
        status.className = 'form-status error';
        status.textContent = 'Server connection error. Ensure your backend is running.';
      }
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();