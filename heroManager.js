const initHeroManager = () => {
  const heroStatus = document.querySelector(
    "#topBarHeroWrapper #topBarHero .heroStatus svg"
  ).classList[0];

  let mask = document.querySelector("#healthMask path").getAttribute("d");

  let bar = document
    .querySelector("#topBarHeroWrapper #topBarHero .health path.title")
    .getAttribute("d");

  let getAngle = (d, radius = 55) => {
    angle = d.split("L")[1].split("A");
    let angle_start = angle[0].split(" ");
    let angle_end = angle[1].split(" ");

    let x1 = Number(angle_start[0]);
    let y1 = Number(angle_start[1]);

    let y2 = Number(angle_end.pop());
    let x2 = Number(angle_end.pop());

    let dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    let ang = 2 * Math.asin(dist / (2 * radius)) * (180 / Math.PI);
    return ang;
  };

  let h1 = getAngle(mask);
  let h2 = getAngle(bar);

  let health = Math.round((h1 / h2) * 100);

  //console.log("dist", dist);

  //let health = Math.round((dist / 85.45) * 100);
  //console.log("h: ", health);

  //let ang = Math.asin((dist / (2 * 55)) * 2);

  //console.log("ang ", ang);
  const adventuresButton = document.querySelector("#topBarHero a.adventure");

  const openInventory = () => {
    document.getElementById("heroImageButton").click();
  };
  const openAdventures = () => {
    adventuresButton.click();
  };

  let hasAdventure = adventuresButton.classList.contains("attention");
  let adventureCount = hasAdventure
    ? Number(adventuresButton.querySelector("div.content").innerText)
    : 0;

  const statusEnum = [
    "heroHome",
    "heroReinforcing",
    "heroRunning",
    "heroDead",
    "heroTrapped",
    "heroReviving",
  ];

  if (location.pathname === "/hero/adventures") {
    if (adventureCount > 0) {
      let adventures = [
        ...document.querySelectorAll("#adventureListForm tbody tr"),
      ];
      console.log(adventures);
      if (adventures > 1) {
        //do sorting
      }
    }
  }
  return {
    heroStatus,
    health,
    adventureCount,
    openAdventures,
    openInventory,
  };
};

if (ShouldRun) {
  const HeroManager = initHeroManager();
  console.log("hero manager", HeroManager);
}
