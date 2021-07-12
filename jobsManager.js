const initJobs = () => {
  let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE));
  jobs = jobs ? jobs : {};
  cvJobs = jobs[CurrentVillage.did] ? jobs[CurrentVillage.did] : [];

  let defaultSettings = {
    prioritisePlanned: false,
    watchAds: false,
    expanded: true,
  };

  let settings = JSON.parse(localStorage.getItem(JOBS_SETTINGS_STORAGE));
  settings = settings ? settings : {};
  let cvSettings = settings[CurrentVillage.did]
    ? settings[CurrentVillage.did]
    : defaultSettings;

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

  const updateSettings = (s) => {
    settings[CurrentVillage.did] = s;
    localStorage.setItem(JOBS_SETTINGS_STORAGE, JSON.stringify(settings));
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

  const add = (job) => {
    //Check if ress and max level ceiling
    if (job.gid < 5) {
      if (job.to > 10) {
        if (!Capital) {
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
      if (Capital && !b.cap) {
        alert("Cant build this in capitol!");
        return;
      }
      if (!Capital && !b.xcap) {
        alert("Cant build this in non capitol city!");
        return;
      }
    }

    const w = getWarehouseCapacity();
    const g = getGranaryCapacity();

    //TODO: check for granary and warehouse jobs planed in job queue
    const stats = BDB.stats(job.gid, job.to);
    if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w)
      return alert("Expand warehouse first!");
    if (stats.cost[3] > g) return alert("Expand granary first!");
    cvJobs.push(job);
    save();
  };

  const checkJobs = () => {
    if (Dorf1Slots) {
      Dorf1Slots.forEach((field) => {
        const buildingNow = ConstructionManager.get().all.filter(
          (bn) => Number(bn.aid) === field.pos
        );
        const min = field.lvl + buildingNow.length + 1;
        const old_jobs = cvJobs.filter(
          (job) => job.pos === field.pos && job.to < min
        );
        if (old_jobs.length > 0) {
          old_jobs.forEach((job) => {
            complete(job);
          });
        }
      });
    } else if (Dorf2Slots) {
      //TODO: check if slots with new buildings are not ocupied
      Dorf2Slots.forEach((building) => {
        //Number of currently beign built same type buildings
        const buildingNow = ConstructionManager.get().all.filter(
          (bn) => Number(bn.aid) === building.pos
        );

        const min = building.lvl + buildingNow.length + 1;
        const old_jobs = cvJobs.filter(
          (job) => job.pos === building.pos && job.to < min
        );
        if (old_jobs.length > 0) {
          old_jobs.forEach((job) => {
            complete(job);
          });
        }
      });
    }
  };

  const next = (did = CurrentVillage.did) => {
    return jobs[did] && jobs[did].length > 0 ? jobs[did][0] : null;
  };

  const nextDorf1 = (did = CurrentVillage.did) => {
    if (!jobs[did]) return null;
    let j = jobs[did].filter((x) => x.gid < 5);
    return j.length > 0 ? j[0] : null;
  };

  const nextDorf2 = (did = CurrentVillage.did) => {
    if (!jobs[did]) return null;
    let j = jobs[did].filter((x) => x.gid > 4);
    return j.length > 0 ? j[0] : null;
  };

  return {
    updateSettings,
    complete,
    settings: (did = CurrentVillage.did) =>
      settings[did] ? settings[did] : defaultSettings,
    remove,
    add,
    jobs,
    checkJobs,
    subscribe,
    next,
    nextDorf1,
    nextDorf2,
    get: (did = CurrentVillage.did) => (jobs[did] ? jobs[did] : []),
  };
};
let JobsManager;
if (ShouldRun) {
  JobsManager = initJobs();
  JobsManager.checkJobs();
}
