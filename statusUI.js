let statusSection, Status;

const statusSection = BotPanel.addSection(`v${VER} (${BOT_ON ? "On" : "Off"})`);

const setUpStatusBar = () => {
  const status = statusSection.content.appendChild(
    document.createElement("div")
  );
  //statusSection.header.style.marginTop = "12px";

  let statusMessage = status.appendChild(document.createElement("div"));
  statusMessage.innerText = "Waiting for instructions";

  const loadingBar = status.appendChild(document.createElement("div"));
  loadingBar.style.cssText =
    "margin-top: 4px; position: relative; height:8px; border:1px solid #52372a; overflow: hidden; border-radius:2px; background-color: #52372a";
  const loadingBarProgress = loadingBar.appendChild(
    document.createElement("div")
  );
  loadingBarProgress.style.cssText =
    "height:6px; width:0; background-color: #546e39; border: 1px solid transparent; border-color: #699e32 #6db024 #71c117; width: 100%";

  const updateStatus = (message = "", fast = false, extraTime = 0) => {
    let speed = fast ? DELAY_FAST : DELAY_SLOW;
    let duration = (Math.floor(Math.random() * 4) + speed) * 1000 + extraTime;
    let width = 0;
    let timestamp = Date.now();
    statusMessage.innerText = message;
    var id = setInterval(frame, 30);
    function frame() {
      width = ((Date.now() - timestamp) / duration) * 100.0;
      if (width >= 100) {
        clearInterval(id);
      } else {
        width++;
        loadingBarProgress.style.width = width + "%";
      }
    }
    return duration;
  };

  return { update: updateStatus };
};
if (ShouldRun) {
  statusSection = BotPanel.addSection(`v${VER} (${BOT_ON ? "On" : "Off"})`);
  Status = setUpStatusBar();
}
