$(document).ready(function() {
  populateUserProfileForEdit();
  displayUserData();
  /**LOGIN BUTTON ACTION */
  $("#update-button").on("click", e => {
    e.preventDefault();
    saveUpdate();
  });
});
/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**Get ached user */
function getLocalStorageValue(key) {
  return JSON.parse(window.localStorage.getItem(key));
}
function populateUserProfileForEdit() {
  const user = getLocalStorageValue("user");
  $("#edit-profile-firstname").val(user.firstname);
  $("#edit-profile-lastname").val(user.lastname);
  $("#edit-profile-phone").val(user.phone);
  $("#edit-profile-country").val(user.country);
}

function saveUpdate() {
  let fname = $("#edit-profile-firstname").val();
  let lname = $("#edit-profile-lastname").val();
  let phone = $("#edit-profile-phone").val();
  let country = $("#edit-profile-country").val();
  let pwd = $("#edit-profile-password").val();
  let confirmPwd = $("#edit-profile-confirm").val();

  var update = {};

  if (fname && lname && pwd && confirmPwd && country && phone) {
    if (pwd === confirmPwd) {
      let user = getLocalStorageValue("user");
      update = {
        firstname: fname,
        lastname: lname,
        phone: phone,
        email: user.email,
        password: pwd,
        country: user.country,
        language: user.language,
        "usd-balance": user["usd-balance"],
        verification: user.verification,
        "is-active": user["is-active"]
      };

      $.ajax({
        type: "PUT",
        url: "http://example.com/api",
        contentType: "application/json",
        data: JSON.stringify(data) // access in body
      })
        .done(function() {
          console.log("SUCCESS");
        })
        .fail(function(msg) {
          console.log("FAIL");
        })
        .always(function(msg) {
          console.log("ALWAYS");
        });

      $.ajax({
        url: "http://localhost:3000/users?email=" + user.email,
        type: "PUT",
        data: update,
        success: function(res) {
          /**cached this user profile */
          setLocalStorageValue("user", res);
          swal("Success", "Update Successful", "success");
        }
      });
    } else {
      swal("Oops", "Password do not match, try again!", "warning");
      $("#sedit-profile-password").val("");
      $("#edit-profile-confirm").val("");
    }
  } else {
    swal("Oops!", "Please all fields are required!", "warning");
  }
}

function displayUserData() {
  let user = getLocalStorageValue("user");
  $("#profile-user-name").text(user.firstname + " " + user.lastname);
  $("#profile-email").text(user.email);
  $("#profile-phone").text(user.phone);
  $("#profile-country").text(user.country);
}
