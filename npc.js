function initNPCRules(b) {
  let rules = JSON.parse(localStorage.getItem(NPC_RULES));
  if (!rules) {
    rules = [];
    localStorage.setItem(NPC_RULES, JSON.stringify(rules));
  }
  b.npcRules = rules;
}

const setNPCCooldown = (rule) => {
  this.npcRules.find((x) => x.id === rule.id).cooldown =
    Date.now() + NPC_COOLDOWN;
  localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
};

const checkNPC = () => {
  let gold = parseInt(
    document
      .querySelector("#header .currency .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );
  let warehouse_capacity = parseInt(
    document
      .querySelector("#stockBar .warehouse .capacity .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );
  let granary_capacity = parseInt(
    document
      .querySelector("#stockBar .granary .capacity .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );

  let percent = [];
  document
    .querySelectorAll("#stockBar .barBox .bar")
    .forEach((b) => percent.push(parseInt(b.style.width.replace("%", ""))));

  let storage = [];
  document
    .querySelectorAll("#stockBar .stockBarButton .value")
    .forEach((b) =>
      storage.push(parseInt(b.innerText.trim().replace(/\D/g, "")))
    );
  const rules = this.npcRules.filter((x) => x.cid === this.cID);

  //TODO && gold >= 3
  if (rules.length > 0) {
    let prog = localStorage.getItem(NPC_IN_PROGRESS);
    const inProgress = prog === "" || prog === null ? null : JSON.parse(prog);
    if (inProgress && inProgress.cid !== this.cID) {
      localStorage.setItem(NPC_IN_PROGRESS, "");
      inProgress = null;
    }
    //&& ruleTriggered
    if (
      inProgress &&
      gold >= 3 &&
      Date.now() > inProgress.cooldown &&
      ((inProgress.dir === "a" &&
        inProgress.percent < percent[inProgress.type - 1]) ||
        (inProgress.dir === "b" &&
          inProgress.percent > percent[inProgress.type - 1]))
    ) {
      this.busy = true;
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
          return setTimeout(
            () => {
              tab.click();
            },
            delay("NPC: Wrong tab detected. switching tab!"),
            true
          );
        }

        let b = document.querySelector("#build .npcMerchant button");
        setTimeout(() => {
          b.click();
          setTimeout(() => {
            // BOT.distributeNPC(document.getElementById("npc"))
            const npc = document.getElementById("npc");
            let distButton = document.querySelector("#submitText button");
            let submitButton = document.querySelector("#submitButton button");
            let total = parseInt(document.querySelector("#sum").innerText);
            let inputs = document.querySelectorAll("td.sel input");

            setTimeout(() => {
              inputs[0].value = Math.floor((total / 100) * inProgress.ratio[0]);
              inputs[1].value = Math.floor((total / 100) * inProgress.ratio[1]);
              inputs[2].value = Math.floor((total / 100) * inProgress.ratio[2]);
              inputs[3].value = Math.floor((total / 100) * inProgress.ratio[3]);
              inputs[0].dispatchEvent(new KeyboardEvent("keyup", { key: "0" }));

              setTimeout(() => {
                distButton.click();
                setTimeout(() => {
                  localStorage.setItem(NPC_IN_PROGRESS, "");
                  this.setNPCCooldown(inProgress);
                  submitButton.click();
                }, delay("NPC: Pressing confirm.", true));
              }, delay("NPC: Pressing distribute.", true));
            }, delay("NPC: Filling in fields"));
          }, 300);
        }, delay("NPC: Pressing npc button"));
      } else {
        return setTimeout(() => {
          localStorage.setItem(NPC_IN_PROGRESS, "");
          location.href = "/dorf1.php";
        }, delay("NPC: Wrong location. Canceling", true));
      }
    } else {
      rules.forEach((rule) => {
        //TODO replace with ruleTriggered() function
        if (
          gold >= 3 &&
          Date.now() > rule.cooldown &&
          ((rule.dir === "a" && rule.percent < percent[rule.type - 1]) ||
            (rule.dir === "b" && rule.percent > percent[rule.type - 1]))
        ) {
          this.busy = true;
          localStorage.setItem(NPC_IN_PROGRESS, JSON.stringify(rule));
          //City center? click marketplace else go to dorf2
          if (window.location.pathname.includes("dorf2")) {
            return clickGid(17);
          } else {
            return setTimeout(() => {
              location.href = "/dorf2.php";
            }, delay("NPC: Navigating to city center"));
          }
        }
      });
    }
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
    "You are setting up this NPC rule: \n" +
    `if ${typeNames[type - 1].name} is ${
      dir === "a" ? "above" : "below"
    } ${percent}%, then distribute to ratio ${ratioArr[0]}% ${ratioArr[1]}% ${
      ratioArr[2]
    }% ${ratioArr[3]}%` +
    "\n" +
    "Press OK to confirm!";

  if (confirm(s)) {
    const cooldown = Date.now();
    iNPC.id = dir + type + "_" + this.cID + percent + "_" + cooldown;
    iNPC.cid = this.cID;
    iNPC.cooldown = cooldown;
    this.npcRules.push(iNPC);
    localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
    this.displayNPCRules();
    ///RERENDER function here later
    // const newSpan = this.npcPanel.appendChild(document.createElement("span"))
    //  newSpan.innerText = `${typeNames[type - 1]} ${dir === "a" ? ">" : "<"} ${percent}% : ${ratio}`
  }
};

const displayNPCRules = () => {
  let rules = this.npcRules.filter((x) => x.cid === this.cID);
  this.npcPanel.innerHTML = "";
  if (rules.length > 0) {
    rules.forEach((r) => {
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
        this.npcRules = this.npcRules.filter((x) => x.id !== r.id);
        localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
        localStorage.setItem(NPC_IN_PROGRESS, "");
        node.remove();
        this.displayNPCRules();
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
      this.npcPanel.appendChild(node);
    });
  } else {
    this.npcPanel.innerText = "No rules created yet.";
  }
};

const setUpNPC = (BOT) => {
  const npcS = botPanel.appendChild(document.createElement("div"));
  npcS.style.cssText = "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
  const npcTitle = npcS.appendChild(document.createElement("h4"));
  npcTitle.style.cssText = titleStyle;
  npcTitle.innerText = "Auto NPC";

  BOT.npcPanel = npcS.appendChild(document.createElement("div"));

  const addNpcButton = npcS.appendChild(document.createElement("button"));
  addNpcButton.className = "textButtonV1 gold productionBoostButton";
  addNpcButton.style.cssText = "margin-top: 8px;";
  addNpcButton.innerText = "Add new rule";
  addNpcButton.onclick = () => BOT.addNPCRule();

  const npcSubtitle = npcS.appendChild(document.createElement("p"));
  npcSubtitle.innerHTML =
    "<strong>Warning:</strong> Still experimental. Spends gold and could contain bugs causing high gold usage. Use at your own risks!";
  npcSubtitle.style.cssText = "margin: 8px 0; color: red;";
  //status setup
  const status = botPanel.appendChild(document.createElement("div"));
  status.style.cssText =
    "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
  const statusTitle = status.appendChild(document.createElement("h4"));
  statusTitle.style.cssText = titleStyle;
  statusTitle.innerText = "Status:";
  let statusMessage = status.appendChild(document.createElement("div"));
  statusMessage.innerText = "Waiting for instructions";

  BOT.setNPCCooldown = setNPCCooldown;
  BOT.checkNPC = checkNPC;
  BOT.addNPCRule = addNPCRule;
  BOT.displayNPCRules = displayNPCRules;
  initNPCRules(BOT);
  displayNPCRules();
};
