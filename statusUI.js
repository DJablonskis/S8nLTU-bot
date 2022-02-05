let statusSection, Status;

const setUpStatusBar = () => {
  let interval = null;
  const status = statusSection.content.appendChild(
    document.createElement("div")
  );
  //statusSection.header.style.marginTop = "12px";

  let statusMessage = status.appendChild(document.createElement("div"));
  statusMessage.innerText = "Waiting for instructions";

  const loadingBar = status.appendChild(document.createElement("div"));
  loadingBar.style.cssText =
    "margin-top: 4px; position: relative; height:8px; border:1px solid #23B5D3; overflow: hidden; border-radius:3px";
  const loadingBarProgress = loadingBar.appendChild(
    document.createElement("div")
  );
  loadingBarProgress.style.cssText =
    "transition:width 0.5s ease; height:8px; background-color: #759eb8; border: 1px solid transparent; width: 0%;";

  const updateStatus = (message = "", instant = false, extraTime = 0) => {
    let duration = instant
      ? 0
      : (Math.floor(Math.random() * 3) + DELAY_SLOW) * 1000 + extraTime;
    let width = instant ? 100 : 0;

    if (!instant && duration < 3000) duration = 3600;
    let timestamp = Date.now();
    if (interval) clearInterval(interval);
    statusMessage.innerText = message;
    if (!instant) {
      interval = setInterval(frame, 1000);
      function frame() {
        let passed = Date.now() - timestamp;
        width = (passed / duration) * 100.0;
        if (width >= 100) {
          loadingBarProgress.style.width = "100%";
          clearInterval(interval);
        } else {
          width++;
          loadingBarProgress.style.width = width + "%";
          statusMessage.innerText =
            message + ` [${msToTimeString(duration - passed, false)}]`;
        }
      }
    } else {
      loadingBarProgress.style.width = width + "%";
    }
    return duration;
  };

  return { update: updateStatus };
};
if (ShouldRun) {
  statusSection = BotPanel.addSection(
    `v${GM_info.script.version} (${BotPower.on ? "On" : "Off"})`
  );

  let updateInfo = BotPanel.addSection("Update Changelog");
  updateInfo.content.innerText =
    "This is a quick fix. After Travian updated their game, construction tracking is broken. That means that bot does not know if anything is under construction and that will result in more freaquent village checks. Please be patient as im working on a solution.";
  BotPower.subscribe((power) => {
    statusSection.header.innerText = `v${GM_info.script.version} (${
      power ? "On" : "Off"
    })`;
  });

  Status = setUpStatusBar();
}
