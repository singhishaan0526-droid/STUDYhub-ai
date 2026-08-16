# Scaffold StudyHub AI Project

$projectName = "studyhub-ai"
New-Item -ItemType Directory -Force -Path $projectName
Set-Location $projectName

# Backend Setup
Write-Host "Setting up backend..."
New-Item -ItemType Directory -Force -Path "backend"
Set-Location "backend"
npm init -y
# We won't install dependencies right now to save time, just create structure
New-Item -ItemType Directory -Force -Path "src"
New-Item -ItemType Directory -Force -Path "src\config"
New-Item -ItemType Directory -Force -Path "src\controllers"
New-Item -ItemType Directory -Force -Path "src\middlewares"
New-Item -ItemType Directory -Force -Path "src\models"
New-Item -ItemType Directory -Force -Path "src\routes"
New-Item -ItemType Directory -Force -Path "src\utils"
New-Item -ItemType Directory -Force -Path "src\services"

Set-Content -Path ".env" -Value "PORT=5000`nDATABASE_URL=postgres://user:password@localhost:5432/studyhub`nJWT_SECRET=your_jwt_secret`nGEMINI_API_KEY=your_gemini_api_key"
Set-Content -Path "src\server.js" -Value "const app = require('./app');`nconst PORT = process.env.PORT || 5000;`n`napp.listen(PORT, () => {`n  console.log(\`Server running on port \${PORT}\`);`n});"
Set-Content -Path "src\app.js" -Value "const express = require('express');`nconst app = express();`n`napp.use(express.json());`n`n// Routes will go here`n`nmodule.exports = app;"

Set-Location ..

# Frontend Setup
Write-Host "Setting up frontend..."
npx -y create-vite@latest frontend --template react
Set-Location "frontend"
# Set up directories
New-Item -ItemType Directory -Force -Path "src\assets"
New-Item -ItemType Directory -Force -Path "src\components"
New-Item -ItemType Directory -Force -Path "src\components\common"
New-Item -ItemType Directory -Force -Path "src\components\layout"
New-Item -ItemType Directory -Force -Path "src\context"
New-Item -ItemType Directory -Force -Path "src\hooks"
New-Item -ItemType Directory -Force -Path "src\pages"
New-Item -ItemType Directory -Force -Path "src\services"
New-Item -ItemType Directory -Force -Path "src\utils"

# Create minimal files for pages
$pages = @("Home", "Login", "Register", "Dashboard", "NotesGenerator", "QuestionGenerator", "ExamGenerator", "DoubtAssistant", "Profile")
foreach ($page in $pages) {
    Set-Content -Path "src\pages\$page.jsx" -Value "import React from 'react';`n`nexport default function $page() {`n  return (<div>$page Page</div>);`n}"
}

# Create App.jsx with routing
$appJsx = @"
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotesGenerator from './pages/NotesGenerator';
import QuestionGenerator from './pages/QuestionGenerator';
import ExamGenerator from './pages/ExamGenerator';
import DoubtAssistant from './pages/DoubtAssistant';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<NotesGenerator />} />
        <Route path="/questions" element={<QuestionGenerator />} />
        <Route path="/exam" element={<ExamGenerator />} />
        <Route path="/doubt" element={<DoubtAssistant />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
"@

Set-Content -Path "src\App.jsx" -Value $appJsx

# Setup Tailwind structure placeholder
Set-Content -Path "tailwind.config.js" -Value "/** @type {import('tailwindcss').Config} */`nexport default {`n  content: [`n    './index.html',`n    './src/**/*.{js,ts,jsx,tsx}',`n  ],`n  theme: {`n    extend: {},`n  },`n  plugins: [],`n}"
Set-Content -Path "src\index.css" -Value "@tailwind base;`n@tailwind components;`n@tailwind utilities;"

Set-Location ..

Write-Host "Setup complete!"
