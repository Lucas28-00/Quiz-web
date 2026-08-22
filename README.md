# ⚡ QuizCraft — Interactive Web Quiz Platform

A modern, responsive, and feature-packed web application for creating, discovering, publishing, and playing interactive trivia and knowledge quizzes.

---

## 🌟 Key Features

### 1. 🔍 Explore & Search Hub (`index.html`)
- **Real-time Search**: Search quizzes dynamically across titles, descriptions, categories, and creators.
- **Category & Difficulty Filters**: Filter quizzes by topic (*Geography, Technology, Science, General Knowledge, History, Entertainment*) and difficulty levels (*Easy, Medium, Hard*).
- **Flexible Sorting**: Sort by newest, most played, question count, or alphabetical order.
- **Interactive Stats**: Live counter showing total available quizzes, questions, and plays.
- **Direct Management**: Delete, preview, and play quizzes directly with immediate persistence.

### 2. ✍️ Quiz Creator Studio (`create.html`)
- **Dynamic Question Builder**: Add multiple questions, configure 2 to 6 custom answer choices per question, and select the correct option with one click.
- **Custom Explanations**: Provide learning explanations that display after answering.
- **Timer Configuration**: Set customized countdown timers per question or allow untimed quizzes.
- **Sample Template Loader**: Quickly populate a template with one click to preview formatting.
- **Validation**: Form validation ensuring complete answers, selected correct choices, and clean data formatting.

### 3. 🎮 Interactive Player Engine (`play.html`)
- **Animated Question Flow**: Smooth transitions between questions with instant visual feedback (correct/incorrect highlighting).
- **Countdown Timers & Progress**: Real-time progress bar and optional animated countdown timer per question.
- **Web Audio Sound Effects**: Integrated synthesizer for audio cues on correct answers, wrong answers, ticking timers, completions, and button interactions (with mute toggle).
- **Detailed Results Breakdown**: Score summary, accuracy percentage, time taken, and review of all answered questions with explanations.
- **Sharing & Replay**: Copy shareable links and replay immediately.

### 4. 💾 Local Persistence & Seed Quizzes (`js/storage.js`)
- Persisted to browser `localStorage` so custom quizzes remain available across sessions.
- Pre-populated with diverse trivia sets covering Geography, Technology, Science, and General Knowledge.

---

## 📁 Repository Structure

```text
Quiz-web/
├── index.html           # Main explore and discovery catalog
├── create.html          # Quiz Creator Studio
├── play.html            # Interactive gameplay engine & score breakdown
├── HOME.html            # Seamless legacy redirect to index.html
├── Page.html            # Seamless legacy redirect to play.html
├── css/
│   └── style.css        # Modern design system (dark mode, glassmorphism, animations)
├── js/
│   ├── app.js           # Catalog logic, filtering, search, stats
│   ├── audio.js         # Web Audio API sound generator & FX engine
│   ├── create.js        # Form validation, question builder, publishing logic
│   ├── play.js          # Game loop, timer, feedback, score calculation
│   └── storage.js       # LocalStorage CRUD and default quiz dataset
├── LICENSE              # Project license
└── README.md            # Documentation
```

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve locally using any static server (e.g. VS Code Live Server, `npx serve`, or Python HTTP server):

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Navigate to `http://localhost:8000` to start exploring and creating quizzes!
