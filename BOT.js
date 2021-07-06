const initBOT = () => {
  let prog = localStorage.getItem(BOT_IN_PROGRESS);
  const inProgress = !prog ? null : JSON.parse(prog);

  const enoughResources = (job) => {
    const building = BDB.get(job.gid);
    const cost = building.stats(job.to).cost;

    const { storage } = ProductionManager.get();

    return (
      storage.l1 >= cost[0] &&
      storage.l2 >= cost[1] &&
      storage.l3 >= cost[2] &&
      storage.l4 >= cost[3]
    );
  };

  const switchCity = () => {
    if (Dorf1Slots) {
      let filtered = Villages.all.filter((v) => {
        let shouldCheck = false;
        let jobs = JobsManager.get(v.did);

        if (jobs && jobs.length > 0) {
          let q1 = jobs.filter((q) => q.gid < 5);
          let q2 = jobs.filter((q) => q.gid > 4);

          const p = v.queue.filter((b) => b.finish > Date.now());
          const p1 = p.filter((_p) => _p.gid < 5);
          const p2 = p.filter((_p) => _p.gid > 4);
          if (v.timestamp + MIN_WAIT < Date.now()) {
            if (Tribe.id === TRIBE_ROMAN) {
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
          shouldCheck =
            (AutoUpgrade.get().upgradeCrop || AutoUpgrade.get().upgradeRes) &&
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
        }, Status.update(`Switching to ${filtered[0].name}`, true, 0));
      } else {
        setTimeout(() => {
          navigateTo(1);
        }, Status.update("Cooldown, waiting minimal time.", false, MIN_WAIT));
      }
    } else {
      setTimeout(() => {
        navigateTo(1);
      }, Status.update("Switching to resources view"));
    }
  };

  const getAutoUpgradeJob = () => {
    const { upgradeCrop, upgradeRes } = AutoUpgrade.get();
    if (Dorf1Slots && (upgradeRes || upgradeCrop)) {
      let upgradable = Dorf1Slots.filter((slot) => slot.status === "good");

      if (!upgradeRes) upgradable = upgradable.filter((f) => f.gid === 4);
      if (!AutoUpgrade.get().upgradeCrop)
        upgradable = upgradable.filter((f) => f.gid !== 4);
      if (upgradeble.length > 0) {
        upgradable = upgradable.sort((a, b) => a.lvl - b.lvl);
        let job = upgradable[0];
        return {
          gid: job.gid,
          pos: job.pos,
          lvl: job.lvl,
          to: job.lvl + 1,
        };
      }
    }
    return null;
  };

  const buildingProcess = () => {
    if (jobs.length > 0) {
      //ANYTHING BUILDING?

      if (nextJob !== null) {
        if (enoughResources(nextJob)) {
          if (
            (nextJob.gid > 4 && Dorf1Slots) ||
            (nextJob.gid < 5 && Dorf2Slots)
          ) {
            return setTimeout(() => {
              window.location.href = `/dorf${nextJob.gid > 4 ? "2" : "1"}.php`;
            }, Status.update("Wrong section. Navigating to correct section"));
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
          inProgress.cid === CurrentVillage.did &&
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
          }
          return setTimeout(() => {
            if (b) {
              this.completeJob(inProgress.job);
              localStorage.setItem(BOT_IN_PROGRESS, "");
              b.click();
            } else console.log("Error! Button for upgrade not found!");
          }, Status.update("Perssing build Button"));
        }
      }
    }
  };

  const getNextJob = (did = CurrentVillage.did) => {
    let nextJob,
      d1Info,
      d2Info = null;
    if (JobsManager.next(did)) {
      nextJob = JobsManager.next(did);
      d1Info = ConstructionManager.available(1, did);
      d2Info = ConstructionManager.available(2, did);

      if (Tribe.id === TRIBE_ROMAN) {
        if (nextJob.gid < 5) {
          if (
            !d1Info.available ||
            (!enoughResources(nextJob) && JobsManager.nextDorf2(did))
          ) {
            let temp = JobsManager.nextDorf2(did);

            //TODO: check which dorf will be available first?
            if (enoughResources(temp) && d2Info.available) nextJob = temp;
          }
        } else {
          if (
            !d2Info.available ||
            (!enoughResources(nextJob) && JobsManager.nextDorf1(did))
          ) {
            let temp = JobsManager.nextDorf1(did);
            //TODO: check which dorf will be available first?
            if (enoughResources(temp) && d1Info.available) nextJob = temp;
          }
        }
      }

      return { nextJob, d1Info, d2Info };
    }
    return null;
  };
  return { getNextJob, getAutoUpgradeJob };
};

const BOT = initBOT();

console.log(BOT.getNextJob());
