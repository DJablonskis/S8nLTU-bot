// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*

// @require settings.js
// @require constants.js
// @require buildings.js
// @require helpers.js
// @require capital.js
// @require notifications.js

// @require productionManager.js
// @require constructionManager.js
// @require jobsManager.js

// @require botPanel.js
// @require statusUI.js
// @require autoUpgradeUI.js
// @require jobsList.js
// @require newBuildUI.js
// @require contextUI.js

// @require BOT.js

// @version        0.10.9
// ==/UserScript==

const start = () => {
  if (shouldRun()) {
    //FARMLIST REGION
    function initFarmingRules(b) {
      let rules = JSON.parse(localStorage.getItem(FARM_RULES));
      if (!rules) {
        rules = [];
        localStorage.setItem(FARM_RULES, JSON.stringify(rules));
      }
      b.npcRules = rules;

      if (
        window.location.pathname.includes("build.php") &&
        params.gid &&
        params.gid === "16" &&
        params.tt &&
        params.tt === "99"
      ) {
        console.log("farm list open");
        let villageList = document.querySelectorAll(
          "#raidList .villageWrapper"
        );
        let farmLists = [];
        villageList.forEach((v) => {
          let farmList = v.querySelectorAll(".dropContainer .raidList");
          farmList.forEach((l) => {
            let farmListItem = {};
            farmListItem.id = l.id;
            farmLists.push(farmListItem);
          });
        });
        console.log(farmLists);
      }
    }

    // BOT.displayJobs();

    //setUpNPC(BOT, botPanel);
    //should be reacurring event if npc rules enabled
    // BOT.checkNPC();

    // let prog = localStorage.getItem(BOT_IN_PROGRESS)
    // const inProgress = prog === "" || prog === null ? null : JSON.parse(prog)

    // if (ON) {
    //   console.log("Starting bot");
    //   BOT.checkNPC();
    //   if (!BOT.busy) {
    //     BOT.setNextJob();
    //   }
    // }

    // console.log(BOT);
  }
};

start();
