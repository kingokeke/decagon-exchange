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
  const addressLength = getRandomInteger(38, 42);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function ltcAddress() {
  // Function to generate random mock LTC addresses for user wallets
  let address = 'M';
  const characterList = generateCharacterList('numbers', 'lowercase', 'uppercase');
  const addressLength = getRandomInteger(32, 36);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function getBTCPrices() {
  const btcUSDPrice = document.querySelector('#bitcoin-usd-price');
  const btcNGNPrice = document.querySelector('#bitcoin-ngn-price');
  const proxyurl = 'https://cors-anywhere.herokuapp.com/';
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  fetch(proxyurl + url, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      // TO DO: CREATE A SECTION ON THE DASHBOARD FOR THIS AND MODIFY THIS PART TO WORK WITH IT
      const btcPrice = data.bitcoin.usd;
      const btcNairaPrice = Number(btcPrice * 360).toFixed(2);
      btcUSDPrice.innerHTML = `<div class="bitcoin-usd-price">&#36;${Number(btcPrice)}</div>`;
      btcNGNPrice.innerHTML = `<div class="bitcoin-naira-price">&#8358;${btcNairaPrice}</div>`;
    });
}

function generateQRCode(address, output) {
  // Function to generate qrcode for wallet addresses
  // Please note that qrcode.min.js must be included
  // on the HTML page before this function is invoked
  let walletType = '';
  switch (address[0]) {
    case '1':
    case '3':
      walletType = 'bitcoin';
      break;
    case '0':
      walletType = 'ethereum';
      break;
    case 'r':
      walletType = 'ripple';
      break;
    case 'q':
      walletType = 'bitcoincash';
      break;
    case 'M':
      walletType = 'litecoin';
      break;
  }
  const qrcode = new QRCode(document.querySelector(output), {
    text: `${walletType}:${address}`,
    width: 256,
    height: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
  });
  return qrcode;
}

function addWallet() {
  const div = document.createElement('div');
  div.classList.add('col-lg-6', 'wallet-instance');
  const walletContainer = document.querySelector('.wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Business</h5>
                          <p>Balance: 3.2 BTC</p>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-warning"><i class="fas fa-pencil-alt mr-2"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                          <button class="btn btn-primary">
                            <i class="fas fa-money-bill-alt mr-3"></i>Buy
                          </button>
                          <button class="btn btn-danger">
                            <i class="fas fa-money-bill-wave mr-3"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info"><i class="fas fa-paper-plane mr-3"></i>Send</button>
                          <button class="btn btn-success"><i class="fas fa-qrcode mr-3"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}
// ###################################
// FUNCTION CALLS
// ###################################

// cryptoNews(7, 160, 'bitcoin');
// const addWalletButton = document.querySelector('.add-wallet-button');
// addWalletButton.onclick = addWallet;
