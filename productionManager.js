const initProductionManager = () => {
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

  const updateProduction = () => {
    let prod = document.querySelector("#contentOuterContainer > script");
    if (prod) {
      arr = prod.text.split("=").pop().trim().slice(0, -1).split("},");
      let production = JSON.parse("{" + arr[0].split(": {").pop() + "}");
      let storage = JSON.parse("{" + arr[1].split(": {").pop() + "}");
      let capacity = JSON.parse("{" + arr[2].split(": {").pop().slice(0, -1));
      return { production, storage, capacity, timestamp: Date.now() };
    } else return null;
  };

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

  return {
    all: productionStorage,
    get: (id) => (productionStorage[id] ? productionStorage[id] : null),
    current: currentStorage,
  };
};

const ProductionManager = initProductionManager();
