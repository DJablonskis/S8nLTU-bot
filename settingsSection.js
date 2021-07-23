let SettingsSection;

if (ShouldRun) {
  SettingsSection = BotPanel.addSection("Settings");

  SettingsSection.content.appendChild(
    createOptionToggle("Keep panel on top", optionKeys.keepOnTop)
  );

  SettingsSection.content.appendChild(
    createOptionToggle("Send hero to adventures", optionKeys.sendToAdventures)
  );

  BotOptions.subscribe(({ settingsOpen }) => {
    SettingsSection.header.style.display = settingsOpen ? "block" : "none";
    SettingsSection.content.style.display = settingsOpen ? "block" : "none";
  });
}
