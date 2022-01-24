function initDemolitionManager() {
  let dmStorage = JSON.parse(localStorage.getItem(DM_STORAGE));
  let manager = {
    data: dmStorage,
    get current() {
      return this.data?.[CurrentVillage.did];
    },
    get(did) {
      return this.data?.[did];
    },
    save() {
      localStorage.setItem(DM_STORAGE, JSON.stringify(this.data));
    },
    add(job) {
      if (!Array.isArray(this.current))
        this.data[CurrentVillage.did] = { jobs: [], busy: 0 };
      this.data[CurrentVillage.did].jobs.push(job);
      this.save();
    },
  };

  if (!dmStorage) {
    manager.data = {};
    manager.save();
  }

  return manager;
}

if (ShouldRun) {
  //load setting to check for next demolition
  let DemolitionManager = initDemolitionManager();

  if (location.pathname.includes("build.php") && getParams()?.gid === "15") {
    let selector = document.querySelector("#build #demolish");
    if (selector) {
      if (selector.nodeName === "SELECT") {
        let demolishButton = selector.parentElement.appendChild(
          blueButton("auto Demolish")
        );
        console.log(selector.value);
        demolishButton.onclick = (e) => {
          e.preventDefault();
          let text_array =
            selector.options[selector.selectedIndex].text.split(" ");
          let pos = Number(text_array.shift());
          let lvl = Number(text_array.pop());
          let name = text_array.join(" ");
          if (lvl > 1) DemolitionManager.add({ pos, lvl, name });
          document.getElementById("btn_demolish").click();
        };
      } else if (selector.nodeName === "TABLE") {
        let remaining = Number(
          selector.querySelector(".times span.timer").getAttribute("value")
        );
        let finish = new Date(Date.now() + remaining * 1000);
        DemolitionManager.current.busy = finish;
        DemolitionManager.save();
      }
    } // not lvl 10 main building
  }
}
