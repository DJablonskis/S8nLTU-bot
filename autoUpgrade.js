let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
if (!settings || !settings[CurrentVillage.did]) {
  settings = settings ? settings : {};
  if (window.location.pathname.includes("dorf")) {
    settings[CurrentVillage.did] = settings[CurrentVillage.did]
      ? settings[CurrentVillage.did]
      : { upgradeRes: false, upgradeCrop: false };
  }
  localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
}

const jobsQueueSection = botPanel.appendChild(document.createElement("div"));
jobsQueueSection.style.cssText =
  "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
const jobQTitle = jobsQueueSection.appendChild(document.createElement("h4"));
jobQTitle.innerText = "Builder";
jobQTitle.style.cssText = titleStyle;

const jobsSection = jobsQueueSection.appendChild(
  document.createElement("details")
);

const builderSettings = jobsQueueSection.appendChild(
  document.createElement("div")
);
builderSettings.style.cssText = "padding-top: 6px";

const autobuilderRow = builderSettings.appendChild(
  document.createElement("div")
);
autobuilderRow.innerHTML =
  '<label for="cbAutoFields" style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoRes" style="margin-right: 2px;">Auto-upgrade resources</label>';

const ignoreCropRow = builderSettings.appendChild(
  document.createElement("div")
);
ignoreCropRow.innerHTML =
  '<label for="cbIgnoreCrop"  style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoCrop" style="margin-right: 2px;">Auto-upgrade crop<label>';

let cbAutoRes = document.getElementById("cbAutoRes");
cbAutoRes.checked = settings[CurrentVillage.did].upgradeRes;
cbAutoRes.addEventListener("change", (e) => {
  if (e.target.checked !== settings[CurrentVillage.did].upgradeRes) {
    let box = e.target;
    settings[CurrentVillage.did].upgradeRes = box.checked;
    console.log(
      "auto res changed to ",
      settings[CurrentVillage.did].upgradeRes
    );
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  }
});

let cbAutoCrop = document.getElementById("cbAutoCrop");
cbAutoCrop.checked = settings[CurrentVillage.did].upgradeCrop;
cbAutoCrop.addEventListener("change", (e) => {
  if (e.target.checked !== settings[CurrentVillage.did].upgradeCrop) {
    let box = e.target;
    settings[CurrentVillage.did].upgradeCrop = box.checked;
    console.log(
      "auto crop changed to ",
      settings[CurrentVillage.did].upgradeCrop
    );
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  }
});

const summary = jobsSection.appendChild(document.createElement("summary"));
summary.innerHTML = `<strong>Jobs planed: </strong> ${jobs.length}; <strong>`;

if (jobs.length > 0) {
  jobs[CurrentVillage.did].forEach((job) => {
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
    jobsSection.appendChild(node);
    nodeText.textContent = `[${job.pos}] ${BDB.name(job.gid)} to level ${
      job.to
    }`;
  });
}

while (jobsSection.firstChild) {
  jobsSection.removeChild(jobsSection.firstChild);
}
