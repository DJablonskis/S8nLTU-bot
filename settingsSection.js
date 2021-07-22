let SettingsSection;

if (ShouldRun) {
  SettingsSection = BotPanel.addSection("Settings");
  let keepOnTopSection = SettingsSection.content.appendChild(
    document.createElement("div")
  );
  keepOnTopSection.innerHTML = `<strong>Keep panel on top: </strong>`;
  keepOnTopSection.className = "settings-row";
  keepOnTopSection.appendChild(
    checkboxToggle(BotOptions.get(optionKeys.keepOnTop))
  );

  keepOnTopSection.querySelector("input").onclick = (e) => {
    if (e.target.checked !== BotOptions.get(optionKeys.keepOnTop)) {
      BotOptions.toggle(optionKeys.keepOnTop);
    }
  };

  BotOptions.subscribe(({ settingsOpen }) => {
    SettingsSection.header.style.display = settingsOpen ? "block" : "none";
    SettingsSection.content.style.display = settingsOpen ? "block" : "none";
  });
}
