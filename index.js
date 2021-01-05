// ==UserScript==
// @name           S8nLTU-Bot
// @description    Travian helper script with build completed notifications and building queue auto building
// @author         S8nLTU
// @include        *.travian.*/*

// @version        0.66
// ==/UserScript==

function allInOneOpera() {

    const V = "0.66"

    const CITIES_STORAGE = "storedCities";
    const PANEL_POSITION = "positionPanel"
    const JOBS_STORAGE = "storedJobs";
    const BOT_POWER = 'bot_enabled';
    const BOT_ON = '1';
    const BOT_OFF = '0';
    const BOT_IN_PROGRESS = "bot_progress"
    const POSITION_UP = "UP";
    const POSITION_DOWN = "DOWN"

    const ON = localStorage.getItem(BOT_POWER) === BOT_ON
    const shouldRun = () => {
        return document.querySelectorAll("div#sidebarBoxVillagelist > div.content > ul > li").length > 0
    }

    const getParams = (loc) => (loc.search.slice(1).split('&').reduce((acc, s) => {
        const [k, v] = s.split('=')
        return Object.assign(acc, { [k]: v })
    }, {}))

    ////KIRILOID

    function RoundMul(v, n) {
        return Math.round(v / n) * n;
    }
    function TimeT3(a, k, b) {
        this.a = a;
        if (arguments.length < 3) {
            this.k = 1.16;
            if (arguments.length === 1) { k = 1; }
            this.b = 1875 * k;
        } else {
            this.k = k;
            this.b = b;
        }
    }

    function getStat(lvl) {
        let k = this.k;
        let cost = this.cost.map((v) => (RoundMul(v * Math.pow(k, lvl - 1), 5)))
        if (this.gid == 40) {
            cost = cost.map((value) => (Math.min(value, 1e6)));
        }
        let cu = this.cu;

        cu = (lvl != 1) ? Math.round((5 * cu + lvl - 1) / 10) : cu;
        return ({
            cost: cost,
            cu: cu
        });
    }


    const buildings = [
        { xcap: true, cap: true, tribe: 0, gid: 1, xgid: [], name: "Woodcutter", cost: [40, 100, 50, 60], k: 1.67, cu: 2, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 0, gid: 2, xgid: [], name: "Clay Pit", cost: [80, 40, 80, 50], k: 1.67, cu: 2, cp: 1, maxLvl: 21 },
        { xcap: true, cap: true, tribe: 0, gid: 3, xgid: [], name: "Iron Mine", cost: [100, 80, 30, 60], k: 1.67, cu: 3, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 0, gid: 4, xgid: [], name: "Cropland", cost: [70, 90, 70, 20], k: 1.67, cu: 0, cp: 1, maxLvl: 21 },
        { xcap: true, cap: true, tribe: 0, gid: 5, xgid: [5], name: "Sawmill", cost: [520, 380, 290, 90], k: 1.80, cu: 4, cp: 1, maxLvl: 5, breq: [{ gid: 1, lvl: 10 }, { gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 6, xgid: [6], name: "Brickyard", cost: [440, 480, 320, 50], k: 1.80, cu: 3, cp: 1, maxLvl: 5, breq: [{ gid: 2, lvl: 10 }, { gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 7, xgid: [7], name: "Iron Foundry", cost: [200, 450, 510, 120], k: 1.80, cu: 6, cp: 1, maxLvl: 5, breq: [{ gid: 3, lvl: 10 }, { gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 8, xgid: [8], name: "Grain Mill", cost: [500, 440, 380, 1240], k: 1.80, cu: 3, cp: 1, maxLvl: 5, breq: [{ gid: 4, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 9, xgid: [9], name: "Bakery", cost: [1200, 1480, 870, 1600], k: 1.80, cu: 4, cp: 1, maxLvl: 5, breq: [{ gid: 4, lvl: 10, }, { gid: 8, lvl: 5, }, { gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 10, xgid: [], name: "Warehouse", cost: [130, 160, 90, 40], k: 1.28, cu: 1, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 1 }], req: { multi: true } },
        { xcap: true, cap: true, tribe: 0, gid: 11, xgid: [], name: "Granary", cost: [80, 100, 70, 20], k: 1.28, cu: 1, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 1 }], req: { multi: true } },
        { xcap: true, cap: true, tribe: 0, gid: 12, xgid: [], name: "Blacksmith", cost: [170, 200, 380, 130], k: 1.28, cu: 4, cp: 2, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 22, lvl: 3 }], req: { version: [0, 3] } },
        { xcap: true, cap: true, tribe: 0, gid: 13, xgid: [13], name: "Armoury", cost: [130, 210, 410, 130], k: 1.28, cu: 4, cp: 2, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 22, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 14, xgid: [14], name: "Tournament Square", cost: [1750, 2250, 1530, 240], k: 1.28, cu: 1, cp: 1, maxLvl: 20, breq: [{ gid: 16, lvl: 15 }] },
        { xcap: true, cap: true, tribe: 0, gid: 15, xgid: [15], name: "Main Building", cost: [70, 40, 60, 20], k: 1.28, cu: 2, cp: 2, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 0, gid: 16, xgid: [16], name: "Rally Point", cost: [110, 160, 90, 70], k: 1.28, cu: 1, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 0, gid: 17, xgid: [17], name: "Marketplace", cost: [80, 70, 120, 70], k: 1.28, cu: 4, cp: 3, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 10, lvl: 1 }, { gid: 11, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 18, xgid: [18], name: "Embassy", cost: [180, 130, 150, 80], k: 1.28, cu: 3, cp: 4, maxLvl: 20, breq: [{ gid: 15, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 19, xgid: [19], name: "Barracks", cost: [210, 140, 260, 120], k: 1.28, cu: 4, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 16, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 20, xgid: [20], name: "Stable", cost: [260, 140, 220, 100], k: 1.28, cu: 5, cp: 2, maxLvl: 20, breq: [{ gid: 12, lvl: 3 }, { gid: 22, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 21, xgid: [21], name: "Workshop", cost: [460, 510, 600, 320], k: 1.28, cu: 3, cp: 3, maxLvl: 20, breq: [{ gid: 15, lvl: 5 }, { gid: 22, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 22, xgid: [22], name: "Academy", cost: [220, 160, 90, 40], k: 1.28, cu: 4, cp: 4, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 19, lvl: 3 }] },
        { xcap: true, cap: true, tribe: 0, gid: 23, xgid: [], name: "Cranny", cost: [40, 50, 30, 10], k: 1.28, cu: 0, cp: 1, maxLvl: 10 },
        { xcap: true, cap: true, tribe: 0, gid: 24, xgid: [24], name: "Town Hall", cost: [1250, 1110, 1260, 600], k: 1.28, cu: 4, cp: 5, maxLvl: 20, breq: [{ gid: 15, lvl: 10 }, { gid: 22, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 25, xgid: [25, 26, 44], name: "Residence", cost: [580, 460, 350, 180], k: 1.28, cu: 1, cp: 2, maxLvl: 20, breq: [{ gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 0, gid: 26, xgid: [26, 25, 44], name: "Palace", cost: [550, 800, 750, 250], k: 1.28, cu: 1, cp: 5, maxLvl: 20, breq: [{ gid: 15, lvl: 5 }, { gid: 18, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 27, xgid: [27], name: "Treasury", cost: [2880, 2740, 2580, 990], k: 1.26, cu: 4, cp: 6, maxLvl: 20, breq: [{ gid: 15, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 28, xgid: [28], name: "Trade Office", cost: [1400, 1330, 1200, 400], k: 1.28, cu: 3, cp: 3, maxLvl: 20, breq: [{ gid: 17, lvl: 20 }, { gid: 20, lvl: 10 }] },
        { xcap: true, cap: false, tribe: 0, gid: 29, xgid: [29], name: "Great Barracks", cost: [630, 420, 780, 360], k: 1.28, cu: 4, cp: 1, maxLvl: 20, breq: [{ gid: 19, lvl: 20 }] },
        { xcap: true, cap: false, tribe: 0, gid: 30, xgid: [30], name: "Great Stable", cost: [780, 420, 660, 300], k: 1.28, cu: 5, cp: 2, maxLvl: 20, breq: [{ gid: 20, lvl: 20 }] },
        { xcap: true, cap: true, tribe: 1, gid: 31, xgid: [31], name: "City Wall", cost: [70, 90, 170, 70], k: 1.28, cu: 0, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 2, gid: 32, xgid: [32], name: "Earth Wall", cost: [120, 200, 0, 80], k: 1.28, cu: 0, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 3, gid: 33, xgid: [33], name: "Palisade", cost: [160, 100, 80, 60], k: 1.28, cu: 0, cp: 1, maxLvl: 20 },
        { xcap: false, cap: true, tribe: 0, gid: 34, xgid: [34], name: "Stonemason", cost: [155, 130, 125, 70], k: 1.28, cu: 2, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 5 }, { gid: 26, lvl: 3 }] },
        { xcap: false, cap: true, tribe: 2, gid: 35, xgid: [35], name: "Brewery", cost: [1460, 930, 1250, 1740], k: 1.40, cu: 6, cp: 4, maxLvl: 10, breq: [{ gid: 11, lvl: 20 }, { gid: 16, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 3, gid: 36, xgid: [36], name: "Trapper", cost: [100, 100, 100, 100], k: 1.28, cu: 4, cp: 1, maxLvl: 20, breq: [{ gid: 16, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 37, xgid: [37], name: "Hero's Mansion", cost: [700, 670, 700, 240], k: 1.33, cu: 2, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 3 }, { gid: 16, lvl: 1 }] },
        { xcap: true, cap: true, tribe: 0, gid: 38, xgid: [], name: "Great Warehouse", cost: [650, 800, 450, 200], k: 1.28, cu: 1, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 39, xgid: [], name: "Great Granary", cost: [400, 500, 350, 100], k: 1.28, cu: 1, cp: 1, maxLvl: 20, breq: [{ gid: 15, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 40, xgid: [40], name: "Wonder of the World", cost: [66700, 69050, 72200, 13200], k: 1.0275, cu: 1, cp: 0, maxLvl: 100, cost100: [1e6, 1e6, 1e6, 193630] },
        { xcap: true, cap: true, tribe: 1, gid: 41, xgid: [41], name: "Horse Drinking Trough", cost: [780, 420, 660, 540], k: 1.28, cu: 5, cp: 3, maxLvl: 20, breq: [{ gid: 16, lvl: 10 }, { gid: 20, lvl: 20 }] },
        { xcap: true, cap: true, tribe: 4, gid: 42, xgid: [42], name: "Stone Wall", cost: [110, 160, 70, 60], k: 1.28, cu: 0, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 5, gid: 43, xgid: [43], name: "Makeshift Wall", cost: [50, 80, 40, 30], k: 1.28, cu: 0, cp: 1, maxLvl: 20 },
        { xcap: true, cap: true, tribe: 5, gid: 44, xgid: [25, 26, 44], name: "Command Center", cost: [1600, 1250, 1050, 200], k: 1.22, cu: 1, cp: 2, maxLvl: 20, breq: [{ gid: 15, lvl: 5 }] },
        { xcap: true, cap: true, tribe: 4, gid: 45, xgid: [45], name: "Waterworks", cost: [910, 945, 910, 340], k: 1.31, cu: 1, cp: 2, maxLvl: 20, breq: [{ gid: 37, lvl: 10 }] },
        { xcap: true, cap: true, tribe: 0, gid: 46, xgid: [46], name: "Hospital", cost: [320, 280, 420, 360], k: 1.28, cu: 3, cp: 4, maxLvl: 20, breq: [{ gid: 22, lvl: 15 }, { gid: 15, lvl: 10 }] },
    ];
    buildings.forEach((b) => { b.getStat = getStat })



    function setUpResFields() {
        const ressFields = []
        const res_fields = document.querySelectorAll("div#resourceFieldContainer > div.level")
        res_fields.forEach((node) => {
            let lvl = Number(node.classList.value.split("level").pop())
            let pos = Number(node.classList.value.split("buildingSlot")[1].split(" ")[0])
            let gid = Number(node.classList.value.split("gid")[1].split(" ")[0])

            let BOT_inc_res_spacer = node.parentNode.appendChild(document.createElement("div"))
            let BOT_inc_res = node.parentNode.appendChild(document.createElement("div"))
            BOT_inc_res.classList.add("level", "buildingSlot" + pos)
            BOT_inc_res_spacer.classList.add("level", "buildingSlot" + pos)
            BOT_inc_res_spacer.style.cssText = " z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;"
            BOT_inc_res.style.cssText = "font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white;"
            ressFields.push(
                {
                    node,
                    pos,
                    gid,
                    lvl,
                    bot: BOT_inc_res
                }
            )
        })

        return ressFields
    }


    //DOES NOT PARSE WALL
    function setUpBuildings() {
        const buildings = []
        const building_nodes = document.querySelectorAll("#village_map > div.buildingSlot > img.building") // does not include wall !!! TODO img.wall for wall selection
        building_nodes.forEach((a) => {
            let node = a.parentNode;

            let gid = Number(node.classList.value.split(" g")[1].split(" ")[0])
            let pos = Number(node.classList.value.split("aid")[1].split(" ")[0])


            let levelNode = node.querySelector("div.labelLayer");
            let lvl = 0;
            if (gid !== 0 && levelNode) {
                lvl = Number(levelNode.textContent)
            }
            let BOT_inc_build = null
            BOT_inc_build = node.appendChild(document.createElement("div"))
            BOT_inc_build.classList.add("level", "buildingSlot", "a" + pos)
            BOT_inc_build.dataset.lvl = lvl;

            BOT_inc_build.style.cssText = "font-weight:900; border:2px ridge #fdfd75; margin-left:-28px; margin-top:2px; background-image:none; border-radius:50%; background-color:rgba(41, 61, 113,0.5); color: white; line-height:23px"
            BOT_inc_build.textContent = "+"
            let BOT_inc_buid_spacer = node.appendChild(document.createElement("div"))
            BOT_inc_buid_spacer.classList.add("level", "buildingSlot", "a" + pos)
            BOT_inc_buid_spacer.style.cssText = "z-index:1;width: 27px;height: 23px;margin-top: 2px;background-color: none;background-image: none;margin-left: -14px; border-top: 2px ridge #fdfd75;border-bottom: 2px ridge #fdfd75;"
            buildings.push({ node, pos, gid, lvl, bot: BOT_inc_build })

            if (gid === 0) {
                BOT_inc_buid_spacer.style.display = "none"
                BOT_inc_build.style.display = "none"
            }

        })

        let wall = document.querySelectorAll("#village_map > div.buildingSlot > img.wall")

        return buildings
    }

    //GET TRIBE DORF 1
    // t = Number(document.querySelector("#resourceFieldContainer").classList[1].slice(-1))

    //DETECTS incoming attacks
    //document.querySelectorAll("table#movements > tbody > tr >td.typ > a > img.att1 ").length>0

    const r1i = (x) => (`<i class="lumber_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:4px;"></i>`);
    const r2i = (x) => (`<i class="clay_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:4px;"></i>`);
    const r3i = (x) => (`<i class="iron_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:4px;"></i>`);
    const r4i = (x) => (`<i class="crop_small" style="width: ${x}px; height: ${x}px; background-size: contain;  margin-right:4px;"></i>`);
    const wi = (x) => (`<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/warehouse_medium.png'); margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`);
    const gi = (x) => (`<i style="background-image: url('https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/hud/topBar/header/stockBar/granary_medium.png');margin-right:4px; width: ${x}px; height: ${x}px; background-size: contain;"></i>`);

    const building = (id, tribe = "teuton", size = 120, big = true) => (`<span class="buildingsV3"><img src="/img/x.gif" class="building g${id} ${tribe} ${big ? "big" : ""}" style="width: ${size}px; height: ${size}px; background-size:contain;"></span>`)

    const getResources = () => {
        let arr = document.querySelector("#contentOuterContainer > script").text.split("=").pop().trim().slice(0, -1).split("},");
        let production = JSON.parse("{" + arr[0].split(": {").pop() + "}");
        let storage = JSON.parse("{" + arr[1].split(": {").pop() + "}");
        let capacity = JSON.parse("{" + arr[2].split(": {").pop().slice(0, -1));
        return { production, storage, capacity }
    }

    const getBuildingQueue = () => {
        if (window.location.pathname.includes("dorf")) {
            let buildingQ = document.querySelectorAll("div.buildingList > ul > li");
            if (buildingQ && buildingQ.length > 0) {
                let buildingLevels = document.querySelector("#content > script").text.split("=").pop();
                const q = JSON.parse(buildingLevels);
                buildingQ.forEach((element, index) => {
                    if (q[index]) {
                        let seconds = Number(element.querySelector("div.buildDuration > span").getAttribute("value"));
                        q[index].name = element.querySelector("div.name").innerHTML.split("<")[0].trim();
                        q[index].finish = Date.now() + (seconds * 1000)
                    }
                })
                return q;
            } else return []
        }
    }

    const getCities = () => {
        const cities = {}
        cities.vil = [];

        //   console.log("getting cities info:")

        let loadedCities = JSON.parse(localStorage.getItem(CITIES_STORAGE))

        //   console.log("loaded cities from storage: ", loadedCities)

        //SETTING TRIBE
        if (window.location.pathname.includes("dorf1") && !Object.keys(loadedCities).includes("tribe")) {
            cities.tribe = document.querySelector("div#resourceFieldContainer").classList[1]
        }

        let villages = document.querySelectorAll("div#sidebarBoxVillagelist > div.content > ul > li");
        //   console.log("villages visible on website: ", villages)
        //   console.log("total found: ", villages.length)
        villages.forEach((vil, i) => {
            let data = vil.querySelector("a > span.coordinatesGrid")
            let name = data.getAttribute("data-villagename");
            if (!name) {
                name = vil.querySelector("span.name").textContent.trim()
            }
            let x = Number(data.getAttribute("data-x"));
            if (!x) { x = Number(vil.querySelector("span.coordinateX").textContent.trim().slice(1).replace(/\u202c|\u202d|/g, '').replace(/\u2212/g, '-')); }
            let y = Number(data.getAttribute("data-y"));
            if (!y) { y = Number(vil.querySelector("span.coordinateY").textContent.trim().slice(0, -1).replace(/\u202c|\u202d|/g, '').replace(/\u2212/g, '-')); }
            let did = Number(data.getAttribute("data-did"));
            if (!did) { did = Number(vil.querySelector("a").href.slice(0, -1).split("?newdid=")[1]) }

            const v = { name, x, y, did }

            // console.log("basic data for village " + i, v)

            if (vil.classList.contains("active")) {
                cities.cID = did;
            }

            if (cities.cID === did && window.location.pathname.includes("dorf")) {
                cities.cID = did;
                v.ress = getResources()
                v.queue = getBuildingQueue()
                v.timestamp = Date.now()
                cities.vil.push(v)
                cities.current = v


            } else {
                if (loadedCities) {
                    let old = loadedCities.vil.find((x) => x.did === v.did)
                    if (old) {
                        old.name = name;
                        cities.vil.push(old)
                    } else { cities.vil.push(v) }
                }
            }

            //SETING CAPITAL
            if (window.location.pathname === "/profile") {
                const cap = document.querySelector("td.name > .mainVillage").parentNode.querySelector("a").innerText.trim()
                //   console.log("Capital name: ", cap)
                //    console.log("Selected town name: ", name)
                if (name === cap) {
                    //  console.log("Matched! seting as capital ", cap)
                    cities.cap = did
                } else {
                    //  console.log("Did not match! capital not set ")
                }
            } else {
                if (loadedCities && loadedCities.cap) {
                    cities.cap = loadedCities.cap
                }
            }






        })

        localStorage.setItem(CITIES_STORAGE, JSON.stringify(cities));
        return cities;
    }

    const createSidePanel = () => {

        const pos = localStorage.getItem(PANEL_POSITION)
        const sideBar = document.querySelector("#sidebarBeforeContent > div")
        const panel = document.createElement("div");
        panel.classList.add("sidebarBox")

        let sidePanelHeader = panel.appendChild(document.createElement("div"))
        sidePanelHeader.classList.add("header")

        let btnWraper = sidePanelHeader.appendChild(document.createElement("div"))
        btnWraper.classList.add("buttonsWrapper")

        let btnPower = btnWraper.appendChild(document.createElement("a"));
        btnPower.classList.add("layoutButton", "buttonFramed", "withIcon", "round", "green")
        btnPower.innerHTML = `<svg class="edit" style="width:30px; stroke-width:2; fill:${ON ? 'red' : 'white'};" viewBox="0 0 20 20"><path d="M10,6.978c-1.666,0-3.022,1.356-3.022,3.022S8.334,13.022,10,13.022s3.022-1.356,3.022-3.022S11.666,6.978,10,6.978M10,12.267c-1.25,0-2.267-1.017-2.267-2.267c0-1.25,1.016-2.267,2.267-2.267c1.251,0,2.267,1.016,2.267,2.267C12.267,11.25,11.251,12.267,10,12.267 M18.391,9.733l-1.624-1.639C14.966,6.279,12.563,5.278,10,5.278S5.034,6.279,3.234,8.094L1.609,9.733c-0.146,0.147-0.146,0.386,0,0.533l1.625,1.639c1.8,1.815,4.203,2.816,6.766,2.816s4.966-1.001,6.767-2.816l1.624-1.639C18.536,10.119,18.536,9.881,18.391,9.733 M16.229,11.373c-1.656,1.672-3.868,2.594-6.229,2.594s-4.573-0.922-6.23-2.594L2.41,10l1.36-1.374C5.427,6.955,7.639,6.033,10,6.033s4.573,0.922,6.229,2.593L17.59,10L16.229,11.373z"></path></svg >`
        btnPower.onclick = (e) => {
            localStorage.setItem(BOT_POWER, ON ? BOT_OFF : BOT_ON);
            location.reload()
        }


        //  btnPower.href = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rmbdeivis@hotmail.com&lc=GB&item_name=Buy%20me%20a%20coffee%20to%20stay%20awake%20while%20writing%20PingWinBot%21&currency_code=GBP&no_note=0&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHostedGuest"
        // btnPower.target = "_blank"




        if (pos === POSITION_UP) {
            let btnDown = btnWraper.appendChild(document.createElement("a"));
            btnDown.classList.add("layoutButton", "buttonFramed", "withIcon", "round", "green")
            btnDown.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path></svg >`
            btnDown.onclick = (e) => {
                localStorage.setItem(PANEL_POSITION, POSITION_DOWN);
                location.reload()
            }
            sideBar.prepend(panel)
        } else {
            let btnUp = btnWraper.appendChild(document.createElement("a"));
            btnUp.classList.add("layoutButton", "buttonFramed", "withIcon", "round", "green")
            btnUp.innerHTML = `<svg class="edit" style="stroke-width:1; fill:white;" viewBox="0 0 20 20"> <path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"></path></svg >`
            btnUp.onclick = (e) => {
                localStorage.setItem(PANEL_POSITION, POSITION_UP);
                location.reload()
            }
            sideBar.appendChild(panel)

        }



        let btnHelp = btnWraper.appendChild(document.createElement("a"));
        btnHelp.href = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rmbdeivis@hotmail.com&lc=GB&item_name=Buy%20me%20a%20coffee%20to%20stay%20awake%20while%20writing%20PingWinBot%21&currency_code=GBP&no_note=0&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHostedGuest"
        btnHelp.target = "_blank"
        btnHelp.classList.add("layoutButton", "buttonFramed", "withIcon", "round", "green")
        btnHelp.innerHTML = `<svg class="edit" style="stroke-width:1; translate: rotate(180); fill:white;" viewBox="0 0 20 20"> <path d="M9.719,17.073l-6.562-6.51c-0.27-0.268-0.504-0.567-0.696-0.888C1.385,7.89,1.67,5.613,3.155,4.14c0.864-0.856,2.012-1.329,3.233-1.329c1.924,0,3.115,1.12,3.612,1.752c0.499-0.634,1.689-1.752,3.612-1.752c1.221,0,2.369,0.472,3.233,1.329c1.484,1.473,1.771,3.75,0.693,5.537c-0.19,0.32-0.425,0.618-0.695,0.887l-6.562,6.51C10.125,17.229,9.875,17.229,9.719,17.073 M6.388,3.61C5.379,3.61,4.431,4,3.717,4.707C2.495,5.92,2.259,7.794,3.145,9.265c0.158,0.265,0.351,0.51,0.574,0.731L10,16.228l6.281-6.232c0.224-0.221,0.416-0.466,0.573-0.729c0.887-1.472,0.651-3.346-0.571-4.56C15.57,4,14.621,3.61,13.612,3.61c-1.43,0-2.639,0.786-3.268,1.863c-0.154,0.264-0.536,0.264-0.69,0C9.029,4.397,7.82,3.61,6.388,3.61"></path></svg >`


        function destroy() {
            panel.remove()
        }

        function addSection(title) {

            let sidePanelContent = panel.appendChild(document.createElement("div"))
            sidePanelContent.classList.add("content")
            sidePanelContent.innerHTML = `<div class='boxTitle'>${title}</div>`


            return sidePanelContent
        }

        return { panel, destroy, addSection, }
    }

    function checkTime(completion) {

        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
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

            let timer = pad(hrs) + ':' + pad(mins) + ':' + pad(secs);

            return { completed: false, timer }

        }
        else return { completed: true, timer: "Completed!" }

    }

    function cC(s, p, c) {
        var color = " color:black; "
        var ratio = s * 1.0 / c;
        if (ratio > 0.2) {
            if (ratio > 0.5) {
                color = " color:green; "
            }
            if (ratio > 0.8) {
                color = " color:#e45f00; "
            }
            if (ratio > 0.9) {
                color = " color:#e62020d; "
            }

        } else if (p < 0) {
            color = " color:#e62020; "
        }
        return color
    }

    function iS(lastTime, ress) {

        let sec = Date.now() - lastTime;
        var ms = sec % 1000;
        sec = (sec - ms) / 1000;

        var style = "display: flex; font-size: 10px; align-items: center;"

        let p_r1 = Math.floor(ress.production.l1 * 1.0 / 3600 * sec + ress.storage.l1);
        p_r1 = p_r1 < ress.capacity.l1 ? p_r1 : ress.capacity.r1;
        let c_r1 = cC(p_r1, ress.production.l1, ress.capacity.l1)

        let p_r2 = Math.floor(ress.production.l2 * 1.0 / 3600 * sec + ress.storage.l2);
        p_r2 = p_r2 < ress.capacity.l2 ? p_r2 : ress.capacity.l2
        let c_r2 = cC(p_r2, ress.production.l12, ress.capacity.l2)

        let p_r3 = Math.floor(ress.production.l3 * 1.0 / 3600 * sec + ress.storage.l3);
        p_r3 = p_r3 < ress.capacity.l3 ? p_r3 : ress.capacity.l3
        let c_r3 = cC(p_r3, ress.production.l3, ress.capacity.l3)

        let p_r4 = Math.floor(ress.production.l4 * 1.0 / 3600 * sec + ress.storage.l4);
        p_r4 = p_r4 < ress.capacity.l4 ? p_r4 : ress.capacity.l4
        let c_r4 = cC(p_r4, ress.production.l4, ress.capacity.l4)


        return ` <span style="${c_r1 + style}">${r1i(10)}${p_r1}</span>        <span style="${c_r2 + style}">${r2i(10)}${p_r2}</span>        <span style="${c_r3 + style}">${r3i(10)}${p_r3}</span>        <span style="${c_r4 + style}">${r4i(10)}${p_r4}</span>`

    }


    // SIDE PANEL
    const createCity = (vil, cities) => {

        const block = document.createElement("div");
        block.style.paddingBottom = '4px'
        //  const nameRow = document.createElement("div");
        //  nameRow.style.display = "flex"
        //  nameRow.style.justifyContent = "space-between"
        // block.appendChild(nameRow)
        const prodRow = document.createElement("div");
        prodRow.style.display = "flex"
        prodRow.style.justifyContent = "space-between"
        prodRow.style.padding = '2px 12px'
        block.appendChild(prodRow)
        const queRow = document.createElement("div");
        queRow.style.padding = "2px"
        block.appendChild(queRow)

        //let capital_string = "";

        //  if (cities.cap && cities.cap === vil.did) capital_string = "(Capital)"

        if (vil.ress) {
            const { capacity } = vil.ress;
            // nameRow.innerHTML = `<div>${wi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l1}</span>${gi(16)}<span style="font-size:10px; padding-right:4px;">${capacity.l4}</span></div>`
            prodRow.innerHTML = iS(vil.timestamp, vil.ress)
            let resUpdate = setInterval(() => {
                prodRow.innerHTML = iS(vil.timestamp, vil.ress)
            }, 2000)
        } else {
            prodRow.innerHTML = `<div style="font-size:10px">No info yet.</div>`
        }



        if (vil.queue) {
            vil.queue.forEach((x) => {
                const task = document.createElement("div");
                queRow.appendChild(task);
                let timer = checkTime(x.finish)
                task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${x.name} level ${x.stufe}</span><span style="font-size:11px;  ${timer.completed ? "color:green;" : ""} align-items:center;">${timer.timer}</span>`
                if (!timer.completed) {
                    let updater = setInterval(() => {
                        timer = checkTime(x.finish)
                        task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${x.name} level ${x.stufe}</span><span style="font-size:11px; ${timer.completed ? "color:green;" : ""} align-items:center;">${timer.timer}</span>`

                        if (timer.completed) {
                            notifyMe("Building completed", x, vil);
                            clearInterval(updater);
                        }
                    }, 1000)
                }

            })
        }
        return { block }
    }



    function notifyMe(title, action, village) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification(title, {
                body: `${action.name} was upgraded to level ${action.stufe} in "${village.name}"`,
                icon: 'https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png',
                image: 'https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051'
            });
            notification.onclick = function () {
                parent.focus();
            }
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {

            Notification.requestPermission().then(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    var notification = new Notification(title, {
                        body: `${action.name} was upgraded to level ${action.stufe} in "${village.name}"`,
                        icon: 'https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png'
                    });
                }
            });
        } else if (Notification.permission === "denied") {
            alert("Please allow notifications for script to work properly")
        }
    }

    function displayJobs() {
        //REMOVE PREVIOUS CHILDREN
        const jobs = this.jobs["c" + this.cID]

        const cVillage = this.vil.find((v) => v.did === this.cID);
        const panel = this.jobsSection
        while (panel.firstChild) {
            panel.removeChild(panel.firstChild);
        }

        if (window.location.pathname.includes("dorf1")) {
            this.fieldsCollection.forEach(field => {
                //Number of currently beign guilt same type buildings
                const buildingNow = cVillage.queue.filter((bn) => Number(bn.pos) === field.pos).length

                const count = jobs.filter(x => x.pos === field.pos).length
                field.bot.textContent = count === 0 ? "+" : count
                field.bot.dataset.lvl = count
                field.bot.onclick = () => {
                    this.addJob({ gid: field.gid, pos: field.pos, lvl: field.lvl, to: Number(field.bot.dataset.lvl) + 1 + Number(field.lvl) + buildingNow })
                    this.displayJobs()
                };
            });
        }
        if (window.location.pathname.includes("dorf2")) {
            this.buildingCollection.forEach(building => {
                //Number of currently beign built same type buildings
                const buildingNow = cVillage.queue.filter((bn) => Number(bn.pos) === building.pos).length
                const pos_jobs = jobs.filter(x => x.pos === building.pos)
                const count = pos_jobs.length
                //  if (building.gid === 0 && pos_jobs > 0) {
                if (building.gid === 0 && count > 0) {
                    //    console.log("Jobs in empty field: ", pos_jobs)
                    //console.log("Field: ", building)
                    //New building in jobs here!
                    building.bot.style.display = "block";
                    building.gid = pos_jobs[0].gid
                    let image = building.node.querySelector("img")
                    image.classList.add("g" + pos_jobs[0].gid)
                    image.style.opacity = "0.5"
                }

                // }
                building.bot.textContent = count === 0 ? "+" : count
                building.bot.dataset.lvl = count
                building.bot.onclick = () => {
                    this.addJob({ gid: building.gid, pos: building.pos, lvl: building.lvl, to: Number(building.bot.dataset.lvl) + 1 + Number(building.lvl) + buildingNow })
                    this.displayJobs()
                };
            });
        }
        if (jobs.length > 0) {
            jobs.forEach((job) => {
                //if new building display!
                const node = document.createElement("div");
                node.style.cssText = "font-size: 10px; line-height:10px;"
                const nodeButton = node.appendChild(document.createElement('span'))
                const nodeText = node.appendChild(document.createElement('span'))
                nodeButton.style.cssText = "width:14px; height:14; border-radius:2px; background-color:red;color:white; text-align:center; font-size:12px; padding:2px; display:inline-block; border:1px solid black; margin-right:4px"
                nodeButton.textContent = "x";
                nodeButton.onclick = (e) => {
                    let i = whichChild(e.target.parentNode)
                    this.removeJob(jobs[i])
                    this.displayJobs()

                    // if (removed.length > 0) {
                    //     localStorage.setItem(JOBS_STORAGE, JSON.stringify(j))
                    //     jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE))
                    //     e.target.parentNode.remove()

                    // } else {
                    //     console.log("could not remove")
                    // }
                }
                this.jobsSection.appendChild(node);
                nodeText.textContent = job.to === 1 ? `Build new ${this.buildingDB[job.gid - 1].name}(${job.pos}).` : `Upgrade ${this.buildingDB[job.gid - 1].name}(${job.pos}) to lvl${job.to}`
            })
        }
    }

    function whichChild(elem) {
        var i = 0;
        while ((elem = elem.previousSibling) != null) ++i;
        return i;
    }

    function initJobQueue(c) {
        let cid = "c" + c.cID

        let jobs = JSON.parse(localStorage.getItem(JOBS_STORAGE))
        if (!jobs || !jobs[cid]) {
            jobs = jobs ? jobs : {}
            if (window.location.pathname.includes("dorf")) {
                jobs[cid] = jobs[cid] ? jobs[cid] : []
            }
            localStorage.setItem(JOBS_STORAGE, JSON.stringify(jobs))
        }
        c.jobs = jobs
        c.displayJobs = displayJobs
    }

    if (window.location.pathname.includes("build.php") && !window.location.search.includes("&gid=")) {
        const params = getParams(window.location)
        const cat = params.category ? Number(params.category) : 1

        const availableBuildings = document.querySelectorAll(".buildingWrapper > .build_desc > img.building");
        availableBuildings.forEach(b => {
            let cont = b.parentNode.parentNode;
            let gid = Number(cont.querySelector(".contract").id.replace("contract_building", ""))
            let pos = window.location.search.split("=")[1]
            pos = pos.includes("&") ? Number(pos.split("&")[0]) : Number(pos)

            cont.style.position = "relative";
            const button = cont.appendChild(document.createElement("button"));
            button.classList.add("textButtonV1", "green", "new");
            button.style.position = "absolute";
            button.style.right = "0"
            button.style.top = "0"
            button.innerText = `Build later`

            button.onclick = () => {
                BOT.addJob({ gid, pos, lvl: 0, to: 1, cat })
                BOT.displayJobs()
                window.location.href = '/dorf2.php'
            };
        })
    }



    //STARTS HERE IF CAN SEE VILLAGE LIST

    if (shouldRun()) {

        const botPanel = createSidePanel().addSection("S8nLTU BOT v" + V);
        const BOT = getCities();
        const villageLiArray = document.querySelectorAll("#sidebarBoxVillagelist li")
        if (window.location.pathname.includes("dorf1")) {
            BOT.fieldsCollection = setUpResFields()
        }

        if (window.location.pathname.includes("dorf2")) {
            BOT.buildingCollection = setUpBuildings()
        }

        // BOT.villagesSection = botPanel.addSection("PINGWINBOT");

        BOT.jobsSection = botPanel.appendChild(document.createElement("div"))

        BOT.buildingDB = buildings;
        BOT.vil.forEach((t, i) => {
            //  BOT.villagesSection.appendChild(createCity(t, BOT).block)
            villageLiArray[i].appendChild(createCity(t, BOT).block)
        });

        BOT.addJob = function (job) {
            if (!this.cap) {
                alert("Capital not set. Opening '/profile' section for you now. While on '/profile' section, please change your current city to your capital city for bot to update. You only need to do this once.")
                location.href = '/profile'
                return
            }
            //Check if ress and max level ceiling
            if (job.gid < 5) {
                if (job.to > 10) {
                    if (this.cap !== this.cID) {
                        alert("Max level is 10 in non Capital villages!")
                        return
                    }
                    else if (job.to > 21) {
                        alert("Max field level is 21!")
                        return
                    }
                }
            } else {

                const b = this.buildingDB[job.gid - 1]
                //is cap and not alowed in cap:
                if (this.cap === this.cID && !b.cap) {
                    alert("Cant build this in capitol!")
                    return
                }
                if (this.cap !== this.cID && !b.xcap) {
                    alert("Cant build this in non capitol city!")
                    return
                }
            }

            //Current village
            const cVillage = this.vil.find((v) => v.did === this.cID);

            //warehouse and granary capacity check
            const w = cVillage.ress.capacity.l1
            const g = cVillage.ress.capacity.l4
            const stats = this.buildingDB[job.gid - 1].getStat(job.to)
            if (stats.cost[0] > w || stats.cost[1] > w || stats.cost[2] > w) {
                alert("Expand warehouse first!")
                return
            }
            if (stats.cost[3] > g) {
                alert("Expand granary first!")
                return
            }

            this.jobs["c" + this.cID].push(job)
            localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs))
        }

        BOT.completeJob = function (job) {
            let jobs = this.jobs["c" + this.cID]
            this.jobs["c" + this.cID] = jobs.filter((j) => (j.pos !== job.pos || (j.pos === job.pos && j.to !== job.to)))
            localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs))
        }


        BOT.removeJob = function (job) {
            let jobs = this.jobs["c" + this.cID]
            this.jobs["c" + this.cID] = jobs.filter((j) => (j.pos !== job.pos || (j.pos === job.pos && j.to < job.to)))
            localStorage.setItem(JOBS_STORAGE, JSON.stringify(this.jobs))
        }


        BOT.setNextJob = function () {
            //TODO check if not empty string
            let prog = localStorage.getItem(BOT_IN_PROGRESS)
            const inProgress = prog === "" || prog === null ? null : JSON.parse(prog)

            if (location.pathname.includes("build.php")) {
                if (inProgress !== null) {
                    const params = getParams(window.location)
                    //check if job was done to this leve and if so, complete it
                    const currentLvl = Number(document.querySelector("div#build").classList[1].replace("level", ""))
                    console.log("Building level detected: ", currentLvl)
                    console.log("Job planed: ", inProgress)
                    if (currentLvl >= inProgress.job.to) {
                        console.log("Job was already done before. Canceling in 5s!")
                        return setTimeout(() => {
                            localStorage.setItem(BOT_IN_PROGRESS, "")
                            this.completeJob(inProgress.job)
                            console.log("job was already done before")
                            window.location.href = '/dorf1.php'

                        }, 5000)
                    }
                    if (inProgress.cid === Number(params.newdid) && inProgress.job.pos === Number(params.id)) {

                        let b = undefined;

                        if (inProgress.job.to === 1 && inProgress.job.cat) {
                            b = document.querySelector(`img.g${inProgress.job.gid}`).parentNode.parentNode.querySelector(".contractLink button")
                        } else {
                            b = document.querySelector(".upgradeBuilding .section1 button.green.build");
                        }
                        setTimeout(() => {
                            if (b) {
                                this.completeJob(inProgress.job)
                                b.click()
                            }
                        }, 3500)
                    }
                }
            }
            else if (location.pathname.includes("dorf")) {


                let jobs = this.jobs["c" + this.cID]
                const { production, storage } = this.current.ress
                console.log("Looking for jobs")
                //ANY JOBS SET?
                if (jobs.length > 0) {
                    console.log("Found some jobs in current town")
                    let j = jobs[0]
                    const cap = this.current.ress.capacity
                    const stor = this.current.ress.storage
                    const cost = this.buildingDB[j.gid - 1].getStat(j.to).cost

                    //ANYTHING BUILDING?
                    if (this.current.queue.length > 0) {
                        console.log("Something already building. Waiting...")
                        //Check if roman here and if can do alternative job instead
                        //   j.push(nj)
                        // if (jobs.length > 1) {
                        //     let nj = j[0].gid < 5 ? jobs.find(x => x.gid > 4) : jobs.find(x => x.gid < 5)
                        //     if (nj !== undefined) {

                        //     }
                        // }

                    } else {
                        console.log("Building queue empty. Can start building")
                        //check if enough storage:
                        if (storage.l1 >= cost[0] && storage.l2 >= cost[1] && storage.l3 >= cost[2] && storage.l4 >= cost[3]) {
                            if (j.gid > 4 && location.pathname.includes("dorf1")) {
                                console.log("Wrong section. Navigating to building section for next job in 3s")
                                return setTimeout(() => {
                                    window.location.href = "/dorf2.php"
                                }, 3000)
                            }
                            if (j.gid < 5 && location.pathname.includes("dorf2")) {
                                console.log("Wrong section. Navigating to fields section for next job in 3s")
                                return setTimeout(() => {
                                    window.location.href = "/dorf1.php"
                                }, 3000)
                            }
                            console.log("Enough resourses. Navigating to the building in 5 seconds!")
                            localStorage.setItem(BOT_IN_PROGRESS, JSON.stringify({
                                cid: this.cID,
                                job: j,
                                ress: this.current.ress
                            }));

                            setTimeout(() => {
                                const href = j.to === 1 && j.cat ? `/build.php?newdid=${this.cID}&id=${j.pos}&category=${j.cat}` : `/build.php?newdid=${this.cID}&id=${j.pos}&t=0&s=0`;
                                window.location.href = href
                            }, 5000)

                        }
                        else {
                            console.log("Not enough resourses. Waiting....")
                        }
                    }
                } else {
                    console.log("No planed jobs in this town. Waiting")
                }
            }

        }


        initJobQueue(BOT);
        BOT.displayJobs()
        if (ON) {
            console.log("Starting bot")
            BOT.setNextJob()
        }

    }
}

allInOneOpera();