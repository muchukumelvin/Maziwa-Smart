// script.js

/* -------------------- DATA KEYS & HELPERS -------------------- */
const STORAGE_USERS = 'maziwa_users';
const STORAGE_CURRENT = 'maziwa_currentUser';

// Get current logged in phone
function getCurrentPhone() {
    return localStorage.getItem(STORAGE_CURRENT);
}

// Save user-specific data
function saveUserData(phone, key, data) {
    const storageKey = `${key}_${phone}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
}

// Load user-specific data
function loadUserData(phone, key, defaultValue = []) {
    const storageKey = `${key}_${phone}`;
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : defaultValue;
}

// Get users list
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
}

// Save users list
function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

/* -------------------- AUTH -------------------- */
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const displayFarmName = document.getElementById('displayFarmName');

// Signup
signupBtn.addEventListener('click', () => {
    const farm = document.getElementById('farmName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const pwd = document.getElementById('signupPassword').value.trim();
    const lang = document.getElementById('language').value;

    if (!farm || !phone || !pwd) return alert('Fill all fields');

    const users = getUsers();
    if (users.find(u => u.phone === phone)) {
        return alert('Phone already registered. Please login.');
    }

    users.push({ farm, phone, password: pwd, language: lang });
    saveUsers(users);

    // auto-login
    localStorage.setItem(STORAGE_CURRENT, phone);
    showApp(phone, farm);
    clearAuthInputs();
});

// Login
loginBtn.addEventListener('click', () => {
    const phone = document.getElementById('loginPhone').value.trim();
    const pwd = document.getElementById('loginPassword').value.trim();

    const users = getUsers();
    const user = users.find(u => u.phone === phone && u.password === pwd);
    if (!user) return alert('Invalid phone or password');

    localStorage.setItem(STORAGE_CURRENT, phone);
    showApp(phone, user.farm);
    clearAuthInputs();
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_CURRENT);
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
});

function clearAuthInputs() {
    document.getElementById('farmName').value = '';
    document.getElementById('signupPhone').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('loginPhone').value = '';
    document.getElementById('loginPassword').value = '';
}

function showApp(phone, farmName) {
    displayFarmName.innerText = farmName || 'Maziwa Smart';
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Load all data and refresh UI
    refreshAllSections(phone);
    setActiveTab('dashboard');  // default to dashboard
}

// Check session on load
(function checkSession() {
    const phone = getCurrentPhone();
    if (phone) {
        const users = getUsers();
        const user = users.find(u => u.phone === phone);
        if (user) {
            showApp(phone, user.farm);
        } else {
            localStorage.removeItem(STORAGE_CURRENT);
        }
    }
})();

/* -------------------- BOTTOM NAVIGATION -------------------- */
const navItems = document.querySelectorAll('.nav-item');
const panels = {
    dashboard: document.getElementById('dashboardSection'),
    cows: document.getElementById('cowsSection'),
    feed: document.getElementById('feedSection'),
    vaccine: document.getElementById('vaccineSection'),
    milk: document.getElementById('milkSection')
};

navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        setActiveTab(tab);
        if (tab === 'dashboard') updateDashboard(); // refresh chart & cards
    });
});

function setActiveTab(tab) {
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    Object.keys(panels).forEach(key => {
        panels[key].classList.toggle('active-panel', key === tab);
    });
}

/* -------------------- REFRESH ALL DATA -------------------- */
let currentChart = null;

function refreshAllSections(phone) {
    renderCowList(phone);
    renderFeedList(phone);
    renderVaccineList(phone);
    renderMilkList(phone);
    updateDashboard(phone);
}

// Wrapper to get phone inside functions
function withPhone(fn) {
    const phone = getCurrentPhone();
    if (!phone) return;
    fn(phone);
}

/* -------------------- COW SECTION -------------------- */
const cowForm = document.getElementById('cowForm');
const cowList = document.getElementById('cowList');

cowForm.addEventListener('submit', (e) => {
    e.preventDefault();
    withPhone(phone => {
        const name = document.getElementById('cowName').value.trim();
        const breed = document.getElementById('cowBreed').value.trim();
        const age = document.getElementById('cowAge').value.trim();
        if (!name || !breed || !age) return;

        const cows = loadUserData(phone, 'cows');
        cows.push({ name, breed, age, id: Date.now() });
        saveUserData(phone, 'cows', cows);
        renderCowList(phone);
        cowForm.reset();
        updateDashboard(phone);
    });
});

function renderCowList(phone) {
    const cows = loadUserData(phone, 'cows');
    cowList.innerHTML = cows.map(c => `<li>🐄 ${c.name} · ${c.breed} · ${c.age} mo</li>`).join('') || '<li>No cows registered</li>';
}

/* -------------------- FEED SECTION -------------------- */
const feedForm = document.getElementById('feedForm');
const feedList = document.getElementById('feedList');

feedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    withPhone(phone => {
        const type = document.getElementById('feedType').value.trim();
        const cost = parseFloat(document.getElementById('feedCost').value);
        if (!type || isNaN(cost)) return;

        const feeds = loadUserData(phone, 'feeds');
        feeds.push({ type, cost, date: new Date().toLocaleDateString(), id: Date.now() });
        saveUserData(phone, 'feeds', feeds);
        renderFeedList(phone);
        feedForm.reset();
        updateDashboard(phone);
    });
});

function renderFeedList(phone) {
    const feeds = loadUserData(phone, 'feeds');
    feedList.innerHTML = feeds.map(f => `<li>🌾 ${f.type} · TZS ${f.cost} · ${f.date}</li>`).join('') || '<li>No feed records</li>';
}

/* -------------------- VACCINE SECTION -------------------- */
const vaccineForm = document.getElementById('vaccineForm');
const vaccineList = document.getElementById('vaccineList');

vaccineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    withPhone(phone => {
        const cow = document.getElementById('vaccineCow').value.trim();
        const name = document.getElementById('vaccineName').value.trim();
        const date = document.getElementById('vaccineDate').value;
        if (!cow || !name || !date) return;

        const vaccines = loadUserData(phone, 'vaccines');
        vaccines.push({ cow, name, date, id: Date.now() });
        saveUserData(phone, 'vaccines', vaccines);
        renderVaccineList(phone);
        vaccineForm.reset();
        updateDashboard(phone);
    });
});

function renderVaccineList(phone) {
    const vaccines = loadUserData(phone, 'vaccines');
    vaccineList.innerHTML = vaccines.map(v => `<li>💉 ${v.cow} · ${v.name} · ${v.date}</li>`).join('') || '<li>No vaccine records</li>';
}

/* -------------------- MILK SECTION -------------------- */
const milkForm = document.getElementById('milkForm');
const milkList = document.getElementById('milkList');

milkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    withPhone(phone => {
        const cow = document.getElementById('milkCow').value.trim();
        const litres = parseFloat(document.getElementById('milkLitres').value);
        const date = document.getElementById('milkDate').value;
        if (!cow || isNaN(litres) || !date) return;

        const milks = loadUserData(phone, 'milks');
        milks.push({ cow, litres, date, id: Date.now() });
        saveUserData(phone, 'milks', milks);
        renderMilkList(phone);
        milkForm.reset();
        updateDashboard(phone);
    });
});

function renderMilkList(phone) {
    const milks = loadUserData(phone, 'milks');
    milkList.innerHTML = milks.map(m => `<li>🥛 ${m.cow} · ${m.litres} L · ${m.date}</li>`).join('') || '<li>No milk records</li>';
}

/* -------------------- DASHBOARD & CHART -------------------- */
function updateDashboard(phone) {
    if (!phone) phone = getCurrentPhone();
    if (!phone) return;

    const cows = loadUserData(phone, 'cows');
    const feeds = loadUserData(phone, 'feeds');
    const vaccines = loadUserData(phone, 'vaccines');
    const milks = loadUserData(phone, 'milks');

    const totalCows = cows.length;
    const totalMilk = milks.reduce((acc, m) => acc + m.litres, 0).toFixed(1);
    const totalFeedCost = feeds.reduce((acc, f) => acc + f.cost, 0);
    const totalVaccines = vaccines.length;

    document.getElementById('totalCows').innerText = totalCows;
    document.getElementById('totalMilk').innerText = totalMilk;
    document.getElementById('totalFeedCost').innerText = totalFeedCost;
    document.getElementById('totalVaccines').innerText = totalVaccines;

    // Pie chart
    const ctx = document.getElementById('farmPieChart').getContext('2d');
    if (currentChart) currentChart.destroy();

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Milk (litres)', 'Feed cost (TZS)', 'Vaccine count'],
            datasets: [{
                data: [totalMilk, totalFeedCost, totalVaccines],
                backgroundColor: ['#2b7a4b', '#f59e0b', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Call update when dashboard becomes active
