const ShouldRun = (() => {
  return (
    document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    ).length > 0
  );
})();

const MIN_WAIT = 3 * 1000 * 60;
const MAX_WAIT = 20 * 1000 * 60;
const NPC_COOLDOWN = 10 * 1000 * 60;
const DELAY_FAST = 1;
const DELAY_SLOW = 3;

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
};

const initBotOptions = () => {
  let options = JSON.parse(localStorage.getItem(PANEL_OPTIONS));

  if (!options) options = {};
  options.keepOnTop = options.keepOnTop ? true : false;
  options.settingsOpen = options.settingsOpen ? true : false;
  options.sendToAdventures = options.sendToAdventures ? true : false;
  options.sendToClosestFirst = options.sendToClosestFirst ? true : false;
  options.sendToHardestFirst = options.sendToHardestFirst ? true : false;

  if (!options.minHealt || options.minHealt < 1 || options.minHealt > 100)
    options.minHealt = 100;

  const subscribers = [];
  const subscribe = (f) => {
    subscribers.push(f);
    f(options);
  };

  const get = (key = "") => {
    if (key) return options[key];
    else return options;
  };

  const set = (key, value) => {
    options[key] = value;
    save();
  };

  const notify = () => {
    subscribers.forEach((f) => f(options));
  };

  const save = () => {
    localStorage.setItem(PANEL_OPTIONS, JSON.stringify(options));
  };

  const toggle = (key) => {
    options[key] = !options[key];
    console.log("settings changed: ", options);
    save();
    notify();
  };

  return { get, toggle, subscribe, set };
};

const BotOptions = initBotOptions();

const initBotPower = () => {
  let initialised = false;
  let BOT_ON = localStorage.getItem(BOT_POWER) === ON;
  const subscribers = [];

  const subscribe = (f) => {
    subscribers.push(f);
    f(BOT_ON);
  };

  const get = () => {
    return BOT_ON;
  };

  const notify = () => {
    if (initialised) subscribers.forEach((f) => f(BOT_ON));
  };

  const toggle = () => {
    if (!BOT_ON) BOT_ON = firebase.auth().currentUser ? true : false;
    else BOT_ON = false;
    localStorage.setItem(BOT_POWER, BOT_ON ? ON : OFF);
    notify();
    return BOT_ON;
  };

  firebase.auth().onAuthStateChanged((user) => {
    initialised = true;
    notify();
  });

  return { get, toggle, subscribe };
};

const BotPower = initBotPower();
