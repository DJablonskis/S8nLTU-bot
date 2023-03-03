// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*
// @updateURL https://djablonskis.github.io/S8nLTU-bot/S8n.user.js

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
// @require jobsManager.js
// ### @require ads.js

// @require jobsList.js
// @require newBuildUI.js
// @require contextUI.js

// ### @require farmer.js

// ### @require heroManager.js
// ###  @require collectRewards.js
// @require BOT.js

// @version        0.16.01
// ==/UserScript==

const my_css = GM_getResourceText("IMPORTED_CSS");
GM_addStyle(my_css);