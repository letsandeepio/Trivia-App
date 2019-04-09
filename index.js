
document.addEventListener("DOMContentLoaded", async function () {
    let jsonData = await loadQuestionAPI();
    process(jsonData);
    document.querySelector("#begin").style.display="block"  ;
});

async function loadQuestionAPI() {
    const questions = await fetch("https://opentdb.com/api.php?amount=10&category=18&type=multiple")
    const questionsJson = await questions.json();
    return questionsJson;
}

function process(json) {
    let outputHTML = '';

    json.results.forEach((item, index, arr) => {
        let lastQuestionAttribute = "";
        let answerKey = [[item.correct_answer, "correct"]]
        item.incorrect_answers.forEach((item) => {
            answerKey.push([item, "incorrect"])
        })

        shuffle(answerKey)
        let question = index + 1;

        const indexOfCorrectAnswer = answerKey.findIndex(function (sub) {
            return sub.indexOf("correct") !== -1;
        });

        if (index === (arr.length - 1)) {
            lastQuestionAttribute = "data-islast=true";
        }

        outputHTML += ` <div class="step" id="question-${question}" data-isactive=true ${lastQuestionAttribute}>
        <div class="content">
            <h2>Question ${question}<span class="stamp is-${item.difficulty}">${item.difficulty}</span></h2>
            <div style="position:relative;">
                <p style="position:relative;">${item.question}
                </p>
                <div class="check success" id="status-icon">
                    <div class="check-circle"></div>
                    <svg class="check-svg" width="40px" height="40px" viewBox="0 0 40 40" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <polyline stroke="#65B280" stroke-width="4" points="11 19 18 26 29 14"></polyline>
                        </g>
                    </svg>
                </div>
            </div>
            <div class="stabs is-vertical">`

        answerKey.forEach((item, index) => {
            outputHTML += `<div class="stab stab-item ${getWord(index + 1)}" onclick="verifyAnswer(${question},${index + 1},${indexOfCorrectAnswer + 1});"><div class="stab-label">${answerKey[index][0]}</div></div>`
        })

        outputHTML += `</div></div></div>`

    })

    document.querySelector("#questions-div").innerHTML = outputHTML;
}

function getWord(num) {
    let words = ["one", "two", "three", "four"]
    return words[num - 1]
}


function verifyAnswer(question, clickedAnswer, correctAnswer) {

    if (isQuestionActive(question) == "false") return false;


    let questionElement = document.getElementById("question-" + question);
    let correctAnswerElement = questionElement.getElementsByClassName("stab " + getWord(correctAnswer));
    let incorrectAnswerElement = questionElement.getElementsByClassName("stab " + getWord(clickedAnswer));
    let success = questionElement.getElementsByClassName("check success");
    let score = document.querySelector("#score").innerText;

    if (clickedAnswer == correctAnswer) {
        correctAnswerElement[0].className += " is-right";
        success[0].style.display = "block";
        score++;
    } else {
        incorrectAnswerElement[0].className += " is-wrong";
        correctAnswerElement[0].className += " is-right";
        success[0].innerHTML = `<img src="error.svg" class="error-icon">`
        success[0].style.display = "block";
    }


    deActivateQuestion(question);
    updateScore(question, score);


    if (questionElement.getAttribute("data-islast") == "true") {
        endGame();
    } else {
        showQuestion(question + 1);
    }
}


function isQuestionActive(num) {

    let questionElement = document.getElementById("question-" + num);
    return questionElement.getAttribute("data-isactive");
}

function deActivateQuestion(num) {
    let questionElement = document.getElementById("question-" + num);
    questionElement.getAttribute("data-isactive");

    let stabElements = questionElement.getElementsByClassName("stab")

    Array.from(stabElements).forEach(function (item) {
        item.classList.remove("stab-item");
    });

    questionElement.setAttribute("data-isactive", false);
}

function showQuestion(argNum) {
    let el = "";

    (argNum==1) ? timeOut = 500 : timeOut = 2000;

    if(typeof argNum=="string")
     {  
           el = argNum;

     } else {
           el = "#question-" + argNum;
     }

    document.querySelector(el).style.display = "block";

    window.setTimeout(() => {
        document.querySelector(el).scrollIntoView();
        
    }, timeOut);

    window.setTimeout(() => {
        document.querySelector(el).classList += " is-active";
        
    }, timeOut+100);  
}

function begin() {

    showQuestion(1);

    // document.querySelector("#question-1").classList += " is-active";
    // document.querySelector("#question-1").style.display = "block";
    
    // window.setTimeout(() => {
    //     document.querySelector("#question-1").scrollIntoView(true);
    // }, 1);

    updateScore(1, 0);
}



/* 
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */

var shuffle = function (array) {

    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;

};

function updateScore(question, score) {
    if (question == 1) document.querySelector(".sides").style.display = "block";
    document.querySelector("#total-questions").innerHTML = question;
    document.querySelector("#score").innerHTML = score;

}

function endGame() {

    let totalQuestions = document.querySelector("#total-questions").innerText;
    let totalScore = document.querySelector("#score").innerText;


    let percentage = (totalScore / totalQuestions) * 100;

    document.querySelector("#end-title").innerText = getFeedback(percentage);
    document.querySelector("#end-message").innerText = `You got ${totalScore} questions right out of ${totalQuestions}.`
    window.setTimeout(function(){
        document.querySelector("#scoreboard").style.display = "none";
    }, 2000);


    showQuestion("#end")

    if(totalQuestions==totalScore) {
       
        about();
        window.setTimeout(()=>{
            perfectScore();
        }, 3000)

    }



    /*
    if (document.querySelector("#total-questions").innerText == document.querySelector("#score").innerText) {

        document.querySelector("#scoreboard").innerHTML = `<h3>perfect score!</h3><a href="#">play again</a>`

        window.setTimeout(()=>{
            perfectScore(document.querySelector("#scoreboard").getBoundingClientRect())
        }, 1000)

    } else {
    document.querySelector("#scoreboard").innerHTML = "<h4>good job!<h4>"
    }
    */

}

function perfectScore(){
    let confettiOrigin = document.querySelector(".about").getBoundingClientRect();
    console.log(confettiOrigin.x,confettiOrigin.y);
    throwConfetti(confettiOrigin.x,confettiOrigin.y);
}


function throwConfetti(argX, argY) {

    new confettiKit({
        confettiCount: 50,
        angle: 90,
        startVelocity: 50,
        elements: {
            'confetti': {
                direction: 'down',
                rotation: true,
            },
            'star': {
                count: 10,
                direction: 'down',
                rotation: true,
            },
            'ribbon': {
                count: 5,
                direction: 'down',
                rotation: true,
            },
        },
        x: argX,
        y: argY,
    })
}


function getFeedback(percentage){
    let feedback = "";
    if(percentage==100) {
            feedback = "Perfect Score!"
    } else if (percentage > 75) {
            feedback = "Great Job!"
    } else if (percentage > 50) {
            feedback = "Good Job!"
    } else if (percentage > 25) {
            feedback = "Not bad"
    } else if (percentage < 25) {
            feedback = "Way to go!"
    }
    return feedback
}

async function reload(){
    document.querySelector("#end").classList.remove("is-active");
    let jsonData = await loadQuestionAPI();
    process(jsonData);
    showQuestion(1);
    updateScore(1, 0);
    return false;
}   

function about(){
    document.querySelector(".about").style.display = "block";
}

