// ======================================================
// ConceptCraft - app.js
// ======================================================

// ------------------------------
// Global State
// ------------------------------

let currentConcept = "";
let currentExplanation = "";

let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];

let explanationData = null;
let explanationHTML = "";

let flashcardData = [];

let quizCompleted = false;

// ------------------------------
// DOM Elements
// ------------------------------

const explainBtn = document.getElementById("explainBtn");
const resultDiv = document.getElementById("result");

// ======================================================
// Explain Button
// ======================================================

explainBtn.addEventListener("click", async () => {

    const subject = document.getElementById("subject").value;
    const grade = document.getElementById("grade").value;
    const concept = document.getElementById("concept").value.trim();

    if (!concept) {
        alert("Please enter a concept.");
        return;
    }

    explainBtn.disabled = true;
    explainBtn.innerHTML = "Generating...";

    resultDiv.innerHTML = `
        <div class="loading-card">
            <h3>🤖 AI is thinking...</h3>
            <p>Generating explanation, analogy and study notes...</p>
        </div>
    `;

    try {

        const response = await fetch("/explain", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                subject,
                grade,
                concept
            })

        });

        const data = await response.json();

        if (data.error) {

            resultDiv.innerHTML = `<p>${data.error}</p>`;
            return;

        }

        displayResult(data);

    }

    catch (error) {

        console.error(error);

        resultDiv.innerHTML = `
            <p>Something went wrong. Please try again.</p>
        `;

    }

    finally {

        explainBtn.disabled = false;
        explainBtn.innerHTML = "Explain";

    }

});

// ======================================================
// Display AI Result
// ======================================================
function displayResult(data) {

    currentConcept = document.getElementById("concept").value.trim();
    currentExplanation = data.explanation;

    explanationData = data;

    resultDiv.innerHTML = `

        <div class="result-card">

            <div class="section">
                <h2>📘 Explanation</h2>
                <p>${data.explanation}</p>
            </div>

            ${
                data.diagram
                ?
                `
                <div class="section">
                    <h2>🎨 Diagram</h2>
                    ${data.diagram}
                </div>
                `
                :
                ""
            }

            <div class="section">
                <h2>💡 Real-life Analogy</h2>
                <p>${data.analogy}</p>
            </div>

            <div class="section">
                <h2>🧠 Memory Trick</h2>
                <p>${data.memory_trick}</p>
            </div>

            <div class="section">

                <h2>📝 Key Takeaways</h2>

                <ul>

                    ${data.key_takeaways
                        .map(item => `<li>${item}</li>`)
                        .join("")}

                </ul>

            </div>

            <div class="quiz-section">

                <button id="quizBtn">
                    📝 Take Quiz
                </button>

                <button id="flashcardBtn">
                    📚 View Flashcards
                </button>

                <button id="chatBtn">
                    💬 Ask Follow-up
                </button>

                <button id="pdfBtn">
                    📄 Download Notes
                </button>

            </div>

        </div>

    `;

    // Save this page so we can come back later
    explanationHTML = resultDiv.innerHTML;

    document
    .getElementById("quizBtn")
    .addEventListener("click", () => {

        if (quizData.length > 0) {

            if (quizCompleted) {
                showScore();
            } else {
                showQuestion();
            }

        } else {

            generateQuiz();

        }

    });


document
    .getElementById("flashcardBtn")
    .addEventListener("click", () => {

        if (flashcardData.length > 0) {

            displayFlashcards(flashcardData);

        } else {

            generateFlashcards();

        }

    });

    document
    .getElementById("chatBtn")
    .addEventListener("click", openChat);  
    
    document
    .getElementById("pdfBtn")
    .addEventListener("click", generatePDF);

    document.getElementById("chatBox").style.display = "none";

resultDiv.style.display = "block";

document.getElementById("chatQuestion").value = "";

document.getElementById("chatResponse").innerHTML = "";

}

function showExplanationPage() {

    resultDiv.innerHTML = explanationHTML;

    document
        .getElementById("quizBtn")
        .addEventListener("click", () => {

            if (quizData.length > 0) {

                if (quizCompleted) {
                    showScore();
                } else {
                    showQuestion();
                }

            } else {

                generateQuiz();

            }

        });

    document
        .getElementById("flashcardBtn")
        .addEventListener("click", () => {

            if (flashcardData.length > 0) {

                displayFlashcards(flashcardData);

            } else {

                generateFlashcards();

            }

        });

    document
        .getElementById("chatBtn")
        .addEventListener("click", openChat);

    document
        .getElementById("pdfBtn")
        .addEventListener("click", generatePDF);

}

// ======================================================
// Generate Quiz
// ======================================================

async function generateQuiz() {

    const quizBtn = document.getElementById("quizBtn");

    quizBtn.disabled = true;
    quizBtn.innerHTML = "Generating Quiz...";
    resultDiv.innerHTML = `
    <div class="loading-card">
    <h3>📝 Generating Quiz...</h3>
    <p>Creating personalized questions...</p>
    </div>
    `;

    try {

        const response = await fetch("/generate-quiz", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                concept: currentConcept,
                explanation: currentExplanation

            })

        });

        const data = await response.json();

        if (data.error) {

            alert(data.error);
            return;

        }

        quizData = data.questions;
        currentQuestionIndex = 0;
        userAnswers = [];

        showQuestion();

    }

    catch (error) {

        console.error(error);

        alert("Unable to generate quiz.");

    }

    finally {

        quizBtn.disabled = false;
        quizBtn.innerHTML = "📝 Generate Quiz";

    }

}
// ======================================================
// Show Question
// ======================================================

function showQuestion() {

    const question = quizData[currentQuestionIndex];

    resultDiv.innerHTML = `

        <div class="result-card">

            <h2>
                Question ${currentQuestionIndex + 1} of ${quizData.length}
            </h2>

            <div class="section">
                <h3>${question.question}</h3>
            </div>

            <div class="options">

                ${question.options.map((option, index) => `

                    <label class="option">

                        <input
                            type="radio"
                            name="answer"
                            value="${index}"
                        >

                        ${option}

                    </label>

                `).join("")}

            </div>

            <button id="nextBtn">
                ${
                    currentQuestionIndex === quizData.length - 1
                    ? "Finish Quiz"
                    : "Next →"
                }
            </button>

        </div>

    `;

    document
        .getElementById("nextBtn")
        .addEventListener("click", handleNextQuestion);

}


// ======================================================
// Next Question
// ======================================================

function handleNextQuestion() {

    const selected = document.querySelector(
        'input[name="answer"]:checked'
    );

    if (!selected) {

        alert("Please select an option.");

        return;

    }

    userAnswers.push(Number(selected.value));

    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {

        showQuestion();

    }

    else {

        showScore();

    }

}


// ======================================================
// Show Final Score
// ======================================================

function showScore() {

    quizCompleted = true;
    let score = 0;

    quizData.forEach((question, index) => {

        if (userAnswers[index] === question.correct_option) {

            score++;

        }

    });

    resultDiv.innerHTML = `

        <div class="result-card">

            <h2>🎉 Quiz Completed!</h2>

            <h3>
                Your Score:
                ${score} / ${quizData.length}
            </h3>

            <br>

            <div style="margin-top:20px; display:flex; gap:15px;">

        <button id="reviewBtn">
        📖Review Answers
        </button>

       <button id="retakeBtn">
        🔄 Retake Quiz
       </button>

       <button id="backToExplanationBtn">
    ← Back to Explanation
     </button>

       </div>

        </div>

    `;

    document
        .getElementById("reviewBtn")
        .addEventListener("click", reviewAnswers);

    document
    .getElementById("retakeBtn")
    .addEventListener("click", retakeQuiz);  
    
    document
    .getElementById("backToExplanationBtn")
    .addEventListener("click", showExplanationPage);

}


// ======================================================
// Review Answers
// ======================================================

function reviewAnswers() {

    let html = `
        <div class="result-card">
            <h2>📚 Quiz Review</h2>
    `;

    quizData.forEach((question, index) => {

        const correct = question.correct_option;
        const user = userAnswers[index];

        html += `

            <div class="section">

                <h3>
                    ${index + 1}. ${question.question}
                </h3>

                <p>
                    <strong>Your Answer:</strong>
                    ${question.options[user]}
                </p>

                <p>
                    <strong>Correct Answer:</strong>
                    ${question.options[correct]}
                </p>

                <p>
                    <strong>Explanation:</strong>
                    ${question.explanation}
                </p>

                <hr>

            </div>

        `;

    });

    html += `

<div style="margin-top:30px; display:flex; gap:15px;">

    <button id="backToScoreBtn">
        ← Back to Score
    </button>

    <button id="backToExplanationBtn">
    ← Back to Explanation
    </button>

</div>

`;

    html += `
        </div>
    `;

    resultDiv.innerHTML = html;
    document
   .getElementById("backToScoreBtn")
   .addEventListener("click",showScore);

   document
    .getElementById("backToExplanationBtn")
    .addEventListener("click", showExplanationPage);

}

function retakeQuiz() {

    quizCompleted = false;

    currentQuestionIndex = 0;

    userAnswers = [];

    showQuestion();

}

// ======================================================
// Generate Flashcards
// ======================================================

async function generateFlashcards() {

    console.log("generateFlashcards() called");
    resultDiv.innerHTML = `
    <div class="loading-card">
    <h3>📚 Generating Flashcards...</h3>
    <p>Preparing your study cards...</p>
    </div>
   `;

    try {

        const response = await fetch("/generate-flashcards", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                concept: currentConcept,
                explanation: currentExplanation

            })

        });

        console.log("Response received");

        const data = await response.json();

        console.log(data);

        flashcardData = data.flashcards;

        displayFlashcards(flashcardData);

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// Display Flashcards
// ======================================================

function displayFlashcards(cards) {

    console.log("Display Flashcards Called");
    console.log(cards);

    let html = `

        <div class="result-card">

            <h2>📚 Study Flashcards</h2>

    `;

    cards.forEach((card, index) => {

        html += `

            <div class="section">

                <h3>${index + 1}. ${card.front}</h3>

                <p>${card.back}</p>

            </div>

        `;

    });

    html += `

        <div
            style="
                display:flex;
                justify-content:center;
                margin-top:25px;
            ">

            <button id="backToExplanationBtn">
                ← Back to Explanation
            </button>

        </div>

    </div>

    `;

    resultDiv.innerHTML = html;

    // Back to Explanation
    document
        .getElementById("backToExplanationBtn")
        .addEventListener("click", showExplanationPage);

}

// ======================================================
// AI Follow-up Chat
// ======================================================

function openChat() {

    resultDiv.style.display = "none";

    document.getElementById("chatBox").style.display = "block";

}


document
.addEventListener("click", async function(e){


    if(e.target && e.target.id === "askChatBtn"){


        const question =
        document.getElementById("chatQuestion").value.trim();


        if(!question){
            alert("Please enter a question.");
            return;
        }


        const responseBox =
        document.getElementById("chatResponse");


        responseBox.innerHTML =
        "<p>🤖 Thinking...</p>";


        try{


            const response = await fetch("/chat",{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    concept:currentConcept,

                    explanation:currentExplanation,

                    question:question

                })

            });


            const data = await response.json();


            if(data.error){

                responseBox.innerHTML =
                `<p>${data.error}</p>`;

                return;

            }


            responseBox.innerHTML =
            `
            <div class="section">
                <h3>AI Answer</h3>
                <p>${data.reply}</p>
            </div>
            `;


        }

        catch(error){

            console.error(error);

            responseBox.innerHTML =
            "<p>Unable to get response.</p>";

        }

    }

});

async function addSvgToPdf(doc, y) {

    const svg = document.querySelector("svg");

    if (!svg) {
        return y;
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8"
    });

    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {

        const img = new Image();

        img.onload = function () {

            const canvas = document.createElement("canvas");

            canvas.width = img.width || 700;
            canvas.height = img.height || 350;

            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0);

            const png = canvas.toDataURL("image/png");

            doc.addImage(
                png,
                "PNG",
                20,
                y,
                170,
                85
            );

            URL.revokeObjectURL(url);

            resolve(y + 95);

        };

        img.src = url;

    });

}

async function generatePDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 20;


    function addText(text){

        const lines = doc.splitTextToSize(text,170);

        doc.text(lines,20,y);

        y += lines.length * 7;

        if(y > 280){

            doc.addPage();

            y = 20;

        }

    }


    doc.setFontSize(18);

    addText("ConceptCraft Study Notes");


    doc.setFontSize(12);


    addText(
        "Topic: " + currentConcept
    );


    addText(
        "\nExplanation:\n" +
        currentExplanation
    );
    
    if (document.querySelector("svg")) {

    addText("\nDiagram:");

    y = await addSvgToPdf(doc, y);
    y+=10;

}

    if(explanationData){

        addText(
            "\nReal-life Analogy:\n" +
            explanationData.analogy
        );


        addText(
            "\nMemory Trick:\n" +
            explanationData.memory_trick
        );


        addText(
            "\nKey Takeaways:"
        );


        explanationData.key_takeaways.forEach(item=>{

            addText("- " + item);

        });

    }


    if(flashcardData.length > 0){

        addText("\nFlashcards");


        flashcardData.forEach((card,index)=>{

            addText(
                `${index+1}. Q: ${card.front}\nA: ${card.back}`
            );

        });

    }


    if(quizData.length > 0){

        addText("\nQuiz");


        quizData.forEach((q,index)=>{

            addText(
                `${index+1}. ${q.question}`
            );

            addText(
                "Answer: " +
                q.options[q.correct_option]
            );

        });

    }


    doc.save(
        `${currentConcept}_ConceptCraft_Notes.pdf`
    );

}

document
.addEventListener("click", function(e){

    if(e.target && e.target.id==="backFromChatBtn"){

        document.getElementById("chatBox").style.display="none";

        resultDiv.style.display="block";

        showExplanationPage();

    }

});