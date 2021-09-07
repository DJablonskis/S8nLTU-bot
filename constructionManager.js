const initConstructionManager = () => {
  const updateBuildingQueue = () => {
    let q = {
      dorf1: [],
      dorf2: [],
      all: [],
      timestamp: Date.now(),
    };
    if (window.location.pathname.includes("dorf")) {
      let buildingQ = document.querySelectorAll("div.buildingList > ul > li");
      if (buildingQ && buildingQ.length > 0) {
        let scripts = [
          ...document.querySelectorAll(
            `#center .village${Dorf1Slots ? "1" : "2"} script`
          ),
        ];

        buildString = scripts.find((s) =>
          s.textContent.startsWith("var bld")
        ).text;

        let buildingLevels = buildString.split("=").pop();
        const jsonQ = JSON.parse(buildingLevels);

        buildingQ.forEach((element, index) => {
          let b = {};

          b.lvl = jsonQ[index].stufe;
          b.gid = jsonQ[index].gid;
          b.pos = Number(jsonQ[index].aid);
          b.finish =
            Date.now() +
            Number(
              element
                .querySelector("div.buildDuration > span")
                .getAttribute("value")
            ) *
              1000;

          b.gid < 5 ? q.dorf1.push(b) : q.dorf2.push(b);
          q.all.push(b);
        });
      }
    } else return null;
    return q;
  };

  let cmStorage = JSON.parse(localStorage.getItem(CM_STORAGE));
  if (!cmStorage) {
    cmStorage = {};
  }

  const get = (did = CurrentVillage.did) => {
    return cmStorage[did]
      ? cmStorage[did]
      : {
          dorf1: [],
          dorf2: [],
          all: [],
          timestamp: 0,
        };
  };
  if (window.location.pathname.includes("dorf")) {
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

      let getDot = () => {
        let dot = document.createElement("span");
        dot.innerText = "•";
        dot.style.cssText = "color:#e91e63 ;padding-right:2px;";
        return dot;
      };

      let completeDot = (dot) => {
        dot.style.color = "#00ff00";
      };

      let q1Node = flexBlock.appendChild(document.createElement("div"));
      q1Node.style.height = "8px";
      get(vil.did).dorf1.forEach((b) => {
        let dot = q1Node.appendChild(getDot());
        let current = Date.now();
        let s = b.finish - current;
        if (s > 0) {
          setTimeout(() => {
            completeDot(dot);
            Notifications.send(b, vil);
          }, s);
        } else {
          completeDot(dot);
        }
      });

      let q2Node = flexBlock.appendChild(document.createElement("div"));
      q2Node.style.height = "8px";
      get(vil.did).dorf2.forEach((b) => {
        let dot = q2Node.appendChild(getDot());
        let current = Date.now();
        let s = b.finish - current;
        if (s > 0) {
          setTimeout(() => {
            completeDot(dot);
          }, s);
        } else {
          completeDot(dot);
        }
      });

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
    dorfStatus: (dorf, did = CurrentVillage.did) => {
      const d = get(did)["dorf" + dorf];
      let dorfFinish = d.length > 0 ? d[d.length - 1].finish : 0;
      let dorfAvailable = dorfFinish < Date.now();
      return { empty: dorfAvailable, finish: dorfFinish };
    },
  };
};
let ConstructionManager;

if (ShouldRun) {
  ConstructionManager = initConstructionManager();
}
