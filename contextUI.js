const setUpContextUI = () => {
  let upgradeWindow = {
    coords: {
      clientX: 0,
      clientY: 0,
    },
    open: false,
    slot: null,
  };
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
      upgradeWindow = {
        coords: {
          clientX: 0,
          clientY: 0,
        },
        open: false,
        slot: null,
      };
      contextUI.style.opacity = 0;
      setTimeout(() => {
        contextUI.style.top = `-1000px`;
        contextUI.style.left = `-1000px`;
      }, 400);
    };

    const controls = document.createElement("div");

    const cancel = controls.appendChild(blueButton("cancel"));
    cancel.style.marginRight = "8px";

    cancel.onclick = close;
    const confirm = controls.appendChild(blueButton("confirm"));

    const jobsDiv = boxContent.appendChild(document.createElement("div"));
    jobsDiv.style.display = "block";
    jobsDiv.style.marginBottom = "6px";

    const maxDiv = boxContent.appendChild(document.createElement("div"));
    maxDiv.innerHTML = "<strong>Maximum level reached</strong>";
    maxDiv.style.display = "none";
    maxDiv.style.marginBottom = "6px";
    const inputDiv = boxContent.appendChild(document.createElement("div"));
    const inputDivLabel = inputDiv.appendChild(document.createElement("span"));
    inputDivLabel.innerText = "Upgrade to lvl: ";
    const input = inputDiv.appendChild(document.createElement("input"));
    input.type = "number";

    const planedDiv = boxContent.appendChild(document.createElement("div"));

    boxContent.appendChild(controls);

    const setUp = (slot) => {
      // fill in fields, slider, header, jobs....};
      console.log("right click on: ", slot);

      if (slot.pos === 40) slot.gid = Tribe.wall_gid;

      let newBuildJob = JobsManager.get().filter(
        (job) => job.pos === slot.pos && job.to === 1
      );

      let gid = newBuildJob.length > 0 ? newBuildJob[0].gid : slot.gid;

      boxHeader.innerText = `[${slot.pos}] ${BDB.name(gid)}`;
      img.className = `buildingIllustration ${Tribe.name} g${gid} big`;

      //TODO: find jobs with matching pos and gid
      let value = slot.lvl + 1;
      let max = gid < 5 && !Capital ? 10 : BDB.data(gid).maxLvl;

      jobs = JobsManager.get().filter((job) => job.pos === slot.pos);

      let jobTo = 0;

      if (jobs.length > 0) {
        jobTo = jobs[jobs.length - 1].to;
        jobsDiv.innerHTML = `<strong>Upgrading to lvl${jobTo}</strong>`;
        value = jobTo + 1;
      } else jobsDiv.innerHTML = "<strong>No planed upgrades</strong>";

      inputDiv.style.display =
        slot.status === "maxLevel" || jobTo >= max ? "none" : "block";
      maxDiv.style.display =
        slot.status === "maxLevel" || jobTo >= max ? "block" : "none";
      confirm.disabled = slot.status === "maxLevel" || jobTo >= max;

      if (slot.status !== "maxLevel") {
        if (slot.upgrading) {
          //get how many levels upgrading
          let count = ConstructionManager.get().all.filter((u) => {
            return u.pos === slot.pos;
          }).length;

          value = value + count;
        }
        input.max = max;
        input.min = value;
        input.value = value;
        confirm.onclick = () => {
          JobsManager.add({
            gid,
            pos: slot.pos,
            lvl: slot.lvl,
            to: Number(input.value),
          });
          close();
        };
      }
    };

    const closeButton = contextUI.appendChild(document.createElement("button"));
    closeButton.innerText = "x";
    closeButton.style.cssText =
      "position: absolute; top:16px; right:12px; z-index: 20";
    closeButton.onclick = close;

    document.body.appendChild(contextUI);

    const open = ({ clientY, clientX }, slot) => {
      upgradeWindow = {
        coords: {
          clientX,
          clientY,
        },
        open: true,
        slot,
      };

      setUp(slot);
      contextUI.style.display = "block";
      contextUI.style.opacity = 1;
      contextUI.style.top = `${clientY - 20}px`;
      contextUI.style.left = `${clientX + 10}px`;
    };
    JobsManager.subscribe((jobs) => {
      if (upgradeWindow.open) {
        open(upgradeWindow.coords, upgradeWindow.slot);
      }
    });

    return {
      close,
      open,
    };
  };

  let slots = Dorf1Slots ? Dorf1Slots : Dorf2Slots;
  const w = createWindow();

  slots.forEach((slot) => {
    let jobs = JobsManager.get().filter(
      (job) => job.pos === slot.pos && job.to === 1
    );

    let link = null;

    if (slot.pos === 40) {
      link =
        jobs.length > 0
          ? slot.link.parentElement.querySelector("path")
          : slot.link.parentNode.querySelector("svg");
    } else {
      link =
        jobs.length > 0
          ? slot.link.parentElement.querySelector("path")
          : slot.link;
    }

    let gid = jobs.length > 0 ? jobs[0].gid : slot.gid;

    link.oncontextmenu = (e) => {
      e.preventDefault();
      w.open(e, slot);
    };
  });
};

if (Dorf1Slots || Dorf2Slots) setUpContextUI();
