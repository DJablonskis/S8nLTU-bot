const initBOT = () => {
  const lag = 60000;
  let prog = localStorage.getItem(BOT_IN_PROGRESS);
  const inProgress = !prog ? null : JSON.parse(prog);
  const { upgradeCrop, upgradeRes } = AutoUpgrade.get();
  const { watchAds, prioritisePlanned } = JobsManager.settings;

  const switchCity = () => {
    console.log("switch city");
    // if (Dorf1Slots) {
    //   let filtered = Villages.all.filter((v) => {
    //     let shouldCheck = false;
    //     let jobs = JobsManager.get(v.did);

    //     if (jobs && jobs.length > 0) {
    //       let q1 = jobs.filter((q) => q.gid < 5);
    //       let q2 = jobs.filter((q) => q.gid > 4);

    //       const p = v.queue.filter((b) => b.finish > Date.now());
    //       const p1 = p.filter((_p) => _p.gid < 5);
    //       const p2 = p.filter((_p) => _p.gid > 4);
    //       if (v.timestamp + MIN_WAIT < Date.now()) {
    //         if (Tribe.id === TRIBE_ROMAN) {
    //           shouldCheck =
    //             (q1.length > 0 && p1.length === 0) ||
    //             (q2.length > 0 && p2.length === 0);
    //         } else {
    //           shouldCheck = p.length === 0;
    //         }

    //         return shouldCheck;
    //       }
    //     }

    //     if (!shouldCheck) {
    //       shouldCheck =
    //         (AutoUpgrade.get().upgradeCrop || AutoUpgrade.get().upgradeRes) &&
    //         v.timestamp + MIN_WAIT < Date.now();
    //       if (shouldCheck) {
    //         console.log(`added ${v.name} because of auto rules`);
    //       }
    //     }

    //     if (!shouldCheck) {
    //       shouldCheck = v.timestamp + MAX_WAIT < Date.now();
    //       if (shouldCheck) {
    //         console.log(`added ${v.name} because of no update in long time`);
    //       }
    //     }

    //     return shouldCheck;
    //   });

    //   if (filtered.length > 0) {
    //     filtered = shuffleArray(filtered);
    //     //switch to some city
    //     setTimeout(() => {
    //       document
    //         .querySelector(
    //           "#sidebarBoxVillagelist li a[href*='" + filtered[0].did + "']"
    //         )
    //         .click();
    //     }, Status.update(`Switching to ${filtered[0].name}`, true, 0));
    //   } else {
    //     setTimeout(() => {
    //       navigateTo(1);
    //     }, Status.update("Cooldown, waiting minimal time.", false, MIN_WAIT));
    //   }
    // } else {
    //   setTimeout(() => {
    //     navigateTo(1);
    //   }, Status.update("Switching to resources view"));
    // }
  };

  const getAutoUpgradeJob = () => {
    let upgradable = Dorf1Slots.filter((slot) => slot.status === "good");
    if (!upgradeRes) upgradable = upgradable.filter((f) => f.gid === 4);
    if (!AutoUpgrade.get().upgradeCrop)
      upgradable = upgradable.filter((f) => f.gid !== 4);
    if (upgradable.length > 0) {
      upgradable = upgradable.sort((a, b) => a.lvl - b.lvl);
      let job = upgradable[0];
      console.log("auto upgrade job found");
      return {
        gid: job.gid,
        pos: job.pos,
        lvl: job.lvl,
        to: job.lvl + 1,
      };
    }
    console.log(" no auto upgrade job found");
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
            console.log("to :", inProgress.job.to);
            console.log("current: ", currentLvl);

            if (b2 && watchAds) {
              b2.click();
              setTimeout(() => {
                let playButton = document.querySelector(".video-js button");
                if (playButton) playButton.click();
                else console.log("could not find play button");
              }, 5000);
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
    console.log("start auto upgrade");
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
          setTimeout(() => {
            clickSite(job.pos);
          }, Status.update(`Auto upgrade: upgrading ${BDB.data(job.gid).name} to level ${job.to}`));
        } else switchCity();
      } else {
        setTimeout(() => {
          navigateTo(1);
        }, Status.update("Auto upgrades: switching to resources view"));
      }
    }
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
              console.log("job to be saved: ", {
                did: CurrentVillage.did,
                job,
                timestamp: Date.now() + lag,
              });
              localStorage.setItem(
                BOT_IN_PROGRESS,
                JSON.stringify({
                  did: CurrentVillage.did,
                  job,
                  timestamp: Date.now() + lag,
                })
              );
              return clickSite(pos);
            } else {
              //something not right
              console.log("job not possible at the moment");
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
      } // TODO: Queue busy keep track of times here for switchingCities
    } else startAutoUpgradeJob();
  };

  const getNextJob = (did = CurrentVillage.did) => {
    let nextJob = null;
    let queueWait = 0;

    if (JobsManager.next(did)) {
      nextJob = JobsManager.next(did);
      let ressWait = ProductionManager.tillEnough(nextJob);
      let d1 = nextJob.gid < 5;

      q1 = ConstructionManager.dorfStatus(1, did);
      q2 = ConstructionManager.dorfStatus(2, did);

      if (!q1.empty || !q2.empty || ressWait > Date.now()) {
        wq1 = q1.empty ? 0 : q1.finish;
        wq2 = q2.empty ? 0 : q2.finish;
        queueWait = wq1 > wq2 ? wq1 : wq2;
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
      return { job: nextJob, queueWait, ressWait };
    }
    return null;
  };

  //Check if anything is in progres... if so, continue building or start new loop
  if (inProgress && inProgress.timestamp > Date.now()) continueUpgrade();
  else startBuildingLoop();
};

if (BOT_ON) {
  console.log("bot on");
  initBOT();
}
