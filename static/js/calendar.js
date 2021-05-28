// days of the week
let days = [
    "SUN (日)",
    "MON (月)",
    "TUE (火)",
    "WED (水)",
    "THU (木)",
    "FRI (金)",
    "SAT (土)"
];

// resolutions
let res = [
    "sddefault.jpg",

]

// variables
let revMemberPhotos = swap(memberPhotos);
let calendarContainer = $("#calendarContainer");
let liveContainer = $("#liveContainer");
let loadingContainer = $("#loadingContainer");
let dayTemplate = $("#dayTemplate");
let streamTemplate = $("#streamTemplate");
let scrollStart = false;
let targetMinutes = 5;

targetMinutes = targetMinutes * 60 * 1000;

// query
var url = new URL(window.location.href);
var query = url.searchParams.get("q");
if (query === null) {
    query = "";
}

$(document).ready(function () {
    buildSchedule(streams);
    setTimeout(function () {
        refresh(targetMinutes);
    }, targetMinutes);
    if (liveInNav === true) {
        liveContainer.addClass("liveInNav");
    }
    liveContainer.insertBefore(mobileButton);
});

function refresh(targetMinutes) {
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
        refresh(targetMinutes);
    }, targetMinutes);
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
            .attr("src", revMemberPhotos[stream.collaborators[0]])

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

        // collab stream
        let collabContainer = clickable.find(".collabContainer");
        if (collaborators.length > 1) {
            // grid
            collabContainer.css("grid-template-columns", `repeat(${3 * collaborators.length + 1}, 1fr)`);

            // create collab images
            collaborators.forEach(function (collaborator, index) {
                let collabor = $("#collabTemplate").clone();
                collabor.attr("src", revMemberPhotos[collaborator].slice(0, revMemberPhotos[collaborator].indexOf("=")))
                    .attr("title", collaborator)
                    .css("grid-column", `${index * 3 + 1}/${index * 3 + 5}`);
                collabor.appendTo(collabContainer);
                collabor.removeAttr("id");
            });
        } else {
            collabContainer.remove();
        }
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
        liveMode = false;
        if (persistentMode) {
            setCookie("liveMode", false, 30);
        }
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