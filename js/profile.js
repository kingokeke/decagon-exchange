$(document).ready(function() {
  const user = getLocalStorageValue("user");
  if (!user) {
    window.location.href = "login.html";
  }
  populateUserProfileForEdit();
  displayUserData();
  /**UPDATE BUTTON ACTION */
  $("#update-button").on("click", e => {
    e.preventDefault();
    saveUpdate();
  });

  /**LOGOUT BUTTON ACTION */
  $("#logout-button").on("click", e => {
    e.preventDefault();
    logout();
  });
  /**DELETE ACCOUNT BUTTON ACTION */
  $("#delete-profile-button").on("click", e => {
    e.preventDefault();
    deleteProfile($("#delete-profile-password").val());
  });
});
/**cached this user */
function setLocalStorageValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**Delete this item from cached memory */
function removeLocalStorageValue(key) {
  window.localStorage.removeItem(key);
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
        url: "http://localhost:3000/users/" + user.id,
        type: "PUT",
        data: update,
        success: function(res) {
          /**cached this user profile */
          setLocalStorageValue("user", res);
          swal("Success", "Update Successful", "success");
          displayUserData();
        },
        fail: function(e) {
          swal("Error", e, "warning");
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
  const user = getLocalStorageValue("user");
  $("#display-name").text(user.firstname);
  $("#profile-user-name").text(user.firstname + " " + user.lastname);
  $("#profile-email").text(user.email);
  $("#profile-phone").text(user.phone);
  $("#profile-country").text(user.country);
}

function deleteProfile(password) {
  if (!password) {
    swal("Oops", "Please provide your password!", "warning");
    return;
  }
  const user = getLocalStorageValue("user");
  if (user.password !== password) {
    swal(
      "Password Mismatch",
      "Password doesn't match with saved password. Try again!",
      "warning"
    );
    return;
  }

  swal({
    title: "Are you serious?",
    text: " You are about to DELETE your account!",
    icon: "warning",
    buttons: ["No, cancel it!", "Yes, I am!"],
    dangerMode: true
  }).then(function(isConfirm) {
    if (isConfirm) {
      let update = {
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        email: user.email,
        password: password,
        country: user.country,
        language: user.language,
        "usd-balance": user["usd-balance"],
        verification: user.verification,
        "is-active": 0
      };

      $.ajax({
        url: "http://localhost:3000/users/" + user.id,
        type: "PUT",
        data: update,
        success: function(res) {
          logout();
        },
        fail: function(e) {
          swal("Error", e, "warning");
        }
      });
    } else {
      swal("Good Choice", "Your account is still safe :)");
    }
  });
}
function logout() {
  removeLocalStorageValue("user");
  window.location.href = "login.html";
}
