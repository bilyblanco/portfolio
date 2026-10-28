
"use strict";

// ========================================
// LESSON DATA
// ========================================

const lessons = [
    {
        title: "Introduction to HTML",
        description:
            "HTML stands for HyperText Markup Language. " +
            "It defines the structure and content of a webpage.",
        code:
`<!DOCTYPE html>
<html lang="en">
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
        tip: "Tip: HTML describes structure. CSS handles appearance."
    },
    {
        title: "Headings and Paragraphs",
        description:
            "Headings organize your content. HTML provides " +
            "six heading levels, from h1 to h6. " +
            "Paragraphs use the p element.",
        code:
`<h1>Main Heading</h1>
<h2>Subheading</h2>
<p>This is a paragraph.</p>`,
        tip: "Tip: Use heading levels in a logical order."
    },
    {
        title: "Links and Images",
        description:
            "The anchor element creates links, while the img " +
            "element displays images. Always include useful alt text.",
        code:
`<a href="https://example.com">Visit Website</a>

<img src="photo.jpg" alt="A mountain landscape">`,
        tip: "Tip: Relative paths are useful for files inside your project."
    },
    {
        title: "Lists and Tables",
        description:
            "Use ul for unordered lists, ol for ordered lists, " +
            "and li for list items. Tables organize tabular data.",
        code:
`<ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ul>

<table>
    <tr>
        <th>Language</th>
        <th>Purpose</th>
    </tr>
    <tr>
        <td>HTML</td>
        <td>Structure</td>
    </tr>
</table>`,
        tip: "Tip: Tables are for data, not for building page layouts."
    },
    {
        title: "HTML Forms",
        description:
            "Forms collect information from users. Labels help " +
            "make inputs easier to understand and access.",
        code:
`<form>
    <label for="email">Email</label>
    <input type="email" id="email" required>

    <button type="submit">Send</button>
</form>`,
        tip: "Tip: Connect labels and inputs using for and id."
    },
    {
        title: "Semantic HTML",
        description:
            "Semantic elements explain the purpose of different " +
            "parts of your webpage, improving structure and accessibility.",
        code:
`<header>
    <nav>Navigation links</nav>
</header>

<main>
    <article>
        <h1>My Article</h1>
        <p>Article content.</p>
    </article>
</main>

<footer>Copyright information</footer>`,
        tip: "Tip: Prefer meaningful elements over unnecessary divs."
    }
];


// ========================================
// LESSON ELEMENTS
// ========================================

const lessonList = document.getElementById("lesson-list");
const lessonNumber = document.getElementById("lesson-number");
const lessonTitle = document.getElementById("lesson-title");
const lessonDescription = document.getElementById("lesson-description");
const lessonCode = document.getElementById("lesson-code");
const lessonTip = document.getElementById("lesson-tip");
const completeButton = document.getElementById("complete-lesson");
const nextLessonButton = document.getElementById("next-lesson");

let currentLesson = 0;


// ========================================
// SAVING PROGRESS
// ========================================

// Load previously completed lessons from localStorage.
// If none exist, begin with an empty array.
let completedLessons = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("htmlAcademyProgress") || "[]"
    );

    if (Array.isArray(saved)) {
        completedLessons = saved.filter(
            (index) =>
                Number.isInteger(index) &&
                index >= 0 &&
                index < lessons.length
        );
        completedLessons = [...new Set(completedLessons)];
    }
} catch (error) {
    completedLessons = [];
}

function saveProgress() {
    try {
        localStorage.setItem(
            "htmlAcademyProgress",
            JSON.stringify(completedLessons)
        );
    } catch (error) {
        // The course still works if browser storage is unavailable.
    }
}


// ========================================
// RENDER LESSONS
// ========================================

function renderLessonList() {
    lessonList.innerHTML = "";

    lessons.forEach((lesson, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-button";

        button.textContent = `${index + 1}. ${lesson.title}`;

        if (index === currentLesson) {
            button.classList.add("active");
            button.setAttribute("aria-current", "step");
        }

        if (completedLessons.includes(index)) {
            button.classList.add("completed");
        }

        button.addEventListener("click", () => {
            currentLesson = index;
            renderLesson();
        });

        lessonList.appendChild(button);
    });
}

function renderLesson() {
    const lesson = lessons[currentLesson];

    lessonNumber.textContent = `Lesson ${currentLesson + 1}`;
    lessonTitle.textContent = lesson.title;
    lessonDescription.textContent = lesson.description;

    // textContent displays HTML code as text instead of
    // interpreting it as actual webpage elements.
    lessonCode.textContent = lesson.code;

    lessonTip.textContent = lesson.tip;

    const completed = completedLessons.includes(currentLesson);

    completeButton.textContent = completed
        ? "✓ Completed"
        : "Mark as Complete";

    completeButton.disabled = completed;

    nextLessonButton.disabled =
        currentLesson === lessons.length - 1;

    renderLessonList();
}


// ========================================
// PROGRESS BAR
// ========================================

const progressPercentage = document.getElementById("progress-percentage");
const progressFill = document.getElementById("progress-fill");
const progressTrack = document.getElementById("progress-track");
const progressText = document.getElementById("progress-text");
const completionMessage = document.getElementById("completion-message");
const resetProgressButton = document.getElementById("reset-progress");

function updateProgress() {
    const completed = completedLessons.length;
    const percentage = Math.round(
        (completed / lessons.length) * 100
    );

    progressPercentage.textContent = percentage + "%";
    progressFill.style.width = percentage + "%";

    progressTrack.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    progressText.textContent =
        `${completed} of ${lessons.length} lessons completed.`;

    completionMessage.textContent =
        completed === lessons.length
            ? "🎉 Congratulations! You've completed every lesson!"
            : "";
}


// ========================================
// LESSON BUTTON EVENTS
// ========================================

completeButton.addEventListener("click", () => {
    if (!completedLessons.includes(currentLesson)) {
        completedLessons.push(currentLesson);
        saveProgress();
    }

    renderLesson();
    updateProgress();
});

nextLessonButton.addEventListener("click", () => {
    if (currentLesson < lessons.length - 1) {
        currentLesson++;
        renderLesson();
    }
});

resetProgressButton.addEventListener("click", () => {
    completedLessons = [];
    saveProgress();
    renderLesson();
    updateProgress();
});


// ========================================
// QUIZ DATA
// ========================================

const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "HyperText Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Machine Logic",
            "Home Tool Markup Language"
        ],
        answer: 0
    },
    {
        question: "Which HTML element creates a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1
    },
    {
        question: "Which tag is used to display an image?",
        options: ["<picture>", "<image>", "<img>", "<src>"],
        answer: 2
    },
    {
        question: "Which element represents the main content of a page?",
        options: ["<footer>", "<main>", "<aside>", "<meta>"],
        answer: 1
    },
    {
        question: "Which attribute connects a label to an input?",
        options: ["src", "href", "for", "alt"],
        answer: 2
    }
];


// ========================================
// QUIZ ELEMENTS AND STATE
// ========================================

const questionNumber = document.getElementById("question-number");
const quizScore = document.getElementById("quiz-score");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const nextQuestionButton = document.getElementById("next-question");
const restartQuizButton = document.getElementById("restart-quiz");

let currentQuestion = 0;
let score = 0;
let answered = false;


// ========================================
// RENDER QUIZ
// ========================================

function renderQuestion() {
    answered = false;

    const question = questions[currentQuestion];

    questionNumber.textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    quizScore.textContent = `Score: ${score}`;
    quizQuestion.textContent = question.question;
    quizFeedback.textContent = "";

    quizOptions.innerHTML = "";

    nextQuestionButton.disabled = true;
    nextQuestionButton.hidden = false;
    restartQuizButton.hidden = true;

    nextQuestionButton.textContent =
        currentQuestion === questions.length - 1
            ? "See Results"
            : "Next Question";

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "quiz-option";
        button.textContent = option;

        button.addEventListener("click", () => {
            checkAnswer(index);
        });

        quizOptions.appendChild(button);
    });
}


// ========================================
// CHECK QUIZ ANSWERS
// ========================================

function checkAnswer(selectedIndex) {
    if (answered) {
        return;
    }

    answered = true;

    const question = questions[currentQuestion];
    const correct = selectedIndex === question.answer;

    if (correct) {
        score++;
        quizFeedback.textContent = "✅ Correct! Great job.";
    } else {
        quizFeedback.textContent =
            `❌ Not quite. Correct answer: ${question.options[question.answer]}`;
    }

    quizScore.textContent = `Score: ${score}`;

    const buttons = quizOptions.querySelectorAll(".quiz-option");

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === question.answer) {
            button.classList.add("correct");
        } else if (index === selectedIndex) {
            button.classList.add("incorrect");
        }
    });

    nextQuestionButton.disabled = false;
}


// ========================================
// QUIZ NAVIGATION
// ========================================

nextQuestionButton.addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    questionNumber.textContent = "Quiz Complete!";
    quizQuestion.textContent =
        `You scored ${score} out of ${questions.length}!`;

    quizOptions.innerHTML = "";

    const percentage = Math.round(
        (score / questions.length) * 100
    );

    quizFeedback.textContent =
        percentage >= 80
            ? "🎉 Excellent work! You've got a strong HTML foundation."
            : "Keep practicing! Review the lessons and try again.";

    nextQuestionButton.hidden = true;
    restartQuizButton.hidden = false;
}

restartQuizButton.addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    renderQuestion();
});


// ========================================
// INITIAL PAGE SETUP
// ========================================

renderLesson();
updateProgress();
renderQuestion();
