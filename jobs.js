const initJobs = (BOT, botPanel) => {
  let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE));
  if (!jobs || !jobs[CurrentVillage.did]) {
    jobs = jobs ? jobs : {};
    if (window.location.pathname.includes("dorf")) {
      jobs[CurrentVillage.did] = jobs[CurrentVillage.did]
        ? jobs[CurrentVillage.did]
        : [];
    }
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
  }

  let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
  if (!settings || !settings[CurrentVillage.did]) {
    settings = settings ? settings : {};
    if (window.location.pathname.includes("dorf")) {
      settings[CurrentVillage.did] = settings[CurrentVillage.did]
        ? settings[CurrentVillage.did]
        : { upgradeRes: false, upgradeCrop: false };
    }
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  }

  const jobsQueueSection = botPanel.appendChild(document.createElement("div"));
  jobsQueueSection.style.cssText =
    "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
  const jobQTitle = jobsQueueSection.appendChild(document.createElement("h4"));
  jobQTitle.innerText = "Builder";
  jobQTitle.style.cssText = titleStyle;

  const jobsSection = jobsQueueSection.appendChild(
    document.createElement("details")
  );

  const builderSettings = jobsQueueSection.appendChild(
    document.createElement("div")
  );
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

  let cbAutoRes = document.getElementById("cbAutoRes");
  cbAutoRes.checked = settings[CurrentVillage.did].upgradeRes;
  cbAutoRes.addEventListener("change", (e) => {
    if (e.target.checked !== settings[CurrentVillage.did].upgradeRes) {
      let box = e.target;
      settings[CurrentVillage.did].upgradeRes = box.checked;
      console.log(
        "auto res changed to ",
        settings[CurrentVillage.did].upgradeRes
      );
      localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
    }
  });

  let cbAutoCrop = document.getElementById("cbAutoCrop");
  cbAutoCrop.checked = settings[CurrentVillage.did].upgradeCrop;
  cbAutoCrop.addEventListener("change", (e) => {
    if (e.target.checked !== settings[CurrentVillage.did].upgradeCrop) {
      let box = e.target;
      settings[CurrentVillage.did].upgradeCrop = box.checked;
      console.log(
        "auto crop changed to ",
        settings[CurrentVillage.did].upgradeCrop
      );
      localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
    }
  });

  const summary = jobsSection.appendChild(document.createElement("summary"));
  summary.innerHTML = `<strong>Jobs planed: </strong> ${jobs.length}; <strong>`;

  if (jobs.length > 0) {
    jobs[CurrentVillage.did].forEach((job) => {
      const node = document.createElement("div");
      node.style.cssText =
        "font-size: 10px; line-height:10px; margin-bottom:2px;";
      const nodeButton = node.appendChild(document.createElement("span"));
      const nodeText = node.appendChild(document.createElement("span"));
      nodeButton.style.cssText =
        "cursor: pointer; width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px; ";
      nodeButton.textContent = "x";
      nodeButton.onclick = (e) => {
        let i = whichChild(e.target.parentNode) - 1;
        removeJob(jobs[CurrentVillage.did][i]);
        refreshJobs();
      };
      jobsSection.appendChild(node);
      nodeText.textContent = `[${job.pos}] ${BDB.name(job.gid)} to level ${
        job.to
      }`;
    });
  }

  const completeJob = (job) => {
    jobs[CurrentVillage.did] = jobs[CurrentVillage.did].filter(
      (j) => j.pos !== job.pos || (j.pos === job.pos && j.to !== job.to)
    );
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
    return jobs[CurrentVillage.did];
  };

  const removeJob = (job) => {
    jobs[CurrentVillage.did] = jobs[CurrentVillage.did].filter(
      (j) => j.pos !== job.pos || (j.pos === job.pos && j.to < job.to)
    );
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
  };

  const addJob = (job) => {
    // if (!this.cap) {
    //   alert(
    //     "Capital not set. Opening '/profile' section for you now. While on '/profile' section, please change your current city to your capital city for bot to update. You only need to do this once."
    //   );
    //   location.href = "/profile";
    //   return;
    // }
    //Check if ress and max level ceiling
    if (job.gid < 5) {
      if (job.to > 10) {
        if (BOT.cap !== BOT.CurrentVillage.did) {
          alert("Max level is 10 in non Capital villages!");
          return;
        } else if (job.to > 21) {
          alert("Max field level is 21!");
          return;
        }
      }
    } else {
      const b = BDB.data(job.gid);

      if (job.to > b.maxLvl) {
        alert(`Max level for ${b.name} is ${b.maxLvl}`);
        return;
      }
      //is cap and not alowed in cap:
      if (BOT.cap === BOT.cID && !b.cap) {
        alert("Cant build this in capitol!");
        return;
      }
      if (BOT.cap !== BOT.cID && !b.xcap) {
        alert("Cant build this in non capitol city!");
        return;
      }
    }

    const w = getWarehouseCapacity();
    const g = getGranaryCapacity();
    const stats = BDB.stats(job.gid, job.to);
    if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w)
      return alert("Expand warehouse first!");
    if (stats.cost[3] > g) return alert("Expand granary first!");
    jobs[cid].push(job);
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
  };
};

const refreshJobs = () => {
  const currentVillage = BOT.current;
  while (jobsSection.firstChild) {
    jobsSection.removeChild(jobsSection.firstChild);
  }

  if (window.location.pathname.includes("dorf1")) {
    const fields = getResFields();
    fields.forEach((field) => {
      const buildingNow = currentVillage.queue.filter(
        (bn) => Number(bn.aid) === field.pos
      );
      const min = field.lvl + buildingNow.length + 1;
      const old_jobs = jobs.filter(
        (job) => job.pos === field.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          jobs = completeJob(job);
        });
      }

      // ADDING JOBS
      // field.bot.onclick = () => {
      //   addJob({
      //     gid: field.gid,
      //     pos: field.pos,
      //     lvl: field.lvl,
      //     to:
      //       Number(field.bot.dataset.lvl) +
      //       1 +
      //       Number(field.lvl) +
      //       buildingNow.length,
      //   });
      //   refreshJobs();
      // };
    });
  }
  if (window.location.pathname.includes("dorf2")) {
    Dorf2Slots.forEach((building) => {
      //Number of currently beign built same type buildings
      const buildingNow = currentVillage.queue.filter(
        (bn) => Number(bn.aid) === building.pos
      );

      const min = building.lvl + buildingNow.length + 1;
      const old_jobs = jobs.filter(
        (job) => job.pos === building.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          jobs = completeJob(job);
        });
      }

      const pos_jobs = jobs.filter((x) => x.pos === building.pos);
      const count = pos_jobs.length;

      // //if new building display!
      // if (building.gid === 0 && count > 0) {
      //   building.bot.style.display = "block";
      //   building.gid = pos_jobs[0].gid;
      //   let image = building.node.querySelector("img");
      //   image.classList.add("g" + pos_jobs[0].gid);
      //   image.style.opacity = "0.5";
      // }

      // building.bot.onclick = () => {
      //   this.addJob({
      //     gid: building.gid,
      //     pos: building.pos,
      //     lvl: building.lvl,
      //     to:
      //       Number(building.bot.dataset.lvl) +
      //       1 +
      //       Number(building.lvl) +
      //       buildingNow.length,
      //   });
      //   this.displayJobs();
      // };
    });
  }

  return {
    allJo,
  };
};

//const JobsManager = initJobs();
