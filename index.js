// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*

// @require settings.js
// @require constants.js
// @require buildings.js
// @require helpers.js

// @require productionManager.js
// @require constructionManager.js

// @version        0.10.4.4
// ==/UserScript==

function allInOneOpera() {
  let BOT = {};

  //STARTS HERE IF CAN SEE VILLAGE LIST

  if (shouldRun()) {
    // BOT = getCities();
    //  const params = getParams();

    // if (
    //   window.location.pathname.includes("build.php") &&
    //   !window.location.search.includes("&gid=")
    // ) {
    //   const cat = params.category ? Number(params.category) : 1;

    //   const availableBuildings = document.querySelectorAll(
    //     ".buildingWrapper > .build_desc > img.building"
    //   );
    //   availableBuildings.forEach((b) => {
    //     let cont = b.parentNode.parentNode;
    //     let gid = Number(
    //       cont.querySelector(".contract").id.replace("contract_building", "")
    //     );
    //     let pos = window.location.search.split("=")[1];
    //     pos = pos.includes("&") ? Number(pos.split("&")[0]) : Number(pos);

    //     cont.style.position = "relative";
    //     const button = cont.appendChild(document.createElement("button"));
    //     button.classList.add("textButtonV1", "green", "new");
    //     button.style.position = "absolute";
    //     button.style.right = "0";
    //     button.style.top = "0";
    //     button.innerText = `Build later`;

    //     button.onclick = () => {
    //       BOT.addJob({ gid, pos, lvl: 0, to: 1, cat });
    //       BOT.displayJobs();
    //       window.location.href = "/dorf2.php";
    //     };
    //   });
    // }

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
          }, BOT.updateStatus(`Switching to ${filtered[0].name}`, true, 0));
        } else {
          setTimeout(() => {
            location.reload();
          }, BOT.updateStatus("Cooldown, waiting minimal time.", false, MIN_WAIT));
        }
      } else {
        setTimeout(() => {
          location.href = "/dorf1.php";
        }, BOT.updateStatus("Switching to resources view"));
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
                    BOT.updateStatus("Wrong tab detected. switching tab!"),
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
                }, BOT.updateStatus("Wrong tab detected. switching tab!", true));
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
              BOT.updateStatus("Perssing build Button"),
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
                }, BOT.updateStatus("Wrong section. Navigating to correct section"));
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

    //  setUpStatusBar(BOT, botPanel);
    // initJobQueue(BOT);
    // initFarmingRules(BOT);
    // BOT.displayJobs();

    //setUpNPC(BOT, botPanel);
    //should be reacurring event if npc rules enabled
    // BOT.checkNPC();

    // let prog = localStorage.getItem(BOT_IN_PROGRESS)
    // const inProgress = prog === "" || prog === null ? null : JSON.parse(prog)

    // if (ON) {
    //   console.log("Starting bot");
    //   BOT.checkNPC();
    //   if (!BOT.busy) {
    //     BOT.setNextJob();
    //   }
    // }

    // console.log(BOT);
  }
}

allInOneOpera();
