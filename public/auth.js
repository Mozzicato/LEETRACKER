const $ = selector => document.querySelector(selector);

let mode = 'login';

const copy = {
  login: {
    heading: 'Welcome back.',
    sub: 'Sign in to pick up your sheet where you left it.',
    submit: 'Sign in',
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
    footAction: 'Sign in',
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
  submit.textContent = mode === 'signup' ? 'Creating account…' : 'Signing in…';

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
fetch('/api/auth/config')
  .then(response => response.json())
  .then(config => {
    if (!config.google) return;
    $('#google-btn').classList.remove('is-hidden');
    $('#auth-divider').classList.remove('is-hidden');
  })
  .catch(() => { /* leave the button hidden */ });
