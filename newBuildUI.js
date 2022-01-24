if (window.location.pathname.includes("build.php")) {
  let params = getParams();
  let query = "#build div[id*=contract_building]";

  if (!params.gid) {
    let containers = document.querySelectorAll(query);
    if (containers) {
      containers.forEach((container) => {
        let job = {
          gid: Number(container.id.replace("contract_building", "")),
          pos: 0,
          lvl: 0,
          to: 1,
          cat: params.category ? Number(params.category) : 1,
        };
        //WALL pos 40!
        if (WALL.includes(job.gid)) {
          job.pos = 40;
        } else if (job.gid === 16) {
          job.pos = 39;
        } else {
          job.pos = Number(params.id);
        }
        let button = blueButton("Add to planed upgrades");
        button.style.marginTop = "4px";
        container.appendChild(button);
        button.onclick = () => {
          JobsManager.add(job);
          navigateTo(2);
        };
      });
    }
  }
} else if (Dorf2Slots) {
  const buildings = [];
  const display = (job) => {
    let building = Dorf2Slots[job.pos - 19];
    if (building.status === "empty") {
      building.link.parentNode.style.display = "block";
      if (building.pos !== 40) {
        let image = building.link.nextSibling;
        image.classList.add("g" + job.gid);
        image.style.opacity = "0.6";
        image.style.filter = "grayscale(100%)";
      } else {
        classBottom = `wall g${Tribe.wall_gid}Bottom ${Tribe.name}`;
        classTop = `wall g${Tribe.wall_gid}Top ${Tribe.name}`;
        let imgBottom = document.createElement("img");
        imgBottom.style.filter = "grayscale(100%)";
        imgBottom.src = "/img/x.gif";
        imgBottom.style.opacity = "0.6";

        //  let imgTop = imgBottom.cloneNode(true);
        //   imgTop.className = classTop;
        imgBottom.className = classBottom;
        building.link.parentNode.appendChild(imgBottom);
        // building.link.parentNode.nextSibling.appendChild(imgTop);
      }
    } else JobsManager.remove(job);
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
