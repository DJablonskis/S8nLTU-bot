const setUpNPC = (BOT, botPanel) => {
  let NPCRules = JSON.parse(localStorage.getItem(NPC_RULES));
  if (!NPCRules) {
    NPCRules = [];
    localStorage.setItem(NPC_RULES, JSON.stringify(NPCRules));
  }

  const npcS = botPanel.appendChild(document.createElement("div"));
  npcS.style.cssText = "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
  const npcTitle = npcS.appendChild(document.createElement("h4"));
  npcTitle.style.cssText = titleStyle;
  npcTitle.innerText = "Auto NPC";

  const NPCPanel = npcS.appendChild(document.createElement("div"));
  const addNpcButton = npcS.appendChild(blueButton("Add new rule"));
  addNpcButton.style.cssText = "margin-top: 8px;";
  addNpcButton.onclick = () => addNPCRule();

  const npcSubtitle = npcS.appendChild(document.createElement("p"));
  npcSubtitle.innerHTML =
    "<strong>Warning:</strong> Still experimental. Spends gold and could contain bugs causing high gold usage. Use at your own risks!";
  npcSubtitle.style.cssText = "margin: 8px 0; color: red;";

  const setNPCCooldown = (rule) => {
    NPCRules.find((x) => x.id === rule.id).cooldown = Date.now() + NPC_COOLDOWN;
    localStorage.setItem(NPC_RULES, JSON.stringify(NPCRules));
  };

  const checkNPC = () => {
    let gold = getGoldBalance();
    let percent = getRecourcesPercent();
    const villageRules = NPCRules.filter((x) => x.cid === BOT.cID);

    //TODO && gold >= 3
    if (villageRules.length > 0 && gold > 2) {
      let prog = localStorage.getItem(NPC_IN_PROGRESS);
      const inProgress = prog === "" || prog === null ? null : JSON.parse(prog);
      if (inProgress && inProgress.cid !== BOT.cID) {
        localStorage.setItem(NPC_IN_PROGRESS, "");
        inProgress = null;
      }
      //&& ruleTriggered
      if (
        inProgress &&
        Date.now() > inProgress.cooldown &&
        ((inProgress.dir === "a" &&
          inProgress.percent < percent[inProgress.type - 1]) ||
          (inProgress.dir === "b" &&
            inProgress.percent > percent[inProgress.type - 1]))
      ) {
        BOT.busy = true;
        if (window.location.pathname.includes("dorf2")) {
          return clickGid(17);
        }
        //find and open marketplace
        else if (
          window.location.pathname.includes("build.php") &&
          getParams().gid === "17"
        ) {
          //switching tab
          let tab = document.querySelector("#content .contentNavi .content a");
          if (tab && !tab.classList.contains("active")) {
            Promise.doAfter(
              () => tab.click(),
              Status.update("NPC: Wrong tab detected. switching tab!")
            );
          }
          Promise.doAfter(
            document.querySelector("#build .npcMerchant button").click(),
            Status.update("NPC: Pressing npc button")
          )
            .doAfter(() => {
              let total = parseInt(document.querySelector("#sum").innerText);
              let inputs = document.querySelectorAll("td.sel input");
              // // BOT.distributeNPC(document.getElementById("npc"))
              // const npc = document.getElementById("npc");
              inputs[0].value = Math.floor((total / 100) * inProgress.ratio[0]);
              inputs[1].value = Math.floor((total / 100) * inProgress.ratio[1]);
              inputs[2].value = Math.floor((total / 100) * inProgress.ratio[2]);
              inputs[3].value = Math.floor((total / 100) * inProgress.ratio[3]);
              inputs[0].dispatchEvent(new KeyboardEvent("keyup", { key: "0" }));
            }, Status.update("NPC: Filling inputs"))
            .doAfter(
              () => document.querySelector("#submitText button").click(),
              Status.update("NPC: Pressing distribute.", true)
            )
            .doAfter(() => {
              localStorage.setItem(NPC_IN_PROGRESS, "");
              setNPCCooldown(inProgress);
              document.querySelector("#submitButton button").click();
            }, Status.update("NPC: Pressing confirm.", true));
        } else {
          return setTimeout(() => {
            localStorage.setItem(NPC_IN_PROGRESS, "");
            location.href = "/dorf1.php";
          }, Status.update("NPC: Wrong location. Canceling", true));
        }
      } else {
        villageRules.forEach((rule) => {
          //TODO replace with ruleTriggered() function
          if (
            gold >= 3 &&
            Date.now() > rule.cooldown &&
            ((rule.dir === "a" && rule.percent < percent[rule.type - 1]) ||
              (rule.dir === "b" && rule.percent > percent[rule.type - 1]))
          ) {
            BOT.busy = true;
            localStorage.setItem(NPC_IN_PROGRESS, JSON.stringify(rule));
            //City center? click marketplace else go to dorf2
            if (window.location.pathname.includes("dorf2")) {
              return clickGid(17);
            } else {
              return setTimeout(() => {
                location.href = "/dorf2.php";
              }, Status.update("NPC: Navigating to city center"));
            }
          }
        });
      }
    }
  };

  const displayNPCRules = () => {
    let villageRules = NPCRules.filter((x) => x.cid === BOT.cID);
    NPCPanel.innerHTML = "";
    if (villageRules.length > 0) {
      villageRules.forEach((r) => {
        const node = document.createElement("div");
        const nodeButton = node.appendChild(document.createElement("span"));
        const nodeText = node.appendChild(document.createElement("span"));
        nodeText.style.cssText = "display: inline-flex; align-items: center;";
        node.style.cssText =
          "font-size: 10px; line-height:10px; display: flex; align-items: center;";
        nodeButton.style.cssText =
          "width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px";
        nodeButton.textContent = "x";
        nodeButton.onclick = (e) => {
          NPCRules = NPCRules.filter((x) => x.id !== r.id);
          localStorage.setItem(NPC_RULES, JSON.stringify(NPCRules));
          localStorage.setItem(NPC_IN_PROGRESS, "");
          node.remove();
          displayNPCRules();
        };
        nodeText.innerHTML = `${typeNames[r.type - 1].icon(12)} ${
          r.dir === "a" ? ">" : "<"
        } ${r.percent}% &nbsp;=&nbsp;${typeNames[0].icon(12)}${
          r.ratio[0]
        }%, &nbsp;${typeNames[1].icon(12)}${
          r.ratio[1]
        }%, &nbsp;${typeNames[2].icon(12)}${
          r.ratio[2]
        }%, &nbsp;${typeNames[3].icon(12)}${r.ratio[3]}%`;
        NPCPanel.appendChild(node);
      });
    } else {
      NPCPanel.innerText = "No villageRules created yet.";
    }
  };

  const addNPCRule = () => {
    const iNPC = {};
    const dir = prompt(
      'Please enter "a" for above limit or "b" for bellow limit:'
    ).toLowerCase();
    if (dir != "a" && dir !== "b") {
      alert("wrong input, canceled!");
      return false;
    }
    iNPC.dir = dir;

    const percent = Number(
      prompt(
        "Please enter percentage storage limit at which NPC will be done:\n (between 0 and 100)"
      ).toLowerCase()
    );
    if (percent < 0 && percent > 100) {
      alert("wrong input, canceled!");
      return false;
    }
    iNPC.percent = percent;

    const type = Number(
      prompt(
        "which resource do you want to watch? \n1 - Lumber\n2 - Clay\n3 - Iron\n4 - Crop"
      )
    );
    if (type < 1 || type > 4) {
      alert("wrong input, canceled!");
      return false;
    }
    iNPC.type = type;

    const ratio = prompt(
      'Resource percent ratio seperated by comma (must add up to 100):\n i.e.: "30, 30, 30, 10" , will be changed to 30% Lumber, 30% Clay, 30% Iron, 10% Crop after NPC'
    );
    let ratioArr = ratio.split(",").map((x) => Number(x));
    if (ratioArr.length !== 4 && ratioArr.reduce((a, b) => a + b, 0) !== 100) {
      alert("wrong input, total needs to add to 100%. Canceled!");
      return false;
    }
    const p = 100.0 / ratioArr.reduce((a, b) => a + b, 0);
    ratioArr = ratioArr.map((x) => Math.round(x * p));
    iNPC.ratio = ratioArr;

    const s =
      "You are setting up BOT NPC rule: \n" +
      `if ${typeNames[type - 1].name} is ${
        dir === "a" ? "above" : "below"
      } ${percent}%, then distribute to ratio ${ratioArr[0]}% ${ratioArr[1]}% ${
        ratioArr[2]
      }% ${ratioArr[3]}%` +
      "\n" +
      "Press OK to confirm!";

    if (confirm(s)) {
      const cooldown = Date.now();
      iNPC.id = dir + type + "_" + BOT.cID + percent + "_" + cooldown;
      iNPC.cid = BOT.cID;
      iNPC.cooldown = cooldown;
      NPCRules.push(iNPC);
      localStorage.setItem(NPC_RULES, JSON.stringify(NPCRules));
      displayNPCRules();
      ///RERENDER function here later
      // const newSpan = this.npcPanel.appendChild(document.createElement("span"))
      //  newSpan.innerText = `${typeNames[type - 1]} ${dir === "a" ? ">" : "<"} ${percent}% : ${ratio}`
    }
  };

  BOT.checkNPC = checkNPC;
  displayNPCRules();
};
