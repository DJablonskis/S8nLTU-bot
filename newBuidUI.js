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

      //   let pos = window.location.search.split("=")[1];
      //   pos = pos.includes("&") ? Number(pos.split("&")[0]) : Number(pos);

      cont.style.position = "relative";
      const button = cont.appendChild(document.createElement("button"));
      button.classList.add("textButtonV1", "green", "new");
      button.style.position = "absolute";
      button.style.right = "0";
      button.style.top = "0";
      button.innerText = `Build later`;
      button.onclick = () => {
        BOT.addJob({ gid, pos: params.id, lvl: 0, to: 1, cat });
        navigateTo(2);
      };
    });
  }
}

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
