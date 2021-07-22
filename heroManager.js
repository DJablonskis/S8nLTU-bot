const initHeroManager = () => {
  const heroStatus = document.querySelector(
    "#topBarHeroWrapper #topBarHero .heroStatus svg"
  ).classList[0];

  let mask = document.querySelector("#healthMask path").getAttribute("d");

  let bar = document
    .querySelector("#topBarHeroWrapper #topBarHero .health path.title")
    .getAttribute("d");

  let getAngle = (d, radius = 55) => {
    angle = d.split("L")[1].split("A");
    let angle_start = angle[0].split(" ");
    let angle_end = angle[1].split(" ");

    let x1 = Number(angle_start[0]);
    let y1 = Number(angle_start[1]);

    let y2 = Number(angle_end.pop());
    let x2 = Number(angle_end.pop());

    let dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    let ang = 2 * Math.asin(dist / (2 * radius)) * (180 / Math.PI);
    return ang;
  };

  let h1 = getAngle(mask);
  let h2 = getAngle(bar);

  let health = Math.round((h1 / h2) * 100);

  //console.log("dist", dist);

  //let health = Math.round((dist / 85.45) * 100);
  //console.log("h: ", health);

  //let ang = Math.asin((dist / (2 * 55)) * 2);

  //console.log("ang ", ang);
  const adventuresButton = document.querySelector("#topBarHero a.adventure");

  const openInventory = () => {
    document.getElementById("heroImageButton").click();
  };

  let hasAdventure = adventuresButton.classList.contains("attention");
  let adventureCount = hasAdventure
    ? Number(adventuresButton.querySelector("div.content").innerText)
    : 0;

  const statusEnum = [
    "heroHome",
    "heroReinforcing",
    "heroRunning",
    "heroDead",
    "heroTrapped",
    "heroReviving",
  ];

  const setUpSettingOn = (container) => {
    settingOnRow = container.appendChild(document.createElement("div"));

    settingOnRow.innerHTML = "<strong>Auto send to adventures </strong>";
    settingOnRow.className = "settings-row";
    settingOnRow.appendChild(
      checkboxToggle(BotOptions.get(optionKeys.sendToAdventures))
    );
    settingOnRow.querySelector("input").onclick = (e) => {
      if (e.target.checked !== BotOptions.get(optionKeys.sendToAdventures)) {
        BotOptions.toggle(optionKeys.sendToAdventures);
      }
    };
  };
  const setUpSettingEasyFirst = (container) => {
    settingOnRow = container.appendChild(document.createElement("div"));

    settingOnRow.innerHTML = "<strong>Send to hardest first</strong>";
    settingOnRow.className = "settings-row";
    settingOnRow.appendChild(
      checkboxToggle(BotOptions.get(optionKeys.sendToHardestFirst))
    );
    settingOnRow.querySelector("input").onclick = (e) => {
      if (e.target.checked !== BotOptions.get(optionKeys.sendToHardestFirst)) {
        BotOptions.toggle(optionKeys.sendToHardestFirst);
      }
    };
  };
  const setUpSettingClosestFirst = (container) => {
    settingOnRow = container.appendChild(document.createElement("div"));

    settingOnRow.innerHTML = "<strong>Send to closest first</strong>";
    settingOnRow.className = "settings-row";
    settingOnRow.appendChild(
      checkboxToggle(BotOptions.get(optionKeys.sendToClosestFirst))
    );
    settingOnRow.querySelector("input").onclick = (e) => {
      if (e.target.checked !== BotOptions.get(optionKeys.sendToClosestFirst)) {
        BotOptions.toggle(optionKeys.sendToClosestFirst);
      }
    };
  };
  const setUpSettingMinHealth = (container) => {
    settingsMinHealthRow = container.appendChild(document.createElement("div"));

    settingsMinHealthRow.innerHTML = `<strong>Minimal health </strong><input type="number" min="1" max="100" value="${BotOptions.get(
      optionKeys.minHealt
    )}">`;
    settingsMinHealthRow.className = "settings-row";

    settingsMinHealthRow.querySelector("input").style.cssText =
      "max-width: 48px;border-radius:4px";
    settingsMinHealthRow
      .querySelector("input")
      .addEventListener("change", (event) => {
        BotOptions.set(optionKeys.minHealt, event.target.value);
      });
  };

  const canGo = () => {
    return (
      BotOptions.get(optionKeys.sendToAdventures) &&
      heroStatus === "heroHome" &&
      health >= BotOptions.get(optionKeys.minHealt)
    );
  };

  if (location.pathname === "/hero/adventures") {
    let container = document.getElementById("content");
    let settings = container.appendChild(document.createElement("div"));
    settings.className = "adventureStatusMessage";
    settings.style.marginTop = "8px";

    let sendToAdventures = settings.appendChild(document.createElement("div"));
    sendToAdventures.innerHTML = "<h4>Auto adventures</h4>";
    let cols = sendToAdventures.appendChild(document.createElement("div"));
    cols.style.display = "flex";
    let col1 = cols.appendChild(document.createElement("div"));
    col1.style.flex = "1";
    let col2 = cols.appendChild(document.createElement("div"));
    col2.style.flex = "1";

    setUpSettingOn(col1);
    setUpSettingMinHealth(col1);
    setUpSettingClosestFirst(col1);
    setUpSettingEasyFirst(col1);

    // BotOptions.subscribe(({ settingsOpen }) => {
    //   SettingsSection.header.style.display = settingsOpen ? "block" : "none";
    //   SettingsSection.content.style.display = settingsOpen ? "block" : "none";
    // });
  }

  const startAdventure = () => {
    if (location.pathname !== "/hero/adventures") {
      setTimeout(() => {
        adventuresButton.click();
      }, Status.update("Checking some available adventures."));
    } else {
      if (adventureCount > 0) {
        let adventures = [
          ...document.querySelectorAll("#adventureListForm tbody tr"),
        ].map((tr) => {
          let id = tr.id.replace("adventure", "");
          let duration = tr.querySelector("#walktime" + id).innerText;
          const arr = duration.split(":"); // splitting the string by colon
          const seconds = arr[0] * 3600 + arr[1] * 60 + +arr[2]; // converting

          let submit = () => {
            tr.querySelector("form").submit();
          };

          let danger = Number(
            tr
              .querySelector("td.difficulty img")
              .className.replace("adventureDifficulty", "")
          );

          return { id, duration: seconds, submit, danger };
        });

        console.log(adventures);
        if (adventures > 1) {
          //do sorting
          if (BotOptions.get(optionKeys.sendToClosestFirst))
            adventures.sort((a, b) => b.duration - a.duration);

          if (BotOptions.get(optionKeys.sendToHardestFirst))
            adventures.sort((a, b) => b.danger - a.danger);
        }
        if (canGo()) {
          setTimeout(() => {
            // adventures[0].submit();
            console.log(adventures[0].id);
          }, Status.update("Sending to adventure " + adventures[0].id));
        } else {
          setTimeout(() => {
            // adventures[0].submit();
            navigateTo(1);
          }, Status.update("Cant send. Going back."));
        }
      } else {
        setTimeout(() => {
          // adventures[0].submit();
          navigateTo(1);
        }, Status.update("No adventures. Going back."));
      }
    }
  };

  return {
    heroStatus,
    health,
    adventureCount,
    startAdventure,
    openInventory,
    canGo,
  };
};

let HeroManager;
if (ShouldRun) {
  HeroManager = initHeroManager();
}
