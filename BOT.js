const initBOT = () => {
  const lag = 60000;
  let prog = localStorage.getItem(BOT_IN_PROGRESS);
  const inProgress = !prog ? null : JSON.parse(prog);
  const { upgradeCrop, upgradeRes } = AutoUpgrade.get();
  const { watchAds, prioritisePlanned } = JobsManager.settings();

  const label = "trav";

  const switchCity = () => {
    console.log("switching city");
    let planned = [];
    Villages.all.forEach((vil) => {
      console.log(`[######   ${vil.name}    #####]`);
      let time = Date.now();

      let { job, queueWait, ressWait, wq1 } = getNextJob(vil.did);
      let { upgradeCrop, upgradeRes } = AutoUpgrade.get(vil.did);
      let { prioritisePlanned } = JobsManager.settings(vil.did);
      let lastCheck = ConstructionManager.get(vil.did).timestamp;

      p = {
        did: vil.did,
        nextCheck: lastCheck + MAX_WAIT,
      };

      let nextCheckMin = lastCheck + MIN_WAIT;
      let nextCheckMax = lastCheck + MAX_WAIT;
      let wmax = queueWait > ressWait ? queueWait : ressWait;
      let auto = upgradeCrop || upgradeRes;
      let nextMax = wmax > nextCheckMax ? nextCheckMax : wmax;

      const getNextAutoTime = () => {
        if (wq1 > time) {
          console.log(
            `village ${vil.name} has busy queue and auto build enabled.`
          );
          return wq1 > nextCheckMax ? nextCheckMax : wq1;
        } else {
          console.log(
            `village ${vil.name} has empty queue and auto build enabled.`
          );
          return nextCheckMin < time ? time : nextCheckMin;
        }
      };

      if (job) {
        //can be built?
        if (wmax < time) {
          console.log(`village ${vil.name} has planed job can be built now`);
          p.nextCheck = time;
        } else if (prioritisePlanned) {
          console.log(
            `village ${vil.name} has planed priority job that cant be built now`
          );
          p.nextCheck = nextMax;
        } else if (auto) {
          //TODO: need to store field values for villages for more acurate calculations
          p.nextCheck = getNextAutoTime();
        }
      } else if (nextCheckMax < time) {
        // Maximum time of not checking passed. needs to be checked!
        console.log(`village ${vil.name} was not checked for too long`);
        p.nextCheck = time;
      } else if (auto) {
        // Maximum time of not checking passed. needs to be checked!
        p.nextCheck = getNextAutoTime();
      }
      planned.push(p);
      console.log(
        "minutes till next check: ",
        (p.nextCheck - Date.now()) / 1000 / 60
      );
      console.log("======================");
    });
    console.log("scan finished", planned);
    planned.sort((a, b) => a.nextCheck - b.nextCheck);
    console.log("vill sorted", planned);

    if (planned[0].did === CurrentVillage.did) {
      setTimeout(
        startBuildingLoop,
        Status.update("waiting for next job", true, planned[0].nextCheck - time)
      );
    } else {
      let delay = Status.update(
        `Switching to ${Villages.get(planned[0].did).name}`,
        true,
        planned[0].nextCheck - time
      );
      setTimeout(() => {
        Villages.get(planned[0].did).node.click();
      }, delay);
    }
  };

  const getAutoUpgradeJob = () => {
    let upgradable = Dorf1Slots.filter((slot) => slot.status === "good");
    if (!upgradeRes) upgradable = upgradable.filter((f) => f.gid === 4);
    if (!AutoUpgrade.get().upgradeCrop)
      upgradable = upgradable.filter((f) => f.gid !== 4);
    if (upgradable.length > 0) {
      upgradable = upgradable.sort((a, b) => a.lvl - b.lvl);
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

  const continueUpgrade = () => {
    console.log("continuing old upgrade");
    if (location.pathname.includes("build.php")) {
      const params = getParams();
      let currentLvl = 0;
      //check if job was done to this leve and if so, complete it
      if (Object.keys(params).includes("gid")) {
        currentLvl = Number(
          document.querySelector("div#build").classList[1].slice(-1)
        );
      }
      if (currentLvl >= inProgress.job.to) {
        console.log("something wrong with levels");
        // return setTimeout(() => {
        //   localStorage.setItem(BOT_IN_PROGRESS, "");
        //   this.completeJob(inProgress.job);
        //   window.location.href = "/dorf1.php";
        // }, 5000);
      }
      if (
        inProgress.did === CurrentVillage.did &&
        inProgress.job.pos === Number(params.id)
      ) {
        let b,
          b2 = undefined;
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
                Status.update("Wrong tab detected. switching tab!"),
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
            }, Status.update("Wrong tab detected. switching tab!"));
          }
          b = document.querySelector(".section1 button.green.build");
          if (b) console.log("first button found");
          if (watchAds) {
            b2 = document.querySelector(".section2 button.green.build");
            console.log("second button found:", b ? true : false);
          }
        }
        if (b || b2) {
          return setTimeout(() => {
            if (b2 && watchAds) {
              b2.click();
              //sending message to other script to start video in 5 seconds
              setTimeout(() => {
                GM_setValue(
                  "trav_ads_main",
                  " pressed on build with add " + Math.random
                );
              }, 3000);
            } else {
              b ? b.click() : console.log("could not find build button");
            }
            //TODO: Job should be auto cleared after reload if level exists already?? check if working
            // JobsManager.complete(inProgress.job);
            localStorage.setItem(BOT_IN_PROGRESS, "");
            //   b.click();
          }, Status.update("Perssing build Button"));
        } else console.log("Error! Button for upgrade not found!");
      }
    }
  };

  const startAutoUpgradeJob = () => {
    if (upgradeCrop || upgradeRes) {
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
            `Auto upgrade: upgrading ${BDB.data(job.gid).name} to level ${
              job.to
            }`
          );
        } else switchCity();
      } else {
        setTimeout(() => {
          navigateTo(1);
        }, Status.update("Auto upgrades: switching to resources view"));
      }
    } else switchCity();
  };

  const startBuildingLoop = () => {
    console.log("starting building loop");
    prog = null;
    localStorage.setItem(BOT_IN_PROGRESS, "");

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
            if (slot.status === "good") {
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
                `Navigating: Upgrading ${BDB.data(gid).name} to level ${job.to}`
              );
            } else {
              //something not right
              console.log("job not possible at the moment");
              switchCity();
            }
          } else {
            //wrong dorf switch to correct dorf if job can be done
            return setTimeout(
              () => navigateTo(Dorf1Slots ? 2 : 1),
              Status.update("Wrong section. Navigating to correct section")
            );
          }
        } else if (!prioritisePlanned) {
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
          Tribe.id === ROMAN &&
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

  //Check if anything is in progres... if so, continue building or start new loop
  if (inProgress && inProgress.timestamp > Date.now()) continueUpgrade();
  else startBuildingLoop();
};

if (BOT_ON && ShouldRun) {
  console.log("bot on");
  initBOT();
}
