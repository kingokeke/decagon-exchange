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

function addBTCWallet() {
  const div = document.createElement('div');
  div.classList.add('col-12', 'wallet-instance');
  const walletContainer = document.querySelector('#bitcoin-wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Bitcoin Wallet #1</h5>
                          <p>Balance: 3.2 BTC</p>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-warning" data-toggle="modal" data-target="#edit-bitcoin-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                          <button class="btn btn-primary" data-target="#buy-bitcoin-modal" data-toggle="modal"><i class="cf cf-btc mr-2"></i>Buy</button>
                          <button class="btn btn-danger" data-target="#sell-bitcoin-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info" data-target="#send-bitcoin-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button class="btn btn-success" data-target="#receive-bitcoin-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}
function addETHWallet() {
  const div = document.createElement('div');
  div.classList.add('col-12', 'wallet-instance');
  const walletContainer = document.querySelector('#ethereum-wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Ethereum wallet #1</h5>
                          <p>Balance: 11.3 ETH</p>
                        </div>
                        <div class="ml-auto">
                            <button class="btn btn-warning" data-toggle="modal" data-target="#edit-ethereum-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                            <button class="btn btn-primary" data-target="#buy-ethereum-modal" data-toggle="modal"><i class="cf cf-eth mr-2"></i>Buy</button>
                          <button class="btn btn-danger" data-target="#sell-ethereum-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info" data-target="#send-ethereum-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button class="btn btn-success" data-target="#receive-ethereum-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}
function addXRPWallet() {
  const div = document.createElement('div');
  div.classList.add('col-12', 'wallet-instance');
  const walletContainer = document.querySelector('#ripple-wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Ripple Wallet #1</h5>
                          <p>Balance: 3667 XRP</p>
                        </div>
                        <div class="ml-auto">
                            <button class="btn btn-warning" data-toggle="modal" data-target="#edit-ripple-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                            <button class="btn btn-primary" data-target="#buy-ripple-modal" data-toggle="modal"><i class="cf cf-xrp mr-2"></i>Buy</button>
                          <button class="btn btn-danger" data-target="#sell-ripple-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info" data-target="#send-ripple-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button class="btn btn-success" data-target="#receive-ripple-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}
function addLTCWallet() {
  const div = document.createElement('div');
  div.classList.add('col-12', 'wallet-instance');
  const walletContainer = document.querySelector('#litecoin-wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Litecoin Wallet #1</h5>
                          <p>Balance: 35.9 LTC</p>
                        </div>
                        <div class="ml-auto">
                            <button class="btn btn-warning" data-toggle="modal" data-target="#edit-litecoin-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                            <button class="btn btn-primary" data-target="#buy-litecoin-modal" data-toggle="modal"><i class="cf cf-ltc mr-2"></i></i>Buy</button>
                          <button class="btn btn-danger" data-target="#sell-litecoin-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info" data-target="#send-litecoin-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button class="btn btn-success" data-target="#receive-litecoin-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}
function addBCHWallet() {
  const div = document.createElement('div');
  div.classList.add('col-12', 'wallet-instance');
  const walletContainer = document.querySelector('#bitcoin-cash-wallet-container');
  const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>Bitcoin Cash Wallet #1</h5>
                          <p>Balance: 3.2 BCH</p>
                        </div>
                        <div class="ml-auto">
                            <button class="btn btn-warning" data-toggle="modal" data-target="#edit-bitcoin-cash-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                          <button class="btn btn-primary" data-target="#buy-bitcoin-cash-modal" data-toggle="modal"><i class="cf cf-btc-alt mr-2"></i>Buy</button>
                          <button class="btn btn-danger" data-target="#sell-bitcoin-cash-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button class="btn btn-info" data-target="#send-bitcoin-cash-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button class="btn btn-success" data-target="#receive-bitcoin-cash-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
  div.innerHTML = message;
  walletContainer.appendChild(div);
}

$(document).ready(function() {
  $('.transactions-datatable').DataTable();
});
// ###################################
// FUNCTION CALLS
// ###################################

// cryptoNews(7, 160, 'bitcoin');
const addBitcoinWalletButton = document.querySelector('#add-bitcoin-wallet-button');
const addEthereumWalletButton = document.querySelector('#add-ethereum-wallet-button');
const addRippleWalletButton = document.querySelector('#add-ripple-wallet-button');
const addLitecoinWalletButton = document.querySelector('#add-litecoin-wallet-button');
const addBitcoinCashWalletButton = document.querySelector('#add-bitcoin-cash-wallet-button');
addBitcoinWalletButton.onclick = () => addBTCWallet();
addEthereumWalletButton.onclick = () => addETHWallet();
addRippleWalletButton.onclick = () => addXRPWallet();
addLitecoinWalletButton.onclick = () => addLTCWallet();
addBitcoinCashWalletButton.onclick = () => addBCHWallet();
