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

const GoldBalance = getGoldBalance();

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

const CurrentVillage = getCurrentVillage();

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

const shouldRun = () => {
  return (
    document.querySelectorAll(
      "div#sidebarBoxVillagelist > div.content > ul > li"
    ).length > 0
  );
};

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

const Villages = getAllVillages();

const getResourceFields = () => {
  const resourceFields = [];
  const res_fields = document.querySelectorAll(
    "#resourceFieldContainer > .level"
  );

  res_fields.forEach((link) => {
    let upgrading = link.classList.contains("underConstruction");

    let status = "unknown";
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
    ...document.querySelectorAll("#village_map > div.buildingSlot"),
  ];
  //REMOVING SECOND WALL
  building_nodes.pop();

  building_nodes.forEach((node) => {
    console.log("next: ", node);

    let pos = Number(node.classList[1].substring(1));
    let gid = Number(node.classList[2].substring(1));

    let lvl = 0;
    let status = "unknown";
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
