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

// variables
let revMembers = swap(members);
let live = [];
let liveContainer = $("#liveContainer");
let calendarContainer = $("#calendarContainer");
let dayTemplate = $("#dayTemplate");
let streamTemplate = $("#streamTemplate");
let callobTemplate = $("#callobTemplate");

// build calendar
// create objects
streams.forEach(stream => {
    let streamTime = parseTime(stream.time);
    // find day container
    let dayContainer = $(`#${streamTime.getMonth() + 1}-${streamTime.getDate()}`);

    // create day container if not yet made
    if (!dayContainer.length) {
        // create day container
        dayContainer = dayTemplate.clone();
        dayContainer.attr("id", `${streamTime.getMonth() + 1}-${streamTime.getDate()}`);
        dayContainer.find("#dayHeader").html(`${streamTime.getMonth() + 1}/${streamTime.getDate()}<br/>${days[streamTime.getDay()]}`);
        dayContainer.appendTo(calendarContainer);
    }

    // container
    let streamContainer = streamTemplate.clone();
    streamContainer.attr("id", stream.link.slice(32, stream.link.length))
        .attr("title", stream.host)
        .appendTo(dayContainer);

    // clickable link
    let clickable = streamContainer.find(".clickable");
    clickable.attr("href", stream.link);

    // thumbnail
    let thumbnail = clickable.find(".thumbnail");
    thumbnail.attr("src", stream.thumbnail)

    // avatar
    let avatar = clickable.find(".avatar");
    avatar.attr("src", revMembers[stream.collaborators[0]])

    // name
    let mName = clickable.find(".mName");
    mName.text(stream.host);
    
    // time
    let timeStr = streamTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    let time = clickable.find(".streamTime")
    time.attr("title", timeStr)
        .text(timeStr);

    // live
    if (stream.live) {
        streamContainer.addClass("live");
        live.push(`#${stream.link.slice(32, stream.link.length)}`);
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
            collabor.attr("src", revMembers[collaborator].slice(0, revMembers[collaborator].indexOf("=")))
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
if (live.length) {
    waitForElement(live[0], function () {
        liveContainer.css("transform", "scale(0.7)");
    });
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
    scrollToLive();
    window.setTimeout(function () {
        liveContainer.css("transform", "scale(0.7)");
    }, 100);
});

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

// parse time and return date object
function parseTime(timeString) {
    timeStr = timeString.slice(0, 10) + "T" + timeString.slice(11, timeString.length);
    return new Date(timeStr);
}

// scroll to live element
let liveIndex = 0;
function scrollToLive() {
    // there is a live stream
    if (live.length) {
        // calculate time to scroll to element
        let scrollPos = $(live[liveIndex]).offset().top - 120;
        let scrollTime = Math.abs($(document).scrollTop() - scrollPos) / 4;
        if (scrollTime < 250) {
            scrollTime = 250;
        } else if (scrollTime > 550) {
            scrollTime = 550;
        }
        // animate
        $('html, body').stop();
        $('html, body').animate({
            scrollTop: scrollPos
        }, scrollTime, "swing");
    }
    // move to next live stream
    liveIndex = (liveIndex + 1) % live.length;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}