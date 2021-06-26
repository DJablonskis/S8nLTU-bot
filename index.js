// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*

// @require constants.js
// @require settings.js
// @require notifications.js
// @require buildings.js
// @require helpers.js
// @require jobs.js
// @require npc1.js

// @version        0.10.02
// ==/UserScript==

function allInOneOpera() {
  const VER = "0.10.02";
  const APP_NAME = "PingWin";
  let BOT;

  function delay(message, fast = false, extraTime = 0) {
    let speed = fast ? DELAY_FAST : DELAY_SLOW;
    let d = (Math.floor(Math.random() * 4) + speed) * 1000 + extraTime;
    BOT.setStatus(message, d);
    return d;
  }

  function setUpResFields() {
    const ressFields = [];
    const res_fields = document.querySelectorAll(
      "#resourceFieldContainer > .level"
    );
    res_fields.forEach((node) => {
      if (node.classList.contains("maxLevel")) {
        return;
      }

      let lvl = Number(node.classList.value.split("level").pop());
      let pos = Number(
        node.classList.value.split("buildingSlot")[1].split(" ")[0]
      );
      let gid = Number(node.classList.value.split("gid")[1].split(" ")[0]);

      let BOT_inc_res_spacer = node.parentNode.appendChild(
        document.createElement("div")
      );
      let BOT_inc_res = node.parentNode.appendChild(
        document.createElement("div")
      );

      node.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        BOT.upgrade.open(e, { gid, lvl, pos });
      });

      BOT_inc_res.classList.add("level", "buildingSlot" + pos);
      BOT_inc_res_spacer.classList.add("level", "buildingSlot" + pos);
      BOT_inc_res_spacer.style.cssText =
        "display:block; border-radius:0;z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;";
      BOT_inc_res.style.cssText =
        "text-align: center;font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white;";
      ressFields.push({
        node,
        pos,
        gid,
        lvl,
        bot: BOT_inc_res,
      });
    });

    return ressFields;
  }

  //DOES NOT PARSE WALL
  function setUpBuildings() {
    const buildings = [];

    const wall = document.querySelector(
      "#village_map .a40.bottom a[href*='id=40'"
    );
    let wall_level_node = wall.querySelector("div.labelLayer");
    let wall_level = 0;
    if (wall_level_node) {
      wall_level = Number(wall_level_node.textContent);
    }
    console.log(wall);
    const wall_btn = document
      .getElementById("village_map")
      .appendChild(document.createElement("div"));

    wall_btn.style.cssText =
      "cursor:pointer;text-align:center;font-weight:900; border:2px ridge #fdfd75; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white; line-height:23px; position:absolute; width:23px; z-index:40; bottom: 43px; left: calc(50% - 20px)";
    wall_btn.textContent = "+";
    buildings.push({
      node: wall.parentNode,
      pos: 40,
      gid: 32,
      lvl: wall_level,
      bot: wall_btn,
    });

    const building_nodes = Array.from(
      document.querySelectorAll(
        "#village_map > div.buildingSlot > img.building"
      )
    );

    //  building_nodes.push(wall)

    building_nodes.forEach((a) => {
      let node = a.parentNode;
      if (node.firstChild.classList.contains("maxLevel")) {
        return;
      }

      let gid, pos;

      // if (node.classList.contains("bottom")) {
      //     gid = WALLS[this.tribe]
      //     pos = 40;
      // }
      gid = Number(node.classList.value.split(" g")[1].split(" ")[0]);
      pos = Number(node.classList.value.split("aid")[1].split(" ")[0]);

      let levelNode = node.querySelector("div.labelLayer");
      let lvl = 0;
      if (gid !== 0 && levelNode) {
        lvl = Number(levelNode.textContent);
      }

      let BOT_inc_build = null;

      // if (pos === 40) {
      //     BOT_inc_build = document.querySelector("#village_map").appendChild(document.createElement("div"))
      //     BOT_inc_build.style.cssText = "text-align:center;position:absolute; left: 50%; bottom:0;font-weight:900; cursor:pointer; border:2px ridge #fdfd75; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.9); color: white; line-height:23px; width: 23px; height:23px"
      // }
      BOT_inc_build = node.appendChild(document.createElement("div"));
      BOT_inc_build.classList.add("level", "buildingSlot");
      BOT_inc_build.dataset.lvl = lvl;

      BOT_inc_build.style.cssText =
        "text-align:center;font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white; line-height:23px";
      BOT_inc_build.textContent = "+";
      let BOT_inc_buid_spacer = node.appendChild(document.createElement("div"));
      BOT_inc_buid_spacer.classList.add("level", "buildingSlot");
      BOT_inc_buid_spacer.style.cssText =
        "border-radius:0;z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;";

      buildings.push({ node, pos, gid, lvl, bot: BOT_inc_build });

      if (gid === 0) {
        BOT_inc_buid_spacer.style.display = "none";
        BOT_inc_build.style.display = "none";
      }
    });
    console.log(buildings);

    return buildings;
  }

  const getCities = () => {
    const cities = {};
    cities.vil = [];

    let loadedCities = JSON.parse(localStorage.getItem(CITIES_STORAGE));

    //SETTING TRIBE
    if (
      loadedCities &&
      window.location.pathname.includes("dorf1") &&
      !Object.keys(loadedCities).includes("tribe")
    ) {
      cities.tribe = document.querySelector(
        "div#resourceFieldContainer"
      ).classList[1];
    } else if (loadedCities && Object.keys(loadedCities).includes("tribe")) {
      cities.tribe = loadedCities.tribe;
    }

    let villages = document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    );
    villages.forEach((vil, i) => {
      let data = vil.querySelector("a > span.coordinatesGrid");
      let name = vil.querySelector("span.name").textContent.trim();
      let x = Number(
        vil
          .querySelector("span.coordinateX")
          .textContent.trim()
          .slice(1)
          .replace(/\u202c|\u202d|/g, "")
          .replace(/\u2212/g, "-")
      );
      let y = Number(
        vil
          .querySelector("span.coordinateY")
          .textContent.trim()
          .slice(0, -1)
          .replace(/\u202c|\u202d|/g, "")
          .replace(/\u2212/g, "-")
      );
      let did = Number(
        getParams("?" + vil.querySelector("a").href.split("?")[1]).newdid
      );

      const v = { name, x, y, did };

      if (vil.classList.contains("active")) {
        cities.cID = did;
      }

      if (cities.cID === did && window.location.pathname.includes("dorf")) {
        cities.cID = did;
        v.ress = getResources();
        v.queue = getBuildingQueue();
        v.timestamp = Date.now();

        v.l1Max = getStorageMax(
          v.ress.capacity.l1,
          v.ress.storage.l1,
          v.ress.production.l1
        );
        v.l2Max = getStorageMax(
          v.ress.capacity.l2,
          v.ress.storage.l2,
          v.ress.production.l2
        );
        v.l3Max = getStorageMax(
          v.ress.capacity.l3,
          v.ress.storage.l3,
          v.ress.production.l3
        );
        v.l4Max = getStorageMax(
          v.ress.capacity.l4,
          v.ress.storage.l4,
          v.ress.production.l4
        );

        v.nextRessCheck = Math.min(v.l1Max, v.l2Max, v.l3Max, v.l4Max);

        cities.vil.push(v);
        cities.current = v;
      } else {
        if (loadedCities) {
          let old = loadedCities.vil.find((x) => x.did === v.did);
          if (old) {
            old.name = name;
            cities.vil.push(old);
          } else {
            cities.vil.push(v);
          }
        }
      }

      //SETING CAPITAL
      if (window.location.pathname === "/profile") {
        const cap = document
          .querySelector("td.name > .mainVillage")
          .parentNode.querySelector("a")
          .innerText.trim();

        if (name === cap) {
          cities.cap = did;
        }
      } else {
        if (loadedCities && loadedCities.cap) {
          cities.cap = loadedCities.cap;
        }
      }
    });
    localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities));
    return cities;
  };

  // SIDE PANEL
  const createCity = (vil, node) => {
    const block = document.createElement("div");
    block.style.paddingBottom = "3px";

    const prodRow = document.createElement("div");
    prodRow.style.display = "flex";
    prodRow.style.justifyContent = "space-between";
    prodRow.style.padding = "0 12px";
    block.appendChild(prodRow);
    const queRow = document.createElement("div");
    block.appendChild(queRow);

    //let capital_string = "";

    //  if (cities.cap && cities.cap === vil.did) capital_string = "(Capital)"

    if (vil.ress) {
      const { capacity } = vil.ress;
      // nameRow.innerHTML = `<div>${wi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l1}</span>${gi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l4}</span></div>`
      prodRow.innerHTML = iS(vil.timestamp, vil.ress);
      let resUpdate = setInterval(() => {
        prodRow.innerHTML = iS(vil.timestamp, vil.ress);
      }, 2000);
    } else {
      prodRow.innerHTML = `<div style="font-size:10px">No info yet.</div>`;
    }

    //CREATING DOTS
    const nameRow = node.querySelector("span.name");
    let flexBlock = document.createElement("div");
    flexBlock.style.cssText =
      "position: absolute;flex-direction: column; display: inline-flex; font-size: 18px; padding-left: 2px; line-height: 0.35;";
    nameRow.appendChild(flexBlock);

    let q1Node = flexBlock.appendChild(document.createElement("div"));
    q1Node.style.height = "8px";
    let q1 = vil.queue ? vil.queue.filter((q) => q.gid < 5) : [];
    q1.forEach((b) => {
      let dot = q1Node.appendChild(document.createElement("span"));
      dot.innerText = "•";
      dot.style.cssText =
        "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange;padding-right:2px;";
      let current = Date.now();
      let s = b.finish - current;
      if (s > 0) {
        setTimeout(() => {
          dot.style.color = "#4cc500";
        }, s);
      } else {
        dot.style.color = "#4cc500";
      }
    });

    let q2Node = flexBlock.appendChild(document.createElement("div"));
    q2Node.style.height = "8px";
    let q2 = vil.queue ? vil.queue.filter((q) => q.gid > 4) : [];
    q2.forEach((b) => {
      let dot = q2Node.appendChild(document.createElement("span"));
      dot.innerText = "•";
      dot.style.cssText =
        "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange; padding-right:2px;";
      let current = Date.now();
      let s = b.finish - current;
      if (s > 0) {
        setTimeout(() => {
          dot.style.color = "#4cc500";
        }, s);
      } else {
        dot.style.color = "#4cc500";
      }
    });

    //EXTRA STATS
    if (vil.queue) {
      vil.queue.forEach((x) => {
        const task = document.createElement("div");
        queRow.appendChild(task);
        let timer = checkTime(x.finish);
        task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
          x.name
        } level ${x.stufe}</span><span style="font-size:11px;  ${
          timer.completed ? "color:green;" : ""
        } align-items:center;">${timer.timer}</span>`;
        if (!timer.completed) {
          let updater = setInterval(() => {
            timer = checkTime(x.finish);
            task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
              x.name
            } level ${x.stufe}</span><span style="font-size:11px; ${
              timer.completed ? "color:green;" : ""
            } align-items:center;">${timer.timer}</span>`;

            if (timer.completed) {
              if (ON_N) {
                notifyMe("Building completed", x, vil);
              }
              clearInterval(updater);
            }
          }, 1000);
        }
      });
    }
    if (ON_S) {
      node.appendChild(block);
    }
  };

  //UPGRADE WINDOW
  const createUpgradeContext = () => {
    const dialog = document.createElement("div");
    dialog.id = "context_dialog";

    const closeButton = dialog.appendChild(document.createElement("button"));
    closeButton.innerText = "x";
    const addUpgradeButton = dialog.appendChild(
      document.createElement("button")
    );
    addUpgradeButton.innerText = "Upgrade";

    const close = () => {
      dialog.style.opacity = 0;
      dialog.style.display = "none";
      return;
    };

    const open = (e, info) => {
      console.log("event", e);
      console.log("target", e.target);
      console.log("info: ", info);
      dialog.style.display = "block";
      dialog.style.top = `${e.clientY - 20}px`;
      dialog.style.left = `${e.clientX + 10}px`;
      dialog.style.opacity = 1;
      return;
    };

    closeButton.onclick = close;

    dialog.style.cssText =
      "padding:4px; z-index: 400; transition: opacity 1.5s ease; opacity:0; position: absolute;flex-direction: column; background-color: white; border-radius: 8px; border: 4px solid green; font-size: 18px;";

    document.body.appendChild(dialog);
    return {
      open,
      close,
    };
  };

  //STARTS HERE IF CAN SEE VILLAGE LIST

  if (shouldRun()) {
    const botPanel = createSidePanel().addSection(`${APP_NAME} v${VER}`);
    BOT = getCities();
    const params = getParams();
    BOT.upgrade = createUpgradeContext();

    if (
      window.location.pathname.includes("build.php") &&
      !window.location.search.includes("&gid=")
    ) {
      const cat = params.category ? Number(params.category) : 1;

      const availableBuildings = document.querySelectorAll(
        ".buildingWrapper > .build_desc > img.building"
      );
      availableBuildings.forEach((b) => {
        let cont = b.parentNode.parentNode;
        let gid = Number(
          cont.querySelector(".contract").id.replace("contract_building", "")
        );
        let pos = window.location.search.split("=")[1];
        pos = pos.includes("&") ? Number(pos.split("&")[0]) : Number(pos);

        cont.style.position = "relative";
        const button = cont.appendChild(document.createElement("button"));
        button.classList.add("textButtonV1", "green", "new");
        button.style.position = "absolute";
        button.style.right = "0";
        button.style.top = "0";
        button.innerText = `Build later`;

        button.onclick = () => {
          BOT.addJob({ gid, pos, lvl: 0, to: 1, cat });
          BOT.displayJobs();
          window.location.href = "/dorf2.php";
        };
      });
    }

    const villageLiArray = document.querySelectorAll(
      "#sidebarBoxVillagelist li"
    );
    if (window.location.pathname.includes("dorf1")) {
      BOT.fieldsCollection = setUpResFields();
    }

    if (window.location.pathname.includes("dorf2")) {
      BOT.buildingCollection = setUpBuildings();
    }

    // BOT.villagesSection = botPanel.addSection("PINGWINBOT");

    const titleStyle =
      'letter-spacing: .1em; font-family: "Noto Serif"; font-weight: bold; color: #5e463a; margin-bottom: 5px; margin-top: 5px;';

    const jobQS = botPanel.appendChild(document.createElement("div"));
    jobQS.style.cssText =
      "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
    const jobQTitle = jobQS.appendChild(document.createElement("h4"));
    jobQTitle.innerText = "Builder";
    jobQTitle.style.cssText = titleStyle;

    BOT.jobsSection = jobQS.appendChild(document.createElement("details"));

    const builderSettings = jobQS.appendChild(document.createElement("div"));
    builderSettings.style.cssText = "padding-top: 6px";

    const autobuilderRow = builderSettings.appendChild(
      document.createElement("div")
    );
    autobuilderRow.innerHTML =
      '<label for="cbAutoFields" style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoRes" style="margin-right: 2px;">Auto-upgrade resources</label>';

    const ignoreCropRow = builderSettings.appendChild(
      document.createElement("div")
    );
    ignoreCropRow.innerHTML =
      '<label for="cbIgnoreCrop"  style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoCrop" style="margin-right: 2px;">Auto-upgrade crop<label>';

    //NPC SETUP
    setUpNPC();

    const loadingBar = status.appendChild(document.createElement("div"));
    loadingBar.style.cssText =
      "margin-top: 4px; position: relative; height:8px; border:1px solid #52372a; overflow: hidden; border-radius:2px; background-color: #52372a";
    const loadingBarProgress = loadingBar.appendChild(
      document.createElement("div")
    );
    loadingBarProgress.style.cssText =
      "height:6px; width:0; background-color: #546e39; border: 1px solid transparent; border-color: #699e32 #6db024 #71c117; width: 100%";
    BOT.setStatus = function (message = "", time = 5000) {
      let width = 0;
      let timestamp = Date.now();
      statusMessage.innerText = message;
      var id = setInterval(frame, 30);
      function frame() {
        width = ((Date.now() - timestamp) / time) * 100.0;
        if (width >= 100) {
          clearInterval(id);
        } else {
          width++;
          loadingBarProgress.style.width = width + "%";
        }
      }
    };

    BOT.buildingDB = buildings;
    BOT.vil.forEach((t, i) => createCity(t, villageLiArray[i]));

    BOT.addJob = function (job) {
      if (!this.cap) {
        alert(
          "Capital not set. Opening '/profile' section for you now. While on '/profile' section, please change your current city to your capital city for bot to update. You only need to do this once."
        );
        location.href = "/profile";
        return;
      }
      //Check if ress and max level ceiling
      if (job.gid < 5) {
        if (job.to > 10) {
          if (this.cap !== this.cID) {
            alert("Max level is 10 in non Capital villages!");
            return;
          } else if (job.to > 21) {
            alert("Max field level is 21!");
            return;
          }
        }
      } else {
        const b = this.buildingDB[job.gid - 1];

        if (job.to > b.maxLvl) {
          alert(`Max level for ${b.name} is ${b.maxLvl}`);
          return;
        }
        //is cap and not alowed in cap:
        if (this.cap === this.cID && !b.cap) {
          alert("Cant build this in capitol!");
          return;
        }
        if (this.cap !== this.cID && !b.xcap) {
          alert("Cant build this in non capitol city!");
          return;
        }
      }

      //Current village
      const cVillage = this.vil.find((v) => v.did === this.cID);

      //warehouse and granary capacity check
      const w = cVillage.ress.capacity.l1;
      const g = cVillage.ress.capacity.l4;
      const stats = this.buildingDB[job.gid - 1].getStat(job.to);
      if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w) {
        alert("Expand warehouse first!");
        return;
      }
      if (stats.cost[3] > g) {
        alert("Expand granary first!");
        return;
      }

      this.jobs["c" + this.cID].push(job);
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
    };

    BOT.completeJob = function (job) {
      let jobs = this.jobs["c" + this.cID];
      this.jobs["c" + this.cID] = jobs.filter(
        (j) => j.pos !== job.pos || (j.pos === job.pos && j.to !== job.to)
      );
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
      return this.jobs["c" + this.cID];
    };

    BOT.removeJob = function (job) {
      let jobs = this.jobs["c" + this.cID];
      this.jobs["c" + this.cID] = jobs.filter(
        (j) => j.pos !== job.pos || (j.pos === job.pos && j.to < job.to)
      );
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
    };

    BOT.switchCity = function () {
      if (location.pathname.includes("dorf1")) {
        let filtered = this.vil.filter((v) => {
          let shouldCheck = false;
          let jobs = this.jobs["c" + v.did];

          if (jobs && jobs.length > 0) {
            let q1 = jobs.filter((q) => q.gid < 5);
            let q2 = jobs.filter((q) => q.gid > 4);

            const p = v.queue.filter((b) => b.finish > Date.now());
            const p1 = p.filter((_p) => _p.gid < 5);
            const p2 = p.filter((_p) => _p.gid > 4);
            if (v.timestamp + MIN_WAIT < Date.now()) {
              if (this.tribe === TRIBE_ROMAN) {
                shouldCheck =
                  (q1.length > 0 && p1.length === 0) ||
                  (q2.length > 0 && p2.length === 0);
              } else {
                shouldCheck = p.length === 0;
              }

              return shouldCheck;
            }
          }

          if (!shouldCheck) {
            let settings = this.settings["c" + v.did];
            shouldCheck =
              (settings.upgradeCrop || settings.upgradeRes) &&
              v.timestamp + MIN_WAIT < Date.now();
            if (shouldCheck) {
              console.log(`added ${v.name} because of auto rules`);
            }
          }

          if (!shouldCheck) {
            shouldCheck = v.timestamp + MAX_WAIT < Date.now();
            if (shouldCheck) {
              console.log(`added ${v.name} because of no update in long time`);
            }
          }

          return shouldCheck;
        });

        if (filtered.length > 0) {
          filtered = shuffleArray(filtered);
          //switch to some city
          setTimeout(() => {
            document
              .querySelector(
                "#sidebarBoxVillagelist li a[href*='" + filtered[0].did + "']"
              )
              .click();
          }, delay(`Switching to ${filtered[0].name}`, true, 0));
        } else {
          setTimeout(() => {
            location.reload();
          }, delay("Cooldown, waiting minimal time.", false, MIN_WAIT));
        }
      } else {
        setTimeout(() => {
          location.href = "/dorf1.php";
        }, delay("Switching to resources view"));
      }
    };

    BOT.setNextJob = function () {
      //TODO check if not empty string
      let prog = localStorage.getItem(BOT_IN_PROGRESS);

      const inProgress = prog === "" || prog === null ? null : JSON.parse(prog);

      if (location.pathname.includes("build.php")) {
        if (inProgress !== null) {
          const params = getParams(window.location.search);
          let currentLvl = 0;
          //check if job was done to this leve and if so, complete it
          if (Object.keys(params).includes("gid")) {
            currentLvl = Number(
              document
                .querySelector("div#build")
                .classList[1].replace("level", "")
            );
          }

          if (currentLvl >= inProgress.job.to) {
            return setTimeout(() => {
              localStorage.setItem(BOT_IN_PROGRESS, "");
              this.completeJob(inProgress.job);
              window.location.href = "/dorf1.php";
            }, 5000);
          }
          if (
            inProgress.cid === this.cID &&
            inProgress.job.pos === Number(params.id)
          ) {
            let b = undefined;

            if (inProgress.job.to === 1) {
              if (inProgress.job.cat) {
                let tab = document.querySelector(
                  `#content .contentNavi .scrollingContainer .content a[href*="category=${inProgress.job.cat}"]`
                );
                if (tab && !tab.classList.contains("active")) {
                  return setTimeout(
                    () => {
                      tab.click();
                    },
                    delay("Wrong tab detected. switching tab!"),
                    true
                  );
                }
                b = document
                  .querySelector(`img.g${inProgress.job.gid}`)
                  .parentNode.parentNode.querySelector(".contractLink button");
              }
              //New res field
              else {
                b = document.querySelector(".section1 button.green.build");
              }
            } else {
              //switching tab
              let tab = document.querySelector(
                "#content .contentNavi .scrollingContainer .content a"
              );

              if (tab && !tab.classList.contains("active")) {
                return setTimeout(() => {
                  tab.click();
                }, delay("Wrong tab detected. switching tab!", true));
              }

              b = document.querySelector(".section1 button.green.build");
            }
            return setTimeout(
              () => {
                if (b) {
                  this.completeJob(inProgress.job);
                  localStorage.setItem(BOT_IN_PROGRESS, "");
                  b.click();
                } else console.log("Error! Button for upgrade not found!");
              },
              delay("Perssing build Button"),
              true
            );
          }
        }
      } else if (location.pathname.includes("dorf")) {
        const { storage } = this.current.ress;
        let jobs = this.jobs["c" + this.cID];
        const d1j = jobs.filter((j) => j.gid < 5);
        const d2j = jobs.filter((j) => j.gid > 4);

        const d1q = this.current.queue.filter((q) => q.gid < 5);
        const d2q = this.current.queue.filter((q) => q.gid > 4);

        //ANY JOBS SET?
        if (jobs.length > 0) {
          let nextJob = null;
          //ANYTHING BUILDING?
          if (this.tribe === TRIBE_ROMAN) {
            if (d1q.length === 0 && d1j.length > 0) {
              nextJob = d1j[0];
            } else if (d2q.length === 0 && d2j.length > 0) {
              nextJob = d2j[0];
            }
          } else if (this.current.queue.length === 0) {
            nextJob = jobs[0];
          }
          if (nextJob !== null) {
            const building = this.buildingDB[nextJob.gid - 1];
            const cost = building.getStat(nextJob.to).cost;

            if (
              storage.l1 >= cost[0] &&
              storage.l2 >= cost[1] &&
              storage.l3 >= cost[2] &&
              storage.l4 >= cost[3]
            ) {
              if (
                (nextJob.gid > 4 && location.pathname.includes("dorf1")) ||
                (nextJob.gid < 5 && location.pathname.includes("dorf2"))
              ) {
                return setTimeout(() => {
                  window.location.href = `/dorf${
                    nextJob.gid > 4 ? "2" : "1"
                  }.php`;
                }, delay("Wrong section. Navigating to correct section"));
              }

              localStorage.setItem(
                BOT_IN_PROGRESS,
                JSON.stringify({
                  cid: this.cID,
                  job: nextJob,
                  ress: this.current.ress,
                })
              );

              return clickSite(nextJob.pos);
            }
          }
        }

        if (location.pathname.includes("dorf1")) {
          let available = this.fieldsCollection.filter((f) =>
            f.node.classList.contains("good")
          );
          let upgrade = [];

          //if !upgrade res
          if (this.settings["c" + this.cID].upgradeRes) {
            upgrade = upgrade.concat(available.filter((f) => f.gid < 4));
          }

          if (this.settings["c" + this.cID].upgradeCrop) {
            upgrade = upgrade.concat(available.filter((f) => f.gid === 4));
          }
          console.log("a", available);
          console.log("u", upgrade);

          upgrade = upgrade.sort((a, b) => a.lvl - b.lvl);
          console.log("u s", upgrade);

          if (upgrade.length > 0) {
            let job = upgrade[0];
            localStorage.setItem(
              BOT_IN_PROGRESS,
              JSON.stringify({
                cid: this.cID,
                job: {
                  gid: job.gid,
                  pos: job.pos,
                  lvl: job.lvl,
                  to: job.lvl + 1,
                },
                ress: this.current.ress,
              })
            );
            return clickSite(job.pos, "Auto-Upgrade: ");
          }
        }
      }
      this.switchCity();
    };

    //FARMLIST REGION
    function initFarmingRules(b) {
      let rules = JSON.parse(localStorage.getItem(FARM_RULES));
      if (!rules) {
        rules = [];
        localStorage.setItem(FARM_RULES, JSON.stringify(rules));
      }
      b.npcRules = rules;
      console.log("Rules: ", rules);

      if (
        window.location.pathname.includes("build.php") &&
        params.gid &&
        params.gid === "16" &&
        params.tt &&
        params.tt === "99"
      ) {
        console.log("farm list open");
        let villageList = document.querySelectorAll(
          "#raidList .villageWrapper"
        );
        let farmLists = [];
        villageList.forEach((v) => {
          let farmList = v.querySelectorAll(".dropContainer .raidList");
          farmList.forEach((l) => {
            let farmListItem = {};
            farmListItem.id = l.id;
            farmLists.push(farmListItem);
          });
        });
        console.log(farmLists);
      }
    }

    initJobQueue(BOT);
    initFarmingRules(BOT);
    BOT.displayJobs();
    setUpNPC(BOT, botPanel);

    // let prog = localStorage.getItem(BOT_IN_PROGRESS)
    // const inProgress = prog === "" || prog === null ? null : JSON.parse(prog)

    if (ON) {
      console.log("Starting bot");
      BOT.checkNPC();
      if (!BOT.busy) {
        BOT.setNextJob();
      }
    }

    console.log(BOT);
  }
}

allInOneOpera();
