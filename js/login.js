/**email validator */
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function makeLogin() {
  var email = $("#login-email").val();
  var password = $("#login-password").val();

  if (email && password) {
    if (validateEmail(email)) {
      $.ajax({
        url: "http://localhost:3000/users?email=" + email,
        type: "GET"
      }).done(response => {
        if (response.length > 0) {
          const user = response[0];
          if (user["is-active"] == 0) {
            swal(
              "Deleted",
              "You have deleted your account. Signup again!",
              "warning"
            );
            return;
          }
          if (user.password === password) {
            setLocalStorageValue("user", user);

            window.location.href = "dashboard.html";
          } else {
            swal(
              "Login Error",
              "Wrong credential details used. Try again!",
              "warning"
            );
          }
        } else {
          swal(
            "Login Error",
            "Wrong credential details used. Try again!",
            "warning"
          );
        }
      });
    } else {
      swal("Invalid", "The email you entered is invalid!", "warning");
    }
  } else {
    swal("Oops", "Please all fields are required!", "warning");
  }
}

$(document).ready(function() {
  /**LOGIN BUTTON ACTION */
  $("#login-button").on("click", e => {
    e.preventDefault();
    makeLogin();
  });
  /**EMAIL BUTTON ACTION */
  $("#login-email").on("focusout", () => {
    const email = $("#login-email").val();
    if (email) {
      if (!validateEmail(email)) {
        swal("Invalid", "The email you entered is invalid!", "warning");
        $("#login-email").val("");
      }
    }
  });
});

/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
