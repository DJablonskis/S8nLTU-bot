const initJobs = () => {
  let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE));
  jobs = jobs ? jobs : {};
  cvJobs = jobs[CurrentVillage.did] ? jobs[CurrentVillage.did] : [];

  const subscribers = [];
  const subscribe = (funk) => {
    subscribers.push(funk);
    funk(cvJobs);
  };

  const save = () => {
    jobs[CurrentVillage.did] = cvJobs;
    localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
    subscribers.forEach((f) => f(cvJobs));
  };

  const complete = (job) => {
    cvJobs = cvJobs.filter(
      (j) => j.pos !== job.pos || (j.pos === job.pos && j.to !== job.to)
    );
    save();
  };

  const remove = (job) => {
    cvJobs = cvJobs.filter(
      (j) => j.pos !== job.pos || (j.pos === job.pos && j.to < job.to)
    );
    save();
  };

  //   add({
  //     gid: field.gid,
  //     pos: field.pos,
  //     lvl: field.lvl,
  //     to:
  //       Number(field.bot.dataset.lvl) +
  //       1 +
  //       Number(field.lvl) +
  //       buildingNow.length,
  //   });

  const add = (job) => {
    if (!Capital) {
      return alert("Capital not set.");
    }

    //Check if ress and max level ceiling
    if (job.gid < 5) {
      if (job.to > 10) {
        if (Capital !== CurrentVillage.did) {
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
      if (Capital === CurrentVillage.did && !b.cap) {
        alert("Cant build this in capitol!");
        return;
      }
      if (Capital !== CurrentVillage.did && !b.xcap) {
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
    cvJobs.push(job);
    save();
  };
};

const checkJobs = () => {
  if (window.location.pathname.includes("dorf1")) {
    Dord1Slots.forEach((field) => {
      const buildingNow = ConstructionManager.current.filter(
        (bn) => Number(bn.aid) === field.pos
      );
      const min = field.lvl + buildingNow.length + 1;
      const old_jobs = jobs.filter(
        (job) => job.pos === field.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          complete(job);
        });
      }
    });
  } else if (window.location.pathname.includes("dorf2")) {
    Dorf2Slots.forEach((building) => {
      //Number of currently beign built same type buildings
      const buildingNow = ConstructionManager.current.filter(
        (bn) => Number(bn.aid) === building.pos
      );

      const min = building.lvl + buildingNow.length + 1;
      const old_jobs = cvJobs.filter(
        (job) => job.pos === building.pos && job.to < min
      );
      if (old_jobs.length > 0) {
        old_jobs.forEach((job) => {
          jobs = complete(job);
        });
      }

      //DISPLAYING NEW PLANED BUILDINGS, NEEDS TO BE MOVED
      // const pos_jobs = jobs.filter((x) => x.pos === building.pos);
      // const count = pos_jobs.length;

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
    complete,
    remove,
    add,
    jobs,
    subscribe,
    get: (did) => jobs[did],
    current: cvJobs,
  };
};

const JobsManager = initJobs();
