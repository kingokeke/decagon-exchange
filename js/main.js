/* eslint-disable no-unused-vars, no-undef */

$(document).ready(function() {
  // Helper function to populate transactions table
  $('#page-title').click(() => {
    createTransaction('Personal BTC Wallet', 1, 1, 'BTC', 'send');
  });

  if ($('#wallets-page')) {
    $('#add-bitcoin-wallet-modal .btn-success').click(() => {
      const bitcoinWalletName = $('#new-bitcoin-wallet-name').val();
      addWallet('BTC', 1, bitcoinWalletName);
    });
    $('#add-ethereum-wallet-modal .btn-success').click(() => {
      const ethereumWalletName = $('#new-ethereum-wallet-name').val();
      addWallet('ETH', 1, ethereumWalletName);
    });
    $('#add-ripple-wallet-modal .btn-success').click(() => {
      const rippleWalletName = $('#new-ripple-wallet-name').val();
      addWallet('XRP', 1, rippleWalletName);
    });
    $('#add-litecoin-wallet-modal .btn-success').click(() => {
      const litecoinWalletName = $('#new-litecoin-wallet-name').val();
      addWallet('LTC', 1, litecoinWalletName);
    });
    $('#add-bitcoin-cash-wallet-modal .btn-success').click(() => {
      const bitcoinCashWalletName = $('#new-bitcoin-cash-wallet-name').val();
      addWallet('BCH', 1, bitcoinCashWalletName);
    });
  }
  listWallets(1, 'BTC');
  listWallets(1, 'ETH');
  listWallets(1, 'XRP');
  listWallets(1, 'LTC');
  listWallets(1, 'BCH');
  listTransactions(1, 'BTC');

  $('#wallets-page').on('click', '.edit-wallet-button', function() {
    $.get(`http://localhost:3000/wallets?id=${$(this).val()}`, data => {
      $(`#edit-${data[0]['coin-name']}-wallet-name`).val(`${data[0]['wallet-name']}`);
      $(`#update-${data[0]['coin-symbol'].toLowerCase()}-wallet-name-button`).click(function() {
        data[0]['wallet-name'] = $(`#edit-${data[0]['coin-name']}-wallet-name`).val();
        $.ajax({
          type: 'PUT',
          url: `http://localhost:3000/wallets/${data[0]['id']}`,
          data: data[0],
        });
      });
      $(`#delete-${data[0]['coin-symbol'].toLowerCase()}-wallet-name-button`).click(function() {
        if (data[0]['coin-balance'] <= 0) {
          data[0]['is-wallet-active'] = 0;
          $.ajax({
            type: 'PUT',
            url: `http://localhost:3000/wallets/${data[0]['id']}`,
            data: data[0],
          });
        } else {
          alert('Account is not empty');
        }
      });
    });
  });

  // Wallet Receive Button Functionality
  $('#wallets-page').on('click', '.receive-button', function() {
    $.get(`http://localhost:3000/wallets?id=${$(this).val()}`, data => {
      if ($(`#${data[0]['coin-symbol'].toLowerCase()}-qrcode-output`).html()) {
        $(`#${data[0]['coin-symbol'].toLowerCase()}-qrcode-output`).html('');
      }
      generateQRCode(`${data[0]['wallet-address']}`, `#${data[0]['coin-symbol'].toLowerCase()}-qrcode-output`);
      $(`input.wallet-address`).val(`${data[0]['wallet-address']}`);
    });
  });

  // Wallet Send Button Functionality
  $('#wallets-page').on('click', '.send-button', function() {
    $.get(`http://localhost:3000/wallets?id=${$(this).val()}`, senderData => {
      $(`#send-${senderData[0]['coin-symbol'].toLowerCase()}-modal-button`).click(function() {
        const sendAmount = $(`#send-${senderData[0]['coin-symbol'].toLowerCase()}-amount`).val();
        const sendAddress = $(`#send-${senderData[0]['coin-symbol'].toLowerCase()}-address`).val();
        $.get(`http://localhost:3000/wallets?wallet-address=${sendAddress}`, receiverData => {
          receiverData[0]['coin-balance'] = parseFloat(receiverData[0]['coin-balance']) + parseFloat(sendAmount);
          senderData[0]['coin-balance'] = parseFloat(senderData[0]['coin-balance']) - parseFloat(sendAmount);
          $.ajax({
            type: 'PUT',
            url: `http://localhost:3000/wallets/${receiverData[0]['id']}`,
            data: receiverData[0],
            success: function(res) {
              $.ajax({
                type: 'PUT',
                url: `http://localhost:3000/wallets/${senderData[0]['id']}`,
                data: senderData[0],
              });
            },
          });
        });
      });
    });
  });

  $('#wallets-page').on('click', '.sell-button', function() {
    $.get(`http://localhost:3000/wallets?id=${$(this).val()}`, walletData => {
      $(`#${walletData[0]['coin-symbol'].toLowerCase()}-sell-button`).click(function() {
        if ($(`#${walletData[0]['coin-symbol'].toLowerCase()}-sell-amount`).val()) {
          const sellAmount = $(`#${walletData[0]['coin-symbol'].toLowerCase()}-sell-amount`).val();
          console.log(sellAmount);
          let coinBalance = walletData[0]['coin-balance'];
          console.log(coinBalance);
          const proxyurl = 'https://cors-anywhere.herokuapp.com/';
          const url = `https://api.coingecko.com/api/v3/simple/price?ids=${walletData[0][
            'coin-name'
          ].toLowerCase()}&vs_currencies=usd`;
          $.get(`http://localhost:3000/users?id=${walletData[0]['user-id']}`, userData => {
            let accountBalance = parseFloat(userData[0]['usd-balance']);
            console.log(accountBalance);
            $.get(`${proxyurl + url}`, coinData => {
              const currentPrice = coinData[`${walletData[0]['coin-name']}`]['usd'];
              const usdEquivalent = (parseFloat(currentPrice) * parseFloat(sellAmount)).toFixed(2);
              accountBalance = parseFloat(accountBalance) + parseFloat(usdEquivalent);
              coinBalance = parseFloat(coinBalance) - parseFloat(sellAmount);

              userData[0]['usd-balance'] = String(Number(accountBalance).toFixed(2));
              walletData[0]['coin-balance'] = String(Number(coinBalance).toFixed(8));
              $.ajax({
                type: 'PUT',
                url: `http://localhost:3000/users/${userData[0]['id']}`,
                data: userData[0],
                success: function(res) {
                  $.ajax({
                    type: 'PUT',
                    url: `http://localhost:3000/wallets/${walletData[0]['id']}`,
                    data: walletData[0],
                  });
                },
              });
            });
          });
        } else {
          alert('Enter an amount to sell');
        }
      });
    });
  });

  $('#wallets-page').on('click', '.buy-button', function() {
    $.get(`http://localhost:3000/wallets?id=${$(this).val()}`, walletData => {
      $(`#${walletData[0]['coin-symbol'].toLowerCase()}-buy-button`).click(function() {
        if ($(`#${walletData[0]['coin-symbol'].toLowerCase()}-buy-amount`).val()) {
          const buyAmount = $(`#${walletData[0]['coin-symbol'].toLowerCase()}-buy-amount`).val();
          console.log(buyAmount);
          let coinBalance = walletData[0]['coin-balance'];
          console.log(coinBalance);
          const proxyurl = 'https://cors-anywhere.herokuapp.com/';
          const url = `https://api.coingecko.com/api/v3/simple/price?ids=${walletData[0][
            'coin-name'
          ].toLowerCase()}&vs_currencies=usd`;
          $.get(`http://localhost:3000/users?id=${walletData[0]['user-id']}`, userData => {
            let accountBalance = parseFloat(userData[0]['usd-balance']);
            console.log(accountBalance);
            $.get(`${proxyurl + url}`, coinData => {
              const currentPrice = coinData[`${walletData[0]['coin-name']}`]['usd'];
              const coinEquivalent = (parseFloat(buyAmount) / parseFloat(currentPrice)).toFixed(8);
              accountBalance = parseFloat(accountBalance) - parseFloat(buyAmount);
              coinBalance = parseFloat(coinBalance) + parseFloat(coinEquivalent);
              userData[0]['usd-balance'] = String(Number(accountBalance).toFixed(2));
              walletData[0]['coin-balance'] = String(Number(coinBalance).toFixed(8));
              $.ajax({
                type: 'PUT',
                url: `http://localhost:3000/users/${userData[0]['id']}`,
                data: userData[0],
                success: function(res) {
                  $.ajax({
                    type: 'PUT',
                    url: `http://localhost:3000/wallets/${walletData[0]['id']}`,
                    data: walletData[0],
                  });
                },
              });
            });
          });
        } else {
          alert('Enter an amount to sell');
        }
      });
    });
  });

  $('#display-name').text(user.firstname);
  /**LOGOUT BUTTON ACTION */
  $('#logout-button').on('click', e => {
    e.preventDefault();
    logout();
  });

  $('.input-group-append').on('click', '.edit-wallet-button', function() {
    copyText(`.input.wallet-address`);
  });

  // Data Tables functionality
  $('.transactions-datatable').DataTable();
});

const user = getLocalStorageValue('user');
if (!user) {
  window.location.href = 'login.html';
}

// ###################################
// FUNCTION CALLS
// ###################################

// cryptoNews(7, 160, 'bitcoin');
// const addBitcoinWalletButton = document.querySelector('#add-bitcoin-wallet-button');
// const addEthereumWalletButton = document.querySelector('#add-ethereum-wallet-button');
// const addRippleWalletButton = document.querySelector('#add-ripple-wallet-button');
// const addLitecoinWalletButton = document.querySelector('#add-litecoin-wallet-button');
// const addBitcoinCashWalletButton = document.querySelector('#add-bitcoin-cash-wallet-button');
// addBitcoinWalletButton.onclick = () => addBTCWallet();
// addEthereumWalletButton.onclick = () => addETHWallet();
// addRippleWalletButton.onclick = () => addXRPWallet();
// addLitecoinWalletButton.onclick = () => addLTCWallet();
// addBitcoinCashWalletButton.onclick = () => addBCHWallet();

// console.log(btcAddress());

// console.log(createTransactionID());
//

function copyText(target) {
  const copyText = document.querySelector(target);
  copyText.select();
  document.execCommand('copy');
}

function listTransactions(user_id, coin_symbol) {
  $.get(`http://localhost:3000/transactions?user-id=${user_id}&coin-symbol=${coin_symbol}`, data => {
    for (let item of data) {
      if (item['transaction-type'] === 'buy' || item['transaction-type'] === 'sell') {
        let message = ``;
        const tr = $(`<tr id=${item['id']}></tr>`);
        message += `<td class="sorting_1" tabindex="0">${item['timestamp']}</td>`;
        message += `<td>${item['wallet-name']}</td>`;
        message += `<td style="text-transform: capitalize;">${item['transaction-type']}</td>`;
        if (item['transaction-type'] === 'buy') {
          message += `<td>$${item['amount-spent']}</td>`;
          message += `<td>${item['amount-received']} ${item['coin-symbol']}</td>`;
        }
        if (item['transaction-type'] === 'sell') {
          message += `<td>${item['amount-spent']} ${item['coin-symbol']}</td>`;
          message += `<td>$${item['amount-received']}</td>`;
        }
        message += `<td>${item['transaction-id']}</td>`;
        tr.append(message);
        $(`#${coin_symbol.toLowerCase()}-buy-sell-transactions-table`).append(tr);
      }
      if (item['transaction-type'] === 'send' || item['transaction-type'] === 'receive') {
        let message = ``;
        const tr = $(`<tr id=${item['id']}></tr>`);
        message += `<td class="sorting_1" tabindex="0">${item['timestamp']}</td>`;
        message += `<td>${item['wallet-name']}</td>`;
        message += `<td style="text-transform: capitalize;">${item['transaction-type']}</td>`;
        message += `<td>$${item['sender-address']}</td>`;
        message += `<td>$${item['receiver-address']}</td>`;
        message += `<td>${item['amount-transferred']} ${item['coin-symbol']}</td>`;
        message += `<td>${item['transaction-id']}</td>`;
        tr.append(message);
        $(`#${coin_symbol.toLowerCase()}-send-receive-transactions-table`).append(tr);
      }
    }
  });
}

function listWallets(user_id, coin) {
  $.get(`http://localhost:3000/wallets?user-id=${user_id}&coin-symbol=${coin}`, data => {
    let icon = '';

    switch (coin) {
      case 'BTC':
        icon = '<i class="cf cf-btc mr-2">';
        break;
      case 'ETH':
        icon = '<i class="cf cf-eth mr-2" />';
        break;
      case 'LTC':
        icon = '<i class="cf cf-ltc mr-2" />';
        break;
      case 'XRP':
        icon = '<i class="cf cf-xrp mr-2" />';
        break;
      case 'BCH':
        icon = '<i class="cf cf-btc-alt mr-2" />';
        break;
    }

    for (let item of data) {
      if (item['is-wallet-active'] != 0) {
        const myDiv = $(`<div id=${item['id']} class='col-12 wallet-instance'></div>`);
        const message = `<div class="card">
                  <div class="card-body">
                    <div class="d-flex">
                      <div>
                        <h5>${item['wallet-name']}</h5>
                        <p>Balance: ${item['coin-balance']} ${coin}</p>
                      </div>
                      <div class="ml-auto">
                        <button value=${
                          item.id
                        } class="btn btn-warning edit-wallet-button" data-toggle="modal" data-target="#edit-${
          item['coin-name']
        }-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="d-flex">
                      <div>
                        <button value=${item.id} class="btn btn-primary buy-button" data-target="#buy-${
          item['coin-name']
        }-modal" data-toggle="modal">${icon}</i>Buy</button>
                        <button value=${item.id} class="btn btn-danger sell-button" data-target="#sell-${
          item['coin-name']
        }-modal" data-toggle="modal">
                          <i class="fas fa-money-bill-wave mr-2"></i>Sell
                        </button>
                      </div>
                      <div class="ml-auto">
                        <button value=${item.id} class="btn btn-info send-button" data-target="#send-${
          item['coin-name']
        }-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                        <button value=${item.id} class="btn btn-success receive-button" data-target="#receive-${
          item['coin-name']
        }-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                      </div>
                    </div>
                  </div>
                </div>`;
        myDiv.append(message);
        $(`#${item['coin-name']}-wallet-container`).append(myDiv);
      }
    }
  });
}

// function walletHandlers() {
//   $('.edit-wallet-button').click(e => {
//     alert('yep');
//     e.preventDefault();
//     const walletID = $(this).attr('value');
//     alert(walletID);
//     console.log(walletID);
//   });
// }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/**Delete this item from cached memory */
function removeLocalStorageValue(key) {
  window.localStorage.removeItem(key);
}
function logout() {
  removeLocalStorageValue('user');
  window.location.href = 'login.html';
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

function generateTransactionID() {
  let transactionID = '';
  const characterList = generateCharacterList('numbers', 'lowercase', 'uppercase');
  for (let i = 60; i--; ) {
    transactionID += characterList[getRandomInteger(0, characterList.length)];
  }
  return transactionID;
}

function getCurrentCryptoPrice(coin) {
  const proxyurl = 'https://cors-anywhere.herokuapp.com/';
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
  $.get(`${proxyurl + url}`, data => {
    return data[coin]['usd'];
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
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
  });
  return qrcode;
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function createTransaction(wallet_name, wallet_id, user_id, coin_symbol, transaction_type) {
  const coinName = (() => {
    if (coin_symbol === 'BTC') return 'Bitcoin';
    if (coin_symbol === 'ETH') return 'Ethereum';
    if (coin_symbol === 'LTC') return 'Litecoin';
    if (coin_symbol === 'XRP') return 'Ripple';
    if (coin_symbol === 'BCH') return 'Bitcoin Cash';
  })();

  const transactionDetails = {
    timestamp: new Date().toUTCString(),
    'wallet-name': wallet_name,
    'wallet-id': wallet_id,
    'transaction-type': transaction_type, // Buy, Sell, Receive, Send
    'transaction-id': generateTransactionID(),
    'user-id': user_id,
    'coin-symbol': coin_symbol,
    'coin-name': coinName,
  };

  if (transaction_type === 'buy') {
    transactionDetails['amount-spent'] = `1000`;
    transactionDetails['amount-received'] = '3';
  }

  if (transaction_type === 'sell') {
    transactionDetails['amount-spent'] = `3`;
    transactionDetails['amount-received'] = '1000';
  }

  if (transaction_type === 'send') {
    transactionDetails['amount-transferred'] = '2.12';
    transactionDetails['sender-address'] = btcAddress();
    transactionDetails['receiver-address'] = btcAddress();
  }

  if (transaction_type === 'receive') {
    transactionDetails['amount-transferred'] = '2.9';
    transactionDetails['sender-address'] = btcAddress();
    transactionDetails['receiver-address'] = btcAddress();
  }

  $.ajax({
    method: 'POST',
    url: 'http://localhost:3000/transactions',
    data: transactionDetails,
  });
}

/**Get ached user */
function getLocalStorageValue(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

function addWallet(coin_symbol, user_id, wallet_name = '') {
  let walletAddress = '';
  let walletName = '';
  let coinName = '';

  switch (coin_symbol) {
    case 'BTC':
      walletAddress = btcAddress();
      walletName = 'Bitcoin Wallet #1';
      coinName = 'bitcoin';
      break;
    case 'ETH':
      walletAddress = ethAddress();
      walletName = 'Ethereum Wallet #1';
      coinName = 'ethereum';
      break;
    case 'XRP':
      walletAddress = xrpAddress();
      walletName = 'Ripple Wallet #1';
      coinName = 'ripple';
      break;
    case 'LTC':
      walletAddress = ltcAddress();
      walletName = 'Litecoin Wallet #1';
      coinName = 'litecoin';
      break;
    case 'BCH':
      walletAddress = bchAddress();
      walletName = 'Bitcoin Cash Wallet #1';
      coinName = 'bitcoin cash';
      break;
  }

  if (wallet_name) {
    walletName = wallet_name;
  }

  const walletData = {
    'wallet-name': walletName,
    'wallet-address': walletAddress,
    'coin-balance': 0,
    'coin-symbol': coin_symbol,
    'coin-name': coinName,
    'user-id': user_id,
    'is-wallet-active': 1,
  };

  $.ajax({
    method: 'POST',
    url: 'http://localhost:3000/wallets',
    data: walletData,
  });
}
