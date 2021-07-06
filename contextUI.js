const setUpContextUI = () => {
  //UPGRADE WINDOW
  const createWindow = () => {
    const contextUI = document.createElement("div");
    contextUI.classList.add("sidebar");
    contextUI.style.cssText =
      "position: absolute; top:-1000px; left:-1000px; z-index:11000; opacity:0; display:block;transition: opacity 0.4s ease; background-color: #00000040; box-shadow: 0 0 10px 8px #00000040";

    const contextUIInner = contextUI.appendChild(document.createElement("div"));
    contextUIInner.classList.add("sidebarBox");
    const contextUIBox = contextUIInner.appendChild(
      document.createElement("div")
    );
    contextUIBox.classList.add("content");

    const img = document.createElement("img");
    img.src = "/img/x.gif";
    img.style.width = "96px";
    img.style.height = "96px";
    img.style.position = "absolute";
    img.style.top = "32px";
    img.style.right = "12px";
    img.style.backgroundSize = "contain";
    img.style.zIndex = 8;

    contextUIBox.appendChild(img);

    const boxHeader = contextUIBox.appendChild(document.createElement("div"));
    boxHeader.classList.add("boxTitle");
    boxHeader.innerText = "";
    const boxContent = contextUIBox.appendChild(document.createElement("div"));
    boxContent.classList.add("boxContent");

    const close = () => {
      contextUI.style.opacity = 0;
      setTimeout(() => {
        contextUI.style.top = `-1000px`;
        contextUI.style.left = `-1000px`;
      }, 400);
    };

    const controls = document.createElement("div");

    const cancel = controls.appendChild(document.createElement("button"));
    cancel.className = "textButtonV1 green";
    cancel.innerText = "cancel";
    cancel.style.marginRight = "8px";

    cancel.onclick = close;
    const confirm = controls.appendChild(document.createElement("button"));
    confirm.className = "textButtonV1 green";
    confirm.innerText = "confirm";

    const maxDiv = boxContent.appendChild(document.createElement("div"));
    const inputDiv = boxContent.appendChild(document.createElement("div"));
    const inputDivLabel = inputDiv.appendChild(document.createElement("span"));
    inputDivLabel.innerText = "Upgrade by: ";
    const input = inputDiv.appendChild(document.createElement("input"));
    input.type = "number";
    input.min = 1;
    input.value = 1;

    const planedDiv = boxContent.appendChild(document.createElement("div"));

    boxContent.appendChild(controls);

    const setUp = (slot) => {
      // fill in fields, slider, header, jobs....};
      boxHeader.innerText = `[${slot.pos}] ${BDB.name(slot.gid)}`;
      img.className = `buildingIllustration ${Tribe.name} g${slot.gid} big`;

      input.disabled = slot.status === "maxLevel";
      if (slot.status !== "maxLevel") {
        if (slot.upgrading) {
          //get how many levels upgrading
        }
        input.max = BDB.data(slot.gid).maxLvl - slot.lvl;
      }
    };

    const closeButton = contextUI.appendChild(document.createElement("button"));
    closeButton.innerText = "x";
    closeButton.style.cssText =
      "position: absolute; top:16px; right:12px; z-index: 20";
    closeButton.onclick = close;

    document.body.appendChild(contextUI);

    const open = ({ clientY, clientX }, slot) => {
      setUp(slot);
      contextUI.style.display = "block";
      contextUI.style.opacity = 1;
      contextUI.style.top = `${clientY - 20}px`;
      contextUI.style.left = `${clientX + 10}px`;
    };

    return {
      close,
      open,
    };
  };

  let slots = Dorf1Slots ? Dorf1Slots : Dorf2Slots;
  const w = createWindow();
  slots.forEach((slot) => {
    let link = slot.link;
    if (slot.pos === 40) {
      link = link.parentNode.querySelector("svg");
    }
    link.oncontextmenu = (e) => {
      e.preventDefault();
      w.open(e, slot);
    };
  });
};

if (Dorf1Slots || Dorf2Slots) setUpContextUI();
