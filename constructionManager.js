const initConstructionManager = () => {
  const updateBuildingQueue = () => {
    let dorf1 = [];
    let dorf2 = [];
    let timestamp = Date.now();
    let q = { d1: 0, d2: 0 };

    let all = [
      ...document.querySelectorAll("div.buildingList ul div.buildDuration"),
    ].map((element) => {
      let name = element.parentNode
        .querySelector("div.name")
        .firstChild.data.trim();
      let lvl = Number(
        element.parentNode
          .querySelector("span.lvl")
          .innerText.trim()
          .split(" ")
          .pop()
      );
      let finish =
        Date.now() +
        Number(element.querySelector("span").getAttribute("value")) * 1000;

      let gid = BDB.gidFromName(name);
      let o = { name, lvl, gid, finish };
      gid < 5 ? dorf1.push(o) : dorf2.push(o);
      return o;
    });

    let isRoman = getTribe().name === "roman";
    let plusOn = document
      .querySelector("#sidebarBoxActiveVillage .buttonsWrapper a.market")
      .classList.contains("green");

    let maxQueue = 1;
    let maxTotal = 1;

    if (plusOn) {
      maxQueue++;
      maxTotal++;
    }
    if (isRoman) maxTotal++;

    //are some q busy
    if (all.length > 0) {
      //some q is free
      if (all.length < maxTotal) {
        if (dorf1.length === maxQueue) q.d1 = dorf1[0].finish;
        if (dorf2.length === maxQueue) q.d2 = dorf2[0].finish;
      } else {
        //all builders busy for roman return individual times else both q first value
        q.d1 = isRoman ? dorf1[0].finish : all[0].finish;
        q.d2 = isRoman ? dorf2[0].finish : all[0].finish;
      }
    }

    return {
      dorf1,
      dorf2,
      all,
      q,
      timestamp,
    };
  };

  let cmStorage = JSON.parse(localStorage.getItem(CM_STORAGE));
  if (!cmStorage) {
    cmStorage = {};
  }

  const get = (did = CurrentVillage.did) =>
    cmStorage[did]
      ? cmStorage[did]
      : {
          dorf1: [],
          dorf2: [],
          all: [],
          timestamp: 0,
          q: { d1: 0, d2: 0 },
        };

  if (PAGE === "dorf1" || PAGE === "dorf2") {
    let updated = updateBuildingQueue();
    if (updated) {
      cmStorage[CurrentVillage.did] = updated;
    } else {
      console.log("Update Building queue returned falsy value?");
      cmStorage[CurrentVillage.did] = {};
    }
  }
  localStorage.setItem(CM_STORAGE, JSON.stringify(cmStorage));

  const checkTime = (completion) => {
    function pad(n, z) {
      z = z || 2;
      return ("00" + n).slice(-z);
    }

    let current = Date.now();
    let s = completion - current;

    if (s > 0) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;

      let timer = pad(hrs) + ":" + pad(mins) + ":" + pad(secs);

      return { completed: false, timer };
    } else return { completed: true, timer: "Completed!" };
  };

  const showDots = () => {
    const detailsBlocks = [];

    Villages.all.forEach((vil) => {
      const nameRow = vil.node.querySelector("span.name");
      let flexBlock = document.createElement("div");
      flexBlock.style.cssText =
        "position: absolute;flex-direction: column; display: inline-flex; font-size: 24px; padding-left: 2px; line-height: 0.35;";
      nameRow.appendChild(flexBlock);

      const block = document.createElement("div");
      block.style.padding = "0 4px";
      block.style.gridColumnStart = "1";
      block.style.gridColumnEnd = "3";
      block.style.fontWeight = 400;

      detailsBlocks.push(block);

      const prodRow = document.createElement("div");
      prodRow.style.padding = "0 12px";
      prodRow.style.fontSize = "10px";
      prodRow.style.display = "flex";
      prodRow.style.justifyContent = "space-between";
      block.appendChild(prodRow);
      ProductionManager.setProductionInfo(vil.did, prodRow);

      const queRow = document.createElement("div");
      block.appendChild(queRow);

      get(vil.did).all.forEach((x) => {
        const task = document.createElement("div");
        queRow.appendChild(task);
        let timer = checkTime(x.finish);
        task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${BDB.name(
          x.gid
        )} level ${x.lvl}</span><span style="font-size:11px;  ${
          timer.completed ? "color:green;" : ""
        } align-items:center;">${timer.timer}</span>`;
        if (!timer.completed) {
          let updater = setInterval(() => {
            timer = checkTime(x.finish);
            task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${BDB.name(
              x.gid
            )} level ${x.lvl}</span><span style="font-size:11px; ${
              timer.completed ? "color:green;" : ""
            } align-items:center;">${timer.timer}</span>`;

            if (timer.completed) {
              clearInterval(updater);
            }
          }, 1000);
        }
      });

      DetailedStats.subscribe((d) => {
        detailsBlocks.forEach((b) => (b.style.display = d ? "block" : "none"));
      });

      vil.node.appendChild(block);
    });
  };
  showDots();
  return {
    all: cmStorage,
    get,
    dorfStatus: (d, did = CurrentVillage.did) => ({
      empty: get(did).q[`d${d}`] < Date.now(),
      finish: get(did).q[`d${d}`],
    }),
  };
};
let ConstructionManager;

if (ShouldRun) {
  ConstructionManager = initConstructionManager();
}
