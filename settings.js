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

  const notify = () => {
    subscribers.forEach((f) => f(ON_S));
  };

  const toggle = () => {
    ON_S = !ON_S;
    localStorage.setItem(BOT_STATS, ON_S ? ON : OFF);
    notify();
  };
  return { on: ON_S, toggle, subscribe };
};

const DetailedStats = initDetailedStats();

const initBotPower = () => {
  let initialised = false;
  let BOT_ON = localStorage.getItem(BOT_POWER) === ON;
  const subscribers = [];

  const subscribe = (f) => {
    subscribers.push(f);
    f(BOT_ON);
  };

  const notify = () => {
    console.log("auth state changed");
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

  return { on: BOT_ON, toggle, subscribe };
};

const BotPower = initBotPower();
