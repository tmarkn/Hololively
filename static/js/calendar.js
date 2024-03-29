const collabNameRegExp = /\(([^)]+)\)/;

// days of the week
const days = [
    "SUN (日)",
    "MON (月)",
    "TUE (火)",
    "WED (水)",
    "THU (木)",
    "FRI (金)",
    "SAT (土)"
];

// resolutions
const res = [
    "sddefault.jpg",

]

// variables
const calendarContainer = $("#calendarContainer");
const liveContainer = $("#liveContainer");
const loadingContainer = $("#loadingContainer");
const dayTemplate = $("#dayTemplate");
const streamTemplate = $("#streamTemplate");
let memberPhotos;
let targetMinutes = 5;

targetMinutes = targetMinutes * 60 * 1000;

// query
var url = new URL(window.location.href);
var query = url.searchParams.get("q");
if (query === null) {
    query = "";
}

$(document).ready(function () {
    getMemberPhotos();
    buildSchedule(streams);
    setTimeout(function () {
        refresh(targetMinutes);
    }, targetMinutes);
    if (liveInNav === true) {
        liveContainer.addClass("liveInNav");
    }
    liveContainer.insertBefore(mobileButton);
});

function getMemberPhotos() {
    // update data
    $.ajax({
        url: "/photos/",
        type: "GET",
        dataType: "json",
        cache: true,
        async: false,
        success: function (data) {
            memberPhotos = data;
        }
    });
}

function refresh(refreshTime) {
    let rTime = refreshTime | 30000 // 5 * 60 * 1000;
    // update data
    $.ajax({
        url: "/api/" + query,
        type: "GET",
        dataType: "json",
        cache: false,
        success: function (data) {
            loadingContainer.css("display", "flex");
            streams = data.streams;
            buildSchedule(streams);
            waitForElement(calendarContainer, function () {
                loadingContainer.css("display", "none");
            });
        }
    });
    setTimeout(function () {
        refresh(rTime);
    }, rTime);
}

// image does not exist
function checkImage(ele) {
    //
    if (ele.naturalWidth === 120 && ele.naturalHeight === 90) {
        let oldThumbnail = $(ele).attr("src");
        $(ele).attr("src", oldThumbnail.replace('/maxresdefault.jpg', '/hqdefault.jpg'));
    }
    $(ele).off('load');
}

// live button animations
liveContainer.on("mouseover", function () {
    $(this).css("transform", "scale(1)");
});

liveContainer.on("mouseleave", function () {
    $(this).css("transform", "scale(0.7)");
});

liveContainer.on("mousedown", function () {
    $(this).css("transform", "scale(1)");
    toggleLive();
    window.setTimeout(function () {
        liveContainer.css("transform", "scale(0.7)");
    }, 100);
});

// create calendar
function buildSchedule(streams) {
    let newLive = [];
    // build calendar
    calendarContainer.empty();
    // create objects
    streams.forEach(stream => {
        // set time zone
        let streamTime = moment(stream.time).tz(moment.tz.guess());
        if (tz !== null) {
            streamTime = moment(stream.time).tz(tz);
        }

        // for upcoming
        if (typeof upcoming !== 'undefined' && upcoming === true) {
            if (!stream.live) {
                let bufferedStreamTime = streamTime.add(15, 'minutes');
                let current = moment();
    
                if (current.isAfter(bufferedStreamTime)) {
                    return
                }
            }
        }   

        // find day container
        // create day container if not yet made
        let date = streamTime.format("M-D");
        let dayContainer = $(`#${date}`);
        if (!dayContainer.length) {
            // create day container
            dayContainer = dayTemplate.clone();
            dayContainer.attr("id", date);
            let dayStr = `${streamTime.format("M/D")} - ${days[(streamTime.day()) % 7]}`;
            dayContainer.find(".dayHeader")
                .html(dayStr.replace(" - ", "<br/>"))
                .attr("title", dayStr);
            dayContainer.appendTo(calendarContainer);
        }

        // container
        let streamContainer = streamTemplate.clone();
        let id = stream.link.slice(32, stream.link.length);
        streamContainer.attr("id", id)
            .attr("title", stream.host)
            .appendTo(dayContainer);

        // clickable link
        let clickable = streamContainer.find(".clickable")
            .attr("href", stream.link);

        // thumbnail
        clickable.find(".thumbnail")
            .attr("src", stream.thumbnail.replace('/mqdefault.jpg', '/maxresdefault.jpg'))

        // avatar
        clickable.find(".avatar")
            .attr("src", memberPhotos[stream.collaborators[0]])

        // name
        clickable.find(".mName")
            .text(stream.host);

        // time
        let time = clickable.find(".streamTime")
        if (lang === "ja-jp") {
            time.attr("title", streamTime.format("HH:mm"));
            timeStr = streamTime.format("HH:mm z");
        } else {
            time.attr("title", streamTime.format("h:mm A"));
            timeStr = streamTime.format("h:mm A z");
        }

        time.text(timeStr);

        // live
        if (stream.live) {
            streamContainer.addClass("live");
            newLive.push(`#${stream.link.slice(32, stream.link.length)}`);
        }

        // collaborators
        // unique collaborators only
        let collaborators = stream.collaborators.filter(onlyUnique);

        // prevent Choco subCh.
        if (stream.host === "癒月ちょこ" || stream.host === "癒月ちょこSub") {
            let chocoMainChIndex = collaborators.indexOf("癒月ちょこ (Yuzuki Choco)");
            let chocoSubChIndex = collaborators.indexOf("癒月ちょこ subCh. (Yuzuki Choco subCh.)");
            if (chocoMainChIndex >= 0 && chocoSubChIndex >= 0) {
                collaborators.splice(chocoSubChIndex, 1);
            }
        }

        // prevent Haachama subCh.
        if (stream.host === "赤井はあと" || stream.host === "赤井はあとSub") {
            let haatoMainChIndex = collaborators.indexOf("赤井はあと (Akai Haato)");
            let haatoSubChIndex = collaborators.indexOf("赤井はあと sub Ch. (Akai Haato sub Ch.)");
            if (haatoMainChIndex >= 0 && haatoSubChIndex >= 0) {
                collaborators.splice(haatoSubChIndex, 1);
            }
        }

        // collab stream
        let collabContainer = clickable.find(".collabContainer");

        if (collaborators.length > 1) {
            let numCollaborators = collaborators.length;
            let numContainers = Math.ceil(collaborators.length / 12);
            let index = 0;

            // make each container
            for (let i = 0; i < numContainers; i++) {
                // calculate how many in current row
                let perRow = Math.ceil(numCollaborators / (numContainers - i));
                numCollaborators -= perRow;
                // clone container
                let newCollabContainer = collabContainer.clone();
                
                // do current row
                for (let j = 0; j < perRow; j++) {
                    // grid
                    newCollabContainer.css("grid-template-columns", `repeat(${3 * perRow + 1}, 1fr)`);

                    // create collab images
                    let collaborator = collaborators[index]
                    // get name of collaborator
                    let enName = collaborator;
                    let nameMatch = collaborator.match(collabNameRegExp);

                    if (nameMatch) {
                        let splits = nameMatch[0].replace(/[\(\)']+/g, '').split(' ');
                            // roboco special case
                            if (splits[0] == 'Roboco') {
                                enName = splits[0];
                            }
                            // aki special case
                            else if (splits[0] == 'Aki') {
                                enName = splits[0];
                            }
                            else if (splits.length > 1) {
                                enName = splits[1];
                            } else {
                                enName = splits[0];
                            }
                    }
                    enName = enName.toLowerCase();

                    let collabor = $("#collabTemplate").clone();

                    // format image link with highest quality image
                    if (hasValue(memberPhotos, collaborator)) {
                        let collabImage = memberPhotos[collaborator];
                        let indexOfEquals = collabImage.lastIndexOf("=");
                        if (indexOfEquals !== -1) {
                            collabImage = collabImage.slice(0, indexOfEquals) + '=s800-c-k-c0x00ffffff-no-rj';
                        }
                        collabor.attr("src", collabImage);
                    }
                    // append each collaborator
                    collabor.attr("title", collaborator)
                        .addClass(enName)
                        .css("grid-column", `${j * 3 + 1}/${j * 3 + 5}`);
                    collabor.appendTo(newCollabContainer);
                    collabor.removeAttr("id");
                    index++;
                }
                newCollabContainer.appendTo(streamContainer);
            }
        }
        collabContainer.remove();
    });

    // scroll to live
    if (newLive.length) {
        liveContainer.css("transform", "scale(0.7)");
        if (liveMode) {
            showNotLive(0);
            hideNotLive(0);
        }
    } else {
        liveContainer.css("transform", "scale(0)");
        showNotLive();
    }
}

// swap dictionary key and values
function swap(dict) {
    var reverse = {};
    for (var key in dict) {
        reverse[dict[key]] = key;
    }
    return reverse;
}

// wait for element then do
function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
        if ($(elementPath).length) {
            callBack(elementPath, $(elementPath));
        } else {
            waitForElement(elementPath, callBack);
        }
    }, 500);
}

// toggle live elements
function toggleLive(animationTime) {
    // optional animation time
    if (animationTime === null) {
        animationTime = 300;
    }
    // activate correct function based on variable
    if (liveMode) {
        showNotLive(animationTime);
    } else {
        hideNotLive(animationTime);
    }
    // toggle variable
    liveMode = !liveMode;
    if (persistentMode) {
        setCookie("liveMode", liveMode, 30);
    }
}

function showNotLive(animationTime) {
    // optional animation time
    if (animationTime === null) {
        animationTime = 300;
    }
    // animate
    $(".dayHeader").stop().slideDown(animationTime)
        .parent().find(".streamContainer:not(.live):not(#streamTemplate)").stop().slideDown(animationTime);
}

function hideNotLive(animationTime) {
    // optional animation time
    if (animationTime === null) {
        animationTime = 300;
    }
    //animate
    $(".streamContainer:not(.live)").stop().slideUp(animationTime);
    // get all dayContainers and subtract the ones with live elements
    $(".dayContainer").not($(".live").parent()).find(".dayHeader").stop().slideUp(animationTime);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function imageExists(url, callback) {
    var img = new Image();
    img.onload = function () {
        if (img.naturalHeight === 90 && img.naturalWidth === 120) {
            callback(false, url);
        } else {
            callback(true, url);
        }
    };
    img.onerror = function () { callback(false, url) };
    img.src = url;
}

function hasValue(json, value) {
    // get key values
    const keys = Object.keys(json)
    // check key for value
    for (let index = 0; index < keys.length; ++index) {
        if(value === keys[index]){
          return true;
        }
    }
    return false
}