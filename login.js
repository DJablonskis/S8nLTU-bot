if (!ShouldRun && location.hostname.includes("travian")) {
  if (location.pathname.includes("login.php")) {
    console.log("on login window");
  } else if (location.pathname.includes("logout.php")) {
    console.log("on logout window");
    let login = document.querySelector("li a[href*='login.php']");
    if (login) {
      console.log("login link found. navigating in few moments");
      setTimeout(() => {
        login.click();
      }, 3000 + Math.random() * 3000);
    }
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    console.log("signed in", user);
    setTimeout(() => {
      navigateTo(1);
    }, Status.update("Logged in. Refreshing..."));

    // ...
  } else {
    // User is signed out
    // ...
    console.log("not signed in");
    signInPrompt();
  }
});

const signInPrompt = () => {
  let email = prompt("your S8n account username:", "");
  let password = prompt("your S8n account password:", "");

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("credentials:", user);
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("errorMessage");
    });
};

const AuthManager = { signInPrompt, user: firebase.auth().currentUser };
