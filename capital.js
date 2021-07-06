const Capital = localStorage.getItem(CAPITAL);

if (!Capital) {
  console.log("capital not set");
  let dialogText =
    "Confirm ID number of your capital (only needs to be done once):\n";
  Villages.all.forEach((vill) => {
    dialogText = dialogText + `ID: [${vill.did}] - "${vill.name}"\n`;
  });

  let cap = prompt(dialogText, "");
  if (!cap) {
    return;
  } else if (Villages.get(cap)) {
    localStorage.setItem(CAPITAL, cap);
  }
}

if (Dorf1Slots) {
  const max = Dorf1Slots.find(
    (slot) => slot.lvl === 10 && slot.status === "maxLevel"
  );

  if (max) {
    console.log("not capital");
  }
  const above10 = Dorf1Slots.find(
    (slot) => slot.lvl > 9 && slot.status !== "maxLevel"
  );
  if (above10) {
    console.log("capital");
  }
  //TODO: check fields for above lvl 10 and maxLevel
}
