// API Base URL
const API_URL = window.location.origin;

// App State
let currentUser = null;
let userProgress = null;
let challenges = [];

// Initialize App
async function init() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/auth/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            await loadUserData();
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Init error:', error);
        showLogin();
    }
}

// Show Loading
function showLoading() {
    document.getElementById('app').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p style="margin-top: 1rem;">Loading...</p>
        </div>
    `;
}

// Show Login
function showLogin() {
    document.getElementById('app').innerHTML = `
        <div class="login-screen">
            <div class="login-box">
                <i class="fas fa-brain"></i>
                <h1>Tech Mastery</h1>
                <p>Your Journey to Becoming a Tech Genius</p>
                
                <button class="btn-google" onclick="loginWithGoogle()">
                    <i class="fab fa-google"></i>
                    Sign in with Google
                </button>
                
                <p style="margin: 1rem 0; color: #999;">OR</p>
                
                <input type="text" id="nicknameInput" placeholder="Enter your nickname" maxlength="20">
                <button class="btn-simple" onclick="simpleLogin()">
                    Quick Start (No Google)
                </button>
            </div>
        </div>
    `;
}

// Login with Google
function loginWithGoogle() {
    window.location.href = `${API_URL}/auth/google`;
}

// Simple Login
async function simpleLogin() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    
    if (!nickname) {
        alert('Please enter a nickname!');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/api/auth/simple-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ nickname })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            await loadUserData();
            showDashboard();
        } else {
            alert('Login failed: ' + data.error);
            showLogin();
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
        showLogin();
    }
}

// Load User Data
async function loadUserData() {
    try {
        const response = await fetch(`${API_URL}/api/user/progress`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            userProgress = data.progress;
        } else {
            userProgress = {
                totalPoints: 0,
                completedChallenges: [],
                completedFields: [],
                currentStreak: 0
            };
        }
    } catch (error) {
        console.error('Load user data error:', error);
    }
}

// Load Challenges
async function loadChallenges(difficulty = null) {
    try {
        const url = difficulty 
            ? `${API_URL}/api/challenges?difficulty=${difficulty}&limit=20`
            : `${API_URL}/api/challenges?limit=20`;
            
        const response = await fetch(url, { credentials: 'include' });
        const data = await response.json();
        challenges = data.challenges;
        return challenges;
    } catch (error) {
        console.error('Load challenges error:', error);
        return [];
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="app">
            <nav class="navbar">
                <div class="nav-brand">
                    <i class="fas fa-brain"></i>
                    <span>Tech Mastery</span>
                </div>
                <div class="nav-user">
                    <span>👋 ${currentUser.nickname}</span>
                    <button onclick="logout()" style="padding: 0.5rem 1rem;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </nav>
            
            <aside class="sidebar">
                <ul>
                    <li class="active" onclick="showSection('dashboard')">
                        <i class="fas fa-home"></i> Dashboard
                    </li>
                    <li onclick="showSection('fields')">
                        <i class="fas fa-code"></i> Tech Fields (8)
                    </li>
                    <li onclick="showSection('challenges')">
                        <i class="fas fa-trophy"></i> Challenges (500+)
                    </li>
                    <li onclick="showSection('playground')">
                        <i class="fas fa-play"></i> Code Playground
                    </li>
                    <li onclick="showSection('genius')">
                        <i class="fas fa-brain"></i> Genius Exercises
                    </li>
                    <li onclick="showSection('missions')">
                        <i class="fas fa-rocket"></i> Missions
                    </li>
                    <li onclick="showSection('hackathons')">
                        <i class="fas fa-laptop-code"></i> Hackathons
                    </li>
                    <li onclick="showSection('playlist')">
                        <i class="fas fa-music"></i> Playlist (60+)
                    </li>
                    <li onclick="showSection('news')">
                        <i class="fas fa-newspaper"></i> Tech News
                    </li>
                    <li onclick="showSection('achievements')">
                        <i class="fas fa-medal"></i> Achievements
                    </li>
                    <li onclick="showSection('certificate')">
                        <i class="fas fa-certificate"></i> Certificate
                    </li>
                </ul>
            </aside>
            
            <main class="content" id="content">
                ${getDashboardHTML()}
            </main>
        </div>
    `;
}

// Logout
async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { credentials: 'include' });
        currentUser = null;
        userProgress = null;
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show Section
function showSection(section) {
    const items = document.querySelectorAll('.sidebar li');
    items.forEach(item => item.classList.remove('active'));
    event.target.closest('li').classList.add('active');
    
    const content = document.getElementById('content');
    
    switch(section) {
        case 'dashboard':
            content.innerHTML = getDashboardHTML();
            break;
        case 'fields':
            content.innerHTML = getFieldsHTML();
            break;
        case 'challenges':
            showChallengesSection();
            break;
        case 'playground':
            content.innerHTML = getPlaygroundHTML();
            break;
        case 'genius':
            content.innerHTML = getGeniusHTML();
            break;
        case 'missions':
            content.innerHTML = getMissionsHTML();
            break;
        case 'hackathons':
            content.innerHTML = getHackathonsHTML();
            break;
        case 'playlist':
            content.innerHTML = getPlaylistHTML();
            break;
        case 'news':
            content.innerHTML = getNewsHTML();
            break;
        case 'achievements':
            content.innerHTML = getAchievementsHTML();
            break;
        case 'certificate':
            content.innerHTML = getCertificateHTML();
            break;
    }
}

// Dashboard HTML
function getDashboardHTML() {
    return `
        <h1>Welcome back, ${currentUser.nickname}! 🚀</h1>
        <p style="margin-bottom: 2rem; color: #64748b;">Your journey to becoming a tech genius continues...</p>
        
        <div class="grid">
            <div class="card">
                <h3>Total Points</h3>
                <h2 style="font-size: 3rem; color: var(--primary);">${userProgress.totalPoints}</h2>
            </div>
            <div class="card">
                <h3>Challenges Completed</h3>
                <h2 style="font-size: 3rem; color: var(--success);">${userProgress.completedChallenges.length}/500</h2>
            </div>
            <div class="card">
                <h3>Current Streak</h3>
                <h2 style="font-size: 3rem; color: var(--danger);">${userProgress.currentStreak} days</h2>
            </div>
        </div>
        
        <div class="card">
            <h3>Quick Start</h3>
            <div class="grid" style="margin-top: 1rem;">
                <button class="btn-primary" onclick="showSection('fields')">
                    📚 Explore Tech Fields
                </button>
                <button class="btn-success" onclick="showSection('challenges')">
                    🎯 Start Challenges
                </button>
                <button class="btn-primary" onclick="showSection('playground')">
                    💻 Code Playground
                </button>
            </div>
        </div>
    `;
}

// Tech Fields HTML
function getFieldsHTML() {
    const fields = [
        { name: 'Web Development', icon: 'fa-globe', desc: 'HTML, CSS, JavaScript, React, Node.js' },
        { name: 'Data Science & AI', icon: 'fa-robot', desc: 'Python, ML, Deep Learning, TensorFlow' },
        { name: 'Mobile Development', icon: 'fa-mobile-alt', desc: 'React Native, Flutter, iOS, Android' },
        { name: 'Cloud & DevOps', icon: 'fa-cloud', desc: 'AWS, Docker, Kubernetes, CI/CD' },
        { name: 'Cybersecurity', icon: 'fa-shield-alt', desc: 'Ethical Hacking, Penetration Testing' },
        { name: 'Blockchain & Web3', icon: 'fa-link', desc: 'Solidity, Smart Contracts, DeFi' },
        { name: 'Game Development', icon: 'fa-gamepad', desc: 'Unity, Unreal Engine, Game Design' },
        { name: 'UI/UX Design', icon: 'fa-palette', desc: 'Figma, Design Principles, Prototyping' }
    ];
    
    return `
        <h1>Master 8 Tech Fields 🎯</h1>
        <p style="margin-bottom: 2rem; color: #64748b;">Choose your path to genius</p>
        <div class="grid">
            ${fields.map(field => `
                <div class="card">
                    <i class="fas ${field.icon}" style="font-size: 2rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <h3>${field.name}</h3>
                    <p style="color: #64748b; margin: 1rem 0;">${field.desc}</p>
                    <button class="btn-success" style="width: 100%;">
                        <i class="fas fa-play"></i> Start Learning
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// Challenges Section
async function showChallengesSection() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    await loadChallenges();
    
    content.innerHTML = `
        <h1>500+ Coding Challenges 💪</h1>
        <p style="margin-bottom: 2rem; color: #64748b;">Test your skills and earn points</p>
        
        <div class="card">
            <h3>Filter by Difficulty</h3>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="btn-success" onclick="filterChallenges('Beginner')">Beginner (150)</button>
                <button class="btn-warning" onclick="filterChallenges('Intermediate')">Intermediate (200)</button>
                <button class="btn-danger" onclick="filterChallenges('Advanced')">Advanced (150)</button>
            </div>
        </div>
        
        <div id="challengesList">
            ${challenges.slice(0, 10).map(challenge => `
                <div class="card">
                    <h3>${challenge.title}</h3>
                    <p style="color: #64748b; margin: 0.5rem 0;">${challenge.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span class="badge badge-${challenge.difficulty === 'Beginner' ? 'success' : challenge.difficulty === 'Intermediate' ? 'warning' : 'danger'}">
                            ${challenge.difficulty} - ${challenge.points} pts
                        </span>
                        <button class="btn-primary" onclick="startChallenge('${challenge._id}')">
                            Start Challenge
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter Challenges
async function filterChallenges(difficulty) {
    const list = document.getElementById('challengesList');
    list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    await loadChallenges(difficulty);
    
    list.innerHTML = challenges.slice(0, 10).map(challenge => `
        <div class="card">
            <h3>${challenge.title}</h3>
            <p style="color: #64748b; margin: 0.5rem 0;">${challenge.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <span>⏱️ ${challenge.timeLimit} | ${challenge.points} points</span>
                <button class="btn-primary" onclick="startChallenge('${challenge._id}')">
                    Start Challenge
                </button>
            </div>
        </div>
    `).join('');
}

// Start Challenge
function startChallenge(challengeId) {
    const challenge = challenges.find(c => c._id === challengeId);
    if (challenge) {
        alert(`Starting: ${challenge.title}\n\nDifficulty: ${challenge.difficulty}\nPoints: ${challenge.points}\nTime Limit: ${challenge.timeLimit}\n\nGood luck!`);
    }
}

// Code Playground HTML
function getPlaygroundHTML() {
    return `
        <h1>Interactive Code Playground 💻</h1>
        <div class="card">
            <h3>JavaScript Code Editor</h3>
            <textarea id="codeArea">// Write your JavaScript code here
console.log('Hello, Tech Genius!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci(10):', fibonacci(10));</textarea>
            <button class="btn-success" onclick="runCode()">
                <i class="fas fa-play"></i> Run Code
            </button>
            <div class="output" id="output">Output will appear here...</div>
        </div>
    `;
}

// Run Code
async function runCode() {
    const code = document.getElementById('codeArea').value;
    const output = document.getElementById('output');
    
    output.textContent = 'Running...';
    
    try {
        const response = await fetch(`${API_URL}/api/execute-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code, language: 'javascript' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            output.textContent = data.output;
        } else {
            output.textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        output.textContent = 'Error: ' + error.message;
    }
}

// Other sections (simplified for now)
function getGeniusHTML() {
    return '<h1>Genius Exercises 🧠</h1><div class="card"><h3>5 Expert-Level Challenges</h3><p>Coming soon...</p></div>';
}

function getMissionsHTML() {
    return '<h1>Epic Missions 🚀</h1><div class="card"><h3>5 Long-term Projects</h3><p>Coming soon...</p></div>';
}

function getHackathonsHTML() {
    return '<h1>Hackathons 🏆</h1><div class="card"><h3>5 Upcoming Competitions</h3><p>Coming soon...</p></div>';
}

function getPlaylistHTML() {
    return '<h1>Tech Playlist 🎵</h1><div class="card"><h3>60+ Coding Songs</h3><p>Coming soon...</p></div>';
}

function getNewsHTML() {
    return '<h1>Tech News 📰</h1><div class="card"><h3>Latest Updates</h3><p>Coming soon...</p></div>';
}

function getAchievementsHTML() {
    return '<h1>Achievements 🏅</h1><div class="card"><h3>10 Achievement Badges</h3><p>Coming soon...</p></div>';
}

function getCertificateHTML() {
    return `
        <h1>Your Certificate 🎓</h1>
        <div class="card" style="text-align: center; padding: 3rem;">
            <i class="fas fa-certificate" style="font-size: 4rem; color: var(--primary);"></i>
            <h2 style="margin: 2rem 0;">Certificate of Excellence</h2>
            <h1 style="color: var(--primary);">${currentUser.nickname}</h1>
            <p style="margin-top: 2rem;">Tech Mastery Program</p>
            <p style="color: #64748b; margin-top: 1rem;">Total Points: ${userProgress.totalPoints}</p>
        </div>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);