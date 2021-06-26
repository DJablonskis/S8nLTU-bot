function displayJobs() {
  let jobs = this.jobs["c" + this.cID];
  jobs = !jobs ? [] : jobs;
  const cVillage = this.current;
  const panel = this.jobsSection;
  while (panel.firstChild) {
    panel.removeChild(panel.firstChild);
  }

  if (window.location.pathname.includes("dorf1")) {
    this.fieldsCollection.forEach((field) => {
      const buildingNow = cVillage.queue.filter(
        (bn) => Number(bn.aid) === field.pos
      );
      const min = field.lvl + buildingNow.length + 1;
      const old_jobs = jobs.filter(
        (job) => job.pos === field.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          jobs = this.completeJob(job);
        });
      }

      const count = jobs.filter((x) => x.pos === field.pos).length;
      field.bot.textContent = count === 0 ? "+" : count;
      field.bot.dataset.lvl = count;
      field.bot.onclick = () => {
        this.addJob({
          gid: field.gid,
          pos: field.pos,
          lvl: field.lvl,
          to:
            Number(field.bot.dataset.lvl) +
            1 +
            Number(field.lvl) +
            buildingNow.length,
        });
        this.displayJobs();
      };
    });
  }
  if (window.location.pathname.includes("dorf2")) {
    this.buildingCollection.forEach((building) => {
      //Number of currently beign built same type buildings
      const buildingNow = cVillage.queue.filter(
        (bn) => Number(bn.aid) === building.pos
      );

      const min = building.lvl + buildingNow.length + 1;
      const old_jobs = jobs.filter(
        (job) => job.pos === building.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          jobs = this.completeJob(job);
        });
      }

      const pos_jobs = jobs.filter((x) => x.pos === building.pos);
      const count = pos_jobs.length;

      //if new building display!
      if (building.gid === 0 && count > 0) {
        building.bot.style.display = "block";
        building.gid = pos_jobs[0].gid;
        let image = building.node.querySelector("img");
        image.classList.add("g" + pos_jobs[0].gid);
        image.style.opacity = "0.5";
      }
      building.bot.textContent = count === 0 ? "+" : count;
      building.bot.dataset.lvl = count;
      building.bot.onclick = () => {
        this.addJob({
          gid: building.gid,
          pos: building.pos,
          lvl: building.lvl,
          to:
            Number(building.bot.dataset.lvl) +
            1 +
            Number(building.lvl) +
            buildingNow.length,
        });
        this.displayJobs();
      };
    });
  }

  const summary = this.jobsSection.appendChild(
    document.createElement("summary")
  );
  summary.innerHTML = `<strong>Jobs planed: </strong> ${jobs.length}; <strong>`;

  if (jobs.length > 0) {
    jobs.forEach((job) => {
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
        this.removeJob(jobs[i]);
        this.displayJobs();
      };
      this.jobsSection.appendChild(node);
      nodeText.textContent = `[${job.pos}] ${
        this.buildingDB[job.gid - 1].name
      } to level ${job.to}`;
    });
  }
}

function initJobQueue(c) {
  let cid = "c" + c.cID;

  let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE));
  if (!jobs || !jobs[cid]) {
    jobs = jobs ? jobs : {};
    if (window.location.pathname.includes("dorf")) {
      jobs[cid] = jobs[cid] ? jobs[cid] : [];
    }
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
  }

  let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
  if (!settings || !settings[cid]) {
    settings = settings ? settings : {};
    if (window.location.pathname.includes("dorf")) {
      settings[cid] = settings[cid]
        ? settings[cid]
        : { upgradeRes: false, upgradeCrop: false };
    }
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  }

  let cbAutoRes = document.getElementById("cbAutoRes");
  cbAutoRes.checked = settings[cid].upgradeRes;
  cbAutoRes.addEventListener("change", (e) => {
    if (e.target.checked !== c.settings[cid].upgradeRes) {
      let box = e.target;
      c.settings[cid].upgradeRes = box.checked;
      console.log("auto res changed to ", c.settings[cid].upgradeRes);
      localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(c.settings));
    }
  });

  let cbAutoCrop = document.getElementById("cbAutoCrop");
  cbAutoCrop.checked = settings[cid].upgradeCrop;
  cbAutoCrop.addEventListener("change", (e) => {
    if (e.target.checked !== c.settings[cid].upgradeCrop) {
      let box = e.target;
      c.settings[cid].upgradeCrop = box.checked;
      console.log("auto crop changed to ", c.settings[cid].upgradeCrop);
      localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(c.settings));
    }
  });

  c.settings = settings;
  c.jobs = jobs;
  c.displayJobs = displayJobs;
}
