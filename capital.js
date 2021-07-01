const Capital = localStorage.getItem(CAPITAL);

if (!Capital) {
  console.log("capital not set");
  let dialogText = "Please update the ID of the capital city:\n";
  dialogText = dialogText + "[ ID ]   [VILLAGE NAME]\n";
  Villages.all.forEach((vill) => {
    dialogText = `[${vill.did}] - "${vill.name}"\n`;
  });

  let cap = prompt(dialogText, "");
  if (cap == null || cap == "") {
    return;
  } else if (Villages.get(cap)) {
    localStorage.setItem(CAPITAL, cap);
  }
}

if (Dorf1Slots) {
  //check fields for above lvl 10 and maxLevel
}
