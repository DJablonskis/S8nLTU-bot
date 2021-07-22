//Chainable tasks with delay
// utility function for returning a promise that resolves after a delay
function doAfter(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

Promise.doAfter = function (fn, t) {
  // fn is an optional argument
  if (!t) {
    t = fn;
    fn = function () {};
  }
  return doAfter(t).then(fn);
};

Promise.prototype.doAfter = function (fn, t) {
  // return chained promise
  return this.then(function () {
    return Promise.doAfter(fn, t);
  });
};

//Returns index of provided child in the parent
function whichChild(elem) {
  var i = 0;
  while ((elem = elem.previousSibling) != null) ++i;
  return i;
}

const msToTimeString = (t, hours = true) => {
  function pad(n, z) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }
  let string = "";

  if (t > 0) {
    var ms = t % 1000;
    t = (t - ms) / 1000;
    var s = t % 60;
    t = (t - s) / 60;
    var min = t % 60;
    var h = (t - min) / 60;

    if (hours) string += pad(h) + ":";
    string += pad(min) + ":" + pad(s);
  }

  return string;
};

const getParams = (loc = window.location.search) =>
  loc
    .slice(1)
    .split("&")
    .reduce((acc, s) => {
      const [k, v] = s.split("=");
      return Object.assign(acc, { [k]: v });
    }, {});

//Reurns int current gold balance
const getGoldBalance = () =>
  parseInt(
    document
      .querySelector("#header .currency .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );

let GoldBalance;
if (ShouldRun) GoldBalance = getGoldBalance();

const getCurrentVillage = () => {
  const active = document.querySelector(
    "div#sidebarBoxVillagelist > div.content > ul > li.active"
  );

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

//Returns int of warehouse capacity
const getWarehouseCapacity = () =>
  parseInt(
    document
      .querySelector("#stockBar .warehouse .capacity .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );

//Returns int of granary capacity
const getGranaryCapacity = () =>
  parseInt(
    document
      .querySelector("#stockBar .granary .capacity .value")
      .innerText.trim()
      .replace(/\D/g, "")
  );

//Returns array of storage percentage
const getResoursesPercent = () => {
  let percent = [];
  document
    .querySelectorAll("#stockBar .barBox .bar")
    .forEach((b) => percent.push(parseInt(b.style.width.replace("%", ""))));

  return percent;
};

//Returns int array of current storage
const getResoursesCount = () => {
  let storage = [];
  document
    .querySelectorAll("#stockBar .stockBarButton .value")
    .forEach((b) =>
      storage.push(parseInt(b.innerText.trim().replace(/\D/g, "")))
    );
  return storage;
};

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

//DETECTS incoming attacks
//document.querySelectorAll("table#movements > tbody > tr >td.typ > a > img.att1 ").length>0

const icon = (type, x = 20) => {
  const t = ["lumber", "clay", "iron", "crop"];
  if (type < 4)
    return `<i class="${t[type]}_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:1px;"></i>`;
  else
    return type === 4
      ? `<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/warehouse_medium.png'); margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`
      : `<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/granary_medium.png');margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`;
};

const typeNames = [
  { name: "Lumber", icon: icon(0) },
  { name: "Clay", icon: icon(1) },
  { name: "Iron", icon: icon(2) },
  { name: "Crop", icon: icon(3) },
];

function clickSite(id, message) {
  setTimeout(() => {
    let gid = "";

    if (id > 18) {
      let g = Number(
        document
          .querySelector(`#villageContent .buildingSlot.a${id}`)
          .classList[2].replace("g", "")
      );
      if (g !== 0) gid = `&gid=${g}`;
    }

    window.location.href = `/build.php?id=${id}${gid}`;
  }, Status.update(message));
}

function clickGid(gid) {
  setTimeout(() => {
    document
      .querySelector(
        `${gid < 5 ? ".village1" : ".village2"} a[href*="&gid=${gid}"]`
      )
      .click();
  }, Status.update("Clicking " + buildings[gid - 1].name));
}

const navigateTo = (n) =>
  document.querySelector(`#navigation>a[accessKey="${n}"] `).click();

const getAllVillages = () => {
  const citiesO = {};
  const citiesA = [];
  let villages = document.querySelectorAll(
    "div#sidebarBoxVillagelist > div.content > ul > li"
  );
  villages.forEach((vil) => {
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

    let did = getParams("?" + vil.querySelector("a").href.split("?")[1]).newdid;
    citiesO[did] = {
      name,
      coords: { x, y },
      node: vil,
    };
    citiesA.push({
      name,
      coords: { x, y },
      did,
      node: vil,
    });
  });

  return {
    all: citiesA,
    get: (id) => citiesO[id],
  };
};
let Villages;
if (ShouldRun) Villages = getAllVillages();

const getResourceFields = () => {
  const resourceFields = [];
  const res_fields = document.querySelectorAll(
    "#resourceFieldContainer > .level"
  );

  res_fields.forEach((link) => {
    let upgrading = link.classList.contains("underConstruction");

    let status = "maxLevel";
    if (link.classList.contains("good")) status = "good";
    else if (link.classList.contains("notNow")) status = "notNow";
    else if (link.classList.contains("maxLevel")) status = "maxLevel";

    let lvl = Number(link.classList.value.split("level").pop());
    let pos = Number(
      link.classList.value.split("buildingSlot")[1].split(" ")[0]
    );
    let gid = Number(link.classList.value.split("gid")[1].split(" ")[0]);
    resourceFields.push({
      status,
      upgrading,
      link,
      pos,
      gid,
      lvl,
    });
  });

  return resourceFields;
};
const Dorf1Slots = window.location.pathname.includes("dorf1")
  ? getResourceFields()
  : null;

const getBuildingSlots = () => {
  const buildings = [];
  let building_nodes = [
    ...document.querySelectorAll(".village2 div.buildingSlot"),
  ];
  //REMOVING SECOND WALL
  if (building_nodes.length > 21) building_nodes.pop();

  building_nodes.forEach((node) => {
    let pos = Number(node.classList[1].substring(1));
    let gid = Number(node.classList[2].substring(1));

    let lvl = 0;
    let status = "maxLevel";
    let upgrading = false;
    let link = node.querySelector("a");
    if (gid !== 0) {
      let levelNode = node.querySelector("div.labelLayer");
      lvl = Number(levelNode.textContent);
      upgrading = link.classList.contains("underConstruction");
      if (link.classList.contains("good")) status = "good";
      else if (link.classList.contains("notNow")) status = "notNow";
      else if (link.classList.contains("maxLevel")) status = "maxLevel";
    } else {
      status = "empty";
    }
    buildings.push({ status, upgrading, link, pos, gid, lvl });
  });
  return buildings;
};
const Dorf2Slots = window.location.pathname.includes("dorf2")
  ? getBuildingSlots()
  : null;

const getTribe = () => {
  let index;
  // "tribe" + id
  const id = ["1", "2", "3", "6", "7"];
  const name = ["roman", "teuton", "gaul", "egyptian", "egiptian"];
  const wall = [31, 32, 33, 42, 43];

  const getIndex = (x) => {
    let i;
    if (x === "1" || x === "roman") i = 0;
    else if (x === "2" || x === "teuton") i = 1;
    else if (x === "3" || x === "gaul") i = 2;
    else if (x === "6" || x === "egyptian") i = 3;
    else if (x === "7" || x === "hun") i = 4;

    return i;
  };
  if (Dorf1Slots) {
    index = getIndex(
      [...document.querySelector("#resourceFieldContainer").classList]
        .pop()
        .slice(-1)
    );
  } else if (Dorf2Slots) {
    index = getIndex(
      [...document.querySelector(".village2 .buildingSlot").classList].pop()
    );
  }

  return index ? { id: id[index], name: name[index], wall: WALL[index] } : null;
};
let Tribe;
if (ShouldRun) Tribe = getTribe();

const blueButton = (text) => {
  let button = document.createElement("button");
  button.className = "textButtonV1 green blue";
  button.innerText = text;
  return button;
};

let TogglePathPower =
  "M10,6.978c-1.666,0-3.022,1.356-3.022,3.022S8.334,13.022,10,13.022s3.022-1.356,3.022-3.022S11.666,6.978,10,6.978M10,12.267c-1.25,0-2.267-1.017-2.267-2.267c0-1.25,1.016-2.267,2.267-2.267c1.251,0,2.267,1.016,2.267,2.267C12.267,11.25,11.251,12.267,10,12.267 M18.391,9.733l-1.624-1.639C14.966,6.279,12.563,5.278,10,5.278S5.034,6.279,3.234,8.094L1.609,9.733c-0.146,0.147-0.146,0.386,0,0.533l1.625,1.639c1.8,1.815,4.203,2.816,6.766,2.816s4.966-1.001,6.767-2.816l1.624-1.639C18.536,10.119,18.536,9.881,18.391,9.733 M16.229,11.373c-1.656,1.672-3.868,2.594-6.229,2.594s-4.573-0.922-6.23-2.594L2.41,10l1.36-1.374C5.427,6.955,7.639,6.033,10,6.033s4.573,0.922,6.229,2.593L17.59,10L16.229,11.373z";

let TogglePathNotifications =
  "M17.657,2.982H2.342c-0.234,0-0.425,0.191-0.425,0.426v10.21c0,0.234,0.191,0.426,0.425,0.426h3.404v2.553c0,0.397,0.48,0.547,0.725,0.302l2.889-2.854h8.298c0.234,0,0.426-0.191,0.426-0.426V3.408C18.083,3.174,17.892,2.982,17.657,2.982M17.232,13.192H9.185c-0.113,0-0.219,0.045-0.3,0.124l-2.289,2.262v-1.96c0-0.233-0.191-0.426-0.425-0.426H2.767V3.833h14.465V13.192z M10,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.488-0.668,1.488-1.489C11.488,7.905,10.821,7.237,10,7.237 M10,9.364c-0.352,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C10.638,9.077,10.351,9.364,10,9.364 M14.254,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489s1.489-0.668,1.489-1.489C15.743,7.905,15.075,7.237,14.254,7.237 M14.254,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.352,0,0.639,0.287,0.639,0.638C14.893,9.077,14.605,9.364,14.254,9.364 M5.746,7.237c-0.821,0-1.489,0.668-1.489,1.489c0,0.821,0.668,1.489,1.489,1.489c0.821,0,1.489-0.668,1.489-1.489C7.234,7.905,6.566,7.237,5.746,7.237 M5.746,9.364c-0.351,0-0.638-0.288-0.638-0.638c0-0.351,0.287-0.638,0.638-0.638c0.351,0,0.638,0.287,0.638,0.638C6.384,9.077,6.096,9.364,5.746,9.364";

let TogglePathStatistics =
  "M17.431,2.156h-3.715c-0.228,0-0.413,0.186-0.413,0.413v6.973h-2.89V6.687c0-0.229-0.186-0.413-0.413-0.413H6.285c-0.228,0-0.413,0.184-0.413,0.413v6.388H2.569c-0.227,0-0.413,0.187-0.413,0.413v3.942c0,0.228,0.186,0.413,0.413,0.413h14.862c0.228,0,0.413-0.186,0.413-0.413V2.569C17.844,2.342,17.658,2.156,17.431,2.156 M5.872,17.019h-2.89v-3.117h2.89V17.019zM9.587,17.019h-2.89V7.1h2.89V17.019z M13.303,17.019h-2.89v-6.651h2.89V17.019z M17.019,17.019h-2.891V2.982h2.891V17.019z";

let TogglePathSettings =
  "M6.176,7.241V6.78c0-0.221-0.181-0.402-0.402-0.402c-0.221,0-0.403,0.181-0.403,0.402v0.461C4.79,7.416,4.365,7.955,4.365,8.591c0,0.636,0.424,1.175,1.006,1.35v3.278c0,0.222,0.182,0.402,0.403,0.402c0.222,0,0.402-0.181,0.402-0.402V9.941c0.582-0.175,1.006-0.714,1.006-1.35C7.183,7.955,6.758,7.416,6.176,7.241 M5.774,9.195c-0.332,0-0.604-0.272-0.604-0.604c0-0.332,0.272-0.604,0.604-0.604c0.332,0,0.604,0.272,0.604,0.604C6.377,8.923,6.105,9.195,5.774,9.195 M10.402,10.058V6.78c0-0.221-0.181-0.402-0.402-0.402c-0.222,0-0.402,0.181-0.402,0.402v3.278c-0.582,0.175-1.006,0.714-1.006,1.35c0,0.637,0.424,1.175,1.006,1.351v0.461c0,0.222,0.181,0.402,0.402,0.402c0.221,0,0.402-0.181,0.402-0.402v-0.461c0.582-0.176,1.006-0.714,1.006-1.351C11.408,10.772,10.984,10.233,10.402,10.058M10,12.013c-0.333,0-0.604-0.272-0.604-0.604S9.667,10.805,10,10.805c0.332,0,0.604,0.271,0.604,0.604S10.332,12.013,10,12.013M14.629,8.448V6.78c0-0.221-0.182-0.402-0.403-0.402c-0.221,0-0.402,0.181-0.402,0.402v1.668c-0.581,0.175-1.006,0.714-1.006,1.35c0,0.636,0.425,1.176,1.006,1.351v2.07c0,0.222,0.182,0.402,0.402,0.402c0.222,0,0.403-0.181,0.403-0.402v-2.07c0.581-0.175,1.006-0.715,1.006-1.351C15.635,9.163,15.21,8.624,14.629,8.448 M14.226,10.402c-0.331,0-0.604-0.272-0.604-0.604c0-0.332,0.272-0.604,0.604-0.604c0.332,0,0.604,0.272,0.604,0.604C14.83,10.13,14.558,10.402,14.226,10.402 M17.647,3.962H2.353c-0.221,0-0.402,0.181-0.402,0.402v11.27c0,0.222,0.181,0.402,0.402,0.402h15.295c0.222,0,0.402-0.181,0.402-0.402V4.365C18.05,4.144,17.869,3.962,17.647,3.962 M17.245,15.232H2.755V4.768h14.49V15.232z";
const blueToggle = (path = "") => {
  let button = document.createElement("a");
  button.classList.add(
    "layoutButton",
    "buttonFramed",
    "withIcon",
    "round",
    "green",
    "blue"
  );

  button.innerHTML = `<svg class="edit" viewBox="0 0 20 20"><path d="${path}"></path></svg >`;

  return button;
};

const checkboxToggle = (checked) => {
  let l = document.createElement("label");
  l.className = "switch";
  l.innerHTML = `<input type="checkbox" ${
    checked ? "checked" : ""
  }><span class="slider round"></span>`;
  return l;
};
