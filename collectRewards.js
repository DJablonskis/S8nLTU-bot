const initRewardManager = () => {
  let questsLink = document.querySelector("#questmasterButton");

  const wait = (time, f) =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        f() ? resolve() : reject();
      }, time)
    );

  async function dailyQuestSteps() {
    let step = 0;
    await wait(Status.update("Opening task list"), () => navigateTo(7))
      .then(wait(Status.update("Navigating back"), () => navigateTo(1)))
      .then();
  }

  async function villageTaskSteps() {
    if (
      questsLink &&
      questsLink.querySelector(".bigSpeechBubble.newQuestSpeechBubble")
    ) {
      if (location.pathname !== "/tasks") {
        setTimeout(() => {
          questsLink.click();
        }, Status.update("Going to collect quest reward"));
      } else {
        let opositeTested = false;
        let opositeTab = document.querySelector(
          "#tasks a.tabItem:not(.active)"
        );

        let questButtons = [
          ...document.querySelectorAll("#tasks button.collect"),
        ];
        if (questButtons.length > 0) {
          setTimeout(() => {
            questButtons[0].click();
            villageTaskSteps();
          }, Status.update("Collecting reward"));
        } else if (!opositeTested) {
          await wait(Status.update("Switching tab"), () => opositeTab.click())
            .then(() =>
              wait(Status.update("Collecting reward"), () => {
                questButtons = [
                  ...document.querySelectorAll("#tasks button.collect"),
                ];
                if (questButtons.length > 0) questButtons[0].click();
              })
            )
            .then(() => {
              if (
                questsLink.querySelector(
                  ".bigSpeechBubble.newQuestSpeechBubble"
                )
              ) {
                villageTaskSteps();
              } else {
                setTimeout(() => {
                  navigateTo(1);
                }, Status.update("all tasks collected"));
              }
            });
        } else
          setTimeout(() => {
            navigateTo(1);
          }, Status.update("all tasks collected"));
      }

      // https://ttq.x2.america.travian.com/tasks?t=1 - tasks for town, https://ttq.x2.america.travian.com/tasks?t=2 - general tasks
      //
    } else
      setTimeout(() => {
        navigateTo(1);
      }, Status.update("all tasks collected"));
  }

  const hasReward = () =>
    questsLink.querySelector(".bigSpeechBubble.newQuestSpeechBubble");
  //  && document.querySelector("#navigation .dailyQuests .indicator");

  // const collectTask = () => {};

  const collect = () => {
    console.log("collect reward called");
    villageTaskSteps();
  };

  //buttons for collection

  // Opens daily tasks dialog
  //unsafeWindow.Travian.Game.Quest.openTodoListDialog('', false);

  //
  //let a = document.querySelector("#navigation .dailyQuests .indicator"); // has rewards to collect

  //let x = document.querySelectorAll("#achievementRewardList div.achievement");

  //document.querySelector("#achievementRewardList a").click();
  // document.querySelector(".questButtons button.questButtonGainReward").click();

  return { hasReward, collect };
};

let RewardManager;
if (ShouldRun) {
  RewardManager = initRewardManager();
}

// dailyQuestSteps().then(() => {
//   // log("Do it again");
//   // dailyQuestSteps(1000);
// });
