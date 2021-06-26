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

function iS(lastTime, ress) {
  let sec = Date.now() - lastTime;
  var ms = sec % 1000;
  sec = (sec - ms) / 1000;

  var style = "display: flex; font-size: 10px; align-items: center;";

  let p_r1 = Math.floor(
    ((ress.production.l1 * 1.0) / 3600) * sec + ress.storage.l1
  );
  p_r1 = p_r1 < ress.capacity.l1 ? p_r1 : ress.capacity.l1;
  let c_r1 = cC(p_r1, ress.production.l1, ress.capacity.l1);

  let p_r2 = Math.floor(
    ((ress.production.l2 * 1.0) / 3600) * sec + ress.storage.l2
  );
  p_r2 = p_r2 < ress.capacity.l2 ? p_r2 : ress.capacity.l2;
  let c_r2 = cC(p_r2, ress.production.l12, ress.capacity.l2);

  let p_r3 = Math.floor(
    ((ress.production.l3 * 1.0) / 3600) * sec + ress.storage.l3
  );
  p_r3 = p_r3 < ress.capacity.l3 ? p_r3 : ress.capacity.l3;
  let c_r3 = cC(p_r3, ress.production.l3, ress.capacity.l3);

  let p_r4 = Math.floor(
    ((ress.production.l4 * 1.0) / 3600) * sec + ress.storage.l4
  );
  p_r4 = p_r4 < ress.capacity.l4 ? p_r4 : ress.capacity.l4;
  let c_r4 = cC(p_r4, ress.production.l4, ress.capacity.l4);

  return ` <span style="${c_r1 + style}">${r1i(
    10
  )}${p_r1}</span>        <span style="${c_r2 + style}">${r2i(
    10
  )}${p_r2}</span>        <span style="${c_r3 + style}">${r3i(
    10
  )}${p_r3}</span>        <span style="${c_r4 + style}">${r4i(
    10
  )}${p_r4}</span>`;
}

function getStorageMax(capacity, storage, production) {
  if (capacity === storage && ON_N) {
    new Notification("Prisipilde resursai!", {
      body: `Resources are full!`,
      icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
      image:
        "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
    });
  }

  if (storage === 0 && production < 0 && ON_N) {
    new Notification("Baigesi grudai!!!!", {
      body: `Granary is empty!`,
      icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
      image:
        "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
    });
  }

  if (production == 0) {
    return MIN_WAIT;
  }
  if (production > 0) {
    return Math.ceil(((capacity - storage) / production) * 60 * 60 * 1000);
  }
  return Math.ceil((storage / production) * 60 * 60 * 1000 * -1);
}

function cC(s, p, c) {
  var color = " color:black; ";
  var ratio = (s * 1.0) / c;
  if (ratio > 0.2) {
    if (ratio > 0.5) {
      color = " color:green; ";
    }
    if (ratio > 0.8) {
      color = " color:#e45f00; ";
    }
    if (ratio > 0.9) {
      color = " color:#e62020d; ";
    }
  } else if (p < 0) {
    color = " color:#e62020; ";
  }
  return color;
}

function getStorageMax(capacity, storage, production) {
  if (capacity === storage && ON_N) {
    new Notification("Prisipilde resursai!", {
      body: `Resources are full!`,
      icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
      image:
        "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
    });
  }

  if (storage === 0 && production < 0 && ON_N) {
    new Notification("Baigesi grudai!!!!", {
      body: `Granary is empty!`,
      icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
      image:
        "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
    });
  }

  if (production == 0) {
    return MIN_WAIT;
  }
  if (production > 0) {
    return Math.ceil(((capacity - storage) / production) * 60 * 60 * 1000);
  }
  return Math.ceil((storage / production) * 60 * 60 * 1000 * -1);
}

const getBuildingQueue = () => {
  if (window.location.pathname.includes("dorf")) {
    let buildingQ = document.querySelectorAll("div.buildingList > ul > li");
    if (buildingQ && buildingQ.length > 0) {
      let buildString = document
        .querySelector("#content > script")
        .text.includes("var bld")
        ? document.querySelector("#content > script").text
        : document.querySelector("#content .village1Content > script").text;
      let buildingLevels = buildString.split("=").pop();
      const q = JSON.parse(buildingLevels);
      buildingQ.forEach((element, index) => {
        if (q[index]) {
          let seconds = Number(
            element
              .querySelector("div.buildDuration > span")
              .getAttribute("value")
          );
          q[index].name = element
            .querySelector("div.name")
            .innerHTML.split("<")[0]
            .trim();
          q[index].finish = Date.now() + seconds * 1000;
        }
      });
      return q;
    } else return [];
  }
};

const getCities = () => {
  const cities = {};
  cities.vil = [];

  let loadedCities = JSON.parse(localStorage.getItem(CITIES_STORAGE));

  //SETTING TRIBE
  if (
    loadedCities &&
    window.location.pathname.includes("dorf1") &&
    !Object.keys(loadedCities).includes("tribe")
  ) {
    cities.tribe = document.querySelector(
      "div#resourceFieldContainer"
    ).classList[1];
  } else if (loadedCities && Object.keys(loadedCities).includes("tribe")) {
    cities.tribe = loadedCities.tribe;
  }

  let villages = document.querySelectorAll(
    "div#sidebarBoxVillagelist > div.content > ul > li"
  );
  villages.forEach((vil, i) => {
    let data = vil.querySelector("a > span.coordinatesGrid");
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
    let did = Number(
      getParams("?" + vil.querySelector("a").href.split("?")[1]).newdid
    );

    const v = { name, x, y, did };

    if (vil.classList.contains("active")) {
      cities.cID = did;
    }

    if (cities.cID === did && window.location.pathname.includes("dorf")) {
      cities.cID = did;
      v.ress = getResources();
      v.queue = getBuildingQueue();
      v.timestamp = Date.now();

      v.l1Max = getStorageMax(
        v.ress.capacity.l1,
        v.ress.storage.l1,
        v.ress.production.l1
      );
      v.l2Max = getStorageMax(
        v.ress.capacity.l2,
        v.ress.storage.l2,
        v.ress.production.l2
      );
      v.l3Max = getStorageMax(
        v.ress.capacity.l3,
        v.ress.storage.l3,
        v.ress.production.l3
      );
      v.l4Max = getStorageMax(
        v.ress.capacity.l4,
        v.ress.storage.l4,
        v.ress.production.l4
      );

      v.nextRessCheck = Math.min(v.l1Max, v.l2Max, v.l3Max, v.l4Max);

      cities.vil.push(v);
      cities.current = v;
    } else {
      if (loadedCities) {
        let old = loadedCities.vil.find((x) => x.did === v.did);
        if (old) {
          old.name = name;
          cities.vil.push(old);
        } else {
          cities.vil.push(v);
        }
      }
    }

    //SETING CAPITAL
    if (window.location.pathname === "/profile") {
      const cap = document
        .querySelector("td.name > .mainVillage")
        .parentNode.querySelector("a")
        .innerText.trim();

      if (name === cap) {
        cities.cap = did;
      }
    } else {
      if (loadedCities && loadedCities.cap) {
        cities.cap = loadedCities.cap;
      }
    }
  });
  localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities));
  return cities;
};
