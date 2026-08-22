/**
 * Quiz Storage Engine & Data Management
 * Handles local persistence, preloaded quiz seeds, search filtering, and CRUD operations.
 */

const STORAGE_KEY = 'quizcraft_quizzes_v1';

const DEFAULT_QUIZZES = [
    {
        id: 'quiz-geo-1',
        title: 'World Capitals & Landmarks Challenge',
        description: 'Test your knowledge of global geography, famous cities, world capitals, and historical landmarks!',
        category: 'Geography',
        difficulty: 'Easy',
        creator: 'GlobeTrotter',
        timeLimit: 20, // seconds per question, 0 for untimed
        plays: 42,
        createdAt: '2026-08-15T10:00:00.000Z',
        questions: [
            {
                id: 'q1-1',
                question: 'What is the capital city of Uganda?',
                options: ['Nairobi', 'Kampala', 'Kigali', 'Dodoma'],
                correctIndex: 1,
                explanation: 'Kampala is the capital and largest city of Uganda, located in the south-central part of the country.'
            },
            {
                id: 'q1-2',
                question: 'Which is the longest river in the world?',
                options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
                correctIndex: 1,
                explanation: 'The Nile River in Africa is traditionally recognized as the longest river in the world (approx 6,650 km).'
            },
            {
                id: 'q1-3',
                question: 'In which city can you visit the ancient Colosseum?',
                options: ['Athens', 'Madrid', 'Rome', 'Paris'],
                correctIndex: 2,
                explanation: 'The Colosseum is an iconic oval amphitheatre situated in the centre of Rome, Italy.'
            },
            {
                id: 'q1-4',
                question: 'What is the smallest country in the world by land area?',
                options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
                correctIndex: 2,
                explanation: 'Vatican City is the smallest independent state in the world, covering an area of just 0.49 square kilometers.'
            }
        ]
    },
    {
        id: 'quiz-tech-1',
        title: 'Modern Web Development Essentials',
        description: 'Challenge your JavaScript, HTML5, CSS3, and browser API skills in this quickfire dev quiz.',
        category: 'Technology',
        difficulty: 'Medium',
        creator: 'DevMaster',
        timeLimit: 25,
        plays: 89,
        createdAt: '2026-08-18T14:30:00.000Z',
        questions: [
            {
                id: 'q2-1',
                question: 'Which CSS property is used to create a glassmorphism frosted glass effect?',
                options: ['background-filter', 'backdrop-filter', 'glass-effect', 'filter-blur'],
                correctIndex: 1,
                explanation: 'backdrop-filter: blur(...) applies graphical effects like blurring to the area behind an element.'
            },
            {
                id: 'q2-2',
                question: 'What does the JavaScript "=== " operator check for?',
                options: ['Equality of value only', 'Assignment of values', 'Equality of value and data type', 'Reference identity only'],
                correctIndex: 2,
                explanation: 'Strict equality (===) checks both value and type without performing type coercion.'
            },
            {
                id: 'q2-3',
                question: 'Where is data stored permanently in the browser until explicitly cleared by user or app?',
                options: ['sessionStorage', 'cookies', 'localStorage', 'RAM Cache'],
                correctIndex: 2,
                explanation: 'localStorage persists key-value data across browser sessions and tabs without expiration time.'
            },
            {
                id: 'q2-4',
                question: 'Which HTML5 semantic element should encapsulate primary page content navigation links?',
                options: ['<menu>', '<nav>', '<links>', '<header>'],
                correctIndex: 1,
                explanation: 'The <nav> element represents a section of a page that links to other pages or parts within the page.'
            }
        ]
    },
    {
        id: 'quiz-sci-1',
        title: 'Cosmos & Scientific Wonders',
        description: 'Explore the mysteries of our solar system, physics, chemistry, and biology.',
        category: 'Science',
        difficulty: 'Medium',
        creator: 'AstroGeek',
        timeLimit: 20,
        plays: 57,
        createdAt: '2026-08-20T08:15:00.000Z',
        questions: [
            {
                id: 'q3-1',
                question: 'Which planet in our solar system is known as the "Red Planet"?',
                options: ['Venus', 'Jupiter', 'Mars', 'Mercury'],
                correctIndex: 2,
                explanation: 'Mars appears reddish because of the large amount of iron oxide (rust) on its surface rocks and soil.'
            },
            {
                id: 'q3-2',
                question: 'What is known as the powerhouse of the biological cell?',
                options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'],
                correctIndex: 1,
                explanation: 'Mitochondria generate most of the chemical energy needed to power the cell\'s biochemical reactions (ATP).'
            },
            {
                id: 'q3-3',
                question: 'What is the chemical symbol for Gold on the periodic table?',
                options: ['Ag', 'Fe', 'Au', 'Gd'],
                correctIndex: 2,
                explanation: 'Au comes from the Latin word "aurum", which means shining dawn or gold.'
            }
        ]
    },
    {
        id: 'quiz-gen-1',
        title: 'Master Trivia: General Knowledge',
        description: 'A fun mix of pop culture, general facts, and everyday curiosities to test your wit.',
        category: 'General',
        difficulty: 'Easy',
        creator: 'Quizzy',
        timeLimit: 15,
        plays: 134,
        createdAt: '2026-08-21T12:00:00.000Z',
        questions: [
            {
                id: 'q4-1',
                question: 'How many days are there in a leap year?',
                options: ['364', '365', '366', '367'],
                correctIndex: 2,
                explanation: 'A leap year has 366 days instead of 365, with an extra day added to February (29th).'
            },
            {
                id: 'q4-2',
                question: 'Which mythical bird rises from its own ashes?',
                options: ['Griffin', 'Phoenix', 'Pegasus', 'Thunderbird'],
                correctIndex: 1,
                explanation: 'In Greek and ancient folklore, the Phoenix cyclically regenerates or is born again from ashes.'
            },
            {
                id: 'q4-3',
                question: 'What is the hardest natural substance on Earth?',
                options: ['Titanium', 'Diamond', 'Granite', 'Quartz'],
                correctIndex: 1,
                explanation: 'Diamond is the hardest naturally occurring mineral, scoring 10 on the Mohs scale of hardness.'
            }
        ]
    }
];

class QuizStore {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
        }
    }

    getAllQuizzes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Error reading quizzes from localStorage:', e);
            return DEFAULT_QUIZZES;
        }
    }

    getQuizById(id) {
        const quizzes = this.getAllQuizzes();
        return quizzes.find(q => q.id === id) || null;
    }

    saveQuiz(quizData) {
        const quizzes = this.getAllQuizzes();
        const existingIdx = quizzes.findIndex(q => q.id === quizData.id);

        if (existingIdx !== -1) {
            quizzes[existingIdx] = {
                ...quizzes[existingIdx],
                ...quizData,
                updatedAt: new Date().toISOString()
            };
        } else {
            const newQuiz = {
                id: quizData.id || 'quiz-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                plays: 0,
                createdAt: new Date().toISOString(),
                ...quizData
            };
            quizzes.unshift(newQuiz);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
        return true;
    }

    deleteQuiz(id) {
        let quizzes = this.getAllQuizzes();
        quizzes = quizzes.filter(q => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
        return true;
    }

    incrementPlayCount(id) {
        const quizzes = this.getAllQuizzes();
        const quiz = quizzes.find(q => q.id === id);
        if (quiz) {
            quiz.plays = (quiz.plays || 0) + 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
        }
    }

    searchQuizzes({ query = '', category = 'All', difficulty = 'All', sortBy = 'newest' } = {}) {
        let list = this.getAllQuizzes();

        // Query filter
        if (query.trim()) {
            const q = query.toLowerCase().trim();
            list = list.filter(item => 
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                (item.creator && item.creator.toLowerCase().includes(q)) ||
                (item.category && item.category.toLowerCase().includes(q))
            );
        }

        // Category filter
        if (category && category !== 'All') {
            list = list.filter(item => item.category && item.category.toLowerCase() === category.toLowerCase());
        }

        // Difficulty filter
        if (difficulty && difficulty !== 'All') {
            list = list.filter(item => item.difficulty && item.difficulty.toLowerCase() === difficulty.toLowerCase());
        }

        // Sorting
        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === 'popular') {
            list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        } else if (sortBy === 'questions') {
            list.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
        } else if (sortBy === 'title') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        }

        return list;
    }

    getPlatformStats() {
        const quizzes = this.getAllQuizzes();
        const totalQuizzes = quizzes.length;
        const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions ? q.questions.length : 0), 0);
        const totalPlays = quizzes.reduce((sum, q) => sum + (q.plays || 0), 0);

        return { totalQuizzes, totalQuestions, totalPlays };
    }

    resetToDefaults() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
    }

    exportJSON() {
        return localStorage.getItem(STORAGE_KEY) || '[]';
    }

    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
}

window.quizStore = new QuizStore();
