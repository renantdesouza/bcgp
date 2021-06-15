Array.prototype.shuffle = function () {
  let i = this.length, j, temp;
  if (i === 0) {
    return this;
  }

  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;

  }
  return this;
}

const cardsDefinitions = [
  {
    id: "rei",
    name: "Rei",
    description: "A palavra rei possu\u00ED um R fraco",
    matchesWith: "r-fraco",
  },
  {
    id: "cronica",
    name: "Crônica",
    description: "A palavra cr\u00F4nica possu\u00ED um R intercalado",
    matchesWith: "r-intercalado",
  },
  {
    id: "carruagem",
    name: "Carruagem",
    description: "A palavra carruagem possu\u00ED um R forte",
    matchesWith: "r-forte",
  },
  {
    id: "porteiro",
    name: "Porteiro",
    description: "A palavra porteiro possu\u00ED um R interposto",
    matchesWith: "r-fraco",
  },
  {
    id: "r-fraco",
    name: "R fraco",
    description: "R fraco \u00E9 o r usado no come\u00E7o de uma palavra, como em rei",
    matchesWith: "rei",
  },
  {
    id: "r-intercalado",
    name: "R intercalado",
    description: "R intercalado \u00E9 o r entre uma vogal e uma consoante, como em cr\u00F4nica",
    matchesWith: "cronica",
  },
  {
    id: "r-forte",
    name: "R forte",
    description: "R forte \u00E9 o r entre duas vogais, utiliza-se RR, como em carruagem",
    matchesWith: "carruagem",
  },
  {
    id: "r-interposto",
    name: "R interposto",
    description: "R interposto \u00E9 o r ao fim de uma s\u00EDlaba, como em porteiro",
    matchesWith: "porteiro",
  },
];

/* A cross-browser requestAnimationFrame */
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
  return window.setTimeout(callback, 1000 / 60);
}

const timer = {
  count: 0,
  isStarted: false,
}

let timerInterval;
let clickInterval;

window.onload = function () {
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 1280;
  canvas.height = 720;

  const cards = [];

  const lines = [220, 380];
  const columns = [180, 400, 620, 840];

  const shuffledCards = cardsDefinitions.shuffle();
  let index = 0;

  lines.forEach(line => {
    columns.forEach(column => {
      const cardDefinition = shuffledCards[index++];
      const card = new Card({x: column, y: line}, cardDefinition);
      cards.push(card);
    })
  });

  timerInterval = setInterval(() => {
    if (timer.isStarted) {
      timer.count += 1;
    }
  }, 5000);

  let selectedCards = [];

  document.addEventListener('click', (event) => {
    if (clickInterval) {
      return;
    }

    // When click is triggered for the first time a count down begins to measure the the time until the end of the game.
    if (!timer.isStarted) {
      timer.isStarted = true;
    }

    const mousePositionX = event.pageX;
    const mousePositionY = event.pageY;

    // Collision detection between clicked offset and element.
    cards.forEach(function (card) {
      const {position, dimension, currentSide, sides} = card;

      const cardPositionX = position.x;
      const cardPositionY = position.y;

      const cardMaxPositionX = position.x + dimension.width;
      const cardMaxPositionY = position.y + dimension.height;

      // mouse is between mouse card(x,y) and card(x+w, y+h);
      if (cardPositionX < mousePositionX && cardPositionY < mousePositionY && cardMaxPositionX > mousePositionX && cardMaxPositionY > mousePositionY) {
        card.currentSide = currentSide === 1 ? 0 : 1;
        card.isClicked = true;

        selectedCards.push(card);
      }
    });

    if (selectedCards.length === 2) {
      clickInterval = setInterval(() => {
        const [first, second] = selectedCards;

        if (first.definition.props.matchesWith === second.definition.props.id) {
          first.matchFound = true;
          second.matchFound = true;

          status.score += 10;
        } else {
          cards.forEach(card => {
            card.currentSide = 0;
            card.isClicked = false
          });
        }

        selectedCards = [];
        clearInterval(clickInterval);
        clickInterval = undefined;
      }, 1000);
    }
  });

  const status = new Status();

  render(cards, canvas, context, status);
}

function render(cards, canvas, context, status) {
  const req = requestAnimationFrame(() => render(cards, canvas, context, status));
  try {
    context.clearRect(0, 0, canvas.width, canvas.height);

    status.draw(context);

    cards.forEach(card => {
      card.draw(context);

      if (card.isClicked) {
        card.definition.draw(context);
      }
    });
  } catch (e) {
    console.log(e);
    window.cancelAnimationFrame(req);
    clearInterval(timerInterval);
  }
}

class Status {

  score = 1000;

  draw = (context) => {
    const score = this.score - (timer.count * 50);

    context.beginPath();
    context.fillStyle = 'green';
    context.fillRect(550, 0, 100, 20);
    context.closePath();

    context.beginPath();
    context.font = "12px Arial";
    context.textAlign = 'center';
    context.fillStyle = "black";
    context.fillText(`${score}`, 600, 15, 100);
    context.closePath();
  }

}

class Card {

  currentSide = 0;

  sides = [];
  position = {
    x: 0,
    y: 0
  }
  dimension = {
    width: 200,
    height: 120,
  }
  definition = {
    draw: () => {
    },
  };
  isClicked = false;
  matchFound = false;

  constructor(position, definition) {
    this.position = position || {x: 0, y: 0};

    const {x, y} = this.position;
    const {width, height} = this.dimension;

    const back = new Side((context) => {
      context.beginPath();
      context.fillStyle = "red";
      context.fillRect(x, y, width, height);
      context.closePath();
    });

    this.sides.push(back);

    const front = new Side((context) => {
      context.beginPath();
      context.fillStyle = "blue";
      context.fillRect(x, y, width, height);
      context.closePath();

      context.beginPath();
      context.font = "12px Arial";
      context.textAlign = 'center';
      context.fillStyle = "black";
      context.fillText(`${definition.name}`, x + width / 2, y + height / 2, width);
      context.closePath();
    });

    this.sides.push(front);

    this.definition = new Definition(definition, (context) => {
      context.beginPath();
      context.fillStyle = 'green';
      context.fillRect(300, 600, 600, 20);
      context.closePath();

      context.beginPath();
      context.font = "16px Arial";
      context.textAlign = 'center';
      context.fillStyle = "black";
      context.fillText(`${definition.description}`, 600, 615, 500);
      context.closePath();
    });
  }

  draw = (context) => {
    if (this.matchFound) {
      return;
    }

    const side = this.sides[this.currentSide];
    side.draw(context);
  }

}

class Side {
  constructor(draw) {
    this.draw = draw;
  }
}

class Definition {
  constructor(props, draw) {
    this.draw = draw;
    this.props = props;
  }
}

