const HeroStatus = document.querySelector(
  "#topBarHeroWrapper #topBarHero .heroStatus svg"
).className;

const heroButton = document.getElementById("heroImageButton");
const adventuresButton = document.querySelector("#topBarHero a.adventure");

const heroStatus = [
  "heroHome",
  "heroReinforcing",
  "heroRunning",
  "heroDead",
  "heroTrapped",
  "heroReviving",
];
