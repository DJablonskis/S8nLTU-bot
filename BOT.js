const initBOT = () => {
  const lag = 60000;

  const { watchAds, prioritise, upgradeCrop, upgradeRess } = BotOptions.get();

  let getInProgress = () => {
    let prog = localStorage.getItem(BOT_IN_PROGRESS);
    return !prog ? null : JSON.parse(prog);
  };

  let timeout = null;

  const switchCity = () => {
    if (!Dorf1Slots && !Dorf2Slots) {
      timeout = setTimeout(
        () => navigateTo(1),
        Status.update("Lost, navigating home")
      );
      return timeout;
    }

    let planned = [];
    Villages.all.forEach((vil) => {
      let time = Date.now();

      let { job, queueWait, ressWait, wq1, wq2 } = getNextJob(vil.did);
      let { prioritise, upgradeCrop, upgradeRess } =
        BotOptions.getVillageSettings(vil.did);

      let lastCheck = ConstructionManager.get(vil.did).timestamp;

      p = {
        did: vil.did,
        nextCheck: lastCheck + MAX_WAIT,
      };

      let nextCheckMin = lastCheck + MIN_WAIT + Math.floor(Math.random() * 120);
      let nextCheckMax = lastCheck + MAX_WAIT;
      let wmax = queueWait > ressWait ? queueWait : ressWait;
      let auto = upgradeCrop || upgradeRess;
      let nextMax = wmax > nextCheckMax ? nextCheckMax : wmax;
      const getNextAutoTime = () => {
        if (Tribe.id === 1)
          if (wq1 < time) return nextCheckMin < time ? time : nextCheckMin;
          else return wq1 > nextCheckMax ? nextCheckMax : wq1;
        else if (queueWait > time)
          return queueWait > nextCheckMax ? nextCheckMax : queueWait;
        else return nextCheckMin < time ? time : nextCheckMin;
      };
      if (job) {
        //can be built?
        if (wmax < time) {
          p.nextCheck = time;
        } else if (prioritise) {
          p.nextCheck = nextMax;
        } else if (auto) {
          //TODO: need to store field values for villages for more acurate calculations
          p.nextCheck = getNextAutoTime();
        }
      } else if (nextCheckMax < time) {
        p.nextCheck = time;
      } else if (auto) {
        p.nextCheck = getNextAutoTime();
      }
      planned.push(p);
    });
    planned.sort((a, b) => a.nextCheck - b.nextCheck);
    if (planned[0].did === CurrentVillage.did) {
      timeout = setTimeout(() => {
        startBuildingLoop();
      }, Status.update("Waiting.", false, planned[0].nextCheck - Date.now().valueOf()));
    } else {
      let delay = Status.update(
        `Checking ${Villages.get(planned[0].did).name}`,
        false,
        planned[0].nextCheck - Date.now().valueOf()
      );
      timeout = setTimeout(() => {
        Villages.get(planned[0].did).node.querySelector("a").click();
      }, delay);
    }
  };

  const getAutoUpgradeJob = () => {
    let upgradable = Dorf1Slots.filter((slot) => slot.status === "good");
    if (!upgradeRess) upgradable = upgradable.filter((f) => f.gid === 4);
    if (!upgradeCrop) upgradable = upgradable.filter((f) => f.gid !== 4);
    if (upgradable.length > 0) {
      upgradable = upgradable.sort((a, b) => {
        let upA = 0;
        let upB = 0;
        // if (unsafeWindow.bld) {
        //   bld.forEach((x) => {
        //     if (Number(x.aid) === a.pos) totalA++;
        //     if (Number(x.aid) === b.pos) totalB++;
        //   });
        // }

        if (a.upgrading) {
          upA = 1;
          // console.log("upgrading ", a);
        }
        if (b.upgrading) {
          upB = 1;
          // console.log("upgrading ", b);
        }

        return a.lvl + upA - (b.lvl + upB);
      });
      let job = upgradable[0];
      return {
        gid: job.gid,
        pos: job.pos,
        lvl: job.lvl,
        to: job.lvl + 1,
      };
    }
    return null;
  };

  const continueUpgrade = (prog) => {
    let { job, did } = prog;
    if (location.pathname.includes("build.php")) {
      const params = getParams();
      let currentLvl = 0;
      //check if job was done to this level and if so, complete it
      if (Object.keys(params).includes("gid")) {
        currentLvl = Number(
          document.querySelector("div#build").classList[1].slice(-1)
        );
      }
      if (currentLvl >= job.to) {
        alert("something wrong with levels");
      }
      if (did === CurrentVillage.did && Number(job.pos) === Number(params.id)) {
        let b,
          b2 = undefined;
        if (job.to === 1) {
          if (job.cat) {
            let tab = document.querySelector(
              `#content .contentNavi .scrollingContainer .content a[href*="category=${job.cat}"]`
            );
            if (tab && !tab.classList.contains("active")) {
              timeout = setTimeout(
                () => {
                  tab.click();
                },
                Status.update("Switching tab."),
                true
              );
              return timeout;
            }
            b = document
              .querySelector(`img.g${job.gid}`)
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
            timeout = setTimeout(() => {
              tab.click();
            }, Status.update("Switching tab."));
            return timeout;
          }
          b = document.querySelector(".section1 button.green.build");
          if (watchAds) {
            b2 = document.querySelector(".section2 button.green.build");
          }
        }
        if (b || b2) {
          timeout = setTimeout(() => {
            if (b2 && watchAds) {
              b2.click();
              //sending message to other script to start video in 5 seconds
              timeout = setTimeout(() => {
                GM_setValue(
                  "trav_ads_main",
                  " pressed on build with add " + Math.random
                );
              }, 3000);
            } else {
              b ? b.click() : console.log("could not find build button");
            }
            localStorage.setItem(BOT_IN_PROGRESS, "");
          }, Status.update("Perssing build Button"));
          return timeout;
        } else console.log("Error! Button for upgrade not found!");
      }
    } else {
      timeout = setTimeout(() => {
        localStorage.setItem(BOT_IN_PROGRESS, "");
        start();
      }, Status.update("Got interupted during job. Reseting..."));
    }
  };

  const startAutoUpgradeJob = () => {
    if (upgradeCrop || upgradeRess) {
      //Check if auto updater is on and available priority
      if (Dorf1Slots) {
        let job = getAutoUpgradeJob();
        if (job) {
          localStorage.setItem(
            BOT_IN_PROGRESS,
            JSON.stringify({
              did: CurrentVillage.did,
              job,
              timestamp: Date.now() + lag,
            })
          );
          clickSite(
            job.pos,
            `Upgrading ${BDB.data(job.gid).name} to level ${job.to}`
          );
        } else switchCity();
      } else {
        timeout = setTimeout(() => {
          navigateTo(1);
        }, Status.update("Autoupgrade: switching tab"));
      }
    } else switchCity();
  };

  const startBuildingLoop = () => {
    if (JobsManager.next()) {
      let { job, queueWait, ressWait } = getNextJob();
      let { gid, pos } = job;
      //can job be done?
      if (queueWait < Date.now()) {
        if (ressWait < Date.now()) {
          //correct dorf
          if ((gid > 4 && Dorf2Slots) || (gid < 5 && Dorf1Slots)) {
            d1 = gid < 5;
            let i = d1 ? pos - 1 : pos - 19;
            let slots = d1 ? Dorf1Slots : Dorf2Slots;
            let slot = slots[i];
            //possible to upgrade
            if (
              slot.status === "good" ||
              (slot.status === "empty" && slot.upgrading === false)
            ) {
              //check fields classes if "good"
              //TODO: Check if levels including current builds are right here too
              localStorage.setItem(
                BOT_IN_PROGRESS,
                JSON.stringify({
                  did: CurrentVillage.did,
                  job,
                  timestamp: Date.now() + lag,
                })
              );
              return clickSite(
                job.pos,
                `Upgrading ${BDB.data(gid).name} to level ${job.to}`
              );
            } else {
              //something not right
              switchCity();
            }
          } else {
            //wrong dorf switch to correct dorf if job can be done
            timeout = setTimeout(
              () => navigateTo(Dorf1Slots ? 2 : 1),
              Status.update("Switching tab.")
            );
            return timeout;
          }
        } else if (!prioritise) {
          // TODO: Not enough resources for job keep track of times here for switchingCities
          startAutoUpgradeJob();
        } else {
          // TODO: Not enough resources for job keep track of times here for switchingCities
          switchCity();
        }
      } else switchCity(); // TODO: Queue busy keep track of times here for switchingCities
    } else startAutoUpgradeJob();
  };

  const getNextJob = (did = CurrentVillage.did) => {
    let isRoman = getTribe().name === "roman";

    let plusOn = document
      .querySelector("#sidebarBoxActiveVillage .buttonsWrapper a.market")
      .classList.contains("green");

    let maxQueue = plusOn ? 2 : 1;

    let nextJob = null;
    let queueWait = 0;

    q1 = ConstructionManager.dorfStatus(1, did);
    q2 = ConstructionManager.dorfStatus(2, did);

    wq1 = q1.empty ? 0 : q1.finish;
    wq2 = q2.empty ? 0 : q2.finish;
    queueWait = wq1 > wq2 ? wq1 : wq2;

    if (JobsManager.next(did)) {
      nextJob = JobsManager.next(did);
      let ressWait = ProductionManager.tillEnough(nextJob);

      let d1 = nextJob.gid < 5;
      if (!q1.empty || !q2.empty || ressWait > Date.now()) {
        if (
          Tribe.id === 1 &&
          ((d1 && JobsManager.nextDorf2(did)) ||
            (!d1 && JobsManager.nextDorf1(did)))
        ) {
          let tempNextJob = d1
            ? JobsManager.nextDorf2(did)
            : JobsManager.nextDorf1(did);
          let tempRessWait = ProductionManager.tillEnough(tempNextJob);
          let tempDInfo = ConstructionManager.dorfStatus(d1 ? 2 : 1, did);
          if (tempRessWait <= Date.now() && tempDInfo.available) {
            nextJob = tempNextJob;
            ressWait = tempRessWait;
            queueWait = d1 ? wq2 : wq1;
          } else {
            //TODO: check which dorf will be available first?
            if (d1) {
              t1 = wq1 > ressWait ? ressWait : wq1;
              t2 = wq2 > tempRessWait ? tempRessWait : wq2;
              if (t1 > t2) {
                nextJob = tempNextJob;
                ressWait = tempRessWait;
                queueWait = wq2;
              }
            } else {
              t1 = wq1 > tempRessWait ? tempRessWait : wq1;
              t2 = wq2 > ressWait ? ressWait : wq2;
              if (t1 < t2) {
                nextJob = tempNextJob;
                ressWait = tempRessWait;
                queueWait = wq1;
              }
            }
          }
        }
      }
      return { job: nextJob, queueWait, wq1, wq2, ressWait };
    }
    return { job: nextJob, queueWait, ressWait: 0, wq1, wq2 };
  };

  const start = () => {
    if (HeroManager.canGo()) {
      return HeroManager.startAdventure();
    } else if (
      RewardManager.hasReward() &&
      BotOptions.get(optionKeys.collectRewards)
    ) {
      console.log(RewardManager.hasReward());
      RewardManager.collect();
    } else if (getInProgress()) {
      let prog = getInProgress();

      if (prog.timestamp > Date.now() && prog.did === CurrentVillage.did) {
        continueUpgrade(prog);
      } else {
        localStorage.setItem(BOT_IN_PROGRESS, "");
        if (!Dorf1Slots && !Dorf2Slots) {
          timeout = setTimeout(
            () => navigateTo(prog.job.gid > 4 ? 2 : 1),
            Status.update("Wrong started job found. Going back.")
          );
        } else {
          timeout = setTimeout(
            startBuildingLoop,
            Status.update("Wrong started job found. Resetting.")
          );
        }
      }
    } else if (!Dorf1Slots && !Dorf2Slots) {
      timeout = setTimeout(
        () => navigateTo(1),
        Status.update("Lost, navigating home")
      );
      return timeout;
    } else startBuildingLoop();
  };

  const stop = () => {
    if (timeout) clearTimeout(timeout);
    Status.update("Bot off", true, 0);
  };

  return { start, stop };
};

const BOT = initBOT();

BotPower.subscribe((power) => (power ? BOT.start() : BOT.stop()));
