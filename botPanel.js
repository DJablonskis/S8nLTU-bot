const createSidePanel = () => {
  const sideBar = document.querySelector("#sidebarBeforeContent > div");
  const panel = document.createElement("div");
  panel.classList.add("sidebarBox");

  let sidePanelHeader = panel.appendChild(document.createElement("div"));
  sidePanelHeader.classList.add("header");

  const block = panel.appendChild(document.createElement("div"));
  block.classList.add("content");

  let btnWraper = sidePanelHeader.appendChild(document.createElement("div"));
  btnWraper.classList.add("buttonsWrapper");

  let btnPower = btnWraper.appendChild(document.createElement("a"));
  btnPower.classList.add(
    "layoutButton",
    "buttonFramed",
    "withIcon",
    "round",
    "green"
  );
  btnPower.style.cssText = "transition: all 1s ease; opacity:0";

  btnPower.innerHTML = `<svg class="edit" style="width:30px; stroke-width:2;" viewBox="0 0 20 20"><path d="M10,6.978c-1.666,0-3.022,1.356-3.022,3.022S8.334,13.022,10,13.022s3.022-1.356,3.022-3.022S11.666,6.978,10,6.978M10,12.267c-1.25,0-2.267-1.017-2.267-2.267c0-1.25,1.016-2.267,2.267-2.267c1.251,0,2.267,1.016,2.267,2.267C12.267,11.25,11.251,12.267,10,12.267 M18.391,9.733l-1.624-1.639C14.966,6.279,12.563,5.278,10,5.278S5.034,6.279,3.234,8.094L1.609,9.733c-0.146,0.147-0.146,0.386,0,0.533l1.625,1.639c1.8,1.815,4.203,2.816,6.766,2.816s4.966-1.001,6.767-2.816l1.624-1.639C18.536,10.119,18.536,9.881,18.391,9.733 M16.229,11.373c-1.656,1.672-3.868,2.594-6.229,2.594s-4.573-0.922-6.23-2.594L2.41,10l1.36-1.374C5.427,6.955,7.639,6.033,10,6.033s4.573,0.922,6.229,2.593L17.59,10L16.229,11.373z"></path></svg >`;

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      btnPower.style.opacity = "1";
      btnPower.querySelector("svg").style.fill = BotPower.on ? "red" : "white";
      btnPower.onclick = (e) => {};
    } else {
      btnPower.style.opacity = "0";
      btnPower.onclick = null;
      // LoginUI.open();
    }
  });

  if ("Notification" in window) {
    let btnNotif = btnWraper.appendChild(document.createElement("a"));
    btnNotif.classList.add(
      "layoutButton",
      "buttonFramed",
      "withIcon",
      "round",
      "green"
    );
    btnNotif.innerHTML = `<svg class="edit" style="stroke-width:2" viewBox="0 0 20 20"><path d="M17.657,2.982H2.342c-0.234,0-0.425,0.191-0.425,0.426v10.21c0,0.234,0.191,0.426,0.425,0.426h3.404v2.553c0,0.397,0.48,0.547,0.725,0.302l2.889-2.854h8.298c0.234,0,0.426-0.191,0.426-0.426V3.408C18.083,3.174,17.892,2.982,17.657,2.982M17.232,13.192H9.185c-0.113,0-0.219,0.045-0.3,0.124l-2.289,2.262v-1.96c0-0.233-0.191-0.426-0.425-0.426H2.767V3.833h14.465V13.192z M10,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.488-0.668,1.488-1.489C11.488,7.905,10.821,7.237,10,7.237 M10,9.364c-0.352,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C10.638,9.077,10.351,9.364,10,9.364 M14.254,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489s1.489-0.668,1.489-1.489C15.743,7.905,15.075,7.237,14.254,7.237 M14.254,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.352,0,0.639,0.287,0.639,0.638C14.893,9.077,14.605,9.364,14.254,9.364 M5.746,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.489-0.668,1.489-1.489C7.234,7.905,6.566,7.237,5.746,7.237 M5.746,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C6.384,9.077,6.096,9.364,5.746,9.364"></path></svg >`;
    let svg = btnNotif.querySelector("svg");
    svg.style.fill = Notifications.on ? "red" : "white";
    btnNotif.onclick = (e) => {
      svg.style.fill = Notifications.toggle() ? "red" : "white";
    };
  }

  let btnStats = btnWraper.appendChild(document.createElement("a"));
  btnStats.classList.add(
    "layoutButton",
    "buttonFramed",
    "withIcon",
    "round",
    "green"
  );
  btnStats.innerHTML = `<svg class="edit" style="stroke-width:2; fill:${
    DetailedStats.on ? "red" : "white"
  };" viewBox="0 0 20 20"><path d="M17.431,2.156h-3.715c-0.228,0-0.413,0.186-0.413,0.413v6.973h-2.89V6.687c0-0.229-0.186-0.413-0.413-0.413H6.285c-0.228,0-0.413,0.184-0.413,0.413v6.388H2.569c-0.227,0-0.413,0.187-0.413,0.413v3.942c0,0.228,0.186,0.413,0.413,0.413h14.862c0.228,0,0.413-0.186,0.413-0.413V2.569C17.844,2.342,17.658,2.156,17.431,2.156 M5.872,17.019h-2.89v-3.117h2.89V17.019zM9.587,17.019h-2.89V7.1h2.89V17.019z M13.303,17.019h-2.89v-6.651h2.89V17.019z M17.019,17.019h-2.891V2.982h2.891V17.019z"></path></svg >`;

  DetailedStats.subscribe((on) => {
    console.log("called");
    console.log(DetailedStats.on);
    console.log(on);
    btnStats.querySelector("svg").style.fill = on ? "red" : "white";
  });

  btnStats.onclick = (e) => DetailedStats.toggle();

  let positionUp = localStorage.getItem(PANEL_POSITION);
  positionUp = positionUp && positionUp === ON;
  let btnPosition = btnWraper.appendChild(document.createElement("a"));
  btnPosition.classList.add(
    "layoutButton",
    "buttonFramed",
    "withIcon",
    "round",
    "green"
  );

  const displayPanel = (remove = false) => {
    if (remove) panel.remove();
    if (positionUp) {
      btnPosition.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path></svg >`;
      sideBar.prepend(panel);
    } else {
      btnPosition.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"></path></svg >`;

      sideBar.appendChild(panel);
    }
  };
  displayPanel();

  btnPosition.onclick = (e) => {
    localStorage.setItem(PANEL_POSITION, positionUp ? OFF : ON);
    positionUp = !positionUp;
    displayPanel(true);
  };

  function addSection(title) {
    let sidePanelHeader = block.appendChild(document.createElement("div"));
    sidePanelHeader.classList.add("boxTitle");
    sidePanelHeader.innerText = title;
    let sidePanelContent = block.appendChild(document.createElement("div"));
    sidePanelContent.classList.add("boxContent");

    return {
      header: sidePanelHeader,
      content: sidePanelContent,
      destroy: () => {
        sidePanelContent.remove();
        sidePanelHeader.remove();
      },
    };
  }

  return { panel, addSection };
};

let BotPanel;

if (ShouldRun) BotPanel = createSidePanel();
