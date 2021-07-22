const createSidePanel = () => {
  const sideBar = document.querySelector("#sidebarBeforeContent > div");
  const panel = document.createElement("div");
  panel.classList.add("sidebarBox");
  panel.id = "S8nLTU";

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

  let btnPower = btnWraper.appendChild(blueToggle(TogglePathPower));
  btnPower.style.cssText = "transition: all 1s ease; opacity:0";

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      btnPower.style.opacity = "1";
      btnPower.classList.add("bigger");
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
    let btnNotif = btnWraper.appendChild(blueToggle(TogglePathNotifications));

    let svg = btnNotif.querySelector("svg");
    svg.style.fill = Notifications.on ? "red" : "white";
    btnNotif.onclick = (e) => {
      svg.style.fill = Notifications.toggle() ? "red" : "white";
    };
  }

  let btnStats = btnWraper.appendChild(blueToggle(TogglePathStatistics));

  // let svg = btnStats.querySelector("svg");
  //   svg.style.fill = DetailedStats.get() ? "red" : "white"

  DetailedStats.subscribe((on) => {
    btnStats.querySelector("svg").style.fill = on ? "red" : "white";
  });

  btnStats.onclick = (e) => DetailedStats.toggle();

  let btnSettings = btnWraper.appendChild(blueToggle(TogglePathSettings));
  btnSettings.classList.add("bigger");

  BotOptions.subscribe(({ settingsOpen }) => {
    btnSettings.querySelector("svg").style.fill = settingsOpen
      ? "red"
      : "white";
  });

  btnSettings.onclick = (e) => {
    BotOptions.toggle(optionKeys.settingsOpen);
  };

  const displayPanel = (open) => {
    panel.remove();
    if (open) {
      sideBar.prepend(panel);
    } else {
      sideBar.appendChild(panel);
    }
  };

  BotOptions.subscribe(({ keepOnTop }) => {
    displayPanel(keepOnTop);
  });

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
