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

const initBotPower = () => {
  let BOT_ON = localStorage.getItem(BOT_POWER) === ON;
  const subscribers = [];

  //const user = ;

  const subscribe = (f) => {
    subscribers.push(f);
    f(BOT_ON);
  };

  const notify = () => {
    console.log("auth state changed");
    subscribers.forEach((f) => f(BOT_ON));
  };

  const toggle = () => {
    if (!BOT_ON) BOT_ON = firebase.auth().currentUser ? true : false;
    else BOT_ON = false;
    localStorage.setItem(BOT_POWER, BOT_ON ? ON : OFF);
    notify();
    return BOT_ON;
  };
  return { on: BOT_ON, toggle, subscribe, notify };
};

const BotPower = initBotPower();

firebase.auth().onAuthStateChanged((user) => {
  BotPower.notify();
  // if (user) {
  //   // User is signed in, see docs for a list of available properties
  //   // https://firebase.google.com/docs/reference/js/firebase.User
  //   var uid = user.uid;
  //   console.log("signed in");
  //   // ...
  // } else {
  //   // User is signed out
  //   // ...
  //   console.log("not signed in");
  //   if (BotPower.on) {
  //     console.log("switching bot off");
  //     BotPower.toggle();
  //   }
  //   //  signInPrompt();
  // }
});
