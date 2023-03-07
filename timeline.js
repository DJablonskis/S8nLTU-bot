KEY.timeline = "timeline_key"


function generateNewStamp(did = CurrentVillage.did) {
    let currentTime = Date.now()

    // TODO: next check should check here if any construction is finishing before this or there will be enough resources soon
    // and change to available time if smaller than max check interval
    return {
        lastCheck: currentTime,
        nextCheck: currentTime + did === CurrentVillage.did ? MIN_WAIT : MAX_WAIT // if not current village did, means we  are generating new stamp for newly found village.
    }
}


// Loads times from storage, with updated current village timestamp
function loadTimestamps() {
    let timestamps = localStorage.getItem(KEY.timeline);
    // deals with null returned from storage
    if (timestamps === null) timestamps = { [CurrentVillage.did]: generateCurrentStamp() }
    else timestamps = JSON.parse(timestamps)
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

function sortAsArray(data) {
    return Object.keys(data).map(key => data[key]).sort((a, b) => a.nextCheck - b.nextCheck)
}

const TIMESTAMPS = loadTimestamps();
checkAllTimestamps(TIMESTAMPS);

console.log(sortAsArray())



