if (window.location.pathname.includes("build.php")) {
  let params = getParams();
  if (!params.gid) {
    const cat = params.category ? Number(params.category) : 1;
    const availableBuildings = [
      ...document.querySelectorAll(
        ".buildingWrapper > .build_desc > img.building"
      ),
    ];
    availableBuildings.forEach((b) => {
      let cont = b.parentNode.parentNode;
      let gid = Number(
        cont.querySelector(".contract").id.replace("contract_building", "")
      );

      cont.style.position = "relative";
      const button = cont.appendChild(document.createElement("button"));
      button.classList.add("textButtonV1", "green", "new");
      button.style.position = "absolute";
      button.style.right = "0";
      button.style.top = "0";
      button.innerText = `Build later`;
      button.onclick = () => {
        JobsManager.add({ gid, pos: Number(params.id), lvl: 0, to: 1, cat });
        navigateTo(2);
      };
    });
  }
} else if (Dorf2Slots) {
  const buildings = [];
  const display = (job) => {
    let building = Dorf2Slots[job.pos - 19];
    if (building.status === "empty") {
      building.link.parentNode.style.display = "block";
      console.log("building", building);
      if (building.pos !== 40) {
        let image = building.link.parentNode.querySelector("img");
        image.oncontextmenu = (e) => {
          console.log("e", e.target);
          e.preventDefault();
        };
        image.classList.add("g" + job.gid);
        image.style.opacity = "0.6";
        image.style.filter = "grayscale(100%)";
      } else {
        classBottom = `wall g${Tribe.wall}Bottom ${Tribe}`;
        classTop = `wall g${Tribe.wall}Top ${Tribe}`;
        let imgBottom = document.createElement("img");
        imgBottom.style.filter = "grayscale(100%)";
        imgBottom.src = "/img/x.gif";
        imgBottom.style.opacity = "0.6";

        let imgTop = imgBottom.cloneNode(true);
        imgTop.className = classTop;
        imgBottom.className = classBottom;
        console.log(Tribe);
        building.link.parentNode.appendChild(imgBottom);
        building.link.parentNode.nextSibling.appendChild(imgTop);
      }
    } else JobsManager.remove(job);

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
  };

  const clear = () => {
    //TODO: walls behave differently remove images!
    buildings.forEach((job) => {
      let building = Dorf2Slots[job.pos - 19];

      if (building.pos === 40) {
        let wallBottom = document.querySelector("img.wall");
        if (wallBottom) wallBottom.remove();
        let wallTop = document.querySelector("img.wall");
        if (wallTop) wallTop.remove();
      } else {
        building.link.parentNode.style.display = "block";
        let image = building.link.parentNode.querySelector("img");
        image.classList.remove("g" + job.gid);
        image.style.opacity = "1";
      }
    });
    //goes through buildings array and reverts changes
  };

  const displayNewBuildings = (jobs) => {
    clear();
    jobs
      .filter((x) => x.gid > 4 && x.to === 1)
      .forEach((job) => {
        display(job);
        buildings.push(job);
      });
  };

  JobsManager.subscribe(displayNewBuildings);
}
