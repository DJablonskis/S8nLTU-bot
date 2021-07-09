let autoUpgradeSection, AutoUpgrade;

const initAutoUpgrades = () => {
  let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
  settings = settings ? settings : {};
  let cvSettings = settings[CurrentVillage.did]
    ? settings[CurrentVillage.did]
    : { upgradeRes: false, upgradeCrop: false };

  const save = () => {
    settings[CurrentVillage.did] = cvSettings;
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
  };

  autoUpgradeSection.header.style.marginTop = "12px";

  const builderSettings = autoUpgradeSection.content.appendChild(
    document.createElement("div")
  );
  builderSettings.style.cssText = "padding-top: 6px";

  const autobuilderRow = builderSettings.appendChild(
    document.createElement("div")
  );
  autobuilderRow.innerHTML =
    '<label for="cbAutoFields" style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoRes" style="margin-right: 2px;">Upgrade resources</label>';

  let cbAutoRes = document.getElementById("cbAutoRes");
  cbAutoRes.checked = cvSettings.upgradeRes;
  cbAutoRes.addEventListener("change", (e) => {
    if (e.target.checked !== cvSettings.upgradeRes) {
      let box = e.target;
      cvSettings.upgradeRes = box.checked;
      save();
    }
  });

  const get = (did = CurrentVillage.did) => settings[did];

  const ignoreCropRow = builderSettings.appendChild(
    document.createElement("div")
  );
  ignoreCropRow.innerHTML =
    '<label for="cbIgnoreCrop"  style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoCrop" style="margin-right: 2px;">Upgrade crop<label>';

  let cbAutoCrop = document.getElementById("cbAutoCrop");
  cbAutoCrop.checked = cvSettings.upgradeCrop;
  cbAutoCrop.addEventListener("change", (e) => {
    if (e.target.checked !== cvSettings.upgradeCrop) {
      let box = e.target;
      cvSettings.upgradeCrop = box.checked;
      save();
    }
  });

  return {
    get,
  };
};

if (ShouldRun) {
  autoUpgradeSection = BotPanel.addSection("Auto Upgrade");
  AutoUpgrade = initAutoUpgrades();
}
