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

    if (status) status.textContent = 'Sending request...';

    try {
      const response = await fetch('http://localhost:5000/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        if (status) {
          status.classList.add('ok');
          status.textContent = 'Thank you. Your request has been received and we will reply shortly.';
        }
        form.reset();
      } else {
        if (status) status.textContent = 'Failed to send request. Please try again.';
      }
    } catch (error) {
      console.error('Error:', error);
      if (status) status.textContent = 'Server connection error. Ensure your backend is running.';
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
const quoteForm = document.getElementById('quote-form');
const responseMsg = document.getElementById('form-status');

if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading State
    responseMsg.className = 'form-status loading';
    responseMsg.textContent = 'Submitting your request... Please wait.';

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      service: document.getElementById('service').value,
      origin: document.getElementById('origin').value,
      dest: document.getElementById('dest').value,
      message: document.getElementById('message').value,
    };

    try {
      const response = await fetch('http://localhost:5000/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        responseMsg.className = 'form-status success';
        responseMsg.textContent = 'Thank you! Your quote request has been sent successfully.';
        quoteForm.reset();

        setTimeout(() => {
          responseMsg.textContent = '';
        }, 5000);
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (error) {
      responseMsg.className = 'form-status error';
      responseMsg.textContent = 'Failed to send request. Please try again.';
      console.error('Submission error:', error);
    }
  });
}