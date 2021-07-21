const createSidePanel = () => {
  const sideBar = document.querySelector("#sidebarBeforeContent > div");
  const panel = document.createElement("div");
  panel.classList.add("sidebarBox");

  panel.style.opacity = "0";
  panel.style.overflow = "hidden";
  panel.style.transition = "all 1.4s ease";
  panel.style.maxHeight = "0px";

  let sidePanelHeader = panel.appendChild(document.createElement("div"));
  sidePanelHeader.classList.add("header");

  const block = panel.appendChild(document.createElement("div"));
  block.classList.add("content");

  let btnWraper = sidePanelHeader.appendChild(document.createElement("div"));
  btnWraper.classList.add("buttonsWrapper");

  let btnPower = btnWraper.appendChild(blueToggle(BotTogglePathPower));
  btnPower.style.cssText = "transition: all 1s ease; opacity:0";

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      btnPower.style.opacity = "1";
      btnPower.classList.add = "bigger";
      btnPower.querySelector("svg").style.fill = BotPower.get()
        ? "red"
        : "white";
      btnPower.onclick = (e) => {
        btnPower.querySelector("svg").style.fill = BotPower.toggle()
          ? "red"
          : "white";
      };
    } else {
      btnPower.style.opacity = "0";
      btnPower.onclick = null;
      // LoginUI.open();
    }
  });

  if ("Notification" in window) {
    let btnNotif = btnWraper.appendChild(
      blueToggle(BotTogglePathNotifications)
    );

    let svg = btnNotif.querySelector("svg");
    svg.style.fill = Notifications.on ? "red" : "white";
    btnNotif.onclick = (e) => {
      svg.style.fill = Notifications.toggle() ? "red" : "white";
    };
  }

  let btnStats = btnWraper.appendChild(blueToggle(BotTogglePathStatistics));

  // let svg = btnStats.querySelector("svg");
  //   svg.style.fill = DetailedStats.get() ? "red" : "white"

  DetailedStats.subscribe((on) => {
    btnStats.querySelector("svg").style.fill = on ? "red" : "white";
  });

  btnStats.onclick = (e) => DetailedStats.toggle();

  let positionUp = localStorage.getItem(PANEL_POSITION);
  positionUp = positionUp && positionUp === ON;
  let btnPosition = btnWraper.appendChild(blueToggle());

  const displayPanel = (remove = false) => {
    if (remove) panel.remove();
    let path = btnPosition.querySelector("svg path");
    if (positionUp) {
      path.setAttribute(
        "d",
        "M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"
      );
      sideBar.prepend(panel);
    } else {
      path.setAttribute(
        "d",
        "M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"
      );
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

  const show = (yes = true) => {
    if (yes) {
      panel.style.opacity = "1";
      panel.style.maxHeight = "2000px";
    } else {
      panel.style.opacity = "0";
      panel.style.maxHeight = "0";
    }
  };

  setTimeout(show, 200);

  return { panel, addSection, show };
};

let BotPanel;

if (ShouldRun) BotPanel = createSidePanel();
