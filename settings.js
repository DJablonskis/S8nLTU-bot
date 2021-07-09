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
