const initProductionManager = () => {
  let productionStorage = JSON.parse(localStorage.getItem(PROD_STORAGE));
  if (!productionStorage) {
    productionStorage = {};
  }
  productionStorage[CurrentVillage.did] = {
    ...unsafeWindow.resources,
    timestamp: Date.now(),
  };
  localStorage.setItem(PROD_STORAGE, JSON.stringify(productionStorage));

  const currentStorage = (did) => {
    if (!productionStorage[did]) return null;
    else {
      const { production, maxStorage, storage, timestamp } =
        productionStorage[did];

      let sec = Date.now() - timestamp;
      var ms = sec % 1000;
      sec = (sec - ms) / 1000;

      let p_r1 = Math.floor(((production.l1 * 1.0) / 3600) * sec + storage.l1);
      p_r1 = p_r1 < maxStorage.l1 ? p_r1 : maxStorage.l1;

      let p_r2 = Math.floor(((production.l2 * 1.0) / 3600) * sec + storage.l2);
      p_r2 = p_r2 < maxStorage.l2 ? p_r2 : maxStorage.l2;

      let p_r3 = Math.floor(((production.l3 * 1.0) / 3600) * sec + storage.l3);
      p_r3 = p_r3 < maxStorage.l3 ? p_r3 : maxStorage.l3;

      let p_r4 = Math.floor(((production.l4 * 1.0) / 3600) * sec + storage.l4);
      p_r4 = p_r4 < maxStorage.l4 ? p_r4 : maxStorage.l4;

      return { l1: p_r1, l2: p_r2, l3: p_r3, l4: p_r4 };
    }
  };

  const tillEnough = (gid, lvl, did) => {
    //TODO: check if levels are correct when checking building which is in progress
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
    if (wait !== 0) enough = Date.now() + Math.ceil(wait);
    return enough;
  };
  return {
    all: productionStorage,
    get: (did = CurrentVillage.did) =>
      productionStorage[did] ? productionStorage[did] : null,
    current: currentStorage,
    tillEnough: ({ gid, lvl }, did = CurrentVillage.did) =>
      tillEnough(gid, lvl + 1, did),
  };
};
let ProductionManager;
if (ShouldRun) ProductionManager = initProductionManager();
