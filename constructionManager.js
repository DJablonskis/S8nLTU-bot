const initConstructionManager = () => {
  let cmStorage = JSON.parse(localStorage.getItem(CM_STORAGE));
  if (!cmStorage) {
    cmStorage = {};
  }
  if (window.location.pathname.includes("dorf")) {
    let updated = updateBuildingQueue();
    if (updater) {
      cmStorage[CurrentVillage.did] = updated;
    } else {
      console.log("Update Building queue returned falsy value?");
      cmStorage[CurrentVillage.did] = [];
    }
  }
  localStorage.setItem(CM_STORAGE, JSON.stringify(cmStorage));

  const updateBuildingQueue = () => {
    let q = [];
    if (window.location.pathname.includes("dorf")) {
      let buildingQ = document.querySelectorAll("div.buildingList > ul > li");
      if (buildingQ && buildingQ.length > 0) {
        let buildString = document
          .querySelector("#content > script")
          .text.includes("var bld")
          ? document.querySelector("#content > script").text
          : document.querySelector("#content .village1Content > script").text;

        let buildingLevels = buildString.split("=").pop();
        const jsonQ = JSON.parse(buildingLevels);

        buildingQ.forEach((element, index) => {
          b = {};
          b.lvl = jsonQ[index].stufe;
          b.gid = jsonQ[index].gid;
          b.finish =
            Date.now() +
            Number(
              element
                .querySelector("div.buildDuration > span")
                .getAttribute("value")
            ) *
              1000;
          q.push(b);
        });
      }
    } else return null;
    console.log("retrieved q: ", q);
    return q;
  };

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

  const showDots = (detailed = false) => {
    Villages.all.forEach((vil) => {
      const nameRow = vil.node.querySelector("span.name");
      let flexBlock = document.createElement("div");
      flexBlock.style.cssText =
        "position: absolute;flex-direction: column; display: inline-flex; font-size: 18px; padding-left: 2px; line-height: 0.35;";
      nameRow.appendChild(flexBlock);

      let q1Node = flexBlock.appendChild(document.createElement("div"));
      q1Node.style.height = "8px";
      let q1 = cmStorage[vil.did]
        ? cmStorage[vil.did].filter((q) => q.gid < 5)
        : [];
      q1.forEach((b) => {
        let dot = q1Node.appendChild(document.createElement("span"));
        dot.innerText = "•";
        dot.style.cssText =
          "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange;padding-right:2px;";
        let current = Date.now();
        let s = b.finish - current;
        if (s > 0) {
          setTimeout(() => {
            dot.style.color = "#4cc500";
          }, s);
        } else {
          dot.style.color = "#4cc500";
        }
      });

      let q2Node = flexBlock.appendChild(document.createElement("div"));
      q2Node.style.height = "8px";
      let q2 = cmStorage[vil.did]
        ? cmStorage[vil.did].filter((q) => q.gid > 4)
        : [];
      q2.forEach((b) => {
        let dot = q2Node.appendChild(document.createElement("span"));
        dot.innerText = "•";
        dot.style.cssText =
          "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange; padding-right:2px;";
        let current = Date.now();
        let s = b.finish - current;
        if (s > 0) {
          setTimeout(() => {
            dot.style.color = "#4cc500";
          }, s);
        } else {
          dot.style.color = "#4cc500";
        }
      });

      if (detailed) {
        const block = document.createElement("div");
        block.style.paddingBottom = "3px";

        const prodRow = document.createElement("div");
        prodRow.style.display = "flex";
        prodRow.style.justifyContent = "space-between";
        prodRow.style.padding = "0 12px";
        block.appendChild(prodRow);

        const queRow = document.createElement("div");
        block.appendChild(queRow);

        const task = document.createElement("div");
        queRow.appendChild(task);

        if (ProductionManager.current(vil.did)) {
          prodRow.innerHTML = ProductionManager.current(vil.did);
          setInterval(() => {
            prodRow.innerHTML = ProductionManager.current(vil.did);
          }, 2000);
        } else {
          prodRow.innerHTML = `<div style="font-size:10px">No info yet.</div>`;
        }

        cmStorage[vil.did].forEach((x) => {
          let timer = checkTime(x.finish);
          task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
            x.name
          } level ${x.stufe}</span><span style="font-size:11px;  ${
            timer.completed ? "color:green;" : ""
          } align-items:center;">${timer.timer}</span>`;
          if (!timer.completed) {
            let updater = setInterval(() => {
              timer = checkTime(x.finish);
              task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
                x.name
              } level ${x.lvl}</span><span style="font-size:11px; ${
                timer.completed ? "color:green;" : ""
              } align-items:center;">${timer.timer}</span>`;

              if (timer.completed) {
                if (ON_N) {
                  notifyMe("Building completed", x, vil);
                }
                clearInterval(updater);
              }
            }, 1000);
          }
        });

        node.appendChild(block);
      }
    });

    return {
      all: cmStorage,
      current: cmStorage[CurrentVillage.did],
      showDots,
    };
  };
};

const ConstructionManager = initConstructionManager();
