function initBuilder() {
    return {}
}

const Builder = initBuilder();



const checkTime = (completion) => {
    function pad(n, z = 2) {
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
};

const showDots = () => {
    const detailsBlocks = [];

    Villages.all.forEach((vil) => {
        const nameRow = vil.node.querySelector("span.name");
        let flexBlock = document.createElement("div");
        flexBlock.style.cssText =
            "position: absolute;flex-direction: column; display: inline-flex; font-size: 24px; padding-left: 2px; line-height: 0.35;";
        nameRow.appendChild(flexBlock);

        const block = document.createElement("div");
        block.style.padding = "0 4px";
        block.style.gridColumnStart = "1";
        block.style.gridColumnEnd = "3";
        block.style.fontWeight = 400;

        detailsBlocks.push(block);

        const prodRow = document.createElement("div");
        prodRow.style.padding = "0 12px";
        prodRow.style.fontSize = "10px";
        prodRow.style.display = "flex";
        prodRow.style.justifyContent = "space-between";
        block.appendChild(prodRow);
        ProductionManager.setProductionInfo(vil.did, prodRow);

        const queRow = document.createElement("div");
        block.appendChild(queRow);

        get(vil.did).all.forEach((x) => {
            const task = document.createElement("div");
            queRow.appendChild(task);
            let timer = checkTime(x.finish);
            task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${BDB.name(
                x.gid
            )} level ${x.lvl}</span><span style="font-size:11px;  ${timer.completed ? "color:green;" : ""
                } align-items:center;">${timer.timer}</span>`;
            if (!timer.completed) {
                let updater = setInterval(() => {
                    timer = checkTime(x.finish);
                    task.innerHTML = `<span style="font-size:11px; padding-left: 15px; padding-right:8px">${BDB.name(
                        x.gid
                    )} level ${x.lvl}</span><span style="font-size:11px; ${timer.completed ? "color:green;" : ""
                        } align-items:center;">${timer.timer}</span>`;

                    if (timer.completed) {
                        clearInterval(updater);
                    }
                }, 1000);
            }
        });

        DetailedStats.subscribe((d) => {
            detailsBlocks.forEach((b) => (b.style.display = d ? "block" : "none"));
        });

        vil.node.appendChild(block);
    });
};

// showDots();