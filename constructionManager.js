const initConstructionManager = () => {

  KEY.constructionManager = "constructionManager";

  function loadConstructionData() {
    let data = localStorage.getItem(KEY.constructionManager);
    if (data === null) data = {}
    else data = JSON.parse(data)
    return data;
  }

  // only load buildings being built and update current village
  function updateConstructionData(data) {

    console.log("hello?")

    if (Dorf1Slots || Dorf2Slots) {
      console.log("construction data available")


      let currentlyBuilding = [
        ...document.querySelectorAll("div.buildingList ul div.buildDuration"),
      ]

      data[CurrentVillage.did] = currentlyBuilding.map((element) => {
        let parent = element.parentNode
        let name = parent.querySelector("div.name").firstChild.data.trim();
        let lvl = Number(parent.querySelector("span.lvl")
          .innerText.trim().split(" ").pop()
        );

        let timeLeft = Number(element.querySelector("span").getAttribute("value")) * 1000;
        let finish = Date.now() + timeLeft;

        let gid = BDB.gidFromName(name);
        let o = { name, lvl, gid, finish };

        return {
          name,
          level: lvl,
          gid,
          finish
        }

      });

      Villages.all.forEach(v => {
        // generate timestamps for villages not in state
        if (!Object.keys(data).includes(v.did)) data[v.did] = []


        //TODO: update UI on completed jobs and then remove? 
        // filter out completed jobs
        // Object.keys(data).forEach(k => {
        //   data[k] = data[k].filter(j => j.finish < Date.now())
        // })
      });

      localStorage.setItem(KEY.ConstructionManager, JSON.stringify(data));
    }

    return data;
  }

  // const getConstructionQueues = (data, did) => {

  //   let dorf1 = data[did].filter(b => b.type === 1);
  //   let dorf2 = data[did].filter(b => b.type === 2);

  //   let isRoman = getTribe().name === "roman";
  //   let plusOn = document
  //     .querySelector("#sidebarBoxActiveVillage .buttonsWrapper a.market")
  //     .classList.contains("green");

  //   let maxQueue = 1;
  //   let maxTotal = 1;

  //   if (plusOn) {
  //     maxQueue++;
  //     maxTotal++;
  //   }

  //   if (isRoman) maxTotal++;


  //   // let queues = {
  //   //   dorf1: true,
  //   //   dorf2: true
  //   // }

  //   // if (data[did].length > 0) { // something is being built
  //   //   //some q is free
  //   //   if (data[did].length < maxTotal) { // additional building can be started
  //   //     queues.dorf1 = dorf1.length === maxQueue;
  //   //     queues.dorf2 = dorf2.length === maxQueue;
  //   //   } else {
  //   //     queues.dorf1 = false;
  //   //     queues.dorf2 = false;
  //   //   }
  //   // }

  //   return {
  //     all: data[did],
  //     dorf1,
  //     dorf2,
  //   };
  // };

  const data = loadConstructionData();
  updateConstructionData(data)

  console.log("constructions", data)


};

const ConstructionManager = initConstructionManager()
