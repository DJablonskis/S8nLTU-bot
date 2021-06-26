function whichChild(elem) {
  var i = 0;
  while ((elem = elem.previousSibling) != null) ++i;
  return i;
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

const getParams = (loc = window.location.search) =>
  loc
    .slice(1)
    .split("&")
    .reduce((acc, s) => {
      const [k, v] = s.split("=");
      return Object.assign(acc, { [k]: v });
    }, {});

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

const shouldRun = () => {
  return (
    document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    ).length > 0
  );
};
