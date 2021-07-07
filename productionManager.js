const initProductionManager = () => {
  const updateProduction = () => {
    let prod = document.querySelector("#header script");
    if (prod) {
      let arr = prod.text.split("=").pop().trim().slice(0, -1).split("},");
      let production = JSON.parse("{" + arr[0].split(": {").pop() + "}");
      let storage = JSON.parse("{" + arr[1].split(": {").pop() + "}");
      let capacity = JSON.parse("{" + arr[2].split(": {").pop().slice(0, -1));
      return { production, storage, capacity, timestamp: Date.now() };
    } else return null;
  };
  let productionStorage = JSON.parse(localStorage.getItem(PROD_STORAGE));
  if (!productionStorage) {
    productionStorage = {};
  }
  // SHOULD BE ABLE TO GET ALL DATA

  if (window.location.pathname.includes("dorf")) {
    let updated = updateProduction();
    if (updated) productionStorage[CurrentVillage.did] = updated;
    else console.log("Update production returned falsy value?");
  }

  localStorage.setItem(PROD_STORAGE, JSON.stringify(productionStorage));

  function getTimeUntillFull(capacity, storage, production) {
    if (production == 0) {
      return MIN_WAIT;
    }
    if (production > 0) {
      return Math.ceil(((capacity - storage) / production) * 60 * 60 * 1000);
    }
    return Math.ceil((storage / production) * 60 * 60 * 1000 * -1);
  }

  const currentStorage = (did) => {
    if (!productionStorage[did]) return null;
    else {
      const { production, capacity, storage, timestamp } =
        productionStorage[did];

      let sec = Date.now() - timestamp;
      var ms = sec % 1000;
      sec = (sec - ms) / 1000;

      let p_r1 = Math.floor(((production.l1 * 1.0) / 3600) * sec + storage.l1);
      p_r1 = p_r1 < capacity.l1 ? p_r1 : capacity.l1;

      let p_r2 = Math.floor(((production.l2 * 1.0) / 3600) * sec + storage.l2);
      p_r2 = p_r2 < capacity.l2 ? p_r2 : capacity.l2;

      let p_r3 = Math.floor(((production.l3 * 1.0) / 3600) * sec + storage.l3);
      p_r3 = p_r3 < capacity.l3 ? p_r3 : capacity.l3;

      let p_r4 = Math.floor(((production.l4 * 1.0) / 3600) * sec + storage.l4);
      p_r4 = p_r4 < capacity.l4 ? p_r4 : capacity.l4;

      return { l1: p_r1, l2: p_r2, l3: p_r3, l4: p_r4 };
    }
  };

  const tillEnough = (gid, lvl, did) => {
    let enough = 0;
    const { cost } = BDB.stats(gid, lvl);
    const { storage, production } = productionStorage[did];
    if (!production) return enough;

    let wait = 0;

    cost.forEach((c, index) => {
      let i = (index + 1).toString();
      if (storage["l" + i] < c) {
        let short = c - storage["l" + i];
        let p = production["l" + i] / 3600.0 / 1000.0;
        if (short > 0) {
          let w = short / p;
          wait = w > wait ? w : wait;
        }
      }
    });
    if (wait === 0) {
      console.log("can be built");
    } else {
      enough = Date.now() + Math.ceil(wait);
    }

    return enough;
  };

  return {
    all: productionStorage,
    get: (did = CurrentVillage.did) =>
      productionStorage[did] ? productionStorage[did] : null,
    current: currentStorage,
    tillEnough: ({ gid, lvl }, did = CurrentVillage.did) =>
      tillEnough(gid, lvl, did),
  };
};
const ProductionManager = initProductionManager();
