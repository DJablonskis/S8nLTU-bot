// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*
// @require https://djablonskis.github.io/S8nLTU-bot/buildings.js

// @version        0.9.8rc
// ==/UserScript==

function allInOneOpera() {
  const VER = "0.9.8rc";
  const APP_NAME = "PingWin";

  let BOT;

  const CITIES_STORAGE = "storedCities";
  const PANEL_POSITION = "positionPanel";
  const NPC_RULES = "npcRules";
  const FARM_RULES = "farmRules";
  const JOBS_STORAGE = "storedJobs";
  const SETTINGS_STORAGE = "storedSettings";
  const BOT_POWER = "bot_enabled";
  const BOT_NOTIFICATIONS = "bot_notifications";
  const BOT_STATS = "bot_statistics";
  const BOT_ON = "1";
  const BOT_OFF = "0";

  const BOT_IN_PROGRESS = "bot_progress";
  const NPC_IN_PROGRESS = "npc_progress";

  const POSITION_UP = "UP";
  const POSITION_DOWN = "DOWN";
  const TRIBE_ROMAN = "tribe1"; //
  const TRIBE_TEUTON = "tribe2"; //
  const TRIBE_GAUL = "tribe3"; //
  const TRIBE_EGIPT = "tribe6"; //
  const TRIBE_HUN = "tribe7"; //

  const WALLS = {
    tribe1: 31,
    tribe2: 32,
    tribe3: 33,
    tribe6: 42,
    tribe7: 43,
  };

  const MIN_WAIT = 3 * 1000 * 60;
  const MAX_WAIT = 20 * 1000 * 60;
  const NPC_COOLDOWN = 10 * 1000 * 60;
  const DELAY_FAST = 1;
  const DELAY_SLOW = 4;

  const Q1 = "q1";
  const Q2 = "q2";

  function notifyMe(title, action, village) {
    var notification = new Notification(title, {
      body: `${action.name} was upgraded to level ${action.stufe} in "${village.name}"`,
      icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
      image:
        "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
    });
    notification.onclick = function () {
      if (parent) parent.focus();
    };
  }
  function delay(message, fast = false, extraTime = 0) {
    let speed = fast ? DELAY_FAST : DELAY_SLOW;
    let d = (Math.floor(Math.random() * 4) + speed) * 1000 + extraTime;
    BOT.setStatus(message, d);
    return d;
  }

  function shuffleArray(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  const ON = localStorage.getItem(BOT_POWER) === BOT_ON;

  const ON_N = localStorage.getItem(BOT_NOTIFICATIONS) === BOT_ON;
  const ON_S = localStorage.getItem(BOT_STATS) === BOT_ON;
  const shouldRun = () => {
    return (
      document.querySelectorAll(
        "div#sidebarBoxVillagelist > div.content > ul > li"
      ).length > 0
    );
  };

  const getParams = (loc = window.location.search) =>
    loc
      .slice(1)
      .split("&")
      .reduce((acc, s) => {
        const [k, v] = s.split("=");
        return Object.assign(acc, { [k]: v });
      }, {});

  function RoundMul(v, n) {
    return Math.round(v / n) * n;
  }

  function getStorageMax(capacity, storage, production) {
    if (capacity === storage && ON_N) {
      new Notification("Prisipilde resursai!", {
        body: `Resources are full!`,
        icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
        image:
          "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
      });
    }

    if (storage === 0 && production < 0 && ON_N) {
      new Notification("Baigesi grudai!!!!", {
        body: `Granary is empty!`,
        icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
        image:
          "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
      });
    }

    if (production == 0) {
      return MIN_WAIT;
    }
    if (production > 0) {
      return Math.ceil(((capacity - storage) / production) * 60 * 60 * 1000);
    }
    return Math.ceil((storage / production) * 60 * 60 * 1000 * -1);
  }

  function TimeT3(a, k, b) {
    this.a = a;
    if (arguments.length < 3) {
      this.k = 1.16;
      if (arguments.length === 1) {
        k = 1;
      }
      this.b = 1875 * k;
    } else {
      this.k = k;
      this.b = b;
    }
  }

  function clickSite(id, caller = "") {
    setTimeout(() => {
      document
        .querySelector(
          `${
            id < 19 ? "#resourceFieldContainer" : "#village_map"
          } a[href*="build.php?id=${id}"]`
        )
        .click();
    }, delay(`${caller}Clicking site ${id}`));
  }

  function clickGid(gid) {
    setTimeout(() => {
      document
        .querySelector(
          `${
            gid < 5 ? "#resourceFieldContainer" : "#village_map"
          } a[href*="&gid=${gid}"]`
        )
        .click();
    }, delay("Clicking " + buildings[gid - 1].name));
  }

  function setUpResFields() {
    const ressFields = [];
    const res_fields = document.querySelectorAll(
      "#resourceFieldContainer > .level"
    );
    res_fields.forEach((node) => {
      if (node.classList.contains("maxLevel")) {
        return;
      }

      let lvl = Number(node.classList.value.split("level").pop());
      let pos = Number(
        node.classList.value.split("buildingSlot")[1].split(" ")[0]
      );
      let gid = Number(node.classList.value.split("gid")[1].split(" ")[0]);

      let BOT_inc_res_spacer = node.parentNode.appendChild(
        document.createElement("div")
      );
      let BOT_inc_res = node.parentNode.appendChild(
        document.createElement("div")
      );

      node.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        BOT.upgrade.open(e, { gid, lvl, pos });
      });

      BOT_inc_res.classList.add("level", "buildingSlot" + pos);
      BOT_inc_res_spacer.classList.add("level", "buildingSlot" + pos);
      BOT_inc_res_spacer.style.cssText =
        "display:block; border-radius:0;z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;";
      BOT_inc_res.style.cssText =
        "text-align: center;font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white;";
      ressFields.push({
        node,
        pos,
        gid,
        lvl,
        bot: BOT_inc_res,
      });
    });

    return ressFields;
  }

  //DOES NOT PARSE WALL
  function setUpBuildings() {
    const buildings = [];

    const wall = document.querySelector(
      "#village_map .a40.bottom a[href*='id=40'"
    );
    let wall_level_node = wall.querySelector("div.labelLayer");
    let wall_level = 0;
    if (wall_level_node) {
      wall_level = Number(wall_level_node.textContent);
    }
    console.log(wall);
    const wall_btn = document
      .getElementById("village_map")
      .appendChild(document.createElement("div"));

    wall_btn.style.cssText =
      "cursor:pointer;text-align:center;font-weight:900; border:2px ridge #fdfd75; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white; line-height:23px; position:absolute; width:23px; z-index:40; bottom: 43px; left: calc(50% - 20px)";
    wall_btn.textContent = "+";
    buildings.push({
      node: wall.parentNode,
      pos: 40,
      gid: 32,
      lvl: wall_level,
      bot: wall_btn,
    });

    const building_nodes = Array.from(
      document.querySelectorAll(
        "#village_map > div.buildingSlot > img.building"
      )
    );

    //  building_nodes.push(wall)

    building_nodes.forEach((a) => {
      let node = a.parentNode;
      if (node.firstChild.classList.contains("maxLevel")) {
        return;
      }

      let gid, pos;

      // if (node.classList.contains("bottom")) {
      //     gid = WALLS[this.tribe]
      //     pos = 40;
      // }
      gid = Number(node.classList.value.split(" g")[1].split(" ")[0]);
      pos = Number(node.classList.value.split("aid")[1].split(" ")[0]);

      let levelNode = node.querySelector("div.labelLayer");
      let lvl = 0;
      if (gid !== 0 && levelNode) {
        lvl = Number(levelNode.textContent);
      }

      let BOT_inc_build = null;

      // if (pos === 40) {
      //     BOT_inc_build = document.querySelector("#village_map").appendChild(document.createElement("div"))
      //     BOT_inc_build.style.cssText = "text-align:center;position:absolute; left: 50%; bottom:0;font-weight:900; cursor:pointer; border:2px ridge #fdfd75; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.9); color: white; line-height:23px; width: 23px; height:23px"
      // }
      BOT_inc_build = node.appendChild(document.createElement("div"));
      BOT_inc_build.classList.add("level", "buildingSlot");
      BOT_inc_build.dataset.lvl = lvl;

      BOT_inc_build.style.cssText =
        "text-align:center;font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white; line-height:23px";
      BOT_inc_build.textContent = "+";
      let BOT_inc_buid_spacer = node.appendChild(document.createElement("div"));
      BOT_inc_buid_spacer.classList.add("level", "buildingSlot");
      BOT_inc_buid_spacer.style.cssText =
        "border-radius:0;z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;";

      buildings.push({ node, pos, gid, lvl, bot: BOT_inc_build });

      if (gid === 0) {
        BOT_inc_buid_spacer.style.display = "none";
        BOT_inc_build.style.display = "none";
      }
    });
    console.log(buildings);

    return buildings;
  }

  //DETECTS incoming attacks
  //document.querySelectorAll("table#movements > tbody > tr >td.typ > a > img.att1 ").length>0

  const r1i = (x) =>
    `<i class="lumber_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:1px;"></i>`;
  const r2i = (x) =>
    `<i class="clay_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:1px;"></i>`;
  const r3i = (x) =>
    `<i class="iron_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:1px;"></i>`;
  const r4i = (x) =>
    `<i class="crop_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:1px;"></i>`;
  const wi = (x) =>
    `<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/warehouse_medium.png'); margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`;
  const gi = (x) =>
    `<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/granary_medium.png');margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`;

  const typeNames = [
    { name: "Lumber", icon: r1i },
    { name: "Clay", icon: r2i },
    { name: "Iron", icon: r3i },
    { name: "Crop", icon: r4i },
  ];

  const getResources = () => {
    let arr = document
      .querySelector("#contentOuterContainer > script")
      .text.split("=")
      .pop()
      .trim()
      .slice(0, -1)
      .split("},");
    let production = JSON.parse("{" + arr[0].split(": {").pop() + "}");
    let storage = JSON.parse("{" + arr[1].split(": {").pop() + "}");
    let capacity = JSON.parse("{" + arr[2].split(": {").pop().slice(0, -1));
    return { production, storage, capacity };
  };

  const getBuildingQueue = () => {
    if (window.location.pathname.includes("dorf")) {
      let buildingQ = document.querySelectorAll("div.buildingList > ul > li");
      if (buildingQ && buildingQ.length > 0) {
        let buildString = document
          .querySelector("#content > script")
          .text.includes("var bld")
          ? document.querySelector("#content > script").text
          : document.querySelector("#content .village1Content > script").text;
        let buildingLevels = buildString.split("=").pop();
        const q = JSON.parse(buildingLevels);
        buildingQ.forEach((element, index) => {
          if (q[index]) {
            let seconds = Number(
              element
                .querySelector("div.buildDuration > span")
                .getAttribute("value")
            );
            q[index].name = element
              .querySelector("div.name")
              .innerHTML.split("<")[0]
              .trim();
            q[index].finish = Date.now() + seconds * 1000;
          }
        });
        return q;
      } else return [];
    }
  };

  const getCities = () => {
    const cities = {};
    cities.vil = [];

    let loadedCities = JSON.parse(localStorage.getItem(CITIES_STORAGE));

    //SETTING TRIBE
    if (
      loadedCities &&
      window.location.pathname.includes("dorf1") &&
      !Object.keys(loadedCities).includes("tribe")
    ) {
      cities.tribe = document.querySelector(
        "div#resourceFieldContainer"
      ).classList[1];
    } else if (loadedCities && Object.keys(loadedCities).includes("tribe")) {
      cities.tribe = loadedCities.tribe;
    }

    let villages = document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    );
    villages.forEach((vil, i) => {
      let data = vil.querySelector("a > span.coordinatesGrid");
      let name = vil.querySelector("span.name").textContent.trim();
      let x = Number(
        vil
          .querySelector("span.coordinateX")
          .textContent.trim()
          .slice(1)
          .replace(/\u202c|\u202d|/g, "")
          .replace(/\u2212/g, "-")
      );
      let y = Number(
        vil
          .querySelector("span.coordinateY")
          .textContent.trim()
          .slice(0, -1)
          .replace(/\u202c|\u202d|/g, "")
          .replace(/\u2212/g, "-")
      );
      let did = Number(
        getParams("?" + vil.querySelector("a").href.split("?")[1]).newdid
      );

      const v = { name, x, y, did };

      if (vil.classList.contains("active")) {
        cities.cID = did;
      }

      if (cities.cID === did && window.location.pathname.includes("dorf")) {
        cities.cID = did;
        v.ress = getResources();
        v.queue = getBuildingQueue();
        v.timestamp = Date.now();

        v.l1Max = getStorageMax(
          v.ress.capacity.l1,
          v.ress.storage.l1,
          v.ress.production.l1
        );
        v.l2Max = getStorageMax(
          v.ress.capacity.l2,
          v.ress.storage.l2,
          v.ress.production.l2
        );
        v.l3Max = getStorageMax(
          v.ress.capacity.l3,
          v.ress.storage.l3,
          v.ress.production.l3
        );
        v.l4Max = getStorageMax(
          v.ress.capacity.l4,
          v.ress.storage.l4,
          v.ress.production.l4
        );

        v.nextRessCheck = Math.min(v.l1Max, v.l2Max, v.l3Max, v.l4Max);

        cities.vil.push(v);
        cities.current = v;
      } else {
        if (loadedCities) {
          let old = loadedCities.vil.find((x) => x.did === v.did);
          if (old) {
            old.name = name;
            cities.vil.push(old);
          } else {
            cities.vil.push(v);
          }
        }
      }

      //SETING CAPITAL
      if (window.location.pathname === "/profile") {
        const cap = document
          .querySelector("td.name > .mainVillage")
          .parentNode.querySelector("a")
          .innerText.trim();

        if (name === cap) {
          cities.cap = did;
        }
      } else {
        if (loadedCities && loadedCities.cap) {
          cities.cap = loadedCities.cap;
        }
      }
    });
    localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities));
    return cities;
  };

  const createSidePanel = () => {
    const pos = localStorage.getItem(PANEL_POSITION);
    const sideBar = document.querySelector("#sidebarBeforeContent > div");
    const panel = document.createElement("div");
    panel.classList.add("sidebarBox");

    let sidePanelHeader = panel.appendChild(document.createElement("div"));
    sidePanelHeader.classList.add("header");

    let btnWraper = sidePanelHeader.appendChild(document.createElement("div"));
    btnWraper.classList.add("buttonsWrapper");

    let btnPower = btnWraper.appendChild(document.createElement("a"));
    btnPower.classList.add(
      "layoutButton",
      "buttonFramed",
      "withIcon",
      "round",
      "green"
    );
    btnPower.innerHTML = `<svg class="edit" style="width:30px; stroke-width:2; fill:${
      ON ? "red" : "white"
    };" viewBox="0 0 20 20"><path d="M10,6.978c-1.666,0-3.022,1.356-3.022,3.022S8.334,13.022,10,13.022s3.022-1.356,3.022-3.022S11.666,6.978,10,6.978M10,12.267c-1.25,0-2.267-1.017-2.267-2.267c0-1.25,1.016-2.267,2.267-2.267c1.251,0,2.267,1.016,2.267,2.267C12.267,11.25,11.251,12.267,10,12.267 M18.391,9.733l-1.624-1.639C14.966,6.279,12.563,5.278,10,5.278S5.034,6.279,3.234,8.094L1.609,9.733c-0.146,0.147-0.146,0.386,0,0.533l1.625,1.639c1.8,1.815,4.203,2.816,6.766,2.816s4.966-1.001,6.767-2.816l1.624-1.639C18.536,10.119,18.536,9.881,18.391,9.733 M16.229,11.373c-1.656,1.672-3.868,2.594-6.229,2.594s-4.573-0.922-6.23-2.594L2.41,10l1.36-1.374C5.427,6.955,7.639,6.033,10,6.033s4.573,0.922,6.229,2.593L17.59,10L16.229,11.373z"></path></svg >`;
    btnPower.onclick = (e) => {
      localStorage.setItem(BOT_IN_PROGRESS, "");
      localStorage.setItem(BOT_POWER, ON ? BOT_OFF : BOT_ON);
      location.reload();
    };

    if ("Notification" in window) {
      let btnNotif = btnWraper.appendChild(document.createElement("a"));
      btnNotif.classList.add(
        "layoutButton",
        "buttonFramed",
        "withIcon",
        "round",
        "green"
      );
      btnNotif.innerHTML = `<svg class="edit" style=" stroke-width:2; fill:${
        ON_N ? "red" : "white"
      };" viewBox="0 0 20 20"><path d="M17.657,2.982H2.342c-0.234,0-0.425,0.191-0.425,0.426v10.21c0,0.234,0.191,0.426,0.425,0.426h3.404v2.553c0,0.397,0.48,0.547,0.725,0.302l2.889-2.854h8.298c0.234,0,0.426-0.191,0.426-0.426V3.408C18.083,3.174,17.892,2.982,17.657,2.982M17.232,13.192H9.185c-0.113,0-0.219,0.045-0.3,0.124l-2.289,2.262v-1.96c0-0.233-0.191-0.426-0.425-0.426H2.767V3.833h14.465V13.192z M10,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.488-0.668,1.488-1.489C11.488,7.905,10.821,7.237,10,7.237 M10,9.364c-0.352,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C10.638,9.077,10.351,9.364,10,9.364 M14.254,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489s1.489-0.668,1.489-1.489C15.743,7.905,15.075,7.237,14.254,7.237 M14.254,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.352,0,0.639,0.287,0.639,0.638C14.893,9.077,14.605,9.364,14.254,9.364 M5.746,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.489-0.668,1.489-1.489C7.234,7.905,6.566,7.237,5.746,7.237 M5.746,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C6.384,9.077,6.096,9.364,5.746,9.364"></path></svg >`;
      btnNotif.onclick = (e) => {
        if (Notification.permission === "denied") {
          return alert("Notification permission was previously denied.");
        } else if (!ON_N) {
          if (
            Notification.permission !== "granted" &&
            Notification.permission !== "denied"
          ) {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                localStorage.setItem(
                  BOT_NOTIFICATIONS,
                  ON_N ? BOT_OFF : BOT_ON
                );
                location.reload();
              } else {
                return alert(
                  "This feature requires you to enable notifications permission for this website in the browser!"
                );
              }
            });
          }
        }
        if (Notification.permission === "granted") {
          localStorage.setItem(BOT_NOTIFICATIONS, ON_N ? BOT_OFF : BOT_ON);
          location.reload();
        }
      };
    }

    let btnStats = btnWraper.appendChild(document.createElement("a"));
    btnStats.classList.add(
      "layoutButton",
      "buttonFramed",
      "withIcon",
      "round",
      "green"
    );
    btnStats.innerHTML = `<svg class="edit" style="stroke-width:2; fill:${
      ON_S ? "red" : "white"
    };" viewBox="0 0 20 20"><path d="M17.431,2.156h-3.715c-0.228,0-0.413,0.186-0.413,0.413v6.973h-2.89V6.687c0-0.229-0.186-0.413-0.413-0.413H6.285c-0.228,0-0.413,0.184-0.413,0.413v6.388H2.569c-0.227,0-0.413,0.187-0.413,0.413v3.942c0,0.228,0.186,0.413,0.413,0.413h14.862c0.228,0,0.413-0.186,0.413-0.413V2.569C17.844,2.342,17.658,2.156,17.431,2.156 M5.872,17.019h-2.89v-3.117h2.89V17.019zM9.587,17.019h-2.89V7.1h2.89V17.019z M13.303,17.019h-2.89v-6.651h2.89V17.019z M17.019,17.019h-2.891V2.982h2.891V17.019z"></path></svg >`;
    btnStats.onclick = (e) => {
      localStorage.setItem(BOT_STATS, ON_S ? BOT_OFF : BOT_ON);
      location.reload();
    };

    if (pos === POSITION_UP) {
      let btnDown = btnWraper.appendChild(document.createElement("a"));
      btnDown.classList.add(
        "layoutButton",
        "buttonFramed",
        "withIcon",
        "round",
        "green"
      );
      btnDown.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path></svg >`;
      btnDown.onclick = (e) => {
        localStorage.setItem(PANEL_POSITION, POSITION_DOWN);
        location.reload();
      };
      sideBar.prepend(panel);
    } else {
      let btnUp = btnWraper.appendChild(document.createElement("a"));
      btnUp.classList.add(
        "layoutButton",
        "buttonFramed",
        "withIcon",
        "round",
        "green"
      );
      btnUp.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"></path></svg >`;
      btnUp.onclick = (e) => {
        localStorage.setItem(PANEL_POSITION, POSITION_UP);
        location.reload();
      };
      sideBar.appendChild(panel);
    }

    let btnHelp = btnWraper.appendChild(document.createElement("a"));
    btnHelp.href =
      "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rmbdeivis@hotmail.com&lc=GB&item_name=Buy%20me%20a%20coffee%20to%20stay%20awake%20while%20writing%20PingWinBot%21&currency_code=GBP&no_note=0&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHostedGuest";
    btnHelp.target = "_blank";
    btnHelp.classList.add(
      "layoutButton",
      "buttonFramed",
      "withIcon",
      "round",
      "green"
    );
    btnHelp.innerHTML = `<svg class="edit" style="stroke-width:1; translate: rotate(180); fill:white;" viewBox="0 0 20 20"> <path d="M9.719,17.073l-6.562-6.51c-0.27-0.268-0.504-0.567-0.696-0.888C1.385,7.89,1.67,5.613,3.155,4.14c0.864-0.856,2.012-1.329,3.233-1.329c1.924,0,3.115,1.12,3.612,1.752c0.499-0.634,1.689-1.752,3.612-1.752c1.221,0,2.369,0.472,3.233,1.329c1.484,1.473,1.771,3.75,0.693,5.537c-0.19,0.32-0.425,0.618-0.695,0.887l-6.562,6.51C10.125,17.229,9.875,17.229,9.719,17.073 M6.388,3.61C5.379,3.61,4.431,4,3.717,4.707C2.495,5.92,2.259,7.794,3.145,9.265c0.158,0.265,0.351,0.51,0.574,0.731L10,16.228l6.281-6.232c0.224-0.221,0.416-0.466,0.573-0.729c0.887-1.472,0.651-3.346-0.571-4.56C15.57,4,14.621,3.61,13.612,3.61c-1.43,0-2.639,0.786-3.268,1.863c-0.154,0.264-0.536,0.264-0.69,0C9.029,4.397,7.82,3.61,6.388,3.61"></path></svg >`;

    function destroy() {
      panel.remove();
    }

    function addSection(title) {
      let sidePanelContent = panel.appendChild(document.createElement("div"));
      sidePanelContent.classList.add("content");
      sidePanelContent.innerHTML = `<div class='boxTitle'>${title}</div>`;

      return sidePanelContent;
    }

    return { panel, destroy, addSection };
  };

  function checkTime(completion) {
    function pad(n, z) {
      z = z || 2;
      return ("00" + n).slice(-z);
    }

    let current = Date.now();
    let s = completion - current;

    if (s > 0) {
      var ms = s % 1000;
      s = (s - ms) / 1000;
      var secs = s % 60;
      s = (s - secs) / 60;
      var mins = s % 60;
      var hrs = (s - mins) / 60;

      let timer = pad(hrs) + ":" + pad(mins) + ":" + pad(secs);

      return { completed: false, timer };
    } else return { completed: true, timer: "Completed!" };
  }

  function cC(s, p, c) {
    var color = " color:black; ";
    var ratio = (s * 1.0) / c;
    if (ratio > 0.2) {
      if (ratio > 0.5) {
        color = " color:green; ";
      }
      if (ratio > 0.8) {
        color = " color:#e45f00; ";
      }
      if (ratio > 0.9) {
        color = " color:#e62020d; ";
      }
    } else if (p < 0) {
      color = " color:#e62020; ";
    }
    return color;
  }

  function iS(lastTime, ress) {
    let sec = Date.now() - lastTime;
    var ms = sec % 1000;
    sec = (sec - ms) / 1000;

    var style = "display: flex; font-size: 10px; align-items: center;";

    let p_r1 = Math.floor(
      ((ress.production.l1 * 1.0) / 3600) * sec + ress.storage.l1
    );
    p_r1 = p_r1 < ress.capacity.l1 ? p_r1 : ress.capacity.l1;
    let c_r1 = cC(p_r1, ress.production.l1, ress.capacity.l1);

    let p_r2 = Math.floor(
      ((ress.production.l2 * 1.0) / 3600) * sec + ress.storage.l2
    );
    p_r2 = p_r2 < ress.capacity.l2 ? p_r2 : ress.capacity.l2;
    let c_r2 = cC(p_r2, ress.production.l12, ress.capacity.l2);

    let p_r3 = Math.floor(
      ((ress.production.l3 * 1.0) / 3600) * sec + ress.storage.l3
    );
    p_r3 = p_r3 < ress.capacity.l3 ? p_r3 : ress.capacity.l3;
    let c_r3 = cC(p_r3, ress.production.l3, ress.capacity.l3);

    let p_r4 = Math.floor(
      ((ress.production.l4 * 1.0) / 3600) * sec + ress.storage.l4
    );
    p_r4 = p_r4 < ress.capacity.l4 ? p_r4 : ress.capacity.l4;
    let c_r4 = cC(p_r4, ress.production.l4, ress.capacity.l4);

    return ` <span style="${c_r1 + style}">${r1i(
      10
    )}${p_r1}</span>        <span style="${c_r2 + style}">${r2i(
      10
    )}${p_r2}</span>        <span style="${c_r3 + style}">${r3i(
      10
    )}${p_r3}</span>        <span style="${c_r4 + style}">${r4i(
      10
    )}${p_r4}</span>`;
  }

  // SIDE PANEL
  const createCity = (vil, node) => {
    const block = document.createElement("div");
    block.style.paddingBottom = "3px";

    const prodRow = document.createElement("div");
    prodRow.style.display = "flex";
    prodRow.style.justifyContent = "space-between";
    prodRow.style.padding = "0 12px";
    block.appendChild(prodRow);
    const queRow = document.createElement("div");
    block.appendChild(queRow);

    //let capital_string = "";

    //  if (cities.cap && cities.cap === vil.did) capital_string = "(Capital)"

    if (vil.ress) {
      const { capacity } = vil.ress;
      // nameRow.innerHTML = `<div>${wi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l1}</span>${gi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l4}</span></div>`
      prodRow.innerHTML = iS(vil.timestamp, vil.ress);
      let resUpdate = setInterval(() => {
        prodRow.innerHTML = iS(vil.timestamp, vil.ress);
      }, 2000);
    } else {
      prodRow.innerHTML = `<div style="font-size:10px">No info yet.</div>`;
    }

    //CREATING DOTS
    const nameRow = node.querySelector("span.name");
    let flexBlock = document.createElement("div");
    flexBlock.style.cssText =
      "position: absolute;flex-direction: column; display: inline-flex; font-size: 18px; padding-left: 2px; line-height: 0.35;";
    nameRow.appendChild(flexBlock);

    let q1Node = flexBlock.appendChild(document.createElement("div"));
    q1Node.style.height = "8px";
    let q1 = vil.queue ? vil.queue.filter((q) => q.gid < 5) : [];
    q1.forEach((b) => {
      let dot = q1Node.appendChild(document.createElement("span"));
      dot.innerText = "•";
      dot.style.cssText =
        "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange;padding-right:2px;";
      let current = Date.now();
      let s = b.finish - current;
      if (s > 0) {
        setTimeout(() => {
          dot.style.color = "#4cc500";
        }, s);
      } else {
        dot.style.color = "#4cc500";
      }
    });

    let q2Node = flexBlock.appendChild(document.createElement("div"));
    q2Node.style.height = "8px";
    let q2 = vil.queue ? vil.queue.filter((q) => q.gid > 4) : [];
    q2.forEach((b) => {
      let dot = q2Node.appendChild(document.createElement("span"));
      dot.innerText = "•";
      dot.style.cssText =
        "font-weight: bold; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: orange; padding-right:2px;";
      let current = Date.now();
      let s = b.finish - current;
      if (s > 0) {
        setTimeout(() => {
          dot.style.color = "#4cc500";
        }, s);
      } else {
        dot.style.color = "#4cc500";
      }
    });

    //EXTRA STATS
    if (vil.queue) {
      vil.queue.forEach((x) => {
        const task = document.createElement("div");
        queRow.appendChild(task);
        let timer = checkTime(x.finish);
        task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
          x.name
        } level ${x.stufe}</span><span style="font-size:11px;  ${
          timer.completed ? "color:green;" : ""
        } align-items:center;">${timer.timer}</span>`;
        if (!timer.completed) {
          let updater = setInterval(() => {
            timer = checkTime(x.finish);
            task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${
              x.name
            } level ${x.stufe}</span><span style="font-size:11px; ${
              timer.completed ? "color:green;" : ""
            } align-items:center;">${timer.timer}</span>`;

            if (timer.completed) {
              if (ON_N) {
                notifyMe("Building completed", x, vil);
              }
              clearInterval(updater);
            }
          }, 1000);
        }
      });
    }
    if (ON_S) {
      node.appendChild(block);
    }
  };

  function displayJobs() {
    let jobs = this.jobs["c" + this.cID];
    jobs = !jobs ? [] : jobs;
    const cVillage = this.current;
    const panel = this.jobsSection;
    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }

    if (window.location.pathname.includes("dorf1")) {
      this.fieldsCollection.forEach((field) => {
        const buildingNow = cVillage.queue.filter(
          (bn) => Number(bn.aid) === field.pos
        );
        const min = field.lvl + buildingNow.length + 1;
        const old_jobs = jobs.filter(
          (job) => job.pos === field.pos && job.to < min
        );
        if (old_jobs.length > 0) {
          old_jobs.forEach((job) => {
            jobs = this.completeJob(job);
          });
        }

        const count = jobs.filter((x) => x.pos === field.pos).length;
        field.bot.textContent = count === 0 ? "+" : count;
        field.bot.dataset.lvl = count;
        field.bot.onclick = () => {
          this.addJob({
            gid: field.gid,
            pos: field.pos,
            lvl: field.lvl,
            to:
              Number(field.bot.dataset.lvl) +
              1 +
              Number(field.lvl) +
              buildingNow.length,
          });
          this.displayJobs();
        };
      });
    }
    if (window.location.pathname.includes("dorf2")) {
      this.buildingCollection.forEach((building) => {
        //Number of currently beign built same type buildings
        const buildingNow = cVillage.queue.filter(
          (bn) => Number(bn.aid) === building.pos
        );

        const min = building.lvl + buildingNow.length + 1;
        const old_jobs = jobs.filter(
          (job) => job.pos === building.pos && job.to < min
        );
        if (old_jobs.length > 0) {
          old_jobs.forEach((job) => {
            jobs = this.completeJob(job);
          });
        }

        const pos_jobs = jobs.filter((x) => x.pos === building.pos);
        const count = pos_jobs.length;

        //if new building display!
        if (building.gid === 0 && count > 0) {
          building.bot.style.display = "block";
          building.gid = pos_jobs[0].gid;
          let image = building.node.querySelector("img");
          image.classList.add("g" + pos_jobs[0].gid);
          image.style.opacity = "0.5";
        }
        building.bot.textContent = count === 0 ? "+" : count;
        building.bot.dataset.lvl = count;
        building.bot.onclick = () => {
          this.addJob({
            gid: building.gid,
            pos: building.pos,
            lvl: building.lvl,
            to:
              Number(building.bot.dataset.lvl) +
              1 +
              Number(building.lvl) +
              buildingNow.length,
          });
          this.displayJobs();
        };
      });
    }

    const summary = this.jobsSection.appendChild(
      document.createElement("summary")
    );
    summary.innerHTML = `<strong>Jobs planed: </strong> ${jobs.length}; <strong>`;

    if (jobs.length > 0) {
      jobs.forEach((job) => {
        const node = document.createElement("div");
        node.style.cssText =
          "font-size: 10px; line-height:10px; margin-bottom:2px;";
        const nodeButton = node.appendChild(document.createElement("span"));
        const nodeText = node.appendChild(document.createElement("span"));
        nodeButton.style.cssText =
          "cursor: pointer; width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px; ";
        nodeButton.textContent = "x";
        nodeButton.onclick = (e) => {
          let i = whichChild(e.target.parentNode) - 1;
          this.removeJob(jobs[i]);
          this.displayJobs();
        };
        this.jobsSection.appendChild(node);
        nodeText.textContent = `[${job.pos}] ${
          this.buildingDB[job.gid - 1].name
        } to level ${job.to}`;
      });
    }
  }

  function whichChild(elem) {
    var i = 0;
    while ((elem = elem.previousSibling) != null) ++i;
    return i;
  }

  function initJobQueue(c) {
    let cid = "c" + c.cID;

    let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE));
    if (!jobs || !jobs[cid]) {
      jobs = jobs ? jobs : {};
      if (window.location.pathname.includes("dorf")) {
        jobs[cid] = jobs[cid] ? jobs[cid] : [];
      }
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs));
    }

    let settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE));
    if (!settings || !settings[cid]) {
      settings = settings ? settings : {};
      if (window.location.pathname.includes("dorf")) {
        settings[cid] = settings[cid]
          ? settings[cid]
          : { upgradeRes: false, upgradeCrop: false };
      }
      localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
    }

    let cbAutoRes = document.getElementById("cbAutoRes");
    cbAutoRes.checked = settings[cid].upgradeRes;
    cbAutoRes.addEventListener("change", (e) => {
      if (e.target.checked !== c.settings[cid].upgradeRes) {
        let box = e.target;
        c.settings[cid].upgradeRes = box.checked;
        console.log("auto res changed to ", c.settings[cid].upgradeRes);
        localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(c.settings));
      }
    });

    let cbAutoCrop = document.getElementById("cbAutoCrop");
    cbAutoCrop.checked = settings[cid].upgradeCrop;
    cbAutoCrop.addEventListener("change", (e) => {
      if (e.target.checked !== c.settings[cid].upgradeCrop) {
        let box = e.target;
        c.settings[cid].upgradeCrop = box.checked;
        console.log("auto crop changed to ", c.settings[cid].upgradeCrop);
        localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(c.settings));
      }
    });

    c.settings = settings;
    c.jobs = jobs;
    c.displayJobs = displayJobs;
  }

  //UPGRADE WINDOW
  const createUpgradeContext = () => {
    const dialog = document.createElement("div");
    dialog.id = "context_dialog";

    const closeButton = dialog.appendChild(document.createElement("button"));
    closeButton.innerText = "x";
    const addUpgradeButton = dialog.appendChild(
      document.createElement("button")
    );
    addUpgradeButton.innerText = "Upgrade";

    const close = () => {
      dialog.style.opacity = 0;
      dialog.style.display = "none";
      return;
    };

    const open = (e, info) => {
      console.log("event", e);
      console.log("target", e.target);
      console.log("info: ", info);
      dialog.style.display = "block";
      dialog.style.top = `${e.clientY - 20}px`;
      dialog.style.left = `${e.clientX + 10}px`;
      dialog.style.opacity = 1;
      return;
    };

    closeButton.onclick = close;

    dialog.style.cssText =
      "padding:4px; z-index: 400; transition: opacity 1.5s ease; opacity:0; position: absolute;flex-direction: column; background-color: white; border-radius: 8px; border: 4px solid green; font-size: 18px;";

    document.body.appendChild(dialog);
    return {
      open,
      close,
    };
  };

  //STARTS HERE IF CAN SEE VILLAGE LIST

  if (shouldRun()) {
    const botPanel = createSidePanel().addSection(`${APP_NAME} v${VER}`);
    BOT = getCities();
    const params = getParams();
    BOT.upgrade = createUpgradeContext();

    if (
      window.location.pathname.includes("build.php") &&
      !window.location.search.includes("&gid=")
    ) {
      const cat = params.category ? Number(params.category) : 1;

      const availableBuildings = document.querySelectorAll(
        ".buildingWrapper > .build_desc > img.building"
      );
      availableBuildings.forEach((b) => {
        let cont = b.parentNode.parentNode;
        let gid = Number(
          cont.querySelector(".contract").id.replace("contract_building", "")
        );
        let pos = window.location.search.split("=")[1];
        pos = pos.includes("&") ? Number(pos.split("&")[0]) : Number(pos);

        cont.style.position = "relative";
        const button = cont.appendChild(document.createElement("button"));
        button.classList.add("textButtonV1", "green", "new");
        button.style.position = "absolute";
        button.style.right = "0";
        button.style.top = "0";
        button.innerText = `Build later`;

        button.onclick = () => {
          BOT.addJob({ gid, pos, lvl: 0, to: 1, cat });
          BOT.displayJobs();
          window.location.href = "/dorf2.php";
        };
      });
    }

    const villageLiArray = document.querySelectorAll(
      "#sidebarBoxVillagelist li"
    );
    if (window.location.pathname.includes("dorf1")) {
      BOT.fieldsCollection = setUpResFields();
    }

    if (window.location.pathname.includes("dorf2")) {
      BOT.buildingCollection = setUpBuildings();
    }

    // BOT.villagesSection = botPanel.addSection("PINGWINBOT");

    const titleStyle =
      'letter-spacing: .1em; font-family: "Noto Serif"; font-weight: bold; color: #5e463a; margin-bottom: 5px; margin-top: 5px;';

    const jobQS = botPanel.appendChild(document.createElement("div"));
    jobQS.style.cssText =
      "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
    const jobQTitle = jobQS.appendChild(document.createElement("h4"));
    jobQTitle.innerText = "Builder";
    jobQTitle.style.cssText = titleStyle;

    BOT.jobsSection = jobQS.appendChild(document.createElement("details"));

    const builderSettings = jobQS.appendChild(document.createElement("div"));
    builderSettings.style.cssText = "padding-top: 6px";

    const autobuilderRow = builderSettings.appendChild(
      document.createElement("div")
    );
    autobuilderRow.innerHTML =
      '<label for="cbAutoFields" style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoRes" style="margin-right: 2px;">Auto-upgrade resources</label>';

    const ignoreCropRow = builderSettings.appendChild(
      document.createElement("div")
    );
    ignoreCropRow.innerHTML =
      '<label for="cbIgnoreCrop"  style="display:flex;margin-bottom:4px"><input type="checkbox" id="cbAutoCrop" style="margin-right: 2px;">Auto-upgrade crop<label>';

    //NPC SETUP
    const npcS = botPanel.appendChild(document.createElement("div"));
    npcS.style.cssText =
      "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
    const npcTitle = npcS.appendChild(document.createElement("h4"));
    npcTitle.style.cssText = titleStyle;
    npcTitle.innerText = "Auto NPC";

    BOT.npcPanel = npcS.appendChild(document.createElement("div"));

    const addNpcButton = npcS.appendChild(document.createElement("button"));
    addNpcButton.className = "textButtonV1 gold productionBoostButton";
    addNpcButton.style.cssText = "margin-top: 8px;";
    addNpcButton.innerText = "Add new rule";
    addNpcButton.onclick = () => BOT.addNPCRule();

    const npcSubtitle = npcS.appendChild(document.createElement("p"));
    npcSubtitle.innerHTML =
      "<strong>Warning:</strong> Still experimental. Spends gold and could contain bugs causing high gold usage. Use at your own risks!";
    npcSubtitle.style.cssText = "margin: 8px 0; color: red;";
    //status setup
    const status = botPanel.appendChild(document.createElement("div"));
    status.style.cssText =
      "padding-bottom: 8px; border-bottom: 1px solid #5e463a;";
    const statusTitle = status.appendChild(document.createElement("h4"));
    statusTitle.style.cssText = titleStyle;
    statusTitle.innerText = "Status:";
    let statusMessage = status.appendChild(document.createElement("div"));
    statusMessage.innerText = "Waiting for instructions";

    const loadingBar = status.appendChild(document.createElement("div"));
    loadingBar.style.cssText =
      "margin-top: 4px; position: relative; height:8px; border:1px solid #52372a; overflow: hidden; border-radius:2px; background-color: #52372a";
    const loadingBarProgress = loadingBar.appendChild(
      document.createElement("div")
    );
    loadingBarProgress.style.cssText =
      "height:6px; width:0; background-color: #546e39; border: 1px solid transparent; border-color: #699e32 #6db024 #71c117; width: 100%";
    BOT.setStatus = function (message = "", time = 5000) {
      let width = 0;
      let timestamp = Date.now();
      statusMessage.innerText = message;
      var id = setInterval(frame, 30);
      function frame() {
        width = ((Date.now() - timestamp) / time) * 100.0;
        if (width >= 100) {
          clearInterval(id);
        } else {
          width++;
          loadingBarProgress.style.width = width + "%";
        }
      }
    };

    BOT.buildingDB = buildings;
    BOT.vil.forEach((t, i) => createCity(t, villageLiArray[i]));

    BOT.addJob = function (job) {
      if (!this.cap) {
        alert(
          "Capital not set. Opening '/profile' section for you now. While on '/profile' section, please change your current city to your capital city for bot to update. You only need to do this once."
        );
        location.href = "/profile";
        return;
      }
      //Check if ress and max level ceiling
      if (job.gid < 5) {
        if (job.to > 10) {
          if (this.cap !== this.cID) {
            alert("Max level is 10 in non Capital villages!");
            return;
          } else if (job.to > 21) {
            alert("Max field level is 21!");
            return;
          }
        }
      } else {
        const b = this.buildingDB[job.gid - 1];

        if (job.to > b.maxLvl) {
          alert(`Max level for ${b.name} is ${b.maxLvl}`);
          return;
        }
        //is cap and not alowed in cap:
        if (this.cap === this.cID && !b.cap) {
          alert("Cant build this in capitol!");
          return;
        }
        if (this.cap !== this.cID && !b.xcap) {
          alert("Cant build this in non capitol city!");
          return;
        }
      }

      //Current village
      const cVillage = this.vil.find((v) => v.did === this.cID);

      //warehouse and granary capacity check
      const w = cVillage.ress.capacity.l1;
      const g = cVillage.ress.capacity.l4;
      const stats = this.buildingDB[job.gid - 1].getStat(job.to);
      if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w) {
        alert("Expand warehouse first!");
        return;
      }
      if (stats.cost[3] > g) {
        alert("Expand granary first!");
        return;
      }

      this.jobs["c" + this.cID].push(job);
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
    };

    BOT.completeJob = function (job) {
      let jobs = this.jobs["c" + this.cID];
      this.jobs["c" + this.cID] = jobs.filter(
        (j) => j.pos !== job.pos || (j.pos === job.pos && j.to !== job.to)
      );
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
      return this.jobs["c" + this.cID];
    };

    BOT.removeJob = function (job) {
      let jobs = this.jobs["c" + this.cID];
      this.jobs["c" + this.cID] = jobs.filter(
        (j) => j.pos !== job.pos || (j.pos === job.pos && j.to < job.to)
      );
      localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs));
    };

    BOT.switchCity = function () {
      if (location.pathname.includes("dorf1")) {
        let filtered = this.vil.filter((v) => {
          let shouldCheck = false;
          let jobs = this.jobs["c" + v.did];

          if (jobs && jobs.length > 0) {
            let q1 = jobs.filter((q) => q.gid < 5);
            let q2 = jobs.filter((q) => q.gid > 4);

            const p = v.queue.filter((b) => b.finish > Date.now());
            const p1 = p.filter((_p) => _p.gid < 5);
            const p2 = p.filter((_p) => _p.gid > 4);
            if (v.timestamp + MIN_WAIT < Date.now()) {
              if (this.tribe === TRIBE_ROMAN) {
                shouldCheck =
                  (q1.length > 0 && p1.length === 0) ||
                  (q2.length > 0 && p2.length === 0);
              } else {
                shouldCheck = p.length === 0;
              }

              return shouldCheck;
            }
          }

          if (!shouldCheck) {
            let settings = this.settings["c" + v.did];
            shouldCheck =
              (settings.upgradeCrop || settings.upgradeRes) &&
              v.timestamp + MIN_WAIT < Date.now();
            if (shouldCheck) {
              console.log(`added ${v.name} because of auto rules`);
            }
          }

          if (!shouldCheck) {
            shouldCheck = v.timestamp + MAX_WAIT < Date.now();
            if (shouldCheck) {
              console.log(`added ${v.name} because of no update in long time`);
            }
          }

          return shouldCheck;
        });

        if (filtered.length > 0) {
          filtered = shuffleArray(filtered);
          //switch to some city
          setTimeout(() => {
            document
              .querySelector(
                "#sidebarBoxVillagelist li a[href*='" + filtered[0].did + "']"
              )
              .click();
          }, delay(`Switching to ${filtered[0].name}`, true, 0));
        } else {
          setTimeout(() => {
            location.reload();
          }, delay("Cooldown, waiting minimal time.", false, MIN_WAIT));
        }
      } else {
        setTimeout(() => {
          location.href = "/dorf1.php";
        }, delay("Switching to resources view"));
      }
    };

    BOT.setNextJob = function () {
      //TODO check if not empty string
      let prog = localStorage.getItem(BOT_IN_PROGRESS);

      const inProgress = prog === "" || prog === null ? null : JSON.parse(prog);

      if (location.pathname.includes("build.php")) {
        if (inProgress !== null) {
          const params = getParams(window.location.search);
          let currentLvl = 0;
          //check if job was done to this leve and if so, complete it
          if (Object.keys(params).includes("gid")) {
            currentLvl = Number(
              document
                .querySelector("div#build")
                .classList[1].replace("level", "")
            );
          }

          if (currentLvl >= inProgress.job.to) {
            return setTimeout(() => {
              localStorage.setItem(BOT_IN_PROGRESS, "");
              this.completeJob(inProgress.job);
              window.location.href = "/dorf1.php";
            }, 5000);
          }
          if (
            inProgress.cid === this.cID &&
            inProgress.job.pos === Number(params.id)
          ) {
            let b = undefined;

            if (inProgress.job.to === 1) {
              if (inProgress.job.cat) {
                let tab = document.querySelector(
                  `#content .contentNavi .scrollingContainer .content a[href*="category=${inProgress.job.cat}"]`
                );
                if (tab && !tab.classList.contains("active")) {
                  return setTimeout(
                    () => {
                      tab.click();
                    },
                    delay("Wrong tab detected. switching tab!"),
                    true
                  );
                }
                b = document
                  .querySelector(`img.g${inProgress.job.gid}`)
                  .parentNode.parentNode.querySelector(".contractLink button");
              }
              //New res field
              else {
                b = document.querySelector(".section1 button.green.build");
              }
            } else {
              //switching tab
              let tab = document.querySelector(
                "#content .contentNavi .scrollingContainer .content a"
              );

              if (tab && !tab.classList.contains("active")) {
                return setTimeout(() => {
                  tab.click();
                }, delay("Wrong tab detected. switching tab!", true));
              }

              b = document.querySelector(".section1 button.green.build");
            }
            return setTimeout(
              () => {
                if (b) {
                  this.completeJob(inProgress.job);
                  localStorage.setItem(BOT_IN_PROGRESS, "");
                  b.click();
                } else console.log("Error! Button for upgrade not found!");
              },
              delay("Perssing build Button"),
              true
            );
          }
        }
      } else if (location.pathname.includes("dorf")) {
        const { storage } = this.current.ress;
        let jobs = this.jobs["c" + this.cID];
        const d1j = jobs.filter((j) => j.gid < 5);
        const d2j = jobs.filter((j) => j.gid > 4);

        const d1q = this.current.queue.filter((q) => q.gid < 5);
        const d2q = this.current.queue.filter((q) => q.gid > 4);

        //ANY JOBS SET?
        if (jobs.length > 0) {
          let nextJob = null;
          //ANYTHING BUILDING?
          if (this.tribe === TRIBE_ROMAN) {
            if (d1q.length === 0 && d1j.length > 0) {
              nextJob = d1j[0];
            } else if (d2q.length === 0 && d2j.length > 0) {
              nextJob = d2j[0];
            }
          } else if (this.current.queue.length === 0) {
            nextJob = jobs[0];
          }
          if (nextJob !== null) {
            const building = this.buildingDB[nextJob.gid - 1];
            const cost = building.getStat(nextJob.to).cost;

            if (
              storage.l1 >= cost[0] &&
              storage.l2 >= cost[1] &&
              storage.l3 >= cost[2] &&
              storage.l4 >= cost[3]
            ) {
              if (
                (nextJob.gid > 4 && location.pathname.includes("dorf1")) ||
                (nextJob.gid < 5 && location.pathname.includes("dorf2"))
              ) {
                return setTimeout(() => {
                  window.location.href = `/dorf${
                    nextJob.gid > 4 ? "2" : "1"
                  }.php`;
                }, delay("Wrong section. Navigating to correct section"));
              }

              localStorage.setItem(
                BOT_IN_PROGRESS,
                JSON.stringify({
                  cid: this.cID,
                  job: nextJob,
                  ress: this.current.ress,
                })
              );

              return clickSite(nextJob.pos);
            }
          }
        }

        if (location.pathname.includes("dorf1")) {
          let available = this.fieldsCollection.filter((f) =>
            f.node.classList.contains("good")
          );
          let upgrade = [];

          //if !upgrade res
          if (this.settings["c" + this.cID].upgradeRes) {
            upgrade = upgrade.concat(available.filter((f) => f.gid < 4));
          }

          if (this.settings["c" + this.cID].upgradeCrop) {
            upgrade = upgrade.concat(available.filter((f) => f.gid === 4));
          }
          console.log("a", available);
          console.log("u", upgrade);

          upgrade = upgrade.sort((a, b) => a.lvl - b.lvl);
          console.log("u s", upgrade);

          if (upgrade.length > 0) {
            let job = upgrade[0];
            localStorage.setItem(
              BOT_IN_PROGRESS,
              JSON.stringify({
                cid: this.cID,
                job: {
                  gid: job.gid,
                  pos: job.pos,
                  lvl: job.lvl,
                  to: job.lvl + 1,
                },
                ress: this.current.ress,
              })
            );
            return clickSite(job.pos, "Auto-Upgrade: ");
          }
        }
      }
      this.switchCity();
    };
    //#region NPC

    function initNPCRules(b) {
      let rules = JSON.parse(localStorage.getItem(NPC_RULES));
      if (!rules) {
        rules = [];
        localStorage.setItem(NPC_RULES, JSON.stringify(rules));
      }
      b.npcRules = rules;
    }

    BOT.setNPCCooldown = function (rule) {
      this.npcRules.find((x) => x.id === rule.id).cooldown =
        Date.now() + NPC_COOLDOWN;
      localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
    };

    BOT.checkNPC = function () {
      let gold = parseInt(
        document
          .querySelector("#header .currency .value")
          .innerText.trim()
          .replace(/\D/g, "")
      );
      let warehouse_capacity = parseInt(
        document
          .querySelector("#stockBar .warehouse .capacity .value")
          .innerText.trim()
          .replace(/\D/g, "")
      );
      let granary_capacity = parseInt(
        document
          .querySelector("#stockBar .granary .capacity .value")
          .innerText.trim()
          .replace(/\D/g, "")
      );

      let percent = [];
      document
        .querySelectorAll("#stockBar .barBox .bar")
        .forEach((b) => percent.push(parseInt(b.style.width.replace("%", ""))));

      let storage = [];
      document
        .querySelectorAll("#stockBar .stockBarButton .value")
        .forEach((b) =>
          storage.push(parseInt(b.innerText.trim().replace(/\D/g, "")))
        );
      const rules = this.npcRules.filter((x) => x.cid === this.cID);

      //TODO && gold >= 3
      if (rules.length > 0) {
        let prog = localStorage.getItem(NPC_IN_PROGRESS);
        const inProgress =
          prog === "" || prog === null ? null : JSON.parse(prog);
        if (inProgress && inProgress.cid !== this.cID) {
          localStorage.setItem(NPC_IN_PROGRESS, "");
          inProgress = null;
        }
        //&& ruleTriggered
        if (
          inProgress &&
          gold >= 3 &&
          Date.now() > inProgress.cooldown &&
          ((inProgress.dir === "a" &&
            inProgress.percent < percent[inProgress.type - 1]) ||
            (inProgress.dir === "b" &&
              inProgress.percent > percent[inProgress.type - 1]))
        ) {
          this.busy = true;
          if (window.location.pathname.includes("dorf2")) {
            return clickGid(17);
          }
          //find and open marketplace
          else if (
            window.location.pathname.includes("build.php") &&
            getParams().gid === "17"
          ) {
            //switching tab
            let tab = document.querySelector(
              "#content .contentNavi .content a"
            );
            if (tab && !tab.classList.contains("active")) {
              return setTimeout(
                () => {
                  tab.click();
                },
                delay("NPC: Wrong tab detected. switching tab!"),
                true
              );
            }

            let b = document.querySelector("#build .npcMerchant button");
            setTimeout(() => {
              b.click();
              setTimeout(() => {
                // BOT.distributeNPC(document.getElementById("npc"))
                const npc = document.getElementById("npc");
                let distButton = document.querySelector("#submitText button");
                let submitButton = document.querySelector(
                  "#submitButton button"
                );
                let total = parseInt(document.querySelector("#sum").innerText);
                let inputs = document.querySelectorAll("td.sel input");

                setTimeout(() => {
                  inputs[0].value = Math.floor(
                    (total / 100) * inProgress.ratio[0]
                  );
                  inputs[1].value = Math.floor(
                    (total / 100) * inProgress.ratio[1]
                  );
                  inputs[2].value = Math.floor(
                    (total / 100) * inProgress.ratio[2]
                  );
                  inputs[3].value = Math.floor(
                    (total / 100) * inProgress.ratio[3]
                  );
                  inputs[0].dispatchEvent(
                    new KeyboardEvent("keyup", { key: "0" })
                  );

                  setTimeout(() => {
                    distButton.click();
                    setTimeout(() => {
                      localStorage.setItem(NPC_IN_PROGRESS, "");
                      this.setNPCCooldown(inProgress);
                      submitButton.click();
                    }, delay("NPC: Pressing confirm.", true));
                  }, delay("NPC: Pressing distribute.", true));
                }, delay("NPC: Filling in fields"));
              }, 300);
            }, delay("NPC: Pressing npc button"));
          } else {
            return setTimeout(() => {
              localStorage.setItem(NPC_IN_PROGRESS, "");
              location.href = "/dorf1.php";
            }, delay("NPC: Wrong location. Canceling", true));
          }
        } else {
          rules.forEach((rule) => {
            //TODO replace with ruleTriggered() function
            if (
              gold >= 3 &&
              Date.now() > rule.cooldown &&
              ((rule.dir === "a" && rule.percent < percent[rule.type - 1]) ||
                (rule.dir === "b" && rule.percent > percent[rule.type - 1]))
            ) {
              this.busy = true;
              localStorage.setItem(NPC_IN_PROGRESS, JSON.stringify(rule));
              //City center? click marketplace else go to dorf2
              if (window.location.pathname.includes("dorf2")) {
                return clickGid(17);
              } else {
                return setTimeout(() => {
                  location.href = "/dorf2.php";
                }, delay("NPC: Navigating to city center"));
              }
            }
          });
        }
      }
    };

    BOT.addNPCRule = function () {
      const iNPC = {};
      const dir = prompt(
        'Please enter "a" for above limit or "b" for bellow limit:'
      ).toLowerCase();
      if (dir != "a" && dir !== "b") {
        alert("wrong input, canceled!");
        return false;
      }
      iNPC.dir = dir;

      const percent = Number(
        prompt(
          "Please enter percentage storage limit at which NPC will be done:\n (between 0 and 100)"
        ).toLowerCase()
      );
      if (percent < 0 && percent > 100) {
        alert("wrong input, canceled!");
        return false;
      }
      iNPC.percent = percent;

      const type = Number(
        prompt(
          "which resource do you want to watch? \n1 - Lumber\n2 - Clay\n3 - Iron\n4 - Crop"
        )
      );
      if (type < 1 || type > 4) {
        alert("wrong input, canceled!");
        return false;
      }
      iNPC.type = type;

      const ratio = prompt(
        'Resource percent ratio seperated by comma (must add up to 100):\n i.e.: "30, 30, 30, 10" , will be changed to 30% Lumber, 30% Clay, 30% Iron, 10% Crop after NPC'
      );
      let ratioArr = ratio.split(",").map((x) => Number(x));
      if (
        ratioArr.length !== 4 &&
        ratioArr.reduce((a, b) => a + b, 0) !== 100
      ) {
        alert("wrong input, total needs to add to 100%. Canceled!");
        return false;
      }
      const p = 100.0 / ratioArr.reduce((a, b) => a + b, 0);
      ratioArr = ratioArr.map((x) => Math.round(x * p));
      iNPC.ratio = ratioArr;

      const s =
        "You are setting up this NPC rule: \n" +
        `if ${typeNames[type - 1].name} is ${
          dir === "a" ? "above" : "below"
        } ${percent}%, then distribute to ratio ${ratioArr[0]}% ${
          ratioArr[1]
        }% ${ratioArr[2]}% ${ratioArr[3]}%` +
        "\n" +
        "Press OK to confirm!";

      if (confirm(s)) {
        const cooldown = Date.now();
        iNPC.id = dir + type + "_" + this.cID + percent + "_" + cooldown;
        iNPC.cid = this.cID;
        iNPC.cooldown = cooldown;
        this.npcRules.push(iNPC);
        localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
        this.displayNPCRules();
        ///RERENDER function here later
        // const newSpan = this.npcPanel.appendChild(document.createElement("span"))
        //  newSpan.innerText = `${typeNames[type - 1]} ${dir === "a" ? ">" : "<"} ${percent}% : ${ratio}`
      }
    };

    BOT.displayNPCRules = function () {
      let rules = this.npcRules.filter((x) => x.cid === this.cID);
      this.npcPanel.innerHTML = "";
      if (rules.length > 0) {
        rules.forEach((r) => {
          const node = document.createElement("div");
          const nodeButton = node.appendChild(document.createElement("span"));
          const nodeText = node.appendChild(document.createElement("span"));
          nodeText.style.cssText = "display: inline-flex; align-items: center;";
          node.style.cssText =
            "font-size: 10px; line-height:10px; display: flex; align-items: center;";
          nodeButton.style.cssText =
            "width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px";
          nodeButton.textContent = "x";
          nodeButton.onclick = (e) => {
            this.npcRules = this.npcRules.filter((x) => x.id !== r.id);
            localStorage.setItem(NPC_RULES, JSON.stringify(this.npcRules));
            localStorage.setItem(NPC_IN_PROGRESS, "");
            node.remove();
            this.displayNPCRules();
          };
          nodeText.innerHTML = `${typeNames[r.type - 1].icon(12)} ${
            r.dir === "a" ? ">" : "<"
          } ${r.percent}% &nbsp;=&nbsp;${typeNames[0].icon(12)}${
            r.ratio[0]
          }%, &nbsp;${typeNames[1].icon(12)}${
            r.ratio[1]
          }%, &nbsp;${typeNames[2].icon(12)}${
            r.ratio[2]
          }%, &nbsp;${typeNames[3].icon(12)}${r.ratio[3]}%`;
          this.npcPanel.appendChild(node);
        });
      } else {
        this.npcPanel.innerText = "No rules created yet.";
      }
    };

    //FARMLIST REGION
    function initFarmingRules(b) {
      let rules = JSON.parse(localStorage.getItem(FARM_RULES));
      if (!rules) {
        rules = [];
        localStorage.setItem(FARM_RULES, JSON.stringify(rules));
      }
      b.npcRules = rules;
      console.log("Rules: ", rules);

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

    initJobQueue(BOT);
    initFarmingRules(BOT);
    BOT.displayJobs();

    initNPCRules(BOT);
    BOT.displayNPCRules();

    // let prog = localStorage.getItem(BOT_IN_PROGRESS)
    // const inProgress = prog === "" || prog === null ? null : JSON.parse(prog)

    if (ON) {
      console.log("Starting bot");
      BOT.checkNPC();
      if (!BOT.busy) {
        BOT.setNextJob();
      }
    }

    console.log(BOT);
  }
}

allInOneOpera();
