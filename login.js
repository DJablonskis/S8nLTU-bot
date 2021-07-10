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
