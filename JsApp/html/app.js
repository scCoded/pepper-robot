var session = new QiSession(function(session) {
    $("#connection").text("Connection established!");
}, function() {
    $("#connection").text("Could not connect to the robot");
});

var randomPepperDialogs = ["hey there user", "hi!", "howdy", "don't poke me", "can I help?", "are you having fun?", "what's up?", "hope your turing good!", "i am a robot"]
var currentQuestionType = "";
var questionTypes = ["text-input-q", "multiple-choice-q", "slider-q"];
var questions = [
    ["How happy have you felt at school so far this year? (1 being not much, 10 meaning that it's the best year so far)", questionTypes[2]],
    ["Which subject do you like the most?", questionTypes[1],
        ["Maths", "English", "Art", "Science"]
    ],
    ["What is the main reason for liking this subject?", questionTypes[0]],
    ["What's the best part of the day at school?", questionTypes[0]],
    ["How much do you enjoy the school lunch? (1 being not much, 10 meaning that you love the school lunch!) ", questionTypes[2]],
    ["Which subject do you find less fun?", questionTypes[1],
        ["Maths", "English", "Art", "Science"]
    ],
    ["Why do you find it a bit less fun?", questionTypes[0]],
    ["How hard is the homework? (1 being easy, 10 being super difficult)", questionTypes[2]],
    ["Did you enjoy interacting with me today?", questionTypes[1],
        ["Yes!", "It was interesting", "A bit different", "Not really, sorry"]
    ],
    ["Any idea to make school better?", questionTypes[0]]
];
var questionNumber = 1;
var answers = "";
var userAmount = "";
var userNumber = 1;
var studentResults = "<h2>Student Results</h2>";
var email = "";

$(document).ready(function() {
    //setup slider type question
    var slider = document.getElementById("slider-range");
    var sliderValue = document.getElementById("slider-q-value");
    sliderValue.innerHTML = slider.value;
    slider.oninput = function() {
        sliderValue.innerHTML = this.value;
    }
    getUserAmount();
    randomEyes(2.0);
    setProgressBar();
    performSpeech("Welcome to the survey");
    showQuestion();

    $("#submitAnswer").mousedown(function(e) { // handle the mousedown event
        e.preventDefault(); // prevent the textarea to loose focus!
    })
    $("#submitAnswer").click(function() {
        var answer;
        //text input question
        if (currentQuestionType == questionTypes[0]) {
            answer = $("#answer").val();
            if (answer == "") {
                performSpeech("Please enter an answer before moving onto the next question!");
                return;
            }
            $("#answer").val("");
            //multichoice question
        } else if (currentQuestionType == questionTypes[1]) {
            var red = $('.red-element').css("background-color");
            if ($('#a').css("background-color") == red) {
                answer = $('#a').text();
            } else if ($('#b').css("background-color") == red) {
                answer = $('#b').text();
            } else if ($('#c').css("background-color") == red) {
                answer = $('#c').text();
            } else if ($('#d').css("background-color") == red) {
                answer = $('#d').text();
            } else {
                performSpeech("Please select an answer before moving onto the next question!");
                return;
            }
            //slider question
        } else {
            answer = $('.slider').val();
            sliderValue.innerHTML = 5;
            $('.slider').val(5);
        }
        answers += "<li>Question " + questionNumber + ": '" + questions[questionNumber - 1][0] + ",  Answer - '" + answer + "'</li>";
        questionNumber++;
        if (questionNumber > questions.length) {
            //save user results
            studentResults += "<br><strong>User " + userNumber + " Results: </strong><ul>" + answers + "</ul><br>";
            userNumber++;
            //reset answers for next user
            answers = "";
            //next user
            performSpeech("Thanks for taking the survey");
            if (userNumber > userAmount) {
                finish();
            } else {
                questionNumber = 1;
                performSpeech("next user please!");
                setProgressBar();
                showQuestion();
            }
        } else {
            setProgressBar();
            showQuestion();
        }
    });
});

function showQuestion() {
    currentQuestionType = questions[questionNumber - 1][1];
    //show answer container div based on questionType
    if (questionTypes[0] == currentQuestionType) {
        $('.' + questionTypes[0]).show();
        $('.' + questionTypes[1]).hide();
        $('.' + questionTypes[2]).hide();
    } else if ((questionTypes[1] == currentQuestionType)) {
        $("#a").html(questions[questionNumber - 1][2][0]);
        $("#b").html(questions[questionNumber - 1][2][1]);
        $("#c").html(questions[questionNumber - 1][2][2]);
        $("#d").html(questions[questionNumber - 1][2][3]);
        $('.' + questionTypes[1]).show();
        $('.' + questionTypes[0]).hide();
        $('.' + questionTypes[2]).hide();
    } else {
        $('.' + questionTypes[2]).show();
        $('.' + questionTypes[0]).hide();
        $('.' + questionTypes[1]).hide();
    }

    (questionNumber == questions.length) ? $("#submitAnswer").html("Finish →"): $("#submitAnswer").html("Next →");
    $("#question").text(questions[questionNumber - 1][0]);
    performSpeech("Question " + questionNumber + ". " + (questions[questionNumber - 1][0]));
}

function performSpeech(speech) {
    session.service("ALAnimatedSpeech").then(function(tts) {
        tts.say(speech);
    });
}

function getUserAmount() {
    userAmount = prompt("How many students are doing the survey today: ");
    if (userAmount > 0 && userAmount < 100 && Number.isInteger(+userAmount)) {
        return;
    } else {
        alert("Invalid input, try again.");
        resetConnection();
        getUserAmount();
    }
}

function randomEyes(duration) {
    session.service("ALLeds").then(function(leds) {
        leds.rasta(duration);
    });
}

function setProgressBar() {
    var completionPercentage = Math.ceil(((questionNumber / questions.length) * 100) / 5) * 5;
    $("#progress").attr('value', completionPercentage);
    $("#progress").attr('data-label', completionPercentage + '% Complete');
}

function getRandomInt() {
    return Math.floor(Math.random() * randomPepperDialogs.length);
}

function changePepperDialog() {
    var dialog = randomPepperDialogs[getRandomInt()]
    $(".box").text(dialog);
    performSpeech(dialog);
}

function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

function getEmail() {
    email = prompt("What email should results be sent to?: ");
    if (!validateEmail(email)) {
        alert("Invalid email, try again.");
        resetConnection();
        getEmail();
    }
}

function resetConnection() {
    session = new QiSession(function(session) {
        $("#connection").text("Connection established!");
    }, function() {
        $("#connection").text("Could not connect to the robot");
    });
}

function finish() {
    getEmail();
    performSpeech("trying to send results");
    Email.send({
        Host: "smtp.mailtrap.io",
        Username: "aa42014ef14a30",
        Password: "81c38ff6c90b23",
        To: email,
        From: `PepperRobot@test-feeback-survey.com`,
        Subject: `School Feedback From Pepper Robot`,
        Body: `<html>
        <p>Hello User,
        </p>
        <br><p>Here are the results. Hope the class had a great day!</p>
        <br><p> Thanks!</p><br><p>From Pepper.</p>
        <br>` + studentResults +
            `</html>`
    }).then(
        performSpeech("Results have been sent to email.")
    );
}