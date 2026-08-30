/* Lit-Sheet. Questions live in Neon; this file talks to the API in api(). */

/* The mastery ladder. Clear it and the problem is vaulted. */
const LADDER = [1, 3, 7, 30, 90];

/* One direct progression, best to worst. */
const SCALE = [
  { key: 'vault', label: 'Vaulted' },
  { key: 'mastered', label: 'Mastered' },
  { key: 'strong', label: 'Strong' },
  { key: 'steady', label: 'Steady' },
  { key: 'slipping', label: 'Slipping' },
  { key: 'fading', label: 'Fading' },
  { key: 'weak', label: 'Weak' },
  { key: 'abandoned', label: 'Abandoned' }
];

/* Modes — a rank earned from how you practise, not from how long you've been here. */
const RANKS = [
  { key: 'new-taker',      name: 'New Taker',      min: 0,    accent: '#94a3b8', blurb: 'Just arrived, notebook still crisp.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80' },
  { key: 'scribbler',      name: 'Scribbler',      min: 30,   accent: '#64748b', blurb: 'Writing things down before they slip.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80' },
  { key: 'drill-hand',     name: 'Drill Hand',     min: 85,   accent: '#0f766e', blurb: 'Reps in, no drama. The work is the work.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80' },
  { key: 'pattern-seeker', name: 'Pattern Seeker', min: 165,  accent: '#2f6fd0', blurb: 'You stopped memorising answers and started seeing shapes.', image: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80' },
  { key: 'merlin',         name: 'Merlin',         min: 280,  accent: '#5b4bb8', blurb: 'The hat is earned. Things stay remembered around you.', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80' },
  { key: 'oracle',         name: 'Oracle',         min: 430,  accent: '#8a5cc4', blurb: 'You rarely forget. People ask you how.', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80' },
  { key: 'archmage',       name: 'Archmage',       min: 620,  accent: '#b8399e', blurb: 'The vault is deep and it does not leak.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
  { key: 'cracked',        name: 'Cracked',        min: 850,  accent: '#e0348b', blurb: 'Absolutely cracked. The patterns never stood a chance.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
  { key: 'goated',         name: 'Goated',         min: 1120, accent: '#d4830f', blurb: 'Greatest-of-all-time behaviour. The sheet runs itself.', image: 'https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=900&q=80' },
  { key: 'legend',         name: 'Legend',         min: 1450, accent: '#c99a12', blurb: 'They tell stories about your recall.', image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80' },
  { key: 'him',            name: 'Him',            min: 1850, accent: '#16181d', blurb: 'You are not built different. You are simply him.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80' }
];

let problems = [];
let cheats = [];
let section = 'sheet';
let viewMode = 'overview';
let groupBy = 'date';
let urgentFilter = 'all';
let searchQuery = '';
let selectedProblem = null;
let editingId = null;
let reviewQueue = [];
let reviewIndex = 0;

const $ = selector => document.querySelector(selector);

const byNumber = number => problems.find(problem => problem.number === number);
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (date, days) => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); return next.toISOString().slice(0, 10); };
const dayDiff = date => Math.round((new Date(`${date}T12:00:00`) - new Date(`${today()}T12:00:00`)) / 86400000);
const shortDate = date => new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const monthLabel = key => new Date(`${key}-01T12:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);

/* ---------- the API ---------- */

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401) { window.location.href = '/login.html'; throw new Error('Signed out.'); }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

/* The server's shape, flattened into the one this UI already speaks. */
const fromApi = question => ({
  id: question.id,
  problem: {
    number: question.leetcode_number,
    title: question.title,
    difficulty: question.difficulty,
    topic: question.topic,
    slug: question.slug
  },
  insight: question.key_insight,
  notes: question.notes || '',
  time: question.time_complexity || '',
  space: question.space_complexity || '',
  solvedAt: question.created_at.slice(0, 10),
  nextReview: question.next_review_at.slice(0, 10),
  interval: question.interval_days,
  reviewCount: question.review_count
});

function showError(message) {
  const box = $('#app-error');
  box.textContent = message;
  box.classList.remove('is-hidden');
}

const hideError = () => $('#app-error').classList.add('is-hidden');

/* ---------- the progression ---------- */

function health(cheat) {
  const late = -dayDiff(cheat.nextReview);
  const rung = Math.max(0, LADDER.indexOf(cheat.interval));

  if (late < 0) {
    if (rung >= LADDER.length - 1) return 'vault';
    if (rung >= 3) return 'mastered';
    if (rung >= 2) return 'strong';
    return 'steady';
  }
  if (late === 0) return 'slipping';
  if (late <= 3) return 'fading';
  if (late <= 10) return 'weak';
  return 'abandoned';
}

function stateLine(cheat) {
  const diff = dayDiff(cheat.nextReview);
  if (diff > 0) return `in ${plural(diff, 'day')}`;
  if (diff === 0) return 'due today';
  return `${plural(-diff, 'day')} late`;
}

const needsPractice = cheat => dayDiff(cheat.nextReview) <= 0;
const labelFor = status => SCALE.find(step => step.key === status).label;
const rungOf = cheat => Math.max(0, LADDER.indexOf(cheat.interval));

/* How far up the ladder, drawn as pips. */
function ladderPips(cheat) {
  const reached = rungOf(cheat);
  const vaulted = health(cheat) === 'vault';
  return `<span class="pips" title="Rung ${reached + 1} of ${LADDER.length}">${LADDER.map((days, index) =>
    `<i class="pip-step${index <= reached ? ' is-on' : ''}${vaulted ? ' is-vault' : ''}" data-days="${days}"></i>`
  ).join('')}</span>`;
}

/* What you've actually done, and what it earns you. */
function practice() {
  const solved = cheats.length;
  const reviews = cheats.reduce((total, cheat) => total + cheat.reviewCount, 0);
  const vaulted = cheats.filter(cheat => health(cheat) === 'vault').length;
  const abandoned = cheats.filter(cheat => health(cheat) === 'abandoned').length;
  const recent = cheats.filter(cheat => -dayDiff(cheat.solvedAt) <= 30).length;

  const points = Math.max(0,
    solved * 2 +      // writing them down
    reviews * 3 +     // coming back to them
    recent * 4 +      // keeping up the pace
    vaulted * 15 -    // getting them locked in
    abandoned * 8     // letting them rot
  );

  const index = RANKS.reduce((found, rank, position) => points >= rank.min ? position : found, 0);
  const rank = RANKS[index];
  const next = RANKS[index + 1] || null;

  return { solved, reviews, vaulted, abandoned, recent, points, rank, next, index };
}

function renderMode() {
  const state = practice();
  $('#mode').style.setProperty('--rank', state.rank.accent);
  $('#mode').innerHTML = `
    <span class="mode-picture">
      <img src="${state.rank.image}" alt="${escapeHtml(state.rank.name)} mode illustration">
      <span class="mode-picture-shade"></span>
    </span>
    <span class="mode-content">
      <span class="mode-eyebrow">Your mode · ${state.rank.min} pts</span>
      <strong class="mode-tag" data-rank="${state.rank.key}">${state.rank.name}</strong>
      <span class="mode-line">${state.rank.blurb}</span>
      <span class="mode-next">${state.next
        ? `${state.next.min - state.points} pts to ${state.next.name}`
        : 'Top mode reached'}</span>
    </span>`;
}

function openModes() {
  const state = practice();
  $('#modes-content').innerHTML = `
    <div class="mode-gallery">
      ${RANKS.map((rank, index) => `
        <article class="mode-card${index === state.index ? ' is-current' : ''}${index > state.index ? ' is-locked' : ''}" style="--rank:${rank.accent}">
          <div class="mode-card-media">
            <img src="${rank.image}" alt="${escapeHtml(rank.name)} mode illustration" loading="lazy">
            <div class="mode-card-shade"></div>
            <div class="mode-card-copy">
              <div class="mode-card-topline">
                <span class="mode-number">Mode ${index + 1}</span>
                <span class="rank-min">${rank.min} pts</span>
              </div>
              <span class="rank-tag" data-rank="${rank.key}">${rank.name}</span>
              <p>${rank.blurb}</p>
              ${index === state.index ? '<span class="rank-now">your current mode</span>' : ''}
            </div>
          </div>
        </article>`).join('')}
    </div>`;
  $('#modes-modal').classList.remove('is-hidden');
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  $('#toasts').append(node);
  setTimeout(() => node.classList.add('is-out'), 2400);
  setTimeout(() => node.remove(), 2800);
}

function celebrateModeUnlock(rank) {
  $('#rank-up-level').textContent = `Mode ${RANKS.indexOf(rank) + 1}`;
  $('#rank-up-title').textContent = rank.name;
  $('#rank-up-message').textContent = rank.blurb;
  $('#rank-up-card').style.setProperty('--rank-up-accent', rank.accent);
  $('#rank-up-modal').classList.remove('is-hidden');
  $('#rank-up-continue').focus();
}

const closeRankUp = () => $('#rank-up-modal').classList.add('is-hidden');

/* ---------- rendering ---------- */

function renderLegend() {
  $('#legend').innerHTML = SCALE.map((step, index) =>
    `<div class="legend-step"><span class="legend-chip" style="background:${step.key === 'vault' ? 'linear-gradient(90deg,var(--vault) 0 70%,var(--gold) 70% 86%,var(--vault) 86% 100%)' : `var(--${step.key})`}"></span><span>${step.label}</span></div>${index < SCALE.length - 1 ? '<span class="legend-arrow">›</span>' : ''}`
  ).join('');
}

function boxMarkup(cheat) {
  const status = health(cheat);
  return `<button class="box" data-status="${status}" data-review-id="${cheat.id}"
    style="--c:var(--${status});--fg:var(--${status}-fg)"
    title="#${cheat.problem.number} ${escapeHtml(cheat.problem.title)} — ${labelFor(status)}, ${stateLine(cheat)}">
    <span class="box-no">${cheat.problem.number}</span>
    <span class="box-title">${escapeHtml(cheat.problem.title)}</span>
  </button>`;
}

function rowMarkup(cheat) {
  const status = health(cheat);
  return `<article class="row" data-status="${status}" data-review-id="${cheat.id}" role="button" tabindex="0"
    style="--c:var(--${status});--fg:var(--${status}-fg)">
    <div class="row-bar"></div>
    <div class="cell cell-q">
      <strong>${escapeHtml(cheat.problem.title)}</strong>
      <span><em>#${cheat.problem.number}</em>${cheat.problem.difficulty} · ${cheat.problem.topic}</span>
    </div>
    <div class="cell cell-cx">
      <b>${escapeHtml(cheat.time) || '—'}</b>${escapeHtml(cheat.space) || '—'} space
    </div>
    <div class="cell cell-note">${escapeHtml(cheat.insight) || 'No note yet.'}</div>
    <div class="cell cell-state">
      <span class="pill">${labelFor(status)}</span>
      <small>${stateLine(cheat)}</small>
      ${ladderPips(cheat)}
    </div>
  </article>`;
}

function groupCheats(list) {
  const buckets = new Map();
  list.forEach(cheat => {
    const key = groupBy === 'pattern' ? cheat.problem.topic : cheat.solvedAt.slice(0, 7);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(cheat);
  });

  const keys = [...buckets.keys()].sort((a, b) => groupBy === 'pattern' ? a.localeCompare(b) : b.localeCompare(a));
  return keys.map(key => ({
    key,
    label: groupBy === 'pattern' ? key : monthLabel(key),
    items: buckets.get(key).sort((a, b) => SCALE.findIndex(s => s.key === health(b)) - SCALE.findIndex(s => s.key === health(a)))
  }));
}

function renderBoard() {
  const urgentCount = cheats.filter(needsPractice).length;
  $('#urgent-badge').textContent = urgentCount;
  $('#urgent-badge').dataset.empty = urgentCount === 0;
  $('#review-count').textContent = urgentCount;
  $('#review-now').classList.toggle('is-hidden', urgentCount === 0);

  renderSpread();
  renderMode();

  let list = cheats;
  if (section === 'urgent') {
    list = cheats.filter(needsPractice);
    if (urgentFilter === 'due') list = list.filter(cheat => dayDiff(cheat.nextReview) === 0);
    if (urgentFilter === 'overdue') list = list.filter(cheat => dayDiff(cheat.nextReview) < 0);
    if (urgentFilter === 'abandoned') list = list.filter(cheat => health(cheat) === 'abandoned');
  }

  const needle = searchQuery.trim().toLowerCase();
  if (needle) {
    list = list.filter(cheat =>
      `${cheat.problem.number} ${cheat.problem.title} ${cheat.problem.topic} ${cheat.insight}`.toLowerCase().includes(needle)
    );
  }

  $('#section-title').textContent = section === 'urgent' ? 'Urgent' : 'Sheet';
  $('#section-sub').textContent = section === 'urgent'
    ? `${plural(list.length, 'problem')} needing practice${urgentFilter === 'all' ? '' : ` · ${urgentFilter}`}`
    : `${plural(cheats.length, 'problem')} solved · ${cheats.filter(cheat => health(cheat) === 'vault').length} vaulted`;

  const board = $('#board');

  if (!list.length) {
    board.innerHTML = needle
      ? `<div class="empty"><strong>No match.</strong><p>Nothing here matches “${escapeHtml(searchQuery.trim())}”. Try a number, a title or a pattern.</p></div>`
      : section === 'urgent'
        ? '<div class="empty"><strong>Nothing urgent.</strong><p>Every problem you have written down is still fresh enough. Come back when something starts slipping.</p></div>'
        : `<div class="empty"><strong>Nothing on the sheet yet.</strong>
             <p>Add the first problem you solved and it will start its way up the ladder.</p>
             <div class="empty-actions">
               <button class="primary" id="empty-add">Add a question</button>
               <button class="add-btn" id="empty-seed" style="width:auto">Load a sample sheet</button>
             </div>
           </div>`;

    const add = $('#empty-add');
    if (add) add.addEventListener('click', openAddModal);
    const sample = $('#empty-seed');
    if (sample) sample.addEventListener('click', loadSample);
    return;
  }

  board.innerHTML = groupCheats(list).map(group => `
    <section class="group">
      <div class="group-head"><h2>${escapeHtml(group.label)}</h2><span>${group.items.length}</span></div>
      ${viewMode === 'overview'
        ? `<div class="grid">${group.items.map(boxMarkup).join('')}</div>`
        : `<div class="rows">${group.items.map(rowMarkup).join('')}</div>`}
    </section>
  `).join('');

  bindCheats();
}

function renderSpread() {
  const counts = SCALE.map(step => ({
    key: step.key,
    label: step.label,
    count: cheats.filter(cheat => health(cheat) === step.key).length
  })).filter(entry => entry.count);

  $('#spread-bar').innerHTML = cheats.length
    ? counts.map(entry =>
        `<span class="spread-seg" data-status="${entry.key}" style="flex:${entry.count};background:var(--${entry.key})" title="${entry.label}: ${entry.count}"></span>`
      ).join('')
    : '';
}

function bindCheats() {
  document.querySelectorAll('[data-review-id]').forEach(element => {
    const open = () => openDetail(cheats.find(cheat => cheat.id === element.dataset.reviewId));
    element.addEventListener('click', open);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });
}

/* ---------- detail drawer ---------- */

function openDetail(cheat) {
  if (!cheat) return;
  const status = health(cheat);

  $('#detail-content').innerHTML = `
    <span class="detail-pill pill" style="--c:var(--${status});--fg:var(--${status}-fg)">${labelFor(status)}</span>
    <p class="detail-no">#${cheat.problem.number}</p>
    <h2 id="detail-title">${escapeHtml(cheat.problem.title)}</h2>
    <p class="detail-sub">${cheat.problem.difficulty} · ${cheat.problem.topic}</p>

    <div class="detail-ladder" style="--c:var(--${status})">
      <div class="detail-ladder-head"><span>Mastery ladder</span><span>${LADDER.map(days => `${days}d`).join(' › ')}</span></div>
      ${ladderPips(cheat)}
      <p class="detail-ladder-note">${status === 'vault'
        ? 'Cleared every rung. This one is vaulted.'
        : `Currently on the ${plural(cheat.interval, 'day')} rung. Remember it again to move up.`}</p>
    </div>

    <div class="detail-block">
      <span class="detail-label">Key thing to remember</span>
      <p>${escapeHtml(cheat.insight)}</p>
    </div>
    ${cheat.notes ? `<div class="detail-block"><span class="detail-label">Notes</span><p>${escapeHtml(cheat.notes)}</p></div>` : ''}

    <dl class="detail-facts">
      <div><dt>Time</dt><dd>${escapeHtml(cheat.time) || '—'}</dd></div>
      <div><dt>Space</dt><dd>${escapeHtml(cheat.space) || '—'}</dd></div>
      <div><dt>Reviews</dt><dd>${cheat.reviewCount}</dd></div>
      <div><dt>Added</dt><dd>${shortDate(cheat.solvedAt)}</dd></div>
      <div><dt>Next review</dt><dd>${shortDate(cheat.nextReview)}</dd></div>
      <div><dt>Status</dt><dd>${stateLine(cheat)}</dd></div>
    </dl>

    <div class="detail-actions">
      <button class="primary" data-detail-review>Review this now</button>
      <a class="leetcode-link" href="https://leetcode.com/problems/${cheat.problem.slug}/" target="_blank" rel="noopener">Open on LeetCode <span aria-hidden="true">↗</span></a>
    </div>
    <div class="detail-minor">
      <button class="link-btn" data-detail-edit>Edit question</button>
      <button class="link-btn link-danger" data-detail-delete>Delete</button>
    </div>`;

  $('#detail-drawer').classList.remove('is-hidden');
  $('#detail-content [data-detail-review]').addEventListener('click', () => { closeModals(); openReview(cheat); });
  $('#detail-content [data-detail-edit]').addEventListener('click', () => { closeModals(); openEditModal(cheat); });
  $('#detail-content [data-detail-delete]').addEventListener('click', () => deleteCheat(cheat));
}

async function deleteCheat(cheat) {
  try {
    await api(`/api/questions/${cheat.id}`, { method: 'DELETE' });
    cheats = cheats.filter(entry => entry.id !== cheat.id);
    closeModals();
    renderBoard();
    toast(`Deleted “${cheat.problem.title}”.`);
  } catch (problem) {
    showError(problem.message);
  }
}

function setActive(container, attribute, value) {
  container.querySelectorAll('button').forEach(button =>
    button.classList.toggle('is-active', button.dataset[attribute] === value)
  );
}

/* ---------- adding ---------- */

function openAddModal() {
  editingId = null;
  selectedProblem = null;
  $('#add-form').reset();
  $('#selected-problem').classList.add('is-hidden');
  $('#problem-search').disabled = false;
  $('#add-title').textContent = 'Add a question';
  $('#add-submit').textContent = 'Save question';
  $('#add-modal').classList.remove('is-hidden');
  renderProblemResults();
  $('#problem-search').focus();
}

function openEditModal(cheat) {
  editingId = cheat.id;
  $('#add-title').textContent = 'Edit question';
  $('#add-submit').textContent = 'Save changes';
  $('#insight-input').value = cheat.insight;
  $('#notes-input').value = cheat.notes || '';
  $('#time-input').value = cheat.time || '';
  $('#space-input').value = cheat.space || '';
  selectProblem(cheat.problem);
  /* The problem itself is fixed once it is on your sheet. */
  $('#problem-search').disabled = true;
  $('#add-modal').classList.remove('is-hidden');
  $('#insight-input').focus();
}

function closeModals() {
  document.querySelectorAll('.scrim, .drawer-scrim').forEach(modal => modal.classList.add('is-hidden'));
}

function renderProblemResults(query = '') {
  const needle = query.trim().toLowerCase();
  const matches = problems
    .filter(problem => !needle || `${problem.number} ${problem.title} ${problem.topic}`.toLowerCase().includes(needle))
    .slice(0, 5);
  $('#problem-results').innerHTML = matches.map(problem =>
    `<button type="button" class="result" data-problem-number="${problem.number}"><span class="result-no">#${problem.number}</span><span class="result-name">${escapeHtml(problem.title)}</span><span class="result-diff">${problem.difficulty}</span></button>`
  ).join('');
  document.querySelectorAll('[data-problem-number]').forEach(button =>
    button.addEventListener('click', () => selectProblem(byNumber(Number(button.dataset.problemNumber))))
  );
}

function selectProblem(problem) {
  selectedProblem = problem;
  $('#problem-search').value = `#${problem.number} ${problem.title}`;
  $('#problem-results').innerHTML = '';
  $('#selected-problem').innerHTML = `${escapeHtml(problem.title)}<span>#${problem.number} · ${problem.difficulty} · ${problem.topic}</span>`;
  $('#selected-problem').classList.remove('is-hidden');
}

/* ---------- review ---------- */

function openReview(firstCheat) {
  reviewQueue = firstCheat ? [firstCheat] : cheats.filter(needsPractice).sort((a, b) => a.nextReview.localeCompare(b.nextReview));
  reviewIndex = 0;
  if (!reviewQueue.length) return;
  $('#review-modal').classList.remove('is-hidden');
  renderReview();
}

function renderReview() {
  const cheat = reviewQueue[reviewIndex];
  $('#review-position').textContent = `${Math.min(reviewIndex + 1, reviewQueue.length)} / ${reviewQueue.length}`;

  if (!cheat) {
    $('#review-content').innerHTML = `<div class="session-end">
      <strong>Session complete.</strong>
      <p>Anything you struggled with drops back down the ladder and returns sooner.</p>
      <button class="primary" data-close-modal>Done</button>
    </div>`;
    $('#review-content [data-close-modal]').addEventListener('click', closeModals);
    return;
  }

  $('#review-content').innerHTML = `<div class="recall">
    <span class="recall-no">#${cheat.problem.number}</span>
    <h2 id="review-title">${escapeHtml(cheat.problem.title)}</h2>
    <p class="recall-sub">${cheat.problem.difficulty} · ${cheat.problem.topic}</p>
    <a class="leetcode-link" href="https://leetcode.com/problems/${cheat.problem.slug}/" target="_blank" rel="noopener">Open on LeetCode <span aria-hidden="true">↗</span></a>
    <p class="ask">Can you still solve this? Try it before revealing your note.</p>
    <div class="verdicts">
      <button class="verdict" data-result="remembered"><span class="pip"></span>I remembered it</button>
      <button class="verdict" data-result="struggled"><span class="pip"></span>I struggled</button>
      <button class="verdict" data-result="forgot"><span class="pip"></span>I forgot</button>
    </div>
  </div>`;

  document.querySelectorAll('[data-result]').forEach(button =>
    button.addEventListener('click', () => submitReview(button.dataset.result, cheat))
  );
}

async function submitReview(result, cheat) {
  document.querySelectorAll('[data-result]').forEach(button => { button.disabled = true; });
  const modeBefore = practice().index;

  let updated;
  try {
    const data = await api(`/api/questions/${cheat.id}/review`, { method: 'POST', body: { result } });
    updated = fromApi(data.question);
  } catch (problem) {
    document.querySelectorAll('[data-result]').forEach(button => { button.disabled = false; });
    showError(problem.message);
    return;
  }

  /* Keep the queue and the sheet pointing at the same, now-updated question. */
  cheats = cheats.map(entry => (entry.id === updated.id ? updated : entry));
  reviewQueue = reviewQueue.map(entry => (entry.id === updated.id ? updated : entry));

  const status = health(updated);
  if (status === 'vault') toast(`“${updated.problem.title}” is vaulted.`);

  const after = practice();
  if (after.index > modeBefore) celebrateModeUnlock(after.rank);

  $('#review-content').innerHTML = `<div class="revealed">
    <div class="reveal-block">
      <span class="reveal-label">Your note</span>
      <p>${escapeHtml(updated.insight)}</p>
      <p class="reveal-cx">${escapeHtml(updated.time) || '—'} time · ${escapeHtml(updated.space) || '—'} space</p>
    </div>
    ${updated.notes ? `<div class="reveal-block"><span class="reveal-label">Notes</span><p>${escapeHtml(updated.notes)}</p></div>` : ''}
    <p class="rescheduled">
      <span class="pill" style="--c:var(--${status});--fg:var(--${status}-fg)">${labelFor(status)}</span>
      Back in ${plural(updated.interval, 'day')}, on ${shortDate(updated.nextReview)}.
      <span style="--c:var(--${status})">${ladderPips(updated)}</span>
    </p>
    <button class="primary wide" id="next-review">${reviewIndex + 1 < reviewQueue.length ? 'Next problem' : 'Finish session'}</button>
  </div>`;

  $('#next-review').addEventListener('click', () => { reviewIndex += 1; renderReview(); renderBoard(); });
}

/* ---------- sample sheet ---------- */

async function loadSample() {
  const button = $('#empty-seed');
  if (button) { button.disabled = true; button.textContent = 'Loading…'; }
  try {
    await api('/api/seed', { method: 'POST' });
    await loadQuestions();
    renderBoard();
    toast('Sample sheet loaded.');
  } catch (problem) {
    showError(problem.message);
    if (button) { button.disabled = false; button.textContent = 'Load a sample sheet'; }
  }
}

/* ---------- wiring ---------- */

document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
  section = button.dataset.section;
  document.querySelectorAll('[data-section]').forEach(other => other.classList.toggle('is-active', other === button));
  $('#filter-toggle').classList.toggle('is-hidden', section !== 'urgent');
  renderBoard();
}));

$('#view-toggle').addEventListener('click', event => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  viewMode = button.dataset.view;
  setActive($('#view-toggle'), 'view', viewMode);
  renderBoard();
});

$('#group-toggle').addEventListener('click', event => {
  const button = event.target.closest('[data-group]');
  if (!button) return;
  groupBy = button.dataset.group;
  setActive($('#group-toggle'), 'group', groupBy);
  renderBoard();
});

$('#filter-toggle').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  urgentFilter = button.dataset.filter;
  setActive($('#filter-toggle'), 'filter', urgentFilter);
  renderBoard();
});

$('#review-now').addEventListener('click', () => openReview());
$('#mode').addEventListener('click', openModes);
$('#add-cheat').addEventListener('click', openAddModal);
$('#rank-up-continue').addEventListener('click', closeRankUp);
$('#rank-up-modal').addEventListener('click', event => { if (event.target === $('#rank-up-modal')) closeRankUp(); });
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
document.querySelectorAll('.scrim, .drawer-scrim').forEach(scrim =>
  scrim.addEventListener('click', event => { if (event.target === scrim) closeModals(); })
);
$('#problem-search').addEventListener('input', event => renderProblemResults(event.target.value));

$('#sign-out').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

$('#add-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!selectedProblem) { $('#problem-search').focus(); return; }
  hideError();

  const submit = $('#add-submit');
  const original = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'Saving…';

  try {
    const data = await api('/api/questions', {
      method: 'POST',
      body: {
        number: selectedProblem.number,
        title: selectedProblem.title,
        slug: selectedProblem.slug,
        difficulty: selectedProblem.difficulty,
        topic: selectedProblem.topic,
        insight: $('#insight-input').value.trim(),
        notes: $('#notes-input').value.trim(),
        time: $('#time-input').value.trim(),
        space: $('#space-input').value.trim()
      }
    });

    const saved = fromApi(data.question);
    const existing = cheats.findIndex(cheat => cheat.id === saved.id);
    if (existing >= 0) cheats[existing] = saved; else cheats.unshift(saved);

    toast(editingId ? 'Changes saved.' : `Added “${saved.problem.title}”. First review tomorrow.`);

    $('#add-form').reset();
    $('#problem-search').disabled = false;
    selectedProblem = null;
    editingId = null;
    $('#selected-problem').classList.add('is-hidden');
    closeModals();
    renderBoard();
  } catch (problem) {
    showError(problem.message);
  } finally {
    submit.disabled = false;
    submit.textContent = original;
  }
});

$('#search').addEventListener('input', event => { searchQuery = event.target.value; renderBoard(); });

document.addEventListener('keydown', event => {
  if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
    event.preventDefault();
    $('#search').focus();
  }
  if (event.key === 'Escape') { closeModals(); closeRankUp(); }
});

/* ---------- boot ---------- */

async function loadQuestions() {
  const data = await api('/api/questions');
  cheats = data.questions.map(fromApi);
}

async function start() {
  renderLegend();

  try {
    const [me, catalogue] = await Promise.all([
      api('/api/auth/me'),
      api('/api/problems')
    ]);
    $('#account-email').textContent = me.user.email;
    $('#account-email').title = me.user.email;
    problems = catalogue.problems;

    await loadQuestions();
    renderBoard();
  } catch (problem) {
    $('#board').innerHTML = '';
    showError(problem.message);
  }
}

start();
