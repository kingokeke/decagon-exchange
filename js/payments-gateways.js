$(document).ready(function() {
  // const user = getLocalStorageValue("user");
  // if (!user) {
  //   window.location.href = "login.html";
  // }
  //payWithPaystack("505000");
  //payWithPaypal("55000");
  /**ADD FUND VIA PAYSTACK BUTTON ACTION */
  $('#paystack-payment-processor').on('click', e => {
    e.preventDefault();
    let fundAmount = $('#account-funding-amount').val();
    if (!fundAmount) {
      swal('Oops', "You didn't provide amount. Try again!", 'warning');
      return;
    }
    if (fundAmount == 0) {
      swal('Oops', 'Please provide amount greater than zero. Try again!', 'warning');
      return;
    }
    payWithPaystack(fundAmount);
  });
  /**ADD FUND VIA PAYPAL BUTTON ACTION */
  $('#paypal-payment-processor').on('click', e => {
    e.preventDefault();

    let fundAmount = $('#account-funding-amount').val();
    if (!fundAmount) {
      swal('Oops', "You didn't provide amount. Try again!", 'warning');
      return;
    }
    if (fundAmount == 0) {
      swal('Oops', 'Please provide amount greater than zero. Try again!', 'warning');
      return;
    }
    payWithPaypal(fundAmount);
    $('#paypal-payment-processor').hide();
  });

  /**SET USER BALANCE */
  $('#account-balance').text(getUserCurrentBalance());
  //jQuery("#account-balance").val(getUserCurrentBalance());
});
/** 
$(document).userTimeout({
  // ULR to redirect to, to log user out
  logouturl: "login.html",

  // URL Referer - false, auto or a passed URL
  referer: false,

  // Name of the passed referal in the URL
  refererName: "refer",

  // Toggle for notification of session ending
  notify: true,

  // Toggle for enabling the countdown timer
  timer: true,

  // 10 Minutes in Milliseconds, then notification of logout
  session: 600000,

  // 5 Minutes in Milliseconds, then logout
  force: 300000,

  // Model Dialog selector (auto, bootstrap, jqueryui)
  ui: "auto",

  // Shows alerts
  debug: false,

  // <a href="https://www.jqueryscript.net/tags.php?/Modal/">Modal</a> Title
  modalTitle: "Session Timeout",

  // Modal Body
  modalBody:
    "You're being timed out due to inactivity. Please choose to stay signed in or to logoff. Otherwise, you will logged off automatically.",

  // Modal log off button text
  modalLogOffBtn: "Logout",

  // Modal stay logged in button text
  modalStayLoggedBtn: "Stay Logged In"
});
*/
/**pastack sanbox Payment processor gateway*/
function payWithPaystack(fundAmount = '5000') {
  if (!fundAmount) {
    swal('Oops', "You didn't provide amount. Try again!", 'warning');
    return;
  }
  if (fundAmount < 5000) {
    swal('Payment Error', 'Deposite Amount too small. The mimimum you can deposite is N5,000.', 'warning');
    return;
  }
  /**Get cached user */
  //const user = getLocalStorageValue('user');

  name = user.firstname + ' ' + user.lastname;
  email = user.email;
  phone = user.phone;

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
      //const user = getLocalStorageValue('user');

      let transactionObject = {
        userId: user['id'],
        reference: response.reference,
        transaction: response.transaction,
        amount: fundAmount,
        paymentProcessor: 'Paystack',
      };

      $.ajax({
        url: 'http://localhost:3000/account-funding-transaction',
        type: 'POST',
        data: transactionObject,
        success: function(res) {
          /**Credit this user with the amount*/
          let amount = parseFloat(user['usd-balance']) + parseFloat(fundAmount) / 360;
          user['usd-balance'] = amount.toFixed(2);

          // const amt = user['usd-balance'];
          // const oldAmount = parseFloat(amt) + parseFloat(fundAmount) / 360;
          // user['usd-balance'] = oldAmount;

          $.ajax({
            method: 'PATCH',
            url: 'http://localhost:3000/users/' + user['id'],
            data: user,
          }).done(function(msg) {
            /**cached this user profile */
            setLocalStorageValue('user', msg);
            // swal('Successful!', 'Your account has been credited and updated!', 'success');
            /**SET USER BALANCE */
            $('#account-balance').text(getUserCurrentBalance());
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

/**Paypal sanbox Payment processor gateway*/
function payWithPaypal(fundAmount = '10') {
  paypal
    .Buttons({
      createOrder: function(data, actions) {
        if (fundAmount < 10) {
          swal('Payment Error', 'Deposite Amount too small. The mimimum you can deposite is $10.', 'warning');
          return;
        }
        // Set up the transaction
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: fundAmount,
              },
            },
          ],
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert('Transaction completed by ' + details.payer.name.given_name);

          /*after the transaction have been completed**/

          /**build and Post transaction history for this user */
          //const user = getLocalStorageValue('user');

          let transactionObject = {
            userId: user['id'],
            reference: response.reference,
            transaction: response.transaction,
            amount: fundAmount,
            paymentProcessor: 'Paypal',
          };

          $.ajax({
            url: 'http://localhost:3000/account-funding-transaction',
            type: 'POST',
            data: transactionObject,
            success: function(res) {
              /**Credit this user with the amount*/
              let amount = parseFloat(user['usd-balance']) + parseFloat(fundAmount);
              user['usd-balance'] = amount.toFixed(3);

              $.ajax({
                method: 'PATCH',
                url: 'http://localhost:3000/users/' + user['id'],
                data: user,
              }).done(function(res) {
                /**cached this user profile */
                setLocalStorageValue('user', res);
                swal('Successful!', 'Your account has been credited and updated!', 'success');
              });
            },
          });
        });
      },
    })
    .render('#paypal-button-container');
}

function getUserCurrentBalance() {
  const user = getLocalStorageValue('user');
  return user['usd-balance'];
}
/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**Get ached user */
function getLocalStorageValue(key) {
  return JSON.parse(window.localStorage.getItem(key));
}
