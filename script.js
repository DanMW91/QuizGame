"use strict";

const categories = [
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Entertainment: Books" },
  { id: 11, name: "Entertainment: Film" },
  { id: 12, name: "Entertainment: Music" },
  { id: 13, name: "Entertainment: Musicals & Theatres" },
  { id: 14, name: "Entertainment: Television" },
  { id: 15, name: "Entertainment: Video Games" },
  { id: 16, name: "Entertainment: Board Games" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 26, name: "Celebrities" },
  { id: 27, name: "Animals" },
  { id: 28, name: "Vehicles" },
  { id: 29, name: "Entertainment: Comics" },
  { id: 30, name: "Science: Gadgets" },
  { id: 31, name: "Entertainment: Japanese Anime & Manga" },
  { id: 32, name: "Entertainment: Cartoon & Animations" },
];

const questionRequest = document.querySelector(".question-request");
const questionBox = document.querySelector(".question");
const answers = document.querySelectorAll(".answer");
const playButton = document.querySelector(".play-button");
const playerInputFields = document.querySelectorAll(".text-field");
const setupContainer = document.querySelector(".setup-container");
const gameContainer = document.querySelector(".game-container");
const scoreNames = document.querySelectorAll(".score");
const requestText = document.querySelector(".request-text");
const subjectChoice = document.querySelectorAll(".subject-choice");
const nextQuestionButton = document.querySelector(".next-question");
const modalWindow = document.querySelector(".modal");
const resultModal = document.querySelector(".modal-result");
const questionModal = document.querySelector(".modal-questions");
const subjectChoices = document.querySelectorAll(".subject-choice");
const subjectPlayer = document.querySelector(".subject-choice-player");
const resultText = document.querySelector(".result-text");
const modalWinner = document.querySelector(".modal-winner");
const winnerText = document.querySelector(".winner-text");
const replayButton = document.querySelector(".replay-button");

class App {
  constructor() {
    this._token;
    this._getToken();
    this._activePlayer;
    this._currQuestion;
    this._players = [];

    subjectChoice.forEach((choice) => {
      choice.addEventListener("click", (e) => {
        const category = this.getCategory(e.target.innerText);

        modalWindow.classList.add("hidden");
        this.fetchQuestion(category);
        answers.forEach((answer) => answer.classList.remove("hidden"));
      });
    });

    nextQuestionButton.addEventListener("click", () => {
      this.populateCategories();
      resultModal.classList.add("hidden");
      questionModal.classList.remove("hidden");
    });

    replayButton.addEventListener("click", () => {
      window.location.reload();
    });

    answers.forEach((answer) =>
      answer.addEventListener("click", (e) => {
        this.checkAnswer(e.target.innerHTML);
        this.nextPlayerQuestion(this._players);
        this.updateScores(this._players);

        modalWindow.classList.remove("hidden");
        questionModal.classList.add("hidden");
        resultModal.classList.remove("hidden");
        this.checkScores();
        questionBox.textContent = "";
        answers.forEach((answer) => answer.classList.add("hidden"));
      })
    );

    playButton.addEventListener("click", () => {
      if (
        playerInputFields[0].value === "" ||
        playerInputFields[1].value === ""
      )
        return alert("Both players need names!");

      this.initialiseGame();
    });
  }

  initialiseGame() {
    playerInputFields.forEach((field) => {
      const playerName = field.value;
      const player = new Player(playerName, "history", "medium");
      this._players.push(player);
    });

    setupContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    this.setActivePlayer(this._players[0]);
    scoreNames.forEach((field, i) => {
      field.textContent = `${this._players[i]._name}: 0`;
    });
    modalWindow.classList.remove("hidden");
    this.populateCategories();
    resultModal.classList.add("hidden");
    questionModal.classList.remove("hidden");
  }

  getCategory(catName) {
    let category;
    categories.forEach((subject) => {
      if (subject.name === catName) category = subject.id;
    });
    return category;
  }

  nextPlayerQuestion(playersArr) {
    for (let i = 0; i < playersArr.length; i++) {
      if (playersArr[i] !== this._activePlayer)
        return this.setActivePlayer(playersArr[i]);
    }
  }

  setActivePlayer(player) {
    this._activePlayer = player;

    subjectPlayer.textContent = `${player._name} choose your category:`;
  }

  getJSON = async function (url) {
    try {
      const res = await fetch(url);
      return res.json();
    } catch (err) {
      console.error("error fetching JSON: " + err);
    }
  };

  _getToken = async function () {
    try {
      const res = await this.getJSON(
        "https://opentdb.com/api_token.php?command=request"
      );

      this._token = res.token;
    } catch (err) {
      console.error("Failed to retrieve token: " + err);
    }
  };

  checkAnswer(targetText) {
    if (this._currQuestion._correctAnswer === targetText) {
      resultText.textContent = "Correct!";
      this._activePlayer.updateScore();
    }
    if (this._currQuestion._correctAnswer !== targetText) {
      resultText.textContent = `Incorrect! Correct Answer: ${this._currQuestion._correctAnswer}`;
    }
  }

  updateScores(players) {
    players.forEach((player, i) => {
      scoreNames[i].textContent = `${player._name}: ${player.score}`;
    });
  }

  checkScores() {
    this._players.forEach((player) => {
      if (player.score >= 3) {
        winnerText.textContent = `Correct! ${player._name} Wins!`;
        resultModal.classList.add("hidden");
        modalWinner.classList.remove("hidden");
      }
    });
  }

  populateCategories() {
    subjectChoices.forEach((window) => {
      let randNum = Math.floor(Math.random() * 23);

      window.textContent = categories[randNum].name;
    });
  }

  fetchQuestion = async function (category) {
    const player = this._activePlayer;
    const token = this._token;

    try {
      const res = await this.getJSON(
        `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${player.difficulty}&type=multiple&token=${token}`
      );

      this.parseQuestion(res);
    } catch (err) {
      console.error("Failed to load questions: " + err);
    }
  };

  parseQuestion(res) {
    const question = new Question(
      res.results[0].question,
      res.results[0].category,
      res.results[0].correct_answer,
      res.results[0].incorrect_answers
    );
    this._currQuestion = question;
    this.renderQuestion();
  }

  renderQuestion() {
    questionBox.innerHTML = this._currQuestion._question;
    answers.forEach((answerBox, i) => {
      answerBox.innerHTML = this._currQuestion._allAnswers[i];
    });
  }
}

class Question {
  constructor(question, category, correctAnswer, incorrectAnswers) {
    this._question = question;
    this._correctAnswer = correctAnswer;
    this._incorrectAnswers = incorrectAnswers;
    this._allAnswers;
    this._category = category;
    this.generateAnswers();
  }

  generateAnswers() {
    const index = Math.floor(Math.random() * 4);
    this._incorrectAnswers.splice(index, 0, this._correctAnswer);
    this._allAnswers = this._incorrectAnswers;
  }
}

class Player {
  constructor(name, preferredSubject, difficulty) {
    this._name = name;
    this._preferredSubject = preferredSubject;
    this._difficulty = difficulty;
    this.score = 0;
  }
  get difficulty() {
    return this._difficulty;
  }
  updateScore() {
    this.score++;
  }
  resetScore() {
    this.score = 0;
  }
}

const game = new App();
