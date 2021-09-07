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

    const w = unsafeWindow.resources.maxStorage["l1"];
    const g = unsafeWindow.resources.maxStorage["l4"];

    //TODO: check for granary and warehouse jobs planed in job queue
    const stats = BDB.stats(job.gid, job.to);
    if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w)
      return alert("Expand warehouse first!");
    if (stats.cost[3] > g) return alert("Expand granary first!");
    cvJobs.push(job);
    save();
  };

  const checkJobs = () => {
    if (Dorf1Slots || Dorf2Slots) {
      slots = Dorf1Slots ? Dorf1Slots : Dorf2Slots;
      slots.forEach((slot) => {
        const buildingNow = ConstructionManager.get().all.filter(
          (bn) => bn.pos === slot.pos
        );
        const min = slot.lvl + buildingNow.length;
        const outdatedJobs = cvJobs.filter(
          (job) => job.pos === slot.pos && (job.to <= min || job.lvl !== min)
        );
        if (outdatedJobs.length > 0) {
          outdatedJobs.forEach((job) => {
            if (job.lvl !== min) job.lvl = min;
            if (job.to <= min) complete(job);
          });
          save();
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
    complete,
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
