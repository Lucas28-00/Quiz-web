/**
 * App Controller for Home / Explore View
 * Handles search, filters, sorting, stats counter, cards rendering, and quiz deletion/sharing.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const categoryChipsContainer = document.getElementById('category-chips');
    const quizGrid = document.getElementById('quiz-grid');
    const resultsCountEl = document.getElementById('results-count');
    
    // Stats Elements
    const statQuizzes = document.getElementById('stat-quizzes');
    const statQuestions = document.getElementById('stat-questions');
    const statPlays = document.getElementById('stat-plays');

    // Modals & UI
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');

    let currentCategory = 'All';
    let quizToDeleteId = null;

    // Initialize View
    initCategories();
    updateStats();
    renderQuizzes();
    initSoundToggle();

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderQuizzes();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            window.soundEngine?.playClick();
            renderQuizzes();
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', () => {
            window.soundEngine?.playClick();
            renderQuizzes();
        });
    }

    // Category Chips
    function initCategories() {
        if (!categoryChipsContainer) return;
        const chips = categoryChipsContainer.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                window.soundEngine?.playClick();
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentCategory = chip.getAttribute('data-category') || 'All';
                renderQuizzes();
            });
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

    // Update Platform Stats
    function updateStats() {
        if (!window.quizStore) return;
        const stats = window.quizStore.getPlatformStats();
        if (statQuizzes) statQuizzes.textContent = stats.totalQuizzes;
        if (statQuestions) statQuestions.textContent = stats.totalQuestions;
        if (statPlays) statPlays.textContent = stats.totalPlays;
    }

    // Render Quizzes Grid
    function renderQuizzes() {
        if (!quizGrid || !window.quizStore) return;

        const query = searchInput ? searchInput.value : '';
        const sortBy = sortSelect ? sortSelect.value : 'newest';
        const difficulty = difficultySelect ? difficultySelect.value : 'All';

        const quizzes = window.quizStore.searchQuizzes({
            query,
            category: currentCategory,
            difficulty,
            sortBy
        });

        if (resultsCountEl) {
            resultsCountEl.textContent = `${quizzes.length} quiz${quizzes.length === 1 ? '' : 'zes'} found`;
        }

        if (quizzes.length === 0) {
            quizGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">No Quizzes Found</div>
                    <div class="empty-subtitle">We couldn't find any quiz matching your search criteria. Try a different query or create your own!</div>
                    <a href="create.html" class="btn btn-primary">
                        <span>✨ Create a New Quiz</span>
                    </a>
                </div>
            `;
            return;
        }

        quizGrid.innerHTML = quizzes.map(quiz => {
            const categoryIcon = getCategoryIcon(quiz.category);
            const difficultyClass = getDifficultyClass(quiz.difficulty);
            const questionCount = quiz.questions ? quiz.questions.length : 0;
            const creatorInitial = (quiz.creator || 'A').charAt(0).toUpperCase();

            return `
                <div class="quiz-card" data-id="${quiz.id}">
                    <div>
                        <div class="quiz-card-top">
                            <span class="quiz-category-tag">${categoryIcon} ${quiz.category || 'General'}</span>
                            <span class="difficulty-badge ${difficultyClass}">${quiz.difficulty || 'Medium'}</span>
                        </div>
                        <h3 class="quiz-title">${escapeHTML(quiz.title)}</h3>
                        <p class="quiz-desc">${escapeHTML(quiz.description || 'No description provided.')}</p>
                    </div>

                    <div>
                        <div class="quiz-meta-row">
                            <div class="quiz-meta-item" title="Number of questions">
                                <span>❓</span>
                                <strong>${questionCount} Qs</strong>
                            </div>
                            <div class="quiz-meta-item" title="Time limit per question">
                                <span>⏱️</span>
                                <span>${quiz.timeLimit > 0 ? quiz.timeLimit + 's / Q' : 'Untimed'}</span>
                            </div>
                            <div class="quiz-meta-item" title="Total plays">
                                <span>👥</span>
                                <span>${quiz.plays || 0} plays</span>
                            </div>
                        </div>

                        <div class="quiz-card-footer">
                            <div class="creator-info">
                                <div class="creator-avatar">${creatorInitial}</div>
                                <span>${escapeHTML(quiz.creator || 'Anonymous')}</span>
                            </div>
                            <div style="display: flex; gap: 0.4rem;">
                                <button class="btn-icon btn-share" data-id="${quiz.id}" title="Share Quiz Link">
                                    🔗
                                </button>
                                <button class="btn-icon btn-delete" data-id="${quiz.id}" title="Delete Quiz">
                                    🗑️
                                </button>
                                <a href="play.html?id=${encodeURIComponent(quiz.id)}" class="btn btn-primary btn-sm">
                                    <span>Play ▶</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach action handlers for dynamic cards
        attachCardHandlers();
    }

    function attachCardHandlers() {
        // Share links
        document.querySelectorAll('.btn-share').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.soundEngine?.playClick();
                const id = btn.getAttribute('data-id');
                const shareUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}play.html?id=${id}`;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast('Quiz link copied to clipboard! 📋', 'success');
                    }).catch(() => {
                        prompt('Copy this quiz URL:', shareUrl);
                    });
                } else {
                    prompt('Copy this quiz URL:', shareUrl);
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.soundEngine?.playClick();
                quizToDeleteId = btn.getAttribute('data-id');
                if (deleteModal) {
                    deleteModal.classList.add('active');
                }
            });
        });
    }

    // Delete Modal Actions
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (quizToDeleteId && window.quizStore) {
                window.quizStore.deleteQuiz(quizToDeleteId);
                window.soundEngine?.playWrong();
                showToast('Quiz deleted successfully', 'success');
                deleteModal.classList.remove('active');
                quizToDeleteId = null;
                updateStats();
                renderQuizzes();
            }
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('active');
            quizToDeleteId = null;
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.remove('active');
                quizToDeleteId = null;
            }
        });
    }

    // Helper functions
    function getCategoryIcon(cat) {
        const map = {
            'Geography': '🌍',
            'Technology': '💻',
            'Science': '🔬',
            'General': '💡',
            'History': '🏛️',
            'Entertainment': '🎬'
        };
        return map[cat] || '✨';
    }

    function getDifficultyClass(diff) {
        if (!diff) return 'difficulty-medium';
        const d = diff.toLowerCase();
        if (d === 'easy') return 'difficulty-easy';
        if (d === 'hard') return 'difficulty-hard';
        return 'difficulty-medium';
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

// Toast notification helper
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
