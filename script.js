// =====================================================
// ONLINE EXAMINATION SYSTEM
// =====================================================

const TOTAL_TIME = 10 * 60;

let questionBank = {};

let currentQuestion = 0;

let answers = [];

let timeLeft = TOTAL_TIME;

let timerInterval = null;


// =====================================================
// LOAD JSON
// =====================================================

async function loadQuestions() {

    try {

        const response = await fetch("./questions.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "HTTP Error: " + response.status
            );
        }

        questionBank = await response.json();

        console.log("Question bank loaded:", questionBank);

        return true;

    } catch (error) {

        console.error("JSON ERROR:", error);

        const options =
            document.getElementById("options");

        if (options) {

            options.innerHTML = `
                <div style="
                    background:#fee2e2;
                    color:#991b1b;
                    padding:20px;
                    border-radius:10px;
                ">
                    <strong>Questions could not be loaded.</strong>
                    <br><br>
                    Please run this project using
                    <b>VS Code Live Server</b>.
                    <br><br>
                    Do not open index.html directly.
                </div>
            `;
        }

        return false;
    }
}


// =====================================================
// LOGIN
// =====================================================

function loginStudent(event) {

    event.preventDefault();

    const name =
        document.getElementById("studentName")
        .value
        .trim();

    const email =
        document.getElementById("studentEmail")
        .value
        .trim();


    if (!name) {

        alert("Please enter student name.");

        return;
    }


    if (!email) {

        alert("Please enter email ID.");

        return;
    }


    localStorage.setItem(
        "studentName",
        name
    );


    localStorage.setItem(
        "studentEmail",
        email
    );


    window.location.href =
        "subjects.html";
}


// =====================================================
// SHOW STUDENT NAME
// =====================================================

function showStudentName() {

    const name =
        localStorage.getItem("studentName");


    const element =
        document.getElementById("studentName");


    if (element) {

        element.textContent =
            name || "Student";
    }
}


// =====================================================
// START EXAM
// =====================================================

async function startExam(subject) {

    localStorage.setItem(
        "selectedSubject",
        subject
    );


    // Clear previous temporary answers
    localStorage.removeItem("currentAnswers");

    localStorage.removeItem("examStart");


    window.location.href =
        "exam.html";
}


// =====================================================
// INITIALIZE EXAM
// =====================================================

async function initExam() {

    const loaded =
        await loadQuestions();


    if (!loaded) {
        return;
    }


    const subject =
        localStorage.getItem("selectedSubject");


    if (!subject) {

        alert("Please select a subject first.");

        window.location.href =
            "subjects.html";

        return;
    }


    const questions =
        questionBank[subject];


    if (!Array.isArray(questions)) {

        alert(
            "Questions not found for " +
            subject
        );

        window.location.href =
            "subjects.html";

        return;
    }


    if (questions.length !== 25) {

        alert(
            "Warning: " +
            formatSubject(subject) +
            " contains " +
            questions.length +
            " questions instead of 25."
        );
    }


    currentQuestion = 0;


    answers =
        new Array(questions.length)
        .fill(null);


    // Display student name
    const studentName =
        document.getElementById(
            "examStudentName"
        );


    if (studentName) {

        studentName.textContent =
            localStorage.getItem(
                "studentName"
            ) || "Student";
    }


    // Display first question
    showQuestion();


    // Start timer
    startTimer();
}


// =====================================================
// SHOW QUESTION
// =====================================================

function showQuestion() {

    const subject =
        localStorage.getItem(
            "selectedSubject"
        );


    const questions =
        questionBank[subject];


    if (!questions) {
        return;
    }


    const q =
        questions[currentQuestion];


    if (!q) {
        return;
    }


    // Subject
    const title =
        document.getElementById(
            "subjectTitle"
        );


    if (title) {

        title.textContent =
            formatSubject(subject);
    }


    // Question number
    const number =
        document.getElementById(
            "questionNumber"
        );


    if (number) {

        number.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;
    }


    // Question text
    const questionText =
        document.getElementById(
            "questionText"
        );


    if (questionText) {

        questionText.textContent =
            q.q;
    }


    // Options
    const optionsContainer =
        document.getElementById(
            "options"
        );


    if (!optionsContainer) {
        return;
    }


    optionsContainer.innerHTML = "";


    q.o.forEach(
        (optionText, index) => {

            const option =
                document.createElement(
                    "div"
                );


            option.className =
                "option";


            option.innerHTML = `

                <input
                    type="radio"
                    name="answer"
                    id="option-${index}"
                    value="${index}"
                >

                <label
                    for="option-${index}"
                >
                    ${escapeHTML(optionText)}
                </label>

            `;


            const radio =
                option.querySelector(
                    "input"
                );


            // Restore answer
            if (
                answers[currentQuestion] ===
                index
            ) {

                radio.checked = true;
            }


            // Radio change
            radio.addEventListener(
                "change",
                function () {

                    answers[currentQuestion] =
                        index;

                    saveCurrentAnswers();
                }
            );


            // Whole box clickable
            option.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.tagName !==
                        "INPUT"
                    ) {

                        radio.checked = true;

                        answers[currentQuestion] =
                            index;

                        saveCurrentAnswers();
                    }
                }
            );


            optionsContainer.appendChild(
                option
            );
        }
    );


    // Previous button
    const prev =
        document.getElementById(
            "prevBtn"
        );


    if (prev) {

        prev.disabled =
            currentQuestion === 0;
    }


    // Next / Submit
    const next =
        document.getElementById(
            "nextBtn"
        );


    const submit =
        document.getElementById(
            "submitBtn"
        );


    if (
        currentQuestion ===
        questions.length - 1
    ) {

        if (next) {
            next.style.display = "none";
        }

        if (submit) {
            submit.style.display = "block";
        }

    } else {

        if (next) {
            next.style.display = "block";
        }

        if (submit) {
            submit.style.display = "none";
        }
    }
}


// =====================================================
// NEXT
// =====================================================

function nextQuestion() {

    const subject =
        localStorage.getItem(
            "selectedSubject"
        );


    const questions =
        questionBank[subject];


    if (
        currentQuestion <
        questions.length - 1
    ) {

        currentQuestion++;

        showQuestion();
    }
}


// =====================================================
// PREVIOUS
// =====================================================

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

        showQuestion();
    }
}


// =====================================================
// SAVE CURRENT ANSWERS
// =====================================================

function saveCurrentAnswers() {

    localStorage.setItem(
        "currentAnswers",
        JSON.stringify(answers)
    );
}


// =====================================================
// TIMER
// =====================================================

function startTimer() {

    clearInterval(timerInterval);


    timeLeft = TOTAL_TIME;


    updateTimer();


    timerInterval =
        setInterval(
            function () {

                timeLeft--;

                updateTimer();


                if (timeLeft <= 0) {

                    clearInterval(
                        timerInterval
                    );


                    alert(
                        "Time is over. Your exam will be submitted automatically."
                    );


                    submitExam(true);
                }

            },
            1000
        );
}


// =====================================================
// UPDATE TIMER
// =====================================================

function updateTimer() {

    const timer =
        document.getElementById(
            "timer"
        );


    if (!timer) {
        return;
    }


    const minutes =
        Math.floor(
            timeLeft / 60
        );


    const seconds =
        timeLeft % 60;


    timer.textContent =
        String(minutes)
        .padStart(2, "0")
        +
        ":"
        +
        String(seconds)
        .padStart(2, "0");


    if (timeLeft <= 60) {

        timer.classList.add(
            "timer-warning"
        );

    } else {

        timer.classList.remove(
            "timer-warning"
        );
    }
}


// =====================================================
// SUBMIT EXAM
// =====================================================

function submitExam(autoSubmit = false) {

    const subject =
        localStorage.getItem(
            "selectedSubject"
        );


    const questions =
        questionBank[subject];


    if (!questions) {

        alert(
            "Questions are not available."
        );

        return;
    }


    if (!autoSubmit) {

        const confirmation =
            confirm(
                "Are you sure you want to submit the exam?"
            );


        if (!confirmation) {
            return;
        }
    }


    clearInterval(timerInterval);


    let correct = 0;

    let wrong = 0;

    let notAttempted = 0;


    questions.forEach(
        (q, index) => {

            const selected =
                answers[index];


            if (
                selected === null ||
                selected === undefined
            ) {

                notAttempted++;

            } else if (
                Number(selected) ===
                Number(q.a)
            ) {

                correct++;

            } else {

                wrong++;
            }
        }
    );


    const total =
        questions.length;


    const percentage =
        Math.round(
            (correct / total) * 100
        );


    const result = {

        studentName:
            localStorage.getItem(
                "studentName"
            ),

        studentEmail:
            localStorage.getItem(
                "studentEmail"
            ),

        subject: subject,

        answers: answers,

        correct: correct,

        wrong: wrong,

        notAttempted: notAttempted,

        score: correct,

        total: total,

        percentage: percentage,

        date:
            new Date()
            .toLocaleString()

    };


    // Latest result
    localStorage.setItem(
        "lastResult",
        JSON.stringify(result)
    );


    // Lifetime history
    let history =
        JSON.parse(
            localStorage.getItem(
                "examHistory"
            )
        ) || [];


    history.push(result);


    localStorage.setItem(
        "examHistory",
        JSON.stringify(history)
    );


    localStorage.removeItem(
        "currentAnswers"
    );


    window.location.href =
        "result.html";
}


// =====================================================
// RESULT
// =====================================================

async function initResult() {

    const data =
        localStorage.getItem(
            "lastResult"
        );


    if (!data) {

        window.location.href =
            "subjects.html";

        return;
    }


    const result =
        JSON.parse(data);


    setText(
        "resultStudentName",
        result.studentName
    );


    setText(
        "resultSubject",
        formatSubject(
            result.subject
        )
    );


    setText(
        "score",
        `${result.score} / ${result.total}`
    );


    setText(
        "percentage",
        `${result.percentage}%`
    );


    setText(
        "correct",
        result.correct
    );


    setText(
        "wrong",
        result.wrong
    );


    setText(
        "notAttempted",
        result.notAttempted
    );
}


// =====================================================
// REVIEW
// =====================================================

async function initReview() {

    const loaded =
        await loadQuestions();


    if (!loaded) {
        return;
    }


    const data =
        localStorage.getItem(
            "lastResult"
        );


    if (!data) {

        window.location.href =
            "subjects.html";

        return;
    }


    const result =
        JSON.parse(data);


    const questions =
        questionBank[
            result.subject
        ];


    setText(
        "reviewSubject",
        formatSubject(
            result.subject
        )
    );


    const container =
        document.getElementById(
            "reviewContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    questions.forEach(
        (q, index) => {

            const selected =
                result.answers[index];


            let status;

            let cardClass;

            let statusClass;


            if (
                selected === null ||
                selected === undefined
            ) {

                status =
                    "Not Attempted";

                cardClass =
                    "not-card";

                statusClass =
                    "not";

            } else if (
                Number(selected) ===
                Number(q.a)
            ) {

                status =
                    "Correct";

                cardClass =
                    "correct-card";

                statusClass =
                    "correct";

            } else {

                status =
                    "Wrong";

                cardClass =
                    "wrong-card";

                statusClass =
                    "wrong";
            }


            const selectedText =
                selected === null ||
                selected === undefined
                    ? "Not Attempted"
                    : q.o[selected];


            const correctText =
                q.o[q.a];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `review-card ${cardClass}`;


            card.innerHTML = `

                <div class="review-header">

                    <h3>
                        Question ${index + 1}
                    </h3>

                    <span
                        class="status ${statusClass}"
                    >
                        ${status}
                    </span>

                </div>


                <p class="review-question">
                    ${escapeHTML(q.q)}
                </p>


                <div class="answer-row">

                    <strong>
                        Your Answer:
                    </strong>

                    <span
                        class="${
                            status === "Wrong"
                            ? "selected-wrong"
                            : ""
                        }"
                    >
                        ${
                            escapeHTML(
                                selectedText
                            )
                        }
                    </span>

                </div>


                <div class="answer-row">

                    <strong>
                        Correct Answer:
                    </strong>

                    <span class="correct-answer">
                        ${
                            escapeHTML(
                                correctText
                            )
                        }
                    </span>

                </div>

            `;


            container.appendChild(
                card
            );
        }
    );
}


// =====================================================
// HISTORY
// =====================================================

function initHistory() {

    setText(
        "historyStudent",
        localStorage.getItem(
            "studentName"
        ) || ""
    );


    showHistory();
}


function showHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );


    if (!container) {
        return;
    }


    const history =
        JSON.parse(
            localStorage.getItem(
                "examHistory"
            )
        ) || [];


    if (history.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                <h2>
                    No Exam History
                </h2>

                <p>
                    Complete an exam to see your history here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    history
        .slice()
        .reverse()
        .forEach(
            (exam, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "history-card";


                card.innerHTML = `

                    <div>

                        <h3>
                            ${formatSubject(
                                exam.subject
                            )}
                        </h3>

                        <small>
                            ${exam.date}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${exam.score}/${exam.total}
                        </strong>

                        <small>
                            Score
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${exam.percentage}%
                        </strong>

                        <small>
                            Percentage
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${exam.correct}
                        </strong>

                        <small>
                            Correct
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${exam.wrong}
                        </strong>

                        <small>
                            Wrong
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${exam.notAttempted}
                        </strong>

                        <small>
                            Not Attempted
                        </small>

                    </div>

                `;


                container.appendChild(
                    card
                );
            }
        );
}


// =====================================================
// CLEAR HISTORY
// =====================================================

function clearHistory() {

    const confirmDelete =
        confirm(
            "Delete all exam history?"
        );


    if (!confirmDelete) {
        return;
    }


    localStorage.removeItem(
        "examHistory"
    );


    showHistory();
}


// =====================================================
// NAVIGATION
// =====================================================

function viewReview() {

    window.location.href =
        "review.html";
}


function backToResult() {

    window.location.href =
        "result.html";
}


function takeAnotherExam() {

    clearInterval(
        timerInterval
    );


    localStorage.removeItem(
        "selectedSubject"
    );


    localStorage.removeItem(
        "currentAnswers"
    );


    window.location.href =
        "subjects.html";
}


function openHistory() {

    window.location.href =
        "history.html";
}


function goSubjects() {

    window.location.href =
        "subjects.html";
}


// =====================================================
// LOGOUT
// =====================================================

function logoutStudent() {

    clearInterval(
        timerInterval
    );


    localStorage.removeItem(
        "studentName"
    );


    localStorage.removeItem(
        "studentEmail"
    );


    localStorage.removeItem(
        "selectedSubject"
    );


    localStorage.removeItem(
        "currentAnswers"
    );


    window.location.href =
        "index.html";
}


// =====================================================
// FORMAT SUBJECT
// =====================================================

function formatSubject(subject) {

    const names = {

        html: "HTML",

        css: "CSS",

        javascript: "JavaScript",

        python: "Python",

        java: "Java",

        c: "C Programming",

        cpp: "C++",

        sql: "SQL / DBMS",

        react: "React JS",

        node: "Node.js"
    };


    return names[subject] ||
        subject;
}


// =====================================================
// SET TEXT SAFELY
// =====================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}