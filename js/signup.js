$(document).ready(function() {
  /**EMAIL BUTTON ACTION */
  $('#signup-email').on('focusout', () => {
    checkAvailability($('#signup-email').val());
  });
  /**SIGNUP BUTTON ACTION */
  $('#signup-button').on('click', () => {
    makeSignup();
  });
});

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
            setLocalStorageValue('user', res);
            //swal('Success', 'Registration Successful', 'success');
            window.location.href = 'login.html';
          },
        });
      } else {
        swal('Oops', 'Password do not match, try again!', 'warning');
        $('#signup-password').val('');
        $('#signup-confirm').val('');
      }
    } else {
      swal('Invalid', 'The email you entered is invalid!', 'warning');
    }
  } else {
    swal('Oops!', 'Please all fields are required!', 'warning');
  }
}

function checkAvailability(email) {
  if (email) {
    if (validateEmail(email)) {
      $.ajax({
        url: 'http://localhost:3000/users?email=' + email,
        type: 'GET',
      }).done(email_res => {
        if (email_res.length > 0) {
          swal('Email Conflict', 'This email address has been taken. Please use a different one!', 'warning');
          $('#signup-email').val('');
        }
      });
    } else {
      swal('Invalid', 'The email you entered is invalid!', 'warning');
      $('#signup-email').val('');
    }
  }
}
/**email validator */
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
