
import { Howl } from 'howler';

const letterContainer = document.getElementById('letter-container');
const optionsContainer = document.getElementById('options-container');
const userInputSection = document.getElementById('user-input-section');
const newGameContainer = document.getElementById('new-game-container');
const newGameButton = document.getElementById(
  'new-game-button',
) as HTMLButtonElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const resultText = document.getElementById('result-text');
const winsCount = document.getElementById('wins') as HTMLParagraphElement;
const losesCount = document.getElementById('loses') as HTMLParagraphElement;
const playAudioButton = document.getElementById(
  'play-audio',
) as HTMLButtonElement;
let context = canvas.getContext('2d');
const prefix = 'kka7705' as string;

let gameWins = 0 as number;
let gameLoses = 0 as number;
let winCount = 0 as number;
let count = 0 as number;
let chosenWord = '' as string;
let chosenWordCopy = [];
let displayItem = '' as string;

const backgroundMusic = new Howl({
  src: ['/sonic-hangman-game/audio/background-music.mp3'],
  loop: true,
  volume: 0.5,
});

const pressSound = new Howl({
  src: ['/sonic-hangman-game/audio/click.mp3'],
  loop: false,
  volume: 0.5,
});

playAudioButton.addEventListener('click', () => {
  if (playAudioButton.innerText == 'Play Audio') {
    backgroundMusic.play();
    //console.log('sound playing');
    playAudioButton.innerText = 'Stop Audio';
  } else if (playAudioButton.innerText == 'Stop Audio') {
    backgroundMusic.pause();
    //console.log('stopped audio');
    playAudioButton.innerText = 'Play Audio';
  }
});

const loadData = (prefix: string) => {
  let storage = '' as string | null;
  storage = localStorage.getItem(prefix);
  let json;
  try {
    json = JSON.parse(storage || '');
  } catch (error) {
    json = {};
  }

  return json;
};

const writeStorage = (key: string, value: number) => {
  const json = loadData(prefix); //get the data from the JSON
  json[key] = value;
  localStorage.setItem(prefix, JSON.stringify(json));
};

let options = {
  'sonic Characters': ['Sonic', 'Tails', 'Shadow', 'Knuckles', 'Amy', 'Eggman'],

  'sonic Quotes': [
    'Gotta go fast',
    'Get a load of this',
    'Youre too slow',
    'Approved',
    'Well this is new',
    'Thats a dumb place for a wall',
  ],

  'sonic Shows': [
    'Sonic Boom',
    'Sonic Prime',
    'Sonic X',
    'Sonic Underground',
    'Knuckles',
  ],
};

//generate a word based on what was clicked
const generateWord = (optionChosen: string) => {
  displayItem = '';
  //console.log('button has been clicked');
  let optionsButtons = document.querySelectorAll<HTMLButtonElement>('.options');

  //if the option chosen matches the buttons innerText then highlight the button
  optionsButtons.forEach((button) => {
    if (button.innerText.toLowerCase() === optionChosen.toLowerCase()) {
      button.classList.add('active');
    }

    button.disabled = true;
  });

  //remove the hide the letters to start off and clear the previous word
  letterContainer?.classList.remove('hide');
  userInputSection!.innerText = '';

  let optionArray = options[optionChosen as keyof typeof options];

  //get the random word from that array we chose now
  chosenWord = optionArray[Math.floor(Math.random() * optionArray.length)];
  chosenWord = chosenWord.toUpperCase();
  //console.log('got a word' + ' ' + chosenWord);

  chosenWordCopy = chosenWord.split(' ');

  //console.log('chosen word copy' + ' ' + chosenWordCopy);
  for (let word of chosenWordCopy) {
    displayItem += `<div class="words" data-letter="${word}">`;
    //console.log(word);
    for (let letter of word as any) {
      //console.log('writing ' + letter);
      displayItem += `<span class="dashes" data-letter="${letter}">_</span>`;
    }
    displayItem += `</div>`;
    if (chosenWord.length > 1) {
      displayItem += `<span class="spaces"> </span>`;
    }
  }

  userInputSection!.innerHTML = displayItem;
};

//show the options buttons
const displayOptions = () => {
  optionsContainer!.innerHTML += '<h3>Please Select An Option</h3>';
  let buttonCondition = document.createElement('div');
  for (let chosen in options) {
    //console.log('chosen' + chosen);
    const optionsButton = document.createElement('button');
    optionsButton.setAttribute('class', 'options');
    optionsButton.appendChild(document.createTextNode(chosen));
    optionsButton.addEventListener('click', () => {
      pressSound.play();
      //console.log('pressed');
      generateWord(chosen);
      preventButtons();
    });
    buttonCondition.append(optionsButton);
  }
  optionsContainer?.appendChild(buttonCondition);
};

const preventButtons = () => {
  let optionsButtons = document.querySelectorAll<HTMLButtonElement>('.options');
  optionsContainer!.innerHTML = '';
  optionsButtons.forEach((button) => {
    button.style.display = 'none';
    button.disabled = true;
  });
};

//prevent other buttons and letters from being pressed
const prevent = () => {
  let optionsButtons = document.querySelectorAll<HTMLButtonElement>('.options');
  let letterButtons = document.querySelectorAll<HTMLButtonElement>('.letters');

  optionsButtons.forEach((button) => {
    button.style.display = 'none';
    button.disabled = true;
  });

  letterButtons.forEach((button) => {
    button.disabled = true;
  });

  newGameContainer?.classList.remove('hide');
};

//this method gets called when the page loads or the user presses the new game
const initialize = () => {
  winCount = 0;
  count = 0;

  const keyWins = 'win';
  const keyLoses = 'lose';

  //to start off we want to take away all the content and hide the letters and
  //new game button
  userInputSection!.innerHTML = '';
  optionsContainer!.innerHTML = '';
  //hide the letter and new game container
  letterContainer?.classList.add('hide');
  newGameContainer?.classList.add('hide');
  letterContainer!.innerHTML = '';

  //create the buttons for letters
  for (let i = 65; i < 91; i++) {
    let button = document.createElement('button');
    button.setAttribute('data-letters', String.fromCharCode(i));
    button.classList.add('letters'); //add class for letters
    button.innerText = String.fromCharCode(i); //create each letter
    //if we click the button
    button.addEventListener('click', () => {
      pressSound.play();
      //console.log('pressed');
      let noSpaces = chosenWord.replace(/ /g, '');
      let charArray = noSpaces.split('');
      let dashes = document.getElementsByClassName(
        'dashes',
      ) as HTMLCollectionOf<HTMLElement>;
      //if array contains clicked value replace the matched dash with the
      //letter otherwise draw on the canvas for now
      //console.log('chosen word' + ' ' + chosenWord);
      if (charArray.includes(button.innerText)) {
        charArray.forEach((character, index) => {
          //if the character we pressed is the same as an element in the
          //array then replace the dash with the character we clicked
          if (character === button.innerText) {
            dashes[index].innerText = character;

            winCount += 1;

            if (winCount == charArray.length) {
              //console.log(chosenWord);
              gameWins += 1;
              //console.log('wins' + gameWins);
              resultText!.innerHTML = `<h2 class ='win-msg'>You Win!</h2><p>The answer was <span>${chosenWord}</span></p>`;
              winsCount.innerText = 'Wins: ' + gameWins;
              writeStorage(keyWins, gameWins);
              //now we want to block all the buttons since they won
              prevent();
            }
          }
        });
      } else {
        //this is the lose count
        count += 1;
        //draw part of the hangman
        drawMan(count);

        if (count == 6) {
          gameLoses += 1;
          resultText!.innerHTML = `<h2 class ='lose-msg'>Game Over!</h2><p>The answer was <span>${chosenWord}</span></p>`;
          losesCount.innerText = 'Loses: ' + gameLoses;
          writeStorage(keyLoses, gameLoses);
          prevent();
        }
      }

      //disbale the clicked button for the letter
      button.disabled = true;
    });

    letterContainer?.append(button);
  }

  displayOptions();

  //call this method to clear previous canvas as well as
  //create the starting canvas
  let { initialDrawing } = canvasCreate();

  initialDrawing();

  const data = loadData(prefix);
  let jsonWins = data[keyWins];
  let jsonLoses = data[keyLoses];
  if (jsonWins == undefined) {
    jsonWins = gameWins;
  } else {
    gameWins = jsonWins;
  }
  if (jsonLoses == undefined) {
    jsonLoses = gameLoses;
  } else {
    gameLoses = jsonLoses;
  }

  winsCount.innerText = 'Wins: ' + jsonWins;
  losesCount.innerText = 'Loses: ' + jsonLoses;
};

const canvasCreate = () => {
  context?.beginPath();
  context!.strokeStyle = 'black';
  context!.lineWidth = 2;

  const drawLine = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => {
    context?.moveTo(startX, startY);
    context?.lineTo(endX, endY);
    context?.stroke();
  };

  const head = () => {
    context!.strokeStyle = '#072ac8';
    context?.beginPath();
    context?.arc(70, 30, 10, 0, Math.PI * 2, true);
    context?.stroke();
  };

  const body = () => {
    context!.strokeStyle = '#29bf12';
    drawLine(70, 40, 70, 80);
  };

  const leftArm = () => {
    context!.strokeStyle = '#f48c06';
    drawLine(70, 50, 50, 70);
  };

  const rightArm = () => {
    context!.strokeStyle = '#ff4d6d';
    drawLine(70, 50, 90, 70);
  };

  const leftLeg = () => {
    context!.strokeStyle = '#ffd500';
    drawLine(70, 80, 50, 110);
  };

  const rightLeg = () => {
    context!.strokeStyle = '#ffd500';
    drawLine(70, 80, 90, 110);
  };

  //starting frame
  const initialDrawing = () => {
    context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context!.strokeStyle = '#f1303d';
    //canvas lines:
    //bottom line
    drawLine(10, 130, 130, 130);
    //left line
    drawLine(10, 10, 10, 131);
    //top line
    drawLine(10, 10, 70, 10);
    //small top line
    drawLine(70, 10, 70, 20);
  };

  return { initialDrawing, head, body, leftArm, rightArm, leftLeg, rightLeg };
};

//draw hangman
const drawMan = (count: number) => {
  let { head, body, leftArm, rightArm, leftLeg, rightLeg } = canvasCreate();
  switch (count) {
    case 1:
      head();
      break;
    case 2:
      body();
      break;
    case 3:
      leftArm();
      break;
    case 4:
      rightArm();
      break;
    case 5:
      leftLeg();
      break;
    case 6:
      rightLeg();
      break;
    default:
      break;
  }
};

newGameButton.addEventListener('click', initialize);
newGameButton.addEventListener('click', () => {
  pressSound.play();
  //console.log('pressed');
});

window.onload = initialize;
