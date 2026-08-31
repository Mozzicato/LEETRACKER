const $ = selector => document.querySelector(selector);

let mode = 'login';

const copy = {
  login: {
    heading: 'Welcome back.',
    sub: 'Pick up your sheet where you left it.',
    submit: 'Login',
    foot: 'New here? ',
    footAction: 'Create an account',
    footMode: 'signup',
    autocomplete: 'current-password'
  },
  signup: {
    heading: 'Start your sheet.',
    sub: 'One account keeps every problem you have written down, on any device.',
    submit: 'Create account',
    foot: 'Already have an account? ',
    footAction: 'Login',
    footMode: 'login',
    autocomplete: 'new-password'
  }
};

function setMode(next) {
  mode = next;
  const text = copy[mode];

  $('#auth-heading').textContent = text.heading;
  $('#auth-sub').textContent = text.sub;
  $('#auth-submit').textContent = text.submit;
  $('#name-field').hidden = mode !== 'signup';
  $('#password').setAttribute('autocomplete', text.autocomplete);

  document.querySelectorAll('#auth-toggle button').forEach(button =>
    button.classList.toggle('is-active', button.dataset.mode === mode)
  );

  $('#auth-foot').innerHTML =
    `${text.foot}<button type="button" class="link-btn" data-mode="${text.footMode}">${text.footAction}</button>`;

  hideError();
}

const showError = message => {
  const box = $('#auth-error');
  box.textContent = message;
  box.classList.remove('is-hidden');
};

const hideError = () => $('#auth-error').classList.add('is-hidden');

document.addEventListener('click', event => {
  const button = event.target.closest('[data-mode]');
  if (button) setMode(button.dataset.mode);
});

$('#auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  hideError();

  const email = $('#email').value.trim();
  const password = $('#password').value;

  if (!email) return showError('Enter your email address.');
  if (!password) return showError('Enter your password.');
  if (mode === 'signup' && password.length < 8) {
    return showError('Password must be at least 8 characters.');
  }

  const submit = $('#auth-submit');
  submit.disabled = true;
  submit.textContent = mode === 'signup' ? 'Creating account…' : 'Logging in…';

  try {
    const response = await fetch(`/api/auth/${mode === 'signup' ? 'signup' : 'login'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: $('#name').value.trim() })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Try again.');

    window.location.href = '/sheet.html';
  } catch (problem) {
    showError(problem.message);
    submit.disabled = false;
    submit.textContent = copy[mode].submit;
  }
});

setMode('login');

/* After setMode, which clears the banner: a failed Google round-trip comes
   back as ?error= on this page. */
const returned = new URLSearchParams(window.location.search).get('error');
if (returned) {
  showError(returned);
  window.history.replaceState({}, '', '/');
}

/* Already signed in? Skip the form. (The server no longer redirects here,
   so that local and Vercel behave identically.) */
fetch('/api/auth/me')
  .then(response => { if (response.ok) window.location.replace('/sheet.html'); })
  .catch(() => { /* stay on the form */ });

/* Only offer Google if the server actually has credentials for it. */
const showGoogle = on => {
  $('#google-btn').classList.toggle('is-hidden', !on);
  $('#auth-divider').classList.toggle('is-hidden', !on);
};

fetch('/api/auth/config')
  .then(async response => {
    if (!response.ok) throw new Error(`the API returned ${response.status}`);
    const type = response.headers.get('content-type') || '';
    /* Anything but JSON means something sits in front of the API — a login
       wall, a proxy, a 404 page — not our server answering. */
    if (!type.includes('application/json')) throw new Error('the API did not return JSON');
    return response.json();
  })
  .then(config => showGoogle(config.google))
  .catch(problem => {
    /* Fail open. Hiding the button on failure makes a broken deployment look
       like a missing feature, which is impossible to diagnose from the page. */
    showGoogle(true);
    console.error('Could not read /api/auth/config:', problem);
    showError(`Could not reach the server (${problem.message}). Login may not work.`);
  });
