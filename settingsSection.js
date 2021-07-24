let SettingsSection;

if (ShouldRun) {
  SettingsSection = BotPanel.addSection("Settings");

  SettingsSection.content.appendChild(
    createOptionToggle("Keep panel on top", optionKeys.keepOnTop)
  );

  SettingsSection.content.appendChild(
    createOptionToggle("Send hero to adventures", optionKeys.sendToAdventures)
  );

  SettingsSection.content.appendChild(
    createOptionToggle("Collect rewards", optionKeys.collectRewards)
  );

  BotOptions.subscribe(({ settingsOpen }) => {
    SettingsSection.header.style.display = settingsOpen ? "block" : "none";
    SettingsSection.content.style.display = settingsOpen ? "block" : "none";
  });
}
