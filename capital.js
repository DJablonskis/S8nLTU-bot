const getCapital = () => {
  let C = localStorage.getItem(CAPITAL);

  const requestCapital = () => {
    let dialogText =
      "Confirm ID number of your capital (only needs to be done once):\n";
    Villages.all.forEach((vill) => {
      dialogText = dialogText + `ID: [${vill.did}] - "${vill.name}"\n`;
    });

    let cap = prompt(dialogText, "");
    if (!cap || !Villages.get(cap)) {
      requestCapital();
    } else localStorage.setItem(CAPITAL, cap);
  };

  if (Dorf1Slots) {
    const max = Dorf1Slots.find(
      (slot) => slot.lvl === 10 && slot.status === "maxLevel"
    );

    if (max && C === CurrentVillage.did) {
      alert(
        "Seems like your capital changed. Please update your capital city."
      );
      requestCapital();
    }
    const above10 = Dorf1Slots.find(
      (slot) => slot.lvl > 10 || (slot.lvl > 9 && slot.status !== "maxLevel")
    );
    if (above10 && C !== CurrentVillage.did) {
      C = CurrentVillage.did;
      localStorage.setItem(CAPITAL, C);
    }
    //TODO: check fields for above lvl 10 and maxLevel
  }

  if (!C) requestCapital();

  return C === CurrentVillage.did;
};
let Capital;
if (ShouldRun) Capital = getCapital();
