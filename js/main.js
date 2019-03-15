/* eslint-disable no-unused-vars, no-undef */
const PORT = `3000`;
let user = getLocalStorageValue("user");
$(document).ready(function() {
  // Helper function to populate transactions table
  $("#page-title").click(() => {
    createTransaction("Personal BTC Wallet", 1, 1, "BTC", "send");
  });

  if ($("#wallets-page")) {
    $("#add-bitcoin-wallet-modal .btn-success").click(() => {
      const bitcoinWalletName = $("#new-bitcoin-wallet-name").val();
      addWallet("BTC", user.id, bitcoinWalletName);
    });
    $("#add-ethereum-wallet-modal .btn-success").click(() => {
      const ethereumWalletName = $("#new-ethereum-wallet-name").val();
      addWallet("ETH", user.id, ethereumWalletName);
    });
    $("#add-ripple-wallet-modal .btn-success").click(() => {
      const rippleWalletName = $("#new-ripple-wallet-name").val();
      addWallet("XRP", user.id, rippleWalletName);
    });
    $("#add-litecoin-wallet-modal .btn-success").click(() => {
      const litecoinWalletName = $("#new-litecoin-wallet-name").val();
      addWallet("LTC", user.id, litecoinWalletName);
    });
    $("#add-bitcoin-cash-wallet-modal .btn-success").click(() => {
      const bitcoinCashWalletName = $("#new-bitcoin-cash-wallet-name").val();
      addWallet("BCH", user.id, bitcoinCashWalletName);
    });
  }
  listWallets(user.id, "BTC");
  listWallets(user.id, "ETH");
  listWallets(user.id, "XRP");
  listWallets(user.id, "LTC");
  listWallets(user.id, "BCH");
  listTransactions(user.id, "BTC");

  //$('#account-balance').val

  $("#wallets-page").on("click", ".edit-wallet-button", function() {
    $.get(`http://localhost:${PORT}/wallets?id=${$(this).val()}`, data => {
      $(`#edit-${data[0]["coin-name"]}-wallet-name`).val(
        `${data[0]["wallet-name"]}`
      );
      $(
        `#update-${data[0]["coin-symbol"].toLowerCase()}-wallet-name-button`
      ).click(function() {
        data[0]["wallet-name"] = $(
          `#edit-${data[0]["coin-name"]}-wallet-name`
        ).val();
        $.ajax({
          type: "PUT",
          url: `http://localhost:${PORT}/wallets/${data[0]["id"]}`,
          data: data[0],
          success: function(res) {
            location.reload();
          }
        });
      });
      $(
        `#delete-${data[0]["coin-symbol"].toLowerCase()}-wallet-name-button`
      ).click(function() {
        if (data[0]["coin-balance"] <= 0) {
          data[0]["is-wallet-active"] = 0;
          $.ajax({
            type: "PUT",
            url: `http://localhost:${PORT}/wallets/${data[0]["id"]}`,
            data: data[0],
            success: function(res) {
              location.reload();
            }
          });
        } else {
          swal("Oops", "Account is not empty!", "warning");
        }
      });
    });
  });

  // Wallet Receive Button Functionality
  $("#wallets-page").on("click", ".receive-button", function() {
    $.get(`http://localhost:${PORT}/wallets?id=${$(this).val()}`, data => {
      if ($(`#${data[0]["coin-symbol"].toLowerCase()}-qrcode-output`).html()) {
        $(`#${data[0]["coin-symbol"].toLowerCase()}-qrcode-output`).html("");
      }
      generateQRCode(
        `${data[0]["wallet-address"]}`,
        `#${data[0]["coin-symbol"].toLowerCase()}-qrcode-output`
      );
      $(`input.wallet-address`).val(`${data[0]["wallet-address"]}`);
    });
  });

  // Wallet Send Button Functionality
  $("#wallets-page").on("click", ".send-button", function() {
    $.get(
      `http://localhost:${PORT}/wallets?id=${$(this).val()}`,
      senderData => {
        $(
          `#send-${senderData[0]["coin-symbol"].toLowerCase()}-modal-button`
        ).click(function() {
          const sendAmount = $(
            `#send-${senderData[0]["coin-symbol"].toLowerCase()}-amount`
          ).val();
          const sendAddress = $(
            `#send-${senderData[0]["coin-symbol"].toLowerCase()}-address`
          ).val();

          if (sendAmount) {
            if (sendAmount == 0) {
              swal(
                "Oops",
                "Please provide amount greater than zero. Try again!",
                "warning"
              );
              return;
            }
            if (sendAddress) {
              /**TODO CHECK IF THIS ADDRESS IS ASSIGNED TO SOMEONE IN OUR DATABASE */

              $.get(
                `http://localhost:${PORT}/wallets?wallet-address=${sendAddress}`,
                receiverData => {
                  receiverData[0]["coin-balance"] =
                    parseFloat(receiverData[0]["coin-balance"]) +
                    parseFloat(sendAmount);
                  senderData[0]["coin-balance"] =
                    parseFloat(senderData[0]["coin-balance"]) -
                    parseFloat(sendAmount);
                  $.ajax({
                    type: "PUT",
                    url: `http://localhost:${PORT}/wallets/${
                      receiverData[0]["id"]
                    }`,
                    data: receiverData[0],
                    success: function(res) {
                      $.ajax({
                        type: "PUT",
                        url: `http://localhost:${PORT}/wallets/${
                          senderData[0]["id"]
                        }`,
                        data: senderData[0],
                        success: function(res) {
                          const sendTransactions = {
                            timestamp: new Date().toUTCString(),
                            "wallet-name": `${senderData[0]["wallet-name"]}`,
                            "wallet-id": `${senderData[0]["id"]}`,
                            "transaction-type": `send`, // Buy, Sell, Receive, Send
                            "transaction-id": generateTransactionID(),
                            "user-id": `${senderData[0]["user-id"]}`,
                            "coin-symbol": `${senderData[0]["coin-symbol"]}`,
                            "coin-name": `${senderData[0]["coin-name"]}`,
                            "amount-transferred": `${sendAmount}`,
                            "sender-address": `${
                              senderData[0]["wallet-address"]
                            }`,
                            "receiver-address": `${sendAddress}`
                          };
                          $.ajax({
                            method: "POST",
                            url: `http://localhost:${PORT}/transactions/`,
                            data: sendTransactions,
                            success: function(res) {
                              const receiveTransactions = {
                                timestamp: new Date().toUTCString(),
                                "wallet-name": `${
                                  receiverData[0]["wallet-name"]
                                }`,
                                "wallet-id": `${receiverData[0]["id"]}`,
                                "transaction-type": `receive`, // Buy, Sell, Receive, Send
                                "transaction-id": generateTransactionID(),
                                "user-id": `${receiverData[0]["user-id"]}`,
                                "coin-symbol": `${
                                  receiverData[0]["coin-symbol"]
                                }`,
                                "coin-name": `${receiverData[0]["coin-name"]}`,
                                "amount-transferred": `${sendAmount}`,
                                "sender-address": `${
                                  senderData[0]["wallet-address"]
                                }`,
                                "receiver-address": `${sendAddress}`
                              };
                              // setTimeout(() => {
                              $.ajax({
                                method: "POST",
                                url: `http://localhost:${PORT}/transactions/`,
                                data: receiveTransactions,
                                success: function(res) {
                                  swal(
                                    "Successful!",
                                    "Operation Successful!",
                                    "success"
                                  );
                                  location.reload();
                                }
                              });
                              //  }, 5000);
                            }
                          });
                        }
                      });
                    }
                  });
                }
              );
            } else {
              swal(
                "Oops!",
                "Please sender address field is required!",
                "warning"
              );
            }
          } else {
            swal("Oops", "You didn't provide amount. Try again!", "warning");
          }
        });
      }
    );
  });

  $("#wallets-page").on("click", ".sell-button", function() {
    $.get(
      `http://localhost:${PORT}/wallets?id=${$(this).val()}`,
      walletData => {
        $(`#${walletData[0]["coin-symbol"].toLowerCase()}-sell-button`).click(
          function() {
            if (
              $(
                `#${walletData[0]["coin-symbol"].toLowerCase()}-sell-amount`
              ).val()
            ) {
              const sellAmount = $(
                `#${walletData[0]["coin-symbol"].toLowerCase()}-sell-amount`
              ).val();
              if (sellAmount == 0) {
                swal(
                  "Oops",
                  "Please provide amount greater than zero. Try again!",
                  "warning"
                );
                return;
              }
              console.log(sellAmount);
              let coinBalance = walletData[0]["coin-balance"];
              /**CHECK IF THIS USER HAS SUFFICIENT COINS FOR SELLING */
              if (coinBalance < parseFloat(sellAmount)) {
                swal(
                  "Insufficient Coins",
                  "You don't have that much coin to sell. Please consider purchasing more now!",
                  "warning"
                );
                return;
              }
              console.log(coinBalance);
              const proxyurl = "https://cors-anywhere.herokuapp.com/";
              const url = `https://api.coingecko.com/api/v3/simple/price?ids=${walletData[0][
                "coin-name"
              ].toLowerCase()}&vs_currencies=usd`;
              $.get(
                `http://localhost:${PORT}/users?id=${walletData[0]["user-id"]}`,
                userData => {
                  let accountBalance = parseFloat(userData[0]["usd-balance"]);
                  console.log(accountBalance);
                  $.get(`${proxyurl + url}`, coinData => {
                    const currentPrice =
                      coinData[`${walletData[0]["coin-name"]}`]["usd"];
                    const usdEquivalent = (
                      parseFloat(currentPrice) * parseFloat(sellAmount)
                    ).toFixed(2);
                    accountBalance =
                      parseFloat(accountBalance) + parseFloat(usdEquivalent);
                    coinBalance =
                      parseFloat(coinBalance) - parseFloat(sellAmount);
                    userData[0]["usd-balance"] = String(
                      Number(accountBalance).toFixed(2)
                    );
                    walletData[0]["coin-balance"] = String(
                      Number(coinBalance).toFixed(4)
                    );
                    $.ajax({
                      type: "PUT",
                      url: `http://localhost:${PORT}/users/${
                        userData[0]["id"]
                      }`,
                      data: userData[0],
                      success: function(res) {
                        /**UPDATED USER PROFILE WITH THE CURRENT RESPONSE */
                        setLocalStorageValue("user", res);
                        /**Successs */
                        //swal("Successful", "Operation Successfuls!", "success");

                        $.ajax({
                          type: "PUT",
                          url: `http://localhost:${PORT}/wallets/${
                            walletData[0]["id"]
                          }`,
                          data: walletData[0],
                          success: function(res) {
                            createTransaction(
                              `${walletData[0]["wallet-name"]}`,
                              `${walletData[0]["id"]}`,
                              `${userData[0]["id"]}`,
                              `${walletData[0]["coin-symbol"]}`,
                              `sell`,
                              sellAmount,
                              usdEquivalent,
                              "",
                              "",
                              ""
                            );
                          }
                        });
                        location.reload();
                      }
                    });
                  });
                }
              );
            } else {
              swal("Oops", "You didn't provide amount. Try again!", "warning");
            }
          }
        );
      }
    );
  });

  $("#wallets-page").on("click", ".buy-button", function() {
    $.get(
      `http://localhost:${PORT}/wallets?id=${$(this).val()}`,
      walletData => {
        $(`#${walletData[0]["coin-symbol"].toLowerCase()}-buy-button`).click(
          function() {
            if (
              $(
                `#${walletData[0]["coin-symbol"].toLowerCase()}-buy-amount`
              ).val()
            ) {
              const buyAmount = $(
                `#${walletData[0]["coin-symbol"].toLowerCase()}-buy-amount`
              ).val();
              if (buyAmount == 0) {
                swal(
                  "Oops",
                  "Please provide amount greater than zero. Try again!",
                  "warning"
                );
                return;
              }
              console.log(buyAmount);
              let coinBalance = walletData[0]["coin-balance"];
              console.log(coinBalance);
              const proxyurl = "https://cors-anywhere.herokuapp.com/";
              const url = `https://api.coingecko.com/api/v3/simple/price?ids=${walletData[0][
                "coin-name"
              ].toLowerCase()}&vs_currencies=usd`;
              $.get(
                `http://localhost:${PORT}/users?id=${walletData[0]["user-id"]}`,
                userData => {
                  let accountBalance = parseFloat(userData[0]["usd-balance"]);
                  /**CHECK IF THIS USER HAS SUFFICIENT AMOUNT FOR PURCHASE */
                  if (accountBalance < parseFloat(buyAmount)) {
                    swal(
                      "Insufficient Fund",
                      "You don't have that much fund in your wallet. Please consider funding now!",
                      "warning"
                    );
                    return;
                  }
                  console.log(accountBalance);
                  $.get(`${proxyurl + url}`, coinData => {
                    const currentPrice =
                      coinData[`${walletData[0]["coin-name"]}`]["usd"];
                    const coinEquivalent = (
                      parseFloat(buyAmount) / parseFloat(currentPrice)
                    ).toFixed(4);
                    accountBalance =
                      parseFloat(accountBalance) - parseFloat(buyAmount);
                    coinBalance =
                      parseFloat(coinBalance) + parseFloat(coinEquivalent);
                    userData[0]["usd-balance"] = String(
                      Number(accountBalance).toFixed(2)
                    );
                    walletData[0]["coin-balance"] = String(
                      Number(coinBalance).toFixed(4)
                    );
                    $.ajax({
                      type: "PUT",
                      url: `http://localhost:${PORT}/users/${
                        userData[0]["id"]
                      }`,
                      data: userData[0],
                      success: function(res) {
                        setLocalStorageValue("user", res);
                        /**Successs */
                        // swal("Successful", "Operation Successfuls!", "success");
                        $.ajax({
                          type: "PUT",
                          url: `http://localhost:${PORT}/wallets/${
                            walletData[0]["id"]
                          }`,
                          data: walletData[0],
                          success: function(res) {
                            createTransaction(
                              `${walletData[0]["wallet-name"]}`,
                              `${walletData[0]["id"]}`,
                              `${userData[0]["id"]}`,
                              `${walletData[0]["coin-symbol"]}`,
                              `buy`,
                              buyAmount,
                              coinEquivalent,
                              "",
                              "",
                              ""
                            );
                          }
                        });
                      }
                    });
                  });
                }
              );
            } else {
              swal("Oops", "You didn't provide amount. Try again!", "warning");
            }
          }
        );
      }
    );
  });

  $("#display-name").text(user.firstname);
  /**LOGOUT BUTTON ACTION */
  $("#logout-button").on("click", e => {
    e.preventDefault();
    logout();
  });

  $(".input-group-append").on("click", ".edit-wallet-button", function() {
    copyText(`.input.wallet-address`);
  });

  // Show full page LoadingOverlay
  $.LoadingOverlay("show");

  // Hide it after 3 seconds
  setTimeout(function() {
    $.LoadingOverlay("hide");
  }, 1000);

  // Data Tables functionality
  $(".transactions-datatable").DataTable();
});

// const user = getLocalStorageValue('user');
// if (!user) {
//   window.location.href = 'login.html';
// }

// ###################################
// FUNCTION CALLS
// ###################################

cryptoNews(4, 160, "bitcoin");
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
  document.execCommand("copy");
}

function listTransactions(user_id, coin_symbol) {
  $.get(
    `http://localhost:${PORT}/transactions?user-id=${user_id}&coin-symbol=${coin_symbol}`,
    data => {
      for (let item of data) {
        if (
          item["transaction-type"] === "buy" ||
          item["transaction-type"] === "sell"
        ) {
          let message = ``;
          const tr = $(`<tr id=${item["id"]}></tr>`);
          message += `<td class="sorting_1" tabindex="0">${
            item["timestamp"]
          }</td>`;
          message += `<td>${item["wallet-name"]}</td>`;
          message += `<td style="text-transform: capitalize;">${
            item["transaction-type"]
          }</td>`;
          if (item["transaction-type"] === "buy") {
            message += `<td>$${item["amount-spent"]}</td>`;
            message += `<td>${item["amount-received"]} ${
              item["coin-symbol"]
            }</td>`;
          }
          if (item["transaction-type"] === "sell") {
            message += `<td>${item["amount-spent"]} ${
              item["coin-symbol"]
            }</td>`;
            message += `<td>$${item["amount-received"]}</td>`;
          }
          message += `<td>${item["transaction-id"]}</td>`;
          tr.append(message);
          $(`#${coin_symbol.toLowerCase()}-buy-sell-transactions-table`).append(
            tr
          );
        }
        if (
          item["transaction-type"] === "send" ||
          item["transaction-type"] === "receive"
        ) {
          let message = ``;
          const tr = $(`<tr id=${item["id"]}></tr>`);
          message += `<td class="sorting_1" tabindex="0">${
            item["timestamp"]
          }</td>`;
          message += `<td>${item["wallet-name"]}</td>`;
          message += `<td style="text-transform: capitalize;">${
            item["transaction-type"]
          }</td>`;
          message += `<td>$${item["sender-address"]}</td>`;
          message += `<td>$${item["receiver-address"]}</td>`;
          message += `<td>${item["amount-transferred"]} ${
            item["coin-symbol"]
          }</td>`;
          message += `<td>${item["transaction-id"]}</td>`;
          tr.append(message);
          $(
            `#${coin_symbol.toLowerCase()}-send-receive-transactions-table`
          ).append(tr);
        }
      }
    }
  );
}

function listWallets(user_id, coin) {
  $.get(
    `http://localhost:${PORT}/wallets?user-id=${user_id}&coin-symbol=${coin}&_sort=views&_order=asc`,
    data => {
      let icon = "";

      switch (coin) {
        case "BTC":
          icon = '<i class="cf cf-btc mr-2">';
          break;
        case "ETH":
          icon = '<i class="cf cf-eth mr-2" />';
          break;
        case "LTC":
          icon = '<i class="cf cf-ltc mr-2" />';
          break;
        case "XRP":
          icon = '<i class="cf cf-xrp mr-2" />';
          break;
        case "BCH":
          icon = '<i class="cf cf-btc-alt mr-2" />';
          break;
      }

      for (let item of data) {
        if (item["is-wallet-active"] != 0) {
          const myDiv = $(
            `<div id=${item["id"]} class='col-12 wallet-instance'></div>`
          );
          const message = `<div class="card">
                  <div class="card-body">
                    <div class="d-flex">
                      <div>
                        <h5>${item["wallet-name"]}</h5>
                        <p>Balance: ${item["coin-balance"]} ${coin}</p>
                      </div>
                      <div class="ml-auto">
                        <button value=${
                          item.id
                        } class="btn btn-warning edit-wallet-button" data-toggle="modal" data-target="#edit-${
            item["coin-name"]
          }-wallet-modal"><i class="fas fa-pencil-alt mr-1"></i>Edit</button>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="d-flex">
                      <div>
                        <button value=${
                          item.id
                        } class="btn btn-primary buy-button" data-target="#buy-${
            item["coin-name"]
          }-modal" data-toggle="modal">${icon}</i>Buy</button>
                        <button value=${
                          item.id
                        } class="btn btn-danger sell-button" data-target="#sell-${
            item["coin-name"]
          }-modal" data-toggle="modal">
                          <i class="fas fa-money-bill-wave mr-2"></i>Sell
                        </button>
                      </div>
                      <div class="ml-auto">
                        <button value=${
                          item.id
                        } class="btn btn-info send-button" data-target="#send-${
            item["coin-name"]
          }-modal" data-toggle="modal"><i class="fas fa-paper-plane mr-2"></i>Send</button>
                        <button value=${
                          item.id
                        } class="btn btn-success receive-button" data-target="#receive-${
            item["coin-name"]
          }-modal" data-toggle="modal"><i class="fas fa-qrcode mr-2"></i>Receive</button>
                      </div>
                    </div>
                  </div>
                </div>`;
          myDiv.append(message);
          $(`#${item["coin-name"]}-wallet-container`).append(myDiv);
        }
      }
    }
  );
}
/**Get ached user */
function getLocalStorageValue(key) {
  return JSON.parse(window.localStorage.getItem(key));
}
/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

//
function cryptoNews(
  number_of_articles,
  number_of_chars,
  query = "",
  type = ""
) {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const API_KEY = "f6968066194849a19cf97a517a1cd3b3";
  const SOURCE = "crypto-coins-news";
  const TYPE = type === "top" ? "top-headlines" : "everything";
  const url = `https://newsapi.org/v2/${TYPE}?q=${query}&sources=${SOURCE}&sortBy=publishedAt&apiKey=${API_KEY}`;
  const req = new Request(url);
  fetch(req)
    .then(response => response.json())
    .then(data => {
      for (let i = 0; i < number_of_articles; i++) {
        const item = data.articles[i];
        const post = `
      <div class="ml-3">
      <h4><a href="${item.url}" target="_blank" class="m-b-0 font-medium p-0">${
          item.title
        }</a></h4>
      <p class="text-muted">
        ${item.description.slice(0, number_of_chars)}... <br />
        <a href="${item.url}" target="_blank">Read more</a>
      </p>
      </div>
      <div class="ml-4 mr-3">
      <div class="text-center">
      <h5 class="text-muted m-b-0">${new Date(item.publishedAt).getDate()}</h5>
      <span class="text-muted font-16">${
        MONTHS[new Date(item.publishedAt).getMonth()]
      }</span>
      </div>
      </div>
      `;
        const article = document.createElement("li");
        article.classList.add(
          "d-flex",
          "no-block",
          "card-body",
          "border-top",
          "article"
        );
        article.innerHTML = post;
        document.querySelector(".cryptocurrency-news ul").appendChild(article);
      }
      const attribution = document.createElement("li");
      attribution.classList.add(
        "d-flex",
        "no-block",
        "card-body",
        "border-top",
        "article",
        "small"
      );
      attribution.innerHTML = `<div class="text-center w-100"><p>Powered by <a href="https://newsapi.org" target="_blank">News API</a></p></div>`;
      document
        .querySelector(".cryptocurrency-news ul")
        .appendChild(attribution);
    });
}
/**Delete this item from cached memory */
function removeLocalStorageValue(key) {
  window.localStorage.removeItem(key);
}
function logout() {
  removeLocalStorageValue("user");
  window.location.href = "index.html";
}
function generateCharacterList(...types) {
  // Helper function to generate list of characters for wallet addresses
  const array = [];
  for (let i = types.length; i--; ) {
    if (types[i] === "numbers") {
      for (let i = 48; i <= 57; i++) {
        array[array.length] = String.fromCharCode(i);
      }
    }
    if (types[i] === "uppercase") {
      for (let i = 65; i <= 90; i++) {
        array[array.length] = String.fromCharCode(i);
      }
    }
    if (types[i] === "lowercase") {
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
  const startNumber = ["1", "3"];
  let address = startNumber[Math.round(Math.random())];
  const characterList = generateCharacterList(
    "numbers",
    "lowercase",
    "uppercase"
  );
  const addressLength = getRandomInteger(30, 34);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function ethAddress() {
  // Function to generate random mock ETH addresses for user wallets
  let address = "0x";
  for (let i = 3; i--; ) {
    address += getRandomInteger(1e16, 1e17).toString(16);
  }
  return address.slice(0, 42);
}

function xrpAddress() {
  // Function to generate random mock XRP addresses for user wallets
  let address = "r";
  let characterList = generateCharacterList(
    "numbers",
    "lowercase",
    "uppercase"
  );
  characterList = characterList.filter(x => !["0", "O", "I", "l"].includes(x));
  const addressLength = getRandomInteger(25, 35);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function bchAddress() {
  // Function to generate random mock BCH addresses for user wallets
  let address = "q";
  const characterList = generateCharacterList("numbers", "lowercase");
  const addressLength = getRandomInteger(38, 42);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function ltcAddress() {
  // Function to generate random mock LTC addresses for user wallets
  let address = "M";
  const characterList = generateCharacterList(
    "numbers",
    "lowercase",
    "uppercase"
  );
  const addressLength = getRandomInteger(32, 36);
  for (let i = addressLength; i--; ) {
    address += characterList[getRandomInteger(0, characterList.length)];
  }
  return address;
}

function generateTransactionID() {
  let transactionID = "";
  const characterList = generateCharacterList(
    "numbers",
    "lowercase",
    "uppercase"
  );
  for (let i = 60; i--; ) {
    transactionID += characterList[getRandomInteger(0, characterList.length)];
  }
  return transactionID;
}

function getCurrentCryptoPrice(coin) {
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
  $.get(`${proxyurl + url}`, data => {
    return data[coin]["usd"];
  });
}
function generateQRCode(address, output) {
  // Function to generate qrcode for wallet addresses
  // Please note that qrcode.min.js must be included
  // on the HTML page before this function is invoked
  let walletType = "";
  switch (address[0]) {
    case "1":
    case "3":
      walletType = "bitcoin";
      break;
    case "0":
      walletType = "ethereum";
      break;
    case "r":
      walletType = "ripple";
      break;
    case "q":
      walletType = "bitcoincash";
      break;
    case "M":
      walletType = "litecoin";
      break;
  }
  const qrcode = new QRCode(document.querySelector(output), {
    text: `${walletType}:${address}`,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff"
  });
  return qrcode;
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function createTransaction(
  wallet_name,
  wallet_id,
  user_id,
  coin_symbol,
  transaction_type,
  amount_spent = "",
  amount_received = "",
  amount_transferred = "",
  sender_address = "",
  receiver_address = ""
) {
  const coinName = (() => {
    if (coin_symbol === "BTC") return "Bitcoin";
    if (coin_symbol === "ETH") return "Ethereum";
    if (coin_symbol === "LTC") return "Litecoin";
    if (coin_symbol === "XRP") return "Ripple";
    if (coin_symbol === "BCH") return "Bitcoin Cash";
  })();

  const transactionDetails = {
    timestamp: new Date().toUTCString(),
    "wallet-name": wallet_name,
    "wallet-id": wallet_id,
    "transaction-type": transaction_type, // Buy, Sell, Receive, Send
    "transaction-id": generateTransactionID(),
    "user-id": user_id,
    "coin-symbol": coin_symbol,
    "coin-name": coinName
  };

  if (transaction_type === "buy") {
    transactionDetails["amount-spent"] = amount_spent;
    transactionDetails["amount-received"] = amount_received;
  }

  if (transaction_type === "sell") {
    transactionDetails["amount-spent"] = amount_spent;
    transactionDetails["amount-received"] = amount_received;
  }

  if (transaction_type === "send") {
    transactionDetails["amount-transferred"] = amount_transferred;
    transactionDetails["sender-address"] = sender_address;
    transactionDetails["receiver-address"] = receiver_address;
  }

  if (transaction_type === "receive") {
    transactionDetails["amount-transferred"] = amount_transferred;
    transactionDetails["sender-address"] = sender_address;
    transactionDetails["receiver-address"] = receiver_address;
  }

  $.ajax({
    method: "POST",
    url: `http://localhost:${PORT}/transactions`,
    data: transactionDetails,
    success: function(res) {
      location.reload();
    }
  });
}

function addWallet(coin_symbol, user_id, wallet_name = "") {
  let walletAddress = "";
  let walletName = "";
  let coinName = "";

  switch (coin_symbol) {
    case "BTC":
      walletAddress = btcAddress();
      walletName = "Bitcoin Wallet #1";
      coinName = "bitcoin";
      break;
    case "ETH":
      walletAddress = ethAddress();
      walletName = "Ethereum Wallet #1";
      coinName = "ethereum";
      break;
    case "XRP":
      walletAddress = xrpAddress();
      walletName = "Ripple Wallet #1";
      coinName = "ripple";
      break;
    case "LTC":
      walletAddress = ltcAddress();
      walletName = "Litecoin Wallet #1";
      coinName = "litecoin";
      break;
    case "BCH":
      walletAddress = bchAddress();
      walletName = "Bitcoin Cash Wallet #1";
      coinName = "bitcoin cash";
      break;
  }

  if (wallet_name) {
    walletName = wallet_name;
  }

  const walletData = {
    "wallet-name": walletName,
    "wallet-address": walletAddress,
    "coin-balance": 0,
    "coin-symbol": coin_symbol,
    "coin-name": coinName,
    "user-id": user_id,
    "is-wallet-active": 1
  };

  $.ajax({
    method: "POST",
    url: `http://localhost:${PORT}/wallets`,
    data: walletData,
    success: function(res) {
      location.reload();
    }
  });
}
