function initTimeline() {
    KEY.timeline = "timeline_key"

    function generateNewStamp(did = CurrentVillage.did) {
        let currentTime = new Date().getTime()
        let next = did === CurrentVillage.did ? MAX_WAIT : MIN_WAIT // if not current village did, means we  are generating new stamp for newly found village.
        let total = currentTime + next;
        // TODO: next check should check here if any construction is finishing before this or there will be enough resources soon
        // and change to available time if smaller than max check interval

        return {
            lastCheck: currentTime,
            nextCheck: total
        }
    }

    // Loads times from storage, with updated current village timestamp
    function loadTimestamps() {
        let timestamps = localStorage.getItem(KEY.timeline);
        // deals with null returned from storage
        if (timestamps === null) timestamps = {}
        else timestamps = JSON.parse(timestamps)
        timestamps[CurrentVillage.did] = generateNewStamp()
        return timestamps
    }

    // checks timestamp for missing village timestamps and fills with new timestamps for missing villages and saves to storage
    function checkAllTimestamps(data) {
        Villages.all.forEach(v => {
            // generate timestamps for villages not in state
            if (!Object.keys(data).includes(v.did)) data[v.did] = generateNewStamp(v.did)
        });

        localStorage.setItem(KEY.timeline, JSON.stringify(data));
    }

    const TIMESTAMPS = loadTimestamps();
    checkAllTimestamps(TIMESTAMPS);

    return {
        getTimeline: () => {
            return Object.keys(TIMESTAMPS).map(key => (
                {
                    ...TIMESTAMPS[key],
                    did: key,
                    name: Villages.get(key).name
                })).sort((a, b) => a.nextCheck > b.nextCheck ? 1 : -1)
        }
    }
}

const TimelineManager = initTimeline()


let LOG = BotPanel.addSection("Timeline");

LOG.content.innerHTML = TimelineManager.getTimeline().reduce((a, v) => {
    return a + `<div>${v.name} next check in <b>${Math.ceil((v.nextCheck - new Date().getTime()) / 1000)}s</b></div>`
}, "")


