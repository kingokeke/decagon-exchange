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

function listWallets(user_id, coin) {
  fetch(`http://localhost:3000/wallets?user-id=${user_id}&coin-name=${coin}`)
    .then(res => res.json())
    .then(data => {
      let icon = '';
      let coinName = '';
      switch (coin) {
        case 'BTC':
          icon = '<i class="cf cf-btc mr-2">';
          coinName = 'bitcoin';
          break;
        case 'ETH':
          icon = '<i class="cf cf-eth mr-2" />';
          coinName = 'ethereum';
          break;
        case 'LTC':
          icon = '<i class="cf cf-ltc mr-2" />';
          coinName = 'litecoin';
          break;
        case 'XRP':
          icon = '<i class="cf cf-xrp mr-2" />';
          coinName = 'ripple';
          break;
        case 'BCH':
          icon = '<i class="cf cf-btc-alt mr-2" />';
          coinName = 'bitcoin-cash';
          break;
      }

      for (let item of data) {
        if (item['is-wallet-active']) {
          const div = document.createElement('div');
          div.classList.add('col-12', 'wallet-instance');
          div.id = `${item['id']}`;
          const walletContainer = document.querySelector(`#${coinName}-wallet-container`);
          const message = `<div class="card">
                    <div class="card-body">
                      <div class="d-flex">
                        <div>
                          <h5>${item['wallet-name']}</h5>
                          <p>Balance: ${item['coin-balance']} ${coin}</p>
                        </div>
                        <div class="ml-auto">
                          <button id=${
                            item.id
                          }-edit class="btn btn-warning" data-toggle="modal" data-target="#edit-${coinName}-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="d-flex">
                        <div>
                          <button id=${
                            item.id
                          }-buy class="btn btn-primary buy-button" data-target="#buy-${coinName}-modal" data-toggle="modal">${icon}</i>Buy</button>
                          <button id=${
                            item.id
                          }-sell class="btn btn-danger sell-button" data-target="#sell-${coinName}-modal" data-toggle="modal">
                            <i class="fas fa-money-bill-wave mr-2"></i>Sell
                          </button>
                        </div>
                        <div class="ml-auto">
                          <button id=${
                            item.id
                          }-send class="btn btn-info" data-target="#send-${coinName}-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                          <button id=${
                            item.id
                          }-receive class="btn btn-success" data-target="#receive-${coinName}-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                        </div>
                      </div>
                    </div>
                  </div>`;
          div.innerHTML = message;
          walletContainer.appendChild(div);
        }
      }
    });
}

function addWallet(coin_type, user_id, wallet_name = '') {
  let walletAddress = '';
  let walletName = '';
  switch (coin_type) {
    case 'BTC':
      walletAddress = btcAddress();
      walletName = 'Bitcoin Wallet #1';
      break;
    case 'ETH':
      walletAddress = ethAddress();
      walletName = 'Ethereum Wallet #1';
      break;
    case 'XRP':
      walletAddress = xrpAddress();
      walletName = 'Ripple Wallet #1';
      break;
    case 'LTC':
      walletAddress = ltcAddress();
      walletName = 'Litecoin Wallet #1';
      break;
    case 'BCH':
      walletAddress = bchAddress();
      walletName = 'Bitcoin Cash Wallet #1';
      break;
  }

  if (wallet_name) {
    walletName = wallet_name;
  }

  const walletData = {
    'wallet-address': walletAddress,
    'coin-balance': 0,
    'coin-name': coin_type,
    'user-id': user_id,
    'wallet-name': walletName,
    'is-wallet-active': 1,
  };

  fetch('http://localhost:3000/wallets', {
    method: 'post',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(walletData),
  });
}
// addWallet('BTC', 1, 'Bitcoin Wallet #1');
/**pastack sanbox Payment processor gateway*/
function payWithPaystack(name, email, phone, fundAmount) {
  var handler = PaystackPop.setup({
    key: 'pk_test_b6ff1e69b9f6983bfa479e67bff6f3f7cad03c94', //public key
    email: email, //customer's email
    amount: fundAmount, //amount the customer is supposed to pay
    metadata: {
      custom_fields: [
        {
          display_name: name,
          variable_name: phone,
          value: phone, //customer's mobile number
        },
      ],
    },
    callback: function(response) {
      /*after the transaction have been completed**/

      /**build and Post transaction history for this user */
      const user = JSON.parse(localStorage.getItem('user'));

      let transactionObject = {
        userId: user['id'],
        reference: response.reference,
        transaction: response.transaction,
        amount: fundAmount,
      };

      $.ajax({
        url: 'http://localhost:5000/transaction-history',
        type: 'POST',
        data: transactionObject,
        success: function(res) {
          /**Credit this user with the amount*/
          user['naira-wallet'] += parseInt(user['naira-wallet']) + fundAmount;

          $.ajax({
            method: 'PATCH',
            url: 'http://localhost:5000/users/' + user['id'],
            data: user,
          }).done(function(msg) {
            /**cached this user profile */
            setLocalStorageValue('user', msg);
            swal('Successful!', 'Your account has been credited!', 'success');
            //populatWalletBalance();
          });
        },
      });
    },
    onClose: function() {
      //when the user close the payment modal
      swal('Cancelled', 'Transaction cancelled!', 'warning');
    },
  });
  handler.openIframe(); //open the paystack's payment modal
}

/**email validator */
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function makeLogin() {
  if ($('#login-email').val()) {
    $.ajax({
      url: 'http://localhost:3000/users?email=' + $('#login-email').val(),
      type: 'GET',
    }).done(email_res => {
      if (email_res.length > 0) {
        window.location.href = 'dashboard.html';
      } else {
        swal('Email conflict', 'This email address has been taken. Please use a different one!', 'warning');
        $('#login-email').val('');
      }
    });
  }
}

function checkAvailability() {
  if ($('#signup-email').val()) {
    $.ajax({
      url: 'http://localhost:3000/users?email=' + $('#signup-email').val(),
      type: 'GET',
    }).done(email_res => {
      if (email_res.length > 0) {
        swal('Email conflict', 'This email address has been taken. Please use a different one!', 'warning');
        $('#signup-email').val('');
      }
    });
  }
}

/**signup button function */
function makeSignup() {
  var fname = $('#signup-firstname').val();
  var lname = $('#signup-lastname').val();
  var phone = $('#signup-phone').val();
  var email = $('#signup-email').val();
  var pwd = $('#signup-password').val();
  var repeatpwd = $('#signup-confirm').val();
  var data = {};

  if (fname && lname && pwd && repeatpwd && email && phone) {
    if (validateEmail(email)) {
      if (pwd === repeatpwd) {
        data = {
          firstname: fname,
          lastname: lname,
          phone: phone,
          email: email,
          password: pwd,
          country: 'Nigeria',
          language: 'English',
          'usd-balance': 0,
          verification: 0,
          'is-active': 1,
        };

        $.ajax({
          url: 'http://localhost:3000/users',
          type: 'POST',
          data: data,
          beforeSend: function(e) {
            if (!validateEmail(email)) {
              swal('Invalid', 'The email you entered is invalid!', 'warning');
              return;
            }
          },
          success: function(res) {
            /**cached this user profile */
            // setLocalStorageValue('user', res);
            const coinTypes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH'];
            let user_wallets = [];
            for (let i = coinTypes.length; i--; ) {
              user_wallets.push(addWallet(coinTypes[i], res[0].id));
            }
            $.ajax({
              url: 'http://localhost:3000/wallets',
              type: 'POST',
              data: user_wallets,
              success: function(res) {
                /**cached this user profile */
                // setLocalStorageValue('user', res);
                //     window.location.href = 'dashboard.html';
                //     //swal('Successful!', 'Your account was created, Please login!', 'success');
                //     //populatWalletBalance();
              },
            });
          },
        });
      }
    } else {
      swal('oops!', 'Please all fields are required!', 'warning');
    }
  } else {
    swal('Error!', 'Please all fields are required!', 'warning');
  }
}

function signUpNewUser() {
  const firstName = document.querySelector('#signup-firstname').value;
  const lastName = document.querySelector('#signup-lastname').value;
  const phone = document.querySelector('#signup-phone').value;
  const email = document.querySelector('#signup-email').value;
  const password = document.querySelector('#signup-password').value;
  const confirmation = document.querySelector('#signup-confirm').value;

  if (firstName && lastName && phone && email && password && confirmation && password === confirmation) {
    const userData = {
      'first-name': firstName,
      'last-name': lastName,
      phone: phone,
      email: email,
      password: password,
      country: 'Nigeria',
      language: 'English',
      'usd-balance': 0,
      verification: 0,
      'is-active': 1,
    };

    fetch('http://localhost:3000/users', {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(res => res.json())
      .then(data => {
        let wallets = '';
        const coinList = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH'];
        for (let i = coinList.length; i--; ) {
          wallets += addWallet(coinList[i], data.id);
          wallets += ',';
        }
        const JSONWallet = JSON.parse(wallets);
        fetch('http://localhost:3000/users', {
          method: 'post',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSONWallet),
        });
      });
  } else {
    swal('Error', 'There was an error', 'warning');
  }
}

$(document).ready(function() {
  /**REGISTRATION BUTTON ACTION */
  // $('#signup-button').on('click', e => {
  //   e.preventDefault();
  //   signUpNewUser();
  //   // makeSignup();
  // });

  // document.querySelector('#signup-button').onclick = e => {
  //   e.preventDefault();
  //   signUpNewUser();
  // };

  /**EMAIL BUTTON ACTION */
  $('#signup-email').on('focusout', () => {
    checkAvailability();
  });

  /**LOGIN BUTTON ACTION */
  $('#login-button').on('click', e => {
    e.preventDefault();
    makeLogin();
  });

  /**PAYMENT BUTTON ACTION */
  $('#deposit').on('click', () => {
    /**get cached user */
    // const user = getLocalStorageValue('user');
    // payWithPaystack(user.firstname + ' ' + user.lastname, user.email, user.phone);
  });

  // Data Tables functionality
  $('.transactions-datatable').DataTable();
});
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
document.querySelector('#add-bitcoin-wallet-modal .btn-success').onclick = () => {
  const bitcoinWalletName = document.querySelector('#new-bitcoin-wallet-name').value;
  addWallet('BTC', 1, bitcoinWalletName);
};
document.querySelector('#add-ethereum-wallet-modal .btn-success').onclick = () => {
  const ethereumWalletName = document.querySelector('#new-ethereum-wallet-name').value;
  addWallet('ETH', 1, ethereumWalletName);
};
document.querySelector('#add-ripple-wallet-modal .btn-success').onclick = () => {
  const rippleWalletName = document.querySelector('#new-ripple-wallet-name').value;
  addWallet('XRP', 1, rippleWalletName);
};
document.querySelector('#add-litecoin-wallet-modal .btn-success').onclick = () => {
  const litecoinWalletName = document.querySelector('#new-litecoin-wallet-name').value;
  addWallet('LTC', 1, litecoinWalletName);
};
document.querySelector('#add-bitcoin-cash-wallet-modal .btn-success').onclick = () => {
  const bitcoinCashWalletName = document.querySelector('#new-bitcoin-cash-wallet-name').value;
  addWallet('BCH', 1, bitcoinCashWalletName);
};

listWallets(1, 'BTC');
listWallets(1, 'ETH');
listWallets(1, 'XRP');
listWallets(1, 'LTC');
listWallets(1, 'BCH');

function createTransactionID() {
  let transactionID = '';
  const characterList = generateCharacterList('numbers', 'lowercase', 'uppercase');
  for (let i = 60; i--; ) {
    transactionID += characterList[getRandomInteger(0, characterList.length)];
  }
  return transactionID;
}
console.log(cre)
//
function createTransaction(wallet_name, type) {
  const transactionDetails = {
    timestamp: new Date(),
    'wallet-name': wallet_name,
    type: type,
    'transaction-id': createTransactionID(),
  };

  if (type === 'Buy') {
    transactionDetails['spent'] = `$1000`;
  }
}
