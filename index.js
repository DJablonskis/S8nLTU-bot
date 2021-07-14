// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*
// @include        *media.oadts.com*

// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener

// @require constants.js
// @require settings.js
// @require buildings.js

// @require https://www.gstatic.com/firebasejs/8.7.1/firebase-app.js
// @require https://www.gstatic.com/firebasejs/8.7.1/firebase-auth.js
// @require firebase.js

// @require notifications.js
// @require botPanel.js
// @require statusUI.js
// @require helpers.js

// @require login.js

// @require capital.js
// @require productionManager.js
// @require constructionManager.js
// @require jobsManager.js
// @require ads.js

// @require autoUpgradeUI.js
// @require jobsList.js
// @require newBuildUI.js
// @require contextUI.js

// @require BOT.js

// @version        0.12.5
// ==/UserScript==

const start = () => {
  if (ShouldRun) {
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
  }
};

start();
