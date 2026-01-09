const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'tech-mastery-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-mastery';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  nickname: String,
  avatar: String,
  progress: {
    totalPoints: { type: Number, default: 0 },
    completedChallenges: [Number],
    completedFields: [Number],
    completedMissions: [Number],
    currentStreak: { type: Number, default: 0 },
    lastActive: Date
  },
  achievements: [Number],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Challenge Schema
const challengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  category: String,
  points: Number,
  timeLimit: String,
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  starterCode: String
});

const Challenge = mongoose.model('Challenge', challengeSchema);

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          nickname: profile.displayName,
          avatar: profile.photos[0].value
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Simple Auth (for testing without Google OAuth)
app.post('/api/auth/simple-login', async (req, res) => {
  try {
    const { nickname } = req.body;
    
    if (!nickname) {
      return res.status(400).json({ error: 'Nickname required' });
    }

    let user = await User.findOne({ nickname });
    
    if (!user) {
      user = await User.create({
        nickname,
        email: `${nickname}@techmastery.local`
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Routes
app.get('/api/user/progress', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await User.findById(req.user.id);
    res.json({ progress: user.progress, achievements: user.achievements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/update-progress', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { challengeId, points } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.progress.completedChallenges.includes(challengeId)) {
      user.progress.completedChallenges.push(challengeId);
      user.progress.totalPoints += points;
      user.progress.lastActive = new Date();
      
      await user.save();
    }

    res.json({ success: true, progress: user.progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Challenge Routes
app.get('/api/challenges', async (req, res) => {
  try {
    const { difficulty, category, limit = 50 } = req.query;
    
    let query = {};
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    const challenges = await Challenge.find(query).limit(parseInt(limit));
    res.json({ challenges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Code Execution Route
app.post('/api/execute-code', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (language !== 'javascript') {
      return res.status(400).json({ error: 'Only JavaScript supported currently' });
    }

    // Simple code execution (in production, use sandboxed environment)
    let output = [];
    const originalLog = console.log;
    
    console.log = (...args) => {
      output.push(args.join(' '));
    };

    try {
      eval(code);
      console.log = originalLog;
      res.json({ success: true, output: output.join('\n') || 'Code executed successfully!' });
    } catch (execError) {
      console.log = originalLog;
      res.json({ success: false, error: execError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed initial challenges
async function seedChallenges() {
  const count = await Challenge.countDocuments();
  
  if (count === 0) {
    console.log('🌱 Seeding challenges...');
    
    const challenges = [];
    
    // Beginner challenges
    for (let i = 1; i <= 150; i++) {
      challenges.push({
        title: `Beginner Challenge ${i}`,
        description: `Solve this beginner-level coding problem to build your foundation. Challenge ${i} focuses on basic programming concepts.`,
        difficulty: 'Beginner',
        category: ['Web Development', 'Data Science & AI', 'Mobile Development'][i % 3],
        points: 10,
        timeLimit: '30 mins',
        starterCode: '// Write your solution here\nfunction solution() {\n  \n}'
      });
    }
    
    // Intermediate challenges
    for (let i = 1; i <= 200; i++) {
      challenges.push({
        title: `Intermediate Challenge ${i}`,
        description: `Take your skills to the next level with this intermediate challenge. Apply advanced concepts and algorithms.`,
        difficulty: 'Intermediate',
        category: ['Cloud & DevOps', 'Cybersecurity', 'Blockchain & Web3'][i % 3],
        points: 25,
        timeLimit: '60 mins',
        starterCode: '// Write your solution here\nfunction solution() {\n  \n}'
      });
    }
    
    // Advanced challenges
    for (let i = 1; i <= 150; i++) {
      challenges.push({
        title: `Advanced Challenge ${i}`,
        description: `Master-level challenge for true tech geniuses. Requires deep understanding of algorithms and data structures.`,
        difficulty: 'Advanced',
        category: ['Game Development', 'UI/UX Design', 'Web Development'][i % 3],
        points: 50,
        timeLimit: '120 mins',
        starterCode: '// Write your solution here\nfunction solution() {\n  \n}'
      });
    }
    
    await Challenge.insertMany(challenges);
    console.log('✅ Seeded 500 challenges!');
  }
}

seedChallenges();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tech Mastery Backend is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});