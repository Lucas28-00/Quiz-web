/**
 * Quiz Player & Results Engine
 * Handles gameplay, countdown timers, keyboard shortcuts, score computation, confetti, and reviews.
 */

document.addEventListener('DOMContentLoaded', () => {
    // URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    // DOM Elements - Quiz View
    const quizView = document.getElementById('quiz-view');
    const resultsView = document.getElementById('results-view');
    const notFoundView = document.getElementById('not-found-view');

    // Header & Meta Elements
    const quizTitleHeader = document.getElementById('quiz-title-header');
    const qCurrentEl = document.getElementById('q-current');
    const qTotalEl = document.getElementById('q-total');
    const timerBox = document.getElementById('timer-box');
    const timerValueEl = document.getElementById('timer-value');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');

    // Question Play Card
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    // Results Elements
    const resultQuizTitle = document.getElementById('result-quiz-title');
    const resultScorePct = document.getElementById('result-score-pct');
    const resultRankBadge = document.getElementById('result-rank-badge');
    const resultCorrectCount = document.getElementById('result-correct-count');
    const resultWrongCount = document.getElementById('result-wrong-count');
    const resultTimeTaken = document.getElementById('result-time-taken');
    const reviewListContainer = document.getElementById('review-list-container');
    const retakeBtn = document.getElementById('retake-btn');
    const shareResultBtn = document.getElementById('share-result-btn');

    // Gameplay State
    let currentQuiz = null;
    let currentIndex = 0;
    let userAnswers = []; // { questionIndex, selectedOptionIndex, isCorrect, timeSpent }
    let score = 0;
    let timerInterval = null;
    let timeLeft = 0;
    let isQuestionLocked = false;
    let quizStartTime = Date.now();

    // Initialize
    initQuiz();
    initSoundToggle();

    function initQuiz() {
        if (!window.quizStore) return;

        if (quizId) {
            currentQuiz = window.quizStore.getQuizById(quizId);
        }

        if (!currentQuiz) {
            const all = window.quizStore.getAllQuizzes();
            if (all.length > 0) {
                currentQuiz = all[0];
            }
        }

        if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
            showNotFound();
            return;
        }

        // Increment play count
        window.quizStore.incrementPlayCount(currentQuiz.id);

        // Setup Quiz Info
        if (quizTitleHeader) quizTitleHeader.textContent = currentQuiz.title;
        if (qTotalEl) qTotalEl.textContent = currentQuiz.questions.length;

        currentIndex = 0;
        score = 0;
        userAnswers = [];
        quizStartTime = Date.now();

        loadQuestion(0);
    }

    function showNotFound() {
        if (quizView) quizView.style.display = 'none';
        if (resultsView) resultsView.style.display = 'none';
        if (notFoundView) notFoundView.style.display = 'block';
    }

    function loadQuestion(index) {
        if (!currentQuiz || index >= currentQuiz.questions.length) {
            finishQuiz();
            return;
        }

        isQuestionLocked = false;
        currentIndex = index;
        const q = currentQuiz.questions[index];

        // Update progress
        if (qCurrentEl) qCurrentEl.textContent = index + 1;
        if (progressBarFill) {
            const pct = ((index) / currentQuiz.questions.length) * 100;
            progressBarFill.style.width = `${pct}%`;
        }

        // Render Question Text
        if (questionTextEl) {
            questionTextEl.textContent = q.question;
        }

        // Render Options
        if (optionsContainer) {
            const letters = ['A', 'B', 'C', 'D'];
            optionsContainer.innerHTML = q.options.map((opt, i) => {
                const letter = letters[i] || `${i + 1}`;
                return `
                    <button class="option-btn" data-index="${i}">
                        <div class="option-letter">${letter}</div>
                        <span>${escapeHTML(opt)}</span>
                    </button>
                `;
            }).join('');

            // Attach click listeners to option buttons
            optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
                    handleAnswerSelection(selectedIdx);
                });
            });
        }

        // Start Timer
        startQuestionTimer();
    }

    function startQuestionTimer() {
        clearInterval(timerInterval);
        const timeLimit = currentQuiz.timeLimit || 0;

        if (timeLimit > 0) {
            if (timerBox) timerBox.style.display = 'flex';
            timeLeft = timeLimit;
            updateTimerDisplay();

            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeOut();
                }
            }, 1000);
        } else {
            if (timerBox) timerBox.style.display = 'none';
        }
    }

    function updateTimerDisplay() {
        if (!timerValueEl) return;
        timerValueEl.textContent = `${timeLeft}s`;

        if (timerBox) {
            if (timeLeft <= 5) {
                timerBox.classList.add('warning');
            } else {
                timerBox.classList.remove('warning');
            }
        }
    }

    function handleTimeOut() {
        if (isQuestionLocked) return;
        isQuestionLocked = true;
        window.soundEngine?.playWrong();

        const q = currentQuiz.questions[currentIndex];

        userAnswers.push({
            question: q.question,
            options: q.options,
            selectedOptionIndex: -1, // Timed out
            correctIndex: q.correctIndex,
            isCorrect: false,
            explanation: q.explanation || ''
        });

        highlightAnswers(-1, q.correctIndex);

        setTimeout(() => {
            loadQuestion(currentIndex + 1);
        }, 1500);
    }

    function handleAnswerSelection(selectedIdx) {
        if (isQuestionLocked) return;
        isQuestionLocked = true;
        clearInterval(timerInterval);

        const q = currentQuiz.questions[currentIndex];
        const isCorrect = selectedIdx === q.correctIndex;

        if (isCorrect) {
            score++;
            window.soundEngine?.playCorrect();
        } else {
            window.soundEngine?.playWrong();
        }

        userAnswers.push({
            question: q.question,
            options: q.options,
            selectedOptionIndex: selectedIdx,
            correctIndex: q.correctIndex,
            isCorrect,
            explanation: q.explanation || ''
        });

        highlightAnswers(selectedIdx, q.correctIndex);

        setTimeout(() => {
            loadQuestion(currentIndex + 1);
        }, 1300);
    }

    function highlightAnswers(selectedIdx, correctIdx) {
        if (!optionsContainer) return;
        const buttons = optionsContainer.querySelectorAll('.option-btn');

        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIdx) {
                btn.classList.add('correct');
            } else if (idx === selectedIdx && selectedIdx !== correctIdx) {
                btn.classList.add('wrong');
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isQuestionLocked || !quizView || quizView.style.display === 'none') return;

        const key = e.key.toUpperCase();
        let selectedIndex = -1;

        if (key === '1' || key === 'A') selectedIndex = 0;
        else if (key === '2' || key === 'B') selectedIndex = 1;
        else if (key === '3' || key === 'C') selectedIndex = 2;
        else if (key === '4' || key === 'D') selectedIndex = 3;

        if (selectedIndex !== -1 && currentQuiz && currentQuiz.questions[currentIndex]) {
            const numOptions = currentQuiz.questions[currentIndex].options.length;
            if (selectedIndex < numOptions) {
                handleAnswerSelection(selectedIndex);
            }
        }
    });

    function finishQuiz() {
        clearInterval(timerInterval);

        if (progressBarFill) progressBarFill.style.width = '100%';
        if (quizView) quizView.style.display = 'none';
        if (resultsView) resultsView.style.display = 'block';

        const totalQuestions = currentQuiz.questions.length;
        const percentage = Math.round((score / totalQuestions) * 100);
        const timeTakenSeconds = Math.round((Date.now() - quizStartTime) / 1000);

        if (resultQuizTitle) resultQuizTitle.textContent = currentQuiz.title;
        if (resultScorePct) resultScorePct.textContent = `${percentage}%`;
        if (resultCorrectCount) resultCorrectCount.textContent = `${score} / ${totalQuestions}`;
        if (resultWrongCount) resultWrongCount.textContent = `${totalQuestions - score}`;
        if (resultTimeTaken) resultTimeTaken.textContent = `${timeTakenSeconds}s`;

        // Rank Badge
        let badgeClass = 'rank-try';
        let badgeText = 'Keep Practicing 🎯';

        if (percentage === 100) {
            badgeClass = 'rank-perfect';
            badgeText = 'Flawless Master! 🏆';
            launchConfetti();
            window.soundEngine?.playVictory();
        } else if (percentage >= 80) {
            badgeClass = 'rank-great';
            badgeText = 'Quiz Whiz! 🌟';
            launchConfetti();
            window.soundEngine?.playVictory();
        } else if (percentage >= 60) {
            badgeClass = 'rank-good';
            badgeText = 'Great Effort! 👏';
        }

        if (resultRankBadge) {
            resultRankBadge.className = `rank-badge ${badgeClass}`;
            resultRankBadge.textContent = badgeText;
        }

        // Render Review Breakdown
        renderReviewList();
    }

    function renderReviewList() {
        if (!reviewListContainer) return;

        reviewListContainer.innerHTML = userAnswers.map((item, idx) => {
            const userPickText = item.selectedOptionIndex >= 0 
                ? item.options[item.selectedOptionIndex] 
                : 'Timed out (No answer)';
            const correctPickText = item.options[item.correctIndex];

            return `
                <div class="review-item ${item.isCorrect ? 'is-correct' : 'is-wrong'}">
                    <div class="review-q-title">
                        <span>${item.isCorrect ? '✅' : '❌'}</span> Q${idx + 1}. ${escapeHTML(item.question)}
                    </div>
                    <div class="review-answers-grid">
                        <div class="review-user-ans">
                            <strong>Your Answer:</strong> ${escapeHTML(userPickText)}
                        </div>
                        ${!item.isCorrect ? `
                            <div class="review-correct-ans">
                                <strong>Correct Answer:</strong> ${escapeHTML(correctPickText)}
                            </div>
                        ` : ''}
                    </div>
                    ${item.explanation ? `
                        <div class="review-explanation">
                            💡 <strong>Explanation:</strong> ${escapeHTML(item.explanation)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Retake Quiz Handler
    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            window.soundEngine?.playClick();
            if (resultsView) resultsView.style.display = 'none';
            if (quizView) quizView.style.display = 'block';
            initQuiz();
        });
    }

    // Share Result Handler
    if (shareResultBtn) {
        shareResultBtn.addEventListener('click', () => {
            window.soundEngine?.playClick();
            const total = currentQuiz ? currentQuiz.questions.length : 0;
            const text = `I just scored ${score}/${total} on "${currentQuiz?.title}" on Quiz Challenge! Can you beat my score? Play here: ${window.location.href}`;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Result copied to clipboard! Share it with friends 🚀', 'success');
                });
            } else {
                prompt('Copy your score to share:', text);
            }
        });
    }

    // Sound toggle in nav
    function initSoundToggle() {
        if (!soundToggleBtn) return;
        updateSoundButtonState();

        soundToggleBtn.addEventListener('click', () => {
            const isEnabled = window.soundEngine.toggleSound();
            updateSoundButtonState();
            if (isEnabled) {
                window.soundEngine.playClick();
                showToast('Sound effects enabled 🔊', 'success');
            } else {
                showToast('Sound effects muted 🔇', 'success');
            }
        });
    }

    function updateSoundButtonState() {
        if (!soundToggleBtn) return;
        const isEnabled = window.soundEngine?.enabled;
        soundToggleBtn.innerHTML = isEnabled 
            ? '<i class="icon">🔊</i>' 
            : '<i class="icon">🔇</i>';
        soundToggleBtn.title = isEnabled ? 'Mute Sound' : 'Enable Sound';
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});

// Canvas Confetti Celebration
function launchConfetti() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width * 0.5,
            y: canvas.height * 0.5,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        });
    }

    let animationFrame;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = 0;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.vx *= 0.98;
            p.rotation += p.rotSpeed;
            p.opacity -= 0.012;

            if (p.opacity > 0) {
                active++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });

        if (active > 0) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.remove();
        }
    }

    animate();
}

// Toast Helper
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
