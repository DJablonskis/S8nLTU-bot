// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*
// @include        *media.oadts.com*

// @resource IMPORTED_CSS styles.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener

// @require constants.js
// @require settings.js
// @require buildings.js

// @require notifications.js
// @require helpers.js
// @require botPanel.js
// @require settingsSection.js
// @require statusUI.js

// @require capital.js
// @require productionManager.js
// @require constructionManager.js
// @require demolitionManager.js
// @require jobsManager.js
// @require ads.js

// @require jobsList.js
// @require newBuildUI.js
// @require contextUI.js

// @require heroManager.js
// @require collectRewards.js
// @require BOT.js

// @version        0.14.1
// ==/UserScript==

const my_css = GM_getResourceText("IMPORTED_CSS");
GM_addStyle(my_css);

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
