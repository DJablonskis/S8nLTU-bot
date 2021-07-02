const initJobsList = () => {
  const { content, header } = BotPanel.addSection("Planed upgrades");
  header.style.paddingTop = "10px";
  const details = content.appendChild(document.createElement("details"));
  const summary = details.appendChild(document.createElement("summary"));
  const detailsInner = details.appendChild(document.createElement("div"));

  const updateJobs = (jobs) => {
    detailsInner.innerHTML = "";
    header.innerText = `Planed upgrades (${jobs.length})`;
    summary.innerHTML = `Click to show/hide`;
    if (jobs.length > 0) {
      jobs.forEach((job) => {
        const node = document.createElement("div");
        node.style.cssText =
          "font-size: 10px; line-height:10px; margin-bottom:2px;";
        const nodeButton = node.appendChild(document.createElement("span"));
        const nodeText = node.appendChild(document.createElement("span"));
        nodeButton.style.cssText =
          "cursor: pointer; width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px; ";
        nodeButton.textContent = "x";
        nodeButton.onclick = (e) => {
          JobsManager.remove(job);
        };
        detailsInner.appendChild(node);
        nodeText.textContent = `[${job.pos}] ${BDB.name(job.gid)} to level ${
          job.to
        }`;
      });
    }
  };
  JobsManager.subscribe(updateJobs);
};

initJobsList();
