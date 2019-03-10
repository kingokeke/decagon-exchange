/* eslint-disable no-unused-vars */

// ###################################
// FUNCTION DECLARATIONS
// ###################################

function cryptoNews(number_of_articles, number_of_chars, query = '', type = '') {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const API_KEY = 'f6968066194849a19cf97a517a1cd3b3';
  const SOURCE = 'crypto-coins-news';
  const TYPE = type === 'top' ? 'top-headlines' : 'everything';
  const url = `https://newsapi.org/v2/${TYPE}?q=${query}&sources=${SOURCE}&sortBy=publishedAt&apiKey=${API_KEY}`;
  const req = new Request(url);
  fetch(req)
    .then(response => response.json())
    .then(data => {
      for (let i = 0; i < number_of_articles; i++) {
        const item = data.articles[i];
        const post = `
      <div class="ml-3">
      <h4><a href="${item.url}" target="_blank" class="m-b-0 font-medium p-0">${item.title}</a></h4>
      <p class="text-muted">
        ${item.description.slice(0, number_of_chars)}... <br />
        <a href="${item.url}" target="_blank">Read more</a>
      </p>
      </div>
      <div class="ml-4 mr-3">
      <div class="text-center">
      <h5 class="text-muted m-b-0">${new Date(item.publishedAt).getDate()}</h5>
      <span class="text-muted font-16">${MONTHS[new Date(item.publishedAt).getMonth()]}</span>
      </div>
      </div>
      `;
        const article = document.createElement('li');
        article.classList.add('d-flex', 'no-block', 'card-body', 'border-top', 'article');
        article.innerHTML = post;
        document.querySelector('.cryptocurrency-news ul').appendChild(article);
      }
      const attribution = document.createElement('li');
      attribution.classList.add('d-flex', 'no-block', 'card-body', 'border-top', 'article', 'small');
      attribution.innerHTML = `<div class="text-center w-100"><p>Powered by <a href="https://newsapi.org" target="_blank">News API</a></p></div>`;
      document.querySelector('.cryptocurrency-news ul').appendChild(attribution);
    });
}

function generateCharacterList(...types) {
  // Helper function to generate list of characters for wallet addresses
  const array = [];
  for (let i = types.length; i--; ) {
    if (types[i] === 'numbers') {
      for (let i = 48; i <= 57; i++) {
        array[array.length] = String.fromCharCode(i);
      }
    }
    if (types[i] === 'uppercase') {
      for (let i = 65; i <= 90; i++) {
        array[array.length] = String.fromCharCode(i);
      }
    }
    if (types[i] === 'lowercase') {
      for (let i = 97; i <= 122; i++) {
        array[array.length] = String.fromCharCode(i);
      }
    }
  }

  return array;
}

function getRandomInteger(min, max) {
  // Helper function to get a random integer between a list of values
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function btcAddress() {
  // Function to generate random mock BTC and BCH addresses for user wallets
  const startNumber = ['1', '3'];
  let address = startNumber[Math.round(Math.random())];
  const characterList = generateCharacterList('numbers', 'lowercase', 'uppercase');
  const addressLength = getRandomInteger(30, 34);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function ethAddress() {
  // Function to generate random mock ETH addresses for user wallets
  let address = '0x';
  for (let i = 3; i--; ) {
    address += getRandomInteger(1e16, 1e17).toString(16);
  }
  return address.slice(0, 42);
}

function xrpAddress() {
  // Function to generate random mock XRP addresses for user wallets
  let address = 'r';
  let characterList = generateCharacterList('numbers', 'lowercase', 'uppercase');
  characterList = characterList.filter(x => !['0', 'O', 'I', 'l'].includes(x));
  const addressLength = getRandomInteger(25, 35);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function bchAddress() {
  // Function to generate random mock BCH addresses for user wallets
  let address = 'q';
  const characterList = generateCharacterList('numbers', 'lowercase');
  const addressLength = getRandomInteger(40, 42);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

// ###################################
// FUNCTION CALLS
// ###################################

// cryptoNews(7, 160, 'bitcoin');
console.log(btcAddress());
console.log(ethAddress());
console.log(xrpAddress());
console.log(bchAddress());

MBTEjQSiUDViwhk3yhGQNbWGFfsgC3GKRB;
