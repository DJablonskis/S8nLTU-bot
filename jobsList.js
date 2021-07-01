const initJobsList = () => {
  const { content } = BotPanel.addSection("Planed upgrades");

  const updateJobs = (jobs) => {
    content.innerHTML = "";
    const details = content.appendChild(document.createElement("details"));
    const summary = details.appendChild(document.createElement("summary"));
    summary.innerHTML = `<strong>Jobs upgrades: </strong> ${jobs.length}; <strong>`;

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
          let i = whichChild(e.target.parentNode) - 1;
          removeJob(jobs[CurrentVillage.did][i]);
          refreshJobs();
        };
        details.appendChild(node);
        nodeText.textContent = `[${job.pos}] ${BDB.name(job.gid)} to level ${
          job.to
        }`;
      });
    }
  };
  JobsManager.subscribe(updateJobs);
};

initJobsList();
