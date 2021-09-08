if (shouldRun && location.pathname.includes("build.php")) {
  const params = getParams();
  if (params?.["gid"] === "15") {
    let selector = document.querySelector("#build #demolish");

    if (selector) {
      let demolishButton = selector.parentElement.appendChild(
        blueButton("auto Demolish")
      );
      demolishButton.onclick = (e) => {
        alert("not implemented yet");
      };
    }
    //else not lvl 10 main building or something already being demolished
  }
}
