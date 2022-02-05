const ShouldRun = unsafeWindow.resources;

const getParams = (loc = window.location.search) =>
  loc
    .slice(1)
    .split("&")
    .reduce((acc, s) => {
      const [k, v] = s.split("=");
      return Object.assign(acc, { [k]: v });
    }, {});

const getCurrentVillage = () => {
  const active = document.querySelector(".villageList .listEntry.active");

  let name = active.querySelector("span.name").textContent.trim();
  let x = Number(
    active
      .querySelector("span.coordinateX")
      .textContent.trim()
      .slice(1)
      .replace(/\u202c|\u202d|/g, "")
      .replace(/\u2212/g, "-")
  );
  let y = Number(
    active
      .querySelector("span.coordinateY")
      .textContent.trim()
      .slice(0, -1)
      .replace(/\u202c|\u202d|/g, "")
      .replace(/\u2212/g, "-")
  );
  let did = getParams(
    "?" + active.querySelector("a").href.split("?")[1]
  ).newdid;

  return {
    name,
    did,
    coords: { x, y },
  };
};
let CurrentVillage;
if (ShouldRun) CurrentVillage = getCurrentVillage();

const MIN_WAIT = 5 * 1000 * 60;
const MAX_WAIT = 25 * 1000 * 60;
const NPC_COOLDOWN = 10 * 1000 * 60;
const DELAY_FAST = 3;
const DELAY_SLOW = 7;

initDetailedStats = () => {
  let ON_S = localStorage.getItem(BOT_STATS) === ON;
  const subscribers = [];

  const subscribe = (f) => {
    subscribers.push(f);
    f(ON_S);
  };

  const get = () => {
    return ON_S;
  };

  const notify = () => {
    subscribers.forEach((f) => f(ON_S));
  };

  const toggle = () => {
    ON_S = !ON_S;
    localStorage.setItem(BOT_STATS, ON_S ? ON : OFF);
    notify();
  };
  return { get, toggle, subscribe };
};

const DetailedStats = initDetailedStats();

const optionKeys = {
  keepOnTop: "keepOnTop",
  settingsOpen: "settingsOpen",
  sendToAdventures: "sendToAdventures",
  sendToClosestFirst: "sendToClosestFirst",
  sendToHardestFirst: "sendToHardestFirst",
  minHealt: "minHealt",
  watchAds: "watchAds",
  prioritise: "prioritise",
  jobsListExpanded: "jobsListExpanded",
  upgradeRess: "upgradeRess",
  upgradeCrop: "upgradeCrop",
  collectRewards: "collectRewards",
};

let botOptionsArray = [
  optionKeys.sendToAdventures,
  optionKeys.sendToClosestFirst,
  optionKeys.sendToHardestFirst,
  optionKeys.keepOnTop,
  optionKeys.settingsOpen,
  optionKeys.collectRewards,
];

let villOptionsArray = [
  optionKeys.upgradeRess,
  optionKeys.upgradeCrop,
  optionKeys.watchAds,
  optionKeys.prioritise,
  optionKeys.jobsListExpanded,
];

const initBotOptions = (did) => {
  const didKey = "village-" + did;
  const loadBotOptions = () => {
    let botOptions = JSON.parse(localStorage.getItem(PANEL_OPTIONS));
    if (!botOptions) {
      botOptions = {};
    }
    if (
      !botOptions.minHealt ||
      botOptions.minHealt < 1 ||
      botOptions.minHealt > 100
    )
      botOptions.minHealt = 100;

    let initBotBoolOptions = (keys) => {
      keys.forEach((key) => {
        botOptions[key] = botOptions[key] ? true : false;
      });
    };

    initBotBoolOptions(botOptionsArray);

    return botOptions;
  };

  const loadVillageOptions = (dk, single = false) => {
    let villageOptions = JSON.parse(localStorage.getItem(VILLAGE_OPTIONS));
    if (!villageOptions) villageOptions = {};
    if (!villageOptions[dk]) villageOptions[dk] = {};

    let initVillageBoolOptions = (keys) => {
      keys.forEach((key) => {
        villageOptions[dk][key] = villageOptions[dk][key] ? true : false;
      });
    };
    initVillageBoolOptions(villOptionsArray);

    return single ? villageOptions[dk] : villageOptions;
  };

  let botOptions = loadBotOptions();
  let villageOptions = loadVillageOptions(didKey);
  let options = () => ({ ...botOptions, ...villageOptions[didKey] });
  const subscribers = [];
  const subscribe = (f) => {
    subscribers.push(f);
    f(options());
  };

  const get = (key = "") => {
    if (key) return options()[key];
    else return options();
  };

  const getVillageSettings = (did) => {
    if (did === CurrentVillage.did) return options();
    else if (villageOptions["village-" + did]) {
      return villageOptions["village-" + did];
    } else
      return {
        upgradeCrop: false,
        upgradeRess: false,
        prioritise: false,
        watchAds: false,
        jobsListExpanded: false,
      };
  };

  const notify = () => {
    subscribers.forEach((f) => f(options()));
  };

  const set = (key, value) => {
    //Bot option
    if (Object.keys(botOptions).includes(key)) {
      botOptions[key] = value;
      localStorage.setItem(PANEL_OPTIONS, JSON.stringify(botOptions));
    }
    //village option
    else {
      villageOptions[didKey][key] = value;
      localStorage.setItem(VILLAGE_OPTIONS, JSON.stringify(villageOptions));
    }

    notify();
  };

  const toggle = (key) => {
    let val;
    if (Object.keys(botOptions).includes(key)) {
      val = !botOptions[key];
    } else {
      val = !villageOptions[didKey][key];
    }
    set(key, val);
  };

  return { get, getVillageSettings, toggle, subscribe, set };
};

let BotOptions;
if (ShouldRun) BotOptions = initBotOptions(CurrentVillage.did);

const initBotPower = () => {
  let BOT_ON = localStorage.getItem(BOT_POWER) === ON;
  const subscribers = [];

  const subscribe = (f) => {
    subscribers.push(f);
    f(BOT_ON);
  };

  const get = () => {
    return BOT_ON;
  };

  const notify = () => subscribers.forEach((f) => f(BOT_ON));

  const toggle = () => {
    BOT_ON = !BOT_ON;
    localStorage.setItem(BOT_POWER, BOT_ON ? ON : OFF);
    notify();
    return BOT_ON;
  };

  return { get, toggle, subscribe };
};

const BotPower = initBotPower();
