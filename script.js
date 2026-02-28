// script.js
// ==================== DATA (localStorage) ====================
let milkLogs = JSON.parse(localStorage.getItem('maziwa_milk')) || [];
let feedLogs = JSON.parse(localStorage.getItem('maziwa_feed')) || [];
let cows = JSON.parse(localStorage.getItem('maziwa_cows')) || [];

// ==================== HELPER: save to storage ====================
function saveAll() {
  localStorage.setItem('maziwa_milk', JSON.stringify(milkLogs));
  localStorage.setItem('maziwa_feed', JSON.stringify(feedLogs));
  localStorage.setItem('maziwa_cows', JSON.stringify(cows));
}

// ==================== CALCULATE TOTALS ====================
function calcTotals() {
  const totalMilk = milkLogs.reduce((sum, e) => sum + (e.morning + e.evening), 0);
  const totalIncome = milkLogs.reduce((sum, e) => sum + ((e.morning + e.evening) * e.price), 0);
  const totalExpenses = feedLogs.reduce((sum, e) => sum + e.cost, 0);
  const profit = totalIncome - totalExpenses;
  return { totalMilk, totalIncome, totalExpenses, profit };
}

// ==================== UPDATE ALL UI CARDS (dashboard + reports) ====================
function updateTotalsUI() {
  const { totalMilk, totalIncome, totalExpenses, profit } = calcTotals();

  // Dashboard cards
  document.getElementById('total-milk').innerText = totalMilk.toFixed(1) + ' L';
  document.getElementById('total-income').innerText = 'KSh ' + totalIncome.toFixed(2);
  document.getElementById('total-expenses').innerText = 'KSh ' + totalExpenses.toFixed(2);
  document.getElementById('total-profit').innerText = 'KSh ' + profit.toFixed(2);

  // Reports cards
  document.getElementById('reports-total-milk').innerText = totalMilk.toFixed(1) + ' L';
  document.getElementById('reports-total-income').innerText = 'KSh ' + totalIncome.toFixed(2);
  document.getElementById('reports-total-expenses').innerText = 'KSh ' + totalExpenses.toFixed(2);
  document.getElementById('reports-total-profit').innerText = 'KSh ' + profit.toFixed(2);
}

// ==================== RENDER LISTS ====================
function renderMilkTable() {
  const tbody = document.getElementById('milk-table-body');
  tbody.innerHTML = '';
  milkLogs.forEach((entry, index) => {
    const row = document.createElement('tr');
    const totalLitres = entry.morning + entry.evening;
    const income = totalLitres * entry.price;
    row.innerHTML = `
      <td>${entry.morning.toFixed(1)} L</td>
      <td>${entry.evening.toFixed(1)} L</td>
      <td>KSh ${entry.price.toFixed(2)}</td>
      <td>${totalLitres.toFixed(1)} L</td>
      <td>KSh ${income.toFixed(2)}</td>
      <td><button class="delete-btn" data-type="milk" data-index="${index}"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderFeedTable() {
  const tbody = document.getElementById('feed-table-body');
  tbody.innerHTML = '';
  feedLogs.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.feedType}</td>
      <td>KSh ${entry.cost.toFixed(2)}</td>
      <td><button class="delete-btn" data-type="feed" data-index="${index}"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderCowTable() {
  const tbody = document.getElementById('cow-table-body');
  tbody.innerHTML = '';
  cows.forEach((cow, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cow.name}</td>
      <td>${cow.breed}</td>
      <td><button class="delete-btn" data-type="cow" data-index="${index}"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });
}

// ==================== FULL RENDER ====================
function renderAll() {
  renderMilkTable();
  renderFeedTable();
  renderCowTable();
  updateTotalsUI();
}

// ==================== DELETE HANDLER (event delegation) ====================
function handleDelete(e) {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;

  const type = btn.dataset.type;
  const index = btn.dataset.index;

  if (type === 'milk') {
    milkLogs.splice(index, 1);
  } else if (type === 'feed') {
    feedLogs.splice(index, 1);
  } else if (type === 'cow') {
    cows.splice(index, 1);
  }

  saveAll();
  renderAll();
}

// Attach listeners to table wrappers (delegation)
document.querySelector('.main-content').addEventListener('click', handleDelete);

// ==================== FORM SUBMITS ====================
// Milk form
document.getElementById('milk-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const morning = parseFloat(document.getElementById('milk-morning').value);
  const evening = parseFloat(document.getElementById('milk-evening').value);
  const price = parseFloat(document.getElementById('milk-price').value);
  if (isNaN(morning) || isNaN(evening) || isNaN(price)) return;

  milkLogs.push({ morning, evening, price });
  saveAll();
  renderAll();
  e.target.reset();
});

// Feed form
document.getElementById('feed-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const feedType = document.getElementById('feed-type').value.trim();
  const cost = parseFloat(document.getElementById('feed-cost').value);
  if (!feedType || isNaN(cost)) return;

  feedLogs.push({ feedType, cost });
  saveAll();
  renderAll();
  e.target.reset();
});

// Cow form
document.getElementById('cow-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('cow-name').value.trim();
  const breed = document.getElementById('cow-breed').value.trim();
  if (!name || !breed) return;

  cows.push({ name, breed });
  saveAll();
  renderAll();
  e.target.reset();
});

// ==================== SIDEBAR NAVIGATION ====================
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

function switchSection(sectionId) {
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  navButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.nav-btn[data-section="${sectionId.replace('-section', '')}"]`).classList.add('active');
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionName = btn.dataset.section; // 'dashboard', 'milk', ...
    switchSection(sectionName + '-section');
  });
});

// ==================== INITIAL LOAD ====================
renderAll();

// default section visible (dashboard already active)
