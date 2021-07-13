var firebaseConfig = {
  apiKey: "AIzaSyAL2StXZAjB1B16Rwr-Ma13B87CesBzh14",
  authDomain: "s8nltu.firebaseapp.com",
  projectId: "s8nltu",
  storageBucket: "s8nltu.appspot.com",
  messagingSenderId: "796423177082",
  appId: "1:796423177082:web:2eda948b4502ea450e0cc3",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    console.log("signed in", user);
    // ...
  } else {
    // User is signed out
    // ...
    console.log("not signed in");

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
  }
});
