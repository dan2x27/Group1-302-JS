import {subject} from '../Resources/questions/question.js'

$(document).ready(function () {
const params = new URLSearchParams(window.location.search);
const selectedSubject = params.get('data1'); 
const questionCount = parseInt(params.get('data2'))

const subjects = JSON.parse(JSON.stringify(subject))

function generateRandomQuestions(subject, questionCount) {
    const subjectQuestions = Object.values(subject.questions)
    
    for (let i = subjectQuestions.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [subjectQuestions[i], subjectQuestions[randomIndex]] = [subjectQuestions[randomIndex], subjectQuestions[i]]
    }

    return subjectQuestions.slice(0, questionCount)
}

function renderQuestions(selectedQuestions) {
    const form = document.createElement('form')
    form.id = 'quiz-form';

    selectedQuestions.forEach((questionObj, index) => {
        const questionContainer = document.createElement('div')
        questionContainer.className = 'question'

        const questionHolder = document.createElement('div')
        questionHolder.className = 'questionHolder'

        const questionText = document.createElement('p')
        questionText.className = 'theQuestion'
        questionText.innerText = `${index + 1}. ${questionObj.question}`
        questionHolder.appendChild(questionText)

        questionContainer.appendChild(questionHolder)

        const answers = [questionObj.answer, ...questionObj.wrong_answers]
        for (let i = answers.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[randomIndex]] = [answers[randomIndex], answers[i]]
        }

        answers.forEach((answer) => {
            const label = document.createElement('label')
            label.innerText = answer
            label.style.display = 'block'

            const radio = document.createElement('input')
            radio.className = "radio"
            radio.type = 'radio'
            radio.name = `question-${index}`
            radio.value = answer

            label.prepend(radio)
            questionContainer.appendChild(label)
        });

        form.appendChild(questionContainer)
    });

    const submitButtonContainer = document.createElement('div')
    const submitButton = document.createElement('button')
    submitButtonContainer.id = "submitButtonContainer"
    submitButton.type = 'submit'
    submitButton.style = '--clr:#39FF14'
    submitButton.innerHTML = '<span>Submit</span><i></i>'
    submitButtonContainer.appendChild(submitButton)

    form.appendChild(submitButtonContainer);

    document.body.appendChild(form)
    }

    let selectedQuestions = []

    if (subjects[selectedSubject]) {
        selectedQuestions = generateRandomQuestions(subjects[selectedSubject], questionCount)
        renderQuestions(selectedQuestions)
    } else {
        alert('Invalid subject selected!')
    }


    document.addEventListener('submit', (event) => {
        event.preventDefault()

        const formData = new FormData(document.getElementById('quiz-form'))
        const results = []

        selectedQuestions.forEach((questionObj, index) => {
            const userAnswer = formData.get(`question-${index}`)
            const correctAnswer = questionObj.answer;
            results.push({
                question: questionObj.question,
                userAnswer,
                correctAnswer,
                correct: userAnswer === correctAnswer
            })
        })

        finish(results)

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})

function finish(results){
    loadResults(results)
    loadChart(results)
    loadScore(results)
    loadReturnButton()
    storeResults()
}

//Crazy Happenings below 
function loadResults(results){
    const questionElements = document.querySelectorAll('.question')

    questionElements.forEach(element => {
        element.remove()
    });
    
    $("#submitButtonContainer").remove()

    for(var x = 0; x < results.length; x++){

        const div = document.createElement('div');
        var questionHolder = document.createElement('div')
        var theQuestion = document.createElement('p')
        var answer = document.createElement('p')
        var correct = document.createElement('p')  

        const question = results[x].question
        const userAnswer = results[x].userAnswer
        const correctAnswr = results[x].correctAnswer
        const isCorrect = results[x].correct

        div.id = (isCorrect) ? 'correct' : "wrong"
        questionHolder.className = "questionHolder"
        theQuestion.className = "theQuestion"
        answer.id = "userAnswer"
        correct.id = "correctAnswer"


        $("#quiz-form").append(div)
        div.append(questionHolder)
        questionHolder.append(theQuestion)
        div.append(answer)
        div.append(correct)

        theQuestion.innerHTML = question
        answer.innerHTML = "Your Answer: " + ((userAnswer != null) ? userAnswer : "No Answer")
        correct.innerHTML = "Correct Answer: " + correctAnswr
    }
}

function loadChart(results) {
    const correctCount = results.filter(result => result.correct).length
    const incorrectCount = results.length - correctCount

    const data = {
        datasets: [{
            data: [correctCount, incorrectCount],
            backgroundColor: ['#39FF14', 'red'],
            hoverOffset: 4
        }]
    };

    const chartContainer = document.createElement('div')
    chartContainer.id = 'chartContainer';
    document.getElementById('quiz-form').appendChild(chartContainer)

    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    new Chart(canvas, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw
                        }
                    }
                }
            }
        }
    });
}

function loadScore(results){
    const correctCount = results.filter(result => result.correct).length
    const incorrectCount = results.length - correctCount

    var scoreElement = document.createElement('p')
    scoreElement.id = "score"
    scoreElement.innerHTML = "Score: " + correctCount + "/" + results.length

    document.getElementById('quiz-form').appendChild(scoreElement)
}

function loadReturnButton(){
    var form = $("#quiz-form") 

    const submitButtonContainer = document.createElement('div')
    const submitButton = document.createElement('button')
    submitButtonContainer.id = "submitButtonContainer"
    submitButton.type = 'button'
    submitButton.style = '--clr:#39FF14';
    submitButton.innerHTML = '<span>Return</span><i></i>'
    submitButtonContainer.appendChild(submitButton)
    
    submitButton.addEventListener('click', () => {
        window.location.href = '../home.html'
    });
    
    form.append(submitButtonContainer);
}

function storeResults(){
    const correctCount = results.filter(result => result.correct).length;

    let cookieIndex = 1;

    while (document.cookie.includes(`correctCount${cookieIndex}=`)) {
        cookieIndex++;
    }

    document.cookie = `correctCount${cookieIndex}=${correctCount}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

}

