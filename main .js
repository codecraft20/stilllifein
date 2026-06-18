// Still Life - Main JavaScript
let currentUser = null;
let users = JSON.parse(localStorage.getItem('stillLifeUsers')) || {};
let userData = {};

// Default data structure
function getDefaultUserData() {
    return {
        tasks: [],
        personal: {},
        activities: [],
        notes: [],
        dreams: [],
        workEntries: [],
        theme: 'dark'
    };
}

// Show/Hide functions
function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('signup-page').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showSignup() {
    document.getElementById('signup-page').classList.remove('hidden');
    document.getElementById('login-page').classList.add('hidden');
}

// Auth
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        userData = JSON.parse(localStorage.getItem(`stillLifeData_${username}`)) || getDefaultUserData();
        loadDashboard();
    } else {
        alert('Invalid credentials');
    }
});

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    
    if (users[username]) {
        alert('Username already exists');
        return;
    }
    
    if (username && password) {
        users[username] = { password: password };
        localStorage.setItem('stillLifeUsers', JSON.stringify(users));
        
        currentUser = username;
        userData = getDefaultUserData();
        localStorage.setItem(`stillLifeData_${username}`, JSON.stringify(userData));
        
        loadDashboard();
    }
});

function loadDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('signup-page').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    document.getElementById('welcome-username').textContent = currentUser;
    
    // Load theme
    if (userData.theme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    renderAll();
}

function logout() {
    currentUser = null;
    userData = {};
    showLogin();
}

// Navigation
function navigateTo(section) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('active');
    });
    
    const target = document.getElementById(section);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
    
    // Update active nav
    document.querySelectorAll('.nav-menu li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick').includes(`'${section}'`)) {
            li.classList.add('active');
        }
    });
    
    if (section === 'reports') {
        generateReports();
    }
}

// Date & Time
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric' 
    });
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit' 
    });
}

// Tasks
function addTask() {
    const input = document.getElementById('new-task');
    const text = input.value.trim();
    if (!text) return;
    
    userData.tasks.push({
        id: Date.now(),
        text: text,
        completed: false,
        date: new Date().toISOString()
    });
    
    saveData();
    renderTasks();
    input.value = '';
}

function toggleTask(id) {
    const task = userData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
    }
}

function deleteTask(id) {
    userData.tasks = userData.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    
    let completed = 0;
    
    userData.tasks.forEach(task => {
        if (task.completed) completed++;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span onclick="toggleTask(${task.id})" style="cursor:pointer; ${task.completed ? 'text-decoration: line-through;' : ''}">${task.text}</span>
            <button onclick="deleteTask(${task.id})" style="background:none;border:none;color:#ff4757;cursor:pointer;">🗑</button>
        `;
        if (task.completed) li.classList.add('completed');
        list.appendChild(li);
    });
    
    document.getElementById('total-tasks').textContent = userData.tasks.length;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = userData.tasks.length - completed;
    
    // Update summary
    document.getElementById('summary-tasks').textContent = userData.tasks.length;
}

// Personal Details
function savePersonalDetails() {
    userData.personal = {
        name: document.getElementById('personal-name').value,
        email: document.getElementById('personal-email').value,
        phone: document.getElementById('personal-phone').value,
        birthday: document.getElementById('personal-birthday').value,
        bio: document.getElementById('personal-bio').value
    };
    saveData();
    alert('Personal details saved!');
}

// Activity Log
function addActivity() {
    const desc = document.getElementById('activity-desc').value.trim();
    if (!desc) return;
    
    userData.activities.push({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        description: desc
    });
    
    saveData();
    renderActivities();
    document.getElementById('activity-desc').value = '';
}

function renderActivities() {
    const list = document.getElementById('activity-list');
    list.innerHTML = '';
    
    userData.activities.slice().reverse().forEach(act => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${act.date} ${act.time}</strong> - ${act.description}`;
        list.appendChild(li);
    });
    
    document.getElementById('summary-activities').textContent = userData.activities.length;
}

// Notes
function addNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    if (!content) return;
    
    userData.notes.push({
        id: Date.now(),
        title: title || 'Untitled',
        content: content,
        date: new Date().toLocaleDateString()
    });
    
    saveData();
    renderNotes();
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
}

function renderNotes(filteredNotes = null) {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    
    const notesToShow = filteredNotes || userData.notes;
    
    notesToShow.slice().reverse().forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${note.title}</strong><br>
                <small>${note.date}</small><br>
                ${note.content.substring(0, 120)}...
            </div>
            <button onclick="deleteNote(${note.id})" style="background:none;border:none;color:#ff4757;">🗑</button>
        `;
        list.appendChild(li);
    });
    
    document.getElementById('summary-notes').textContent = userData.notes.length;
}

function deleteNote(id) {
    userData.notes = userData.notes.filter(n => n.id !== id);
    saveData();
    renderNotes();
}

function searchNotes() {
    const query = document.getElementById('note-search').value.toLowerCase();
    const filtered = userData.notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
    );
    renderNotes(filtered);
}

// Dreams
function addDream() {
    const title = document.getElementById('dream-title').value.trim();
    const content = document.getElementById('dream-content').value.trim();
    if (!content) return;
    
    userData.dreams.push({
        id: Date.now(),
        title: title || 'Dream',
        content: content,
        date: new Date().toLocaleDateString()
    });
    
    saveData();
    renderDreams();
    document.getElementById('dream-title').value = '';
    document.getElementById('dream-content').value = '';
}

function renderDreams() {
    const list = document.getElementById('dreams-list');
    list.innerHTML = '';
    
    userData.dreams.slice().reverse().forEach(dream => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${dream.title}</strong> <small>${dream.date}</small><br>
                ${dream.content.substring(0, 100)}...
            </div>
        `;
        list.appendChild(li);
    });
}

// Work Journal
function addWorkEntry() {
    const content = document.getElementById('work-entry').value.trim();
    if (!content) return;
    
    userData.workEntries.push({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        content: content
    });
    
    saveData();
    renderWork();
    document.getElementById('work-entry').value = '';
}

function renderWork() {
    const list = document.getElementById('work-list');
    list.innerHTML = '';
    
    userData.workEntries.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${entry.date} ${entry.time}</strong><br>${entry.content.substring(0, 150)}...`;
        list.appendChild(li);
    });
    
    document.getElementById('summary-journal').textContent = userData.workEntries.length;
}

// Reports
let activityChartInstance = null;
let productivityChartInstance = null;

function generateReports() {
    // Overview Cards
    const overviewHTML = `
        <div class="card">
            <h3>Total Tasks</h3>
            <div class="card-value">${userData.tasks.length}</div>
        </div>
        <div class="card">
            <h3>Completion Rate</h3>
            <div class="card-value">${userData.tasks.length ? Math.round((userData.tasks.filter(t => t.completed).length / userData.tasks.length) * 100) : 0}%</div>
        </div>
        <div class="card">
            <h3>Total Notes</h3>
            <div class="card-value">${userData.notes.length}</div>
        </div>
        <div class="card">
            <h3>Total Activities</h3>
            <div class="card-value">${userData.activities.length}</div>
        </div>
    `;
    document.querySelector('.report-cards').innerHTML = overviewHTML;
    
    // Reflection
    const totalEntries = userData.tasks.length + userData.notes.length + userData.activities.length + userData.workEntries.length;
    document.getElementById('monthly-reflection').innerHTML = `
        During this period, you completed <strong>${userData.tasks.filter(t => t.completed).length}</strong> tasks, 
        wrote <strong>${userData.notes.length}</strong> notes, recorded <strong>${userData.activities.length}</strong> activities, 
        and maintained <strong>${userData.workEntries.length}</strong> work entries. 
        Keep going — your consistency is building something meaningful.
    `;
    
    // Charts
    renderCharts();
}

function renderCharts() {
    // Destroy old charts
    if (activityChartInstance) activityChartInstance.destroy();
    if (productivityChartInstance) productivityChartInstance.destroy();
    
    // Activity Chart (fake monthly data)
    const ctx1 = document.getElementById('activity-chart');
    activityChartInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Daily Activities',
                data: [12, 19, 8, 15],
                backgroundColor: 'rgba(168, 230, 207, 0.6)',
                borderColor: '#a8e6cf',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
    });
    
    // Productivity Trend
    const ctx2 = document.getElementById('productivity-chart');
    productivityChartInstance = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Productivity',
                data: [65, 78, 82, 71, 88, 92, 85],
                borderColor: '#764ba2',
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });
}

// Export PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Still Life Monthly Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`For user: ${currentUser}`, 20, 35);
    doc.text(new Date().toLocaleDateString(), 20, 45);
    
    doc.text("Summary:", 20, 65);
    doc.text(`Tasks: ${userData.tasks.length}`, 30, 75);
    doc.text(`Notes: ${userData.notes.length}`, 30, 85);
    doc.text(`Activities: ${userData.activities.length}`, 30, 95);
    
    doc.save('StillLife_Report.pdf');
}

// Data persistence
function saveData() {
    if (currentUser) {
        localStorage.setItem(`stillLifeData_${currentUser}`, JSON.stringify(userData));
    }
}

function renderAll() {
    renderTasks();
    renderActivities();
    renderNotes();
    renderDreams();
    renderWork();
}

// Toggle Dark/Light
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    userData.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    saveData();
}

// Profile menu
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('dashboard').classList.contains('hidden')) {
        logout();
    }
});

// Initialize
showLogin();