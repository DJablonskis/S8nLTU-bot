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

const createLoginWindow = () => {
  const panel = document.createElement("div");
  panel.classList.add("sidebar");
  panel.style.cssText =
    "position: absolute; top:-1000px; left:-1000px; z-index:11000; opacity:0; display:block;transition: opacity 0.4s ease; background-color: #00000040; box-shadow: 0 0 10px 8px #00000040";

  const loginBox = panel.appendChild(document.createElement("div"));
  loginBox.classList.add("sidebarBox");

  const innerBox = loginBox.appendChild(document.createElement("div"));
  innerBox.classList.add("content");

  const boxHeader = innerBox.appendChild(document.createElement("div"));
  boxHeader.classList.add("boxTitle");
  boxHeader.innerText = `Login or Register`;

  const boxContent = innerBox.appendChild(document.createElement("div"));
  boxContent.classList.add("boxContent");

  const controls = document.createElement("div");

  const usernameGroup = boxContent.appendChild(document.createElement("div"));
  const usernameLabel = usernameGroup.appendChild(
    document.createElement("span")
  );
  usernameLabel.innerText = "License email:";
  const usernameInput = usernameGroup.appendChild(
    document.createElement("input")
  );
  usernameInput.type = "email";

  const passGroup = boxContent.appendChild(document.createElement("div"));
  const passLabel = passGroup.appendChild(document.createElement("span"));
  passLabel.innerText = "License password:";
  const passInput = passGroup.appendChild(document.createElement("input"));
  passInput.type = "password";

  const loginButton = controls.appendChild(document.createElement("button"));
  loginButton.className = "textButtonV1 green";
  loginButton.innerText = "Login";
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
            console.log("credentials:", user);
            close();
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("errorMessage", errorMessage);
          });
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  };

  const registerButton = controls.appendChild(document.createElement("button"));
  registerButton.className = "textButtonV1 green";
  registerButton.innerText = "Register";
  registerButton.onclick = () => {};

  const close = () => {
    panel.style.opacity = 0;
    setTimeout(() => {
      panel.style.top = `-1000px`;
      panel.style.left = `-1000px`;
    }, 400);
  };

  boxContent.appendChild(controls);

  const closeButton = panel.appendChild(document.createElement("button"));
  closeButton.innerText = "x";
  closeButton.style.cssText =
    "position: absolute; top:16px; right:12px; z-index: 20";
  closeButton.onclick = close;

  document.body.appendChild(panel);

  const open = () => {
    panel.style.display = "block";
    panel.style.opacity = 1;
    panel.style.top = `20%`;
    panel.style.left = `50%`;
    panel.style.marginLeft = "-50%";
  };

  return {
    close,
    open,
  };
};

const LoginUI = createLoginWindow();
//LoginUI.open();
