const shouldRun = () => {
  return (
    document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    ).length > 0
  );
};

const ShouldRun = shouldRun();
const MIN_WAIT = 3 * 1000 * 60;
const MAX_WAIT = 20 * 1000 * 60;
const NPC_COOLDOWN = 10 * 1000 * 60;
const DELAY_FAST = 1;
const DELAY_SLOW = 4;

const initBotPower = () => {
  let BOT_ON = localStorage.getItem(BOT_POWER) === ON;
  const subscribers = [];

  const subscribe = (f) => {
    subscribers.push(f);
    f(BOT_ON);
  };

  const toggle = () => {
    BOT_ON = !BOT_ON;
    localStorage.setItem(BOT_POWER, BOT_ON ? ON : OFF);
    subscribers.forEach((f) => f(BOT_ON));
    return BOT_ON;
  };
  return { on: BOT_ON, toggle, subscribe };
};

const BotPower = initBotPower();
