const autoUpgradeSection = BotPanel.addSection("Auto Upgrade");

let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
settings = settings ? settings : {};
let cvSettings = settings[CurrentVillage.did]
  ? settings[CurrentVillage.did]
  : { upgradeRes: false, upgradeCrop: false };

const save = () => {
  settings[CurrentVillage.did] = cvSettings;
  localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
};

// autoUpgradeSection.style.cssText =
//   "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
// const jobQTitle = autoUpgradeSection.appendChild(document.createElement("h4"));
// jobQTitle.innerText = "Builder";
// jobQTitle.style.cssText = titleStyle;

// const jobsSection = autoUpgradeSection.appendChild(
//   document.createElement("details")
// );

const builderSettings = autoUpgradeSection.content.appendChild(
  document.createElement("div")
);
builderSettings.style.cssText = "padding-top: 6px";

const autobuilderRow = builderSettings.appendChild(
  document.createElement("div")
);
autobuilderRow.innerHTML =
  '<label for="cbAutoFields" style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoRes" style="margin-right: 2px;">Auto-upgrade resources</label>';

let cbAutoRes = document.getElementById("cbAutoRes");
cbAutoRes.checked = cvSettings.upgradeRes;
cbAutoRes.addEventListener("change", (e) => {
  if (e.target.checked !== cvSettings.upgradeRes) {
    let box = e.target;
    cvSettings.upgradeRes = box.checked;
    save();
  }
});

const ignoreCropRow = builderSettings.appendChild(
  document.createElement("div")
);
ignoreCropRow.innerHTML =
  '<label for="cbIgnoreCrop"  style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoCrop" style="margin-right: 2px;">Auto-upgrade crop<label>';

let cbAutoCrop = document.getElementById("cbAutoCrop");
cbAutoCrop.checked = cvSettings.upgradeCrop;
cbAutoCrop.addEventListener("change", (e) => {
  if (e.target.checked !== cvSettings.upgradeCrop) {
    let box = e.target;
    cvSettings.upgradeCrop = box.checked;
    save();
  }
});

// const summary = jobsSection.appendChild(document.createElement("summary"));
// summary.innerHTML = `<strong>Jobs planed: </strong> ${jobs.length}; <strong>`;

// if (jobs.length > 0) {
//   jobs[CurrentVillage.did].forEach((job) => {
//     const node = document.createElement("div");
//     node.style.cssText =
//       "font-size: 10px; line-height:10px; margin-bottom:2px;";
//     const nodeButton = node.appendChild(document.createElement("span"));
//     const nodeText = node.appendChild(document.createElement("span"));
//     nodeButton.style.cssText =
//       "cursor: pointer; width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px; ";
//     nodeButton.textContent = "x";
//     nodeButton.onclick = (e) => {
//       let i = whichChild(e.target.parentNode) - 1;
//       removeJob(jobs[CurrentVillage.did][i]);
//       refreshJobs();
//     };
//     jobsSection.appendChild(node);
//     nodeText.textContent = `[${job.pos}] ${BDB.name(job.gid)} to level ${
//       job.to
//     }`;
//   });
// }

// while (jobsSection.firstChild) {
//   jobsSection.removeChild(jobsSection.firstChild);
// }
