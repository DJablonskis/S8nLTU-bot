const setUpContextUI = () => {
  //UPGRADE WINDOW
  const contextUI = document.createElement("div");
  contextUI.classList.add("sidebar");
  contextUI.style.cssText = "position: absolute; top:0; left:0";

  const contextUIInner = contextUI.append(document.createElement("div"));
  contextUIInner.classList.add("sidebarBox");
  const contextUIBox = contextUIInner.append(document.createElement("div"));
  contextUIBox.classList.add("content");

  const boxHeader = contextUIBox.append(document.createElement("div"));
  boxHeader.classList.add("boxHeader");
  const boxContent = contextUIBox.append(document.createElement("div"));
  boxContent.classList.add("boxContent");

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
    contextUI.style.display = "none";
    return;
  };

  const openContext = (e, pos) => {
    console.log("event", e);
    console.log("target", e.target);
    console.log("info: ", info);
    contextUI.style.display = "block";
    contextUI.style.top = `${e.clientY - 20}px`;
    contextUI.style.left = `${e.clientX + 10}px`;
    return;
  };
};
