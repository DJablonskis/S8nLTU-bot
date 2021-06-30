const setUpContextUI = (BOT) => {
  //UPGRADE WINDOW
  const contextUI = document.createElement("div");
  contextUI.id = "context_dialog";

  const closeButton = contextUI.appendChild(document.createElement("button"));
  closeButton.innerText = "x";
  const addUpgradeButton = contextUI.appendChild(
    document.createElement("button")
  );

  addUpgradeButton.innerText = "Upgrade";
  contextUI.style.cssText =
    "padding:4px; z-index: 400; transition: opacity 1.5s ease; opacity:0; position: absolute;flex-direction: column; background-color: white; border-radius: 8px; border: 4px solid green; font-size: 18px;";

  document.body.appendChild(contextUI);

  const closeContext = () => {
    contextUI.style.opacity = 0;
    contextUI.style.display = "none";
    return;
  };

  const openContext = (e, info) => {
    console.log("event", e);
    console.log("target", e.target);
    console.log("info: ", info);
    contextUI.style.display = "block";
    contextUI.style.top = `${e.clientY - 20}px`;
    contextUI.style.left = `${e.clientX + 10}px`;
    contextUI.style.opacity = 1;
    return;
  };

  closeButton.onclick = closeContext;
};
