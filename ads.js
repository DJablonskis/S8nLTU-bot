if (location.hostname.includes("media.oadts.com")) {
  setTimeout(() => {
    let button = document.querySelector("button");
    if (button) {
      GM_setValue("trav_add", Math.random().toString());
      // console.log("button found. starting to play");
      button.click();
    }
  }, 3000);
}
