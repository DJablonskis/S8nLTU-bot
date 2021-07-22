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

const createAuthPanel = () => {
  const { version, speed, country, worldId } = unsafeWindow.Travian.Game;

  const Server = {
    version,
    speed,
    country,
    worldId,
    username: document.querySelector("div.playerName").innerText,
    host: window.location.hostname,
    path: window.location.pathname,
  };

  console.log("Server", Server);

  let { content } = SettingsSection;

  const populateLoginPanel = () => {
    const panel = document.createElement("div");
    panel.style.cssText =
      "display:none;flex-direction:column; justify-content:center";
    content.appendChild(panel);
    const usernameLabel = panel.appendChild(document.createElement("span"));
    usernameLabel.innerText = "License email:";

    const usernameInput = panel.appendChild(document.createElement("input"));
    usernameInput.type = "email";

    const passLabel = panel.appendChild(document.createElement("span"));
    passLabel.innerText = "License password:";

    const passInput = panel.appendChild(document.createElement("input"));
    passInput.type = "password";

    const clear = () => {
      usernameInput.value = "";
      passInput.value = "";
    };

    const controls = panel.appendChild(document.createElement("div"));

    const loginButton = controls.appendChild(blueButton("Login"));
    loginButton.style.marginRight = "8px";
    loginButton.onclick = () => {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          let email = usernameInput.value;
          let password = passInput.value;
          return firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // Signed in
              var user = userCredential.user;
              close();
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
            });
        })
        .catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
        });
    };

    const registerButton = controls.appendChild(blueButton("Register"));
    registerButton.onclick = () => {};

    const open = () => {
      clear();
      panel.style.display = "flex";
    };

    const close = () => {
      panel.style.display = "none";
    };

    return { open, close };
  };

  const populateAccountPanel = () => {
    const panel = document.createElement("div");
    panel.style.display = "none";
    content.appendChild(panel);
    const usernameSpan = panel.appendChild(document.createElement("p"));
    panel.appendChild(
      document.createElement("div")
    ).innerText = `Server: ${Server.host}`;
    panel.appendChild(
      document.createElement("div")
    ).innerText = `World ID: ${Server.worldId}, Speed: ${Server.speed}`;
    panel.appendChild(
      document.createElement("div")
    ).innerText = `Account: ${Server.username}`;

    const controls = panel.appendChild(document.createElement("div"));
    controls.style.cssText = "display:flex;justify-content:center;";

    const logoutBTN = controls.appendChild(blueButton("Logout"));
    logoutBTN.onclick = () =>
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful.
        })
        .catch((error) => {
          // An error happened.
        });

    const open = (user) => {
      usernameSpan.innerText = `License Key: ${user}`;
      panel.style.display = "block";
    };

    const close = () => {
      usernameSpan.innerText = "";
      panel.style.display = "none";
    };

    return { open, close };
  };

  const loginPanel = populateLoginPanel();
  const accountPanel = populateAccountPanel();

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      var uid = user.uid;
      accountPanel.open(uid);
      loginPanel.close();
      // ...
    } else {
      accountPanel.close;
      loginPanel.open();
    }
  });

  return {
    close,
    open,
  };
};
if (ShouldRun) {
  const LoginUI = createAuthPanel();
}

//LoginUI.open();
