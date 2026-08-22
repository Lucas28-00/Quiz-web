/**
 * Quiz Creator Studio Controller
 * Handles dynamic question building, option management, validation, and publishing to local storage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const publishForm = document.getElementById('quiz-creator-form');
    const fillSampleBtn = document.getElementById('fill-sample-btn');
    const questionCounterEl = document.getElementById('question-total-count');

    let questionCount = 0;

    // Initialize with 1 empty question
    addNewQuestion();

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            window.soundEngine?.playClick();
            addNewQuestion();
        });
    }

    if (fillSampleBtn) {
        fillSampleBtn.addEventListener('click', () => {
            window.soundEngine?.playClick();
            fillSampleData();
        });
    }

    if (publishForm) {
        publishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePublish();
        });
    }

    function updateQuestionNumbers() {
        const items = questionsContainer.querySelectorAll('.question-item');
        questionCount = items.length;
        if (questionCounterEl) {
            questionCounterEl.textContent = `${questionCount} Question${questionCount === 1 ? '' : 's'}`;
        }

        items.forEach((item, index) => {
            const num = index + 1;
            const badge = item.querySelector('.question-num-badge');
            if (badge) badge.textContent = `Question #${num}`;

            // Update radio group names to ensure grouping per question
            const radios = item.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.name = `correct-answer-q${num}`;
            });
        });
    }

    function addNewQuestion(data = null) {
        const qIndex = questionsContainer.querySelectorAll('.question-item').length + 1;
        const qCard = document.createElement('div');
        qCard.className = 'question-item';

        const qText = data ? data.question : '';
        const options = data ? data.options : ['', '', '', ''];
        const correctIdx = data ? data.correctIndex : 0;
        const explanation = data ? (data.explanation || '') : '';

        const letters = ['A', 'B', 'C', 'D'];

        qCard.innerHTML = `
            <div class="question-header">
                <span class="question-num-badge">Question #${qIndex}</span>
                <button type="button" class="btn btn-danger btn-sm btn-delete-q" title="Delete Question">
                    🗑️ Remove
                </button>
            </div>

            <div class="form-group">
                <label class="form-label">Question Text <span class="req">*</span></label>
                <textarea class="form-control q-input-text" placeholder="e.g., What is the speed of light in a vacuum?" required>${escapeHTML(qText)}</textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Answer Choices & Correct Answer <span class="req">*</span> (Select radio for correct answer)</label>
                <div class="options-container">
                    ${letters.map((letter, idx) => `
                        <div class="option-edit-row ${idx === correctIdx ? 'is-correct' : ''}">
                            <input type="radio" name="correct-answer-q${qIndex}" value="${idx}" class="radio-custom q-radio-correct" ${idx === correctIdx ? 'checked' : ''} title="Mark as correct answer">
                            <span style="font-weight: 700; width: 20px; text-align: center; color: var(--primary);">${letter}</span>
                            <input type="text" class="option-input q-option-text" placeholder="Option ${letter} text" value="${escapeHTML(options[idx] || '')}" required>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Explanation / Hint (Optional)</label>
                <input type="text" class="form-control q-explanation-text" placeholder="e.g., Approximately 299,792 kilometers per second." value="${escapeHTML(explanation)}">
            </div>
        `;

        // Radio change event to highlight the correct row
        const radios = qCard.querySelectorAll('.q-radio-correct');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                window.soundEngine?.playClick();
                qCard.querySelectorAll('.option-edit-row').forEach(row => row.classList.remove('is-correct'));
                radio.closest('.option-edit-row').classList.add('is-correct');
            });
        });

        // Delete question handler
        const deleteBtn = qCard.querySelector('.btn-delete-q');
        deleteBtn.addEventListener('click', () => {
            const allItems = questionsContainer.querySelectorAll('.question-item');
            if (allItems.length <= 1) {
                showToast('A quiz must contain at least 1 question.', 'error');
                return;
            }
            window.soundEngine?.playClick();
            qCard.remove();
            updateQuestionNumbers();
        });

        questionsContainer.appendChild(qCard);
        updateQuestionNumbers();
    }

    function fillSampleData() {
        document.getElementById('quiz-title').value = 'Space & Planetary Mysteries';
        document.getElementById('quiz-description').value = 'A fun journey across the solar system, black holes, and space exploration!';
        document.getElementById('quiz-category').value = 'Science';
        document.getElementById('quiz-difficulty').value = 'Medium';
        document.getElementById('quiz-timer').value = '20';
        document.getElementById('quiz-creator').value = 'CosmoFan';

        questionsContainer.innerHTML = '';

        const sampleQuestions = [
            {
                question: 'Which is the hottest planet in our solar system?',
                options: ['Mercury', 'Venus', 'Mars', 'Jupiter'],
                correctIndex: 1,
                explanation: 'Venus is the hottest planet due to its thick greenhouse atmosphere of carbon dioxide and sulfuric acid clouds.'
            },
            {
                question: 'What is the boundary around a black hole beyond which nothing can escape?',
                options: ['Singularity', 'Event Horizon', 'Oort Cloud', 'Accretion Disk'],
                correctIndex: 1,
                explanation: 'The event horizon is the threshold where gravitational pull becomes infinite and light cannot escape.'
            },
            {
                question: 'In what year did humans first land on the Moon?',
                options: ['1965', '1969', '1971', '1975'],
                correctIndex: 1,
                explanation: 'Apollo 11 landed on the Moon on July 20, 1969, carrying Neil Armstrong and Buzz Aldrin.'
            }
        ];

        sampleQuestions.forEach(q => addNewQuestion(q));
        showToast('Sample quiz template loaded! ✨', 'success');
    }

    function handlePublish() {
        const title = document.getElementById('quiz-title').value.trim();
        const description = document.getElementById('quiz-description').value.trim();
        const category = document.getElementById('quiz-category').value;
        const difficulty = document.getElementById('quiz-difficulty').value;
        const timeLimit = parseInt(document.getElementById('quiz-timer').value, 10) || 0;
        const creator = document.getElementById('quiz-creator').value.trim() || 'Anonymous';

        if (!title) {
            showToast('Please enter a quiz title', 'error');
            return;
        }

        const questionElements = questionsContainer.querySelectorAll('.question-item');
        if (questionElements.length === 0) {
            showToast('Please add at least one question', 'error');
            return;
        }

        const questions = [];

        for (let i = 0; i < questionElements.length; i++) {
            const qEl = questionElements[i];
            const qText = qEl.querySelector('.q-input-text').value.trim();
            if (!qText) {
                showToast(`Question #${i + 1} text cannot be empty.`, 'error');
                return;
            }

            const optionInputs = qEl.querySelectorAll('.q-option-text');
            const options = [];
            for (let j = 0; j < optionInputs.length; j++) {
                const optText = optionInputs[j].value.trim();
                if (!optText) {
                    showToast(`Question #${i + 1}, Choice ${j + 1} cannot be empty.`, 'error');
                    return;
                }
                options.push(optText);
            }

            const selectedRadio = qEl.querySelector('.q-radio-correct:checked');
            if (!selectedRadio) {
                showToast(`Please mark the correct answer for Question #${i + 1}.`, 'error');
                return;
            }

            const correctIndex = parseInt(selectedRadio.value, 10);
            const explanation = qEl.querySelector('.q-explanation-text').value.trim();

            questions.push({
                id: `q-${Date.now()}-${i + 1}`,
                question: qText,
                options,
                correctIndex,
                explanation
            });
        }

        const newQuiz = {
            id: 'quiz-' + Date.now(),
            title,
            description,
            category,
            difficulty,
            timeLimit,
            creator,
            plays: 0,
            questions
        };

        if (window.quizStore) {
            window.quizStore.saveQuiz(newQuiz);
            window.soundEngine?.playVictory();
            showToast('Quiz published successfully! 🎉', 'success');

            setTimeout(() => {
                window.location.href = `play.html?id=${encodeURIComponent(newQuiz.id)}`;
            }, 1200);
        }
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
