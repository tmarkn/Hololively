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

// build calendar
// create objects
streams.forEach(stream => {
    let streamTime = parseTime(stream.time);
    // find day container
    let dayContainer = $("#" + (streamTime.getMonth() + 1) + "-" + streamTime.getDate());

    // create day container if not yet made
    if (!dayContainer.length) {
        // create day container
        dayContainer = $("<div/>", { id: (streamTime.getMonth() + 1) + "-" + streamTime.getDate(), class: "dayContainer" }).append(
            // header
            $("<h1/>", {
                class: "dayHeader",
                html: (streamTime.getMonth() + 1) + "/" + streamTime.getDate() + '<br/>' + days[streamTime.getDay()]
            })
        ).appendTo(calendarContainer);
    }

    // container
    let streamContainer = $("<div/>", {
        id: stream.link.slice(32, stream.link.length),
        class: "streamContainer"
    })
    // clickable link
    let clickable = $("<a/>", {
        class: "clickable",
        href: stream.link,
        target: '_blank'
    })

    // time string
    let timeStr = streamTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    dayContainer.append(
        streamContainer.append(
            clickable.append(
                // topContainer
                $("<div/>", { class: "topContainer" }).append(
                    // thumbnail
                    $("<img/>", { class: "thumbnail", src: stream.thumbnail, title: stream.host, loading: "lazy" }),
                    // text
                    $("<div/>", { class: "textContainer" }).append(
                        $("<h2/>", { class: "memberName", title: stream.host, text: stream.host })
                            .prepend($("<img/>", { class: "avatar", src: revMembers[stream.collaborators[0]], title: stream.host, loading: "lazy" }))
                            .append($("<span/>", { class: "liveDot" })),
                        // time
                        $("<h2/>", { class: "streamTime", title: timeStr, text: timeStr })
                    )
                )
            )
        )
    )

    // live
    if (stream.live) {
        streamContainer.addClass("live");
        live.push("#" + stream.link.slice(32, stream.link.length));
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
    if (collaborators.length > 1) {
        let collabContainer = $("<div/>", {
            class: "collabContainer",
            style: "grid-template-columns:" + "repeat(" + (3 * collaborators.length + 1) + ", 1fr)"
        }).appendTo(clickable);

        // create collab images
        collaborators.forEach(function (collaborator, index) {
            // add collaborator
            collabContainer.append(
                $("<img/>", {
                    class: "collabImg",
                    src: revMembers[collaborator].slice(0, revMembers[collaborator].indexOf("=")),
                    title: collaborator,
                    loading: "lazy",
                    style: "grid-column:" + (index * 3 + 1) + "/" + (index * 3 + 5) + ";"
                })
            )
        });
    }
});
// scroll to live
if (live.length) {
    waitForElement(live[0], function () {
        liveContainer.css("transform", "scale(1)");
    });
}

// live button animations
liveContainer.on("mouseover", function () {
    $(this).css("transform", "scale(1.35)");
});

liveContainer.on("mouseleave", function () {
    $(this).css("transform", "scale(1)");
});

liveContainer.on("mousedown", function () {
    $(this).css("transform", "scale(1.35)");
    scrollToLive();
    window.setTimeout(function () {
        liveContainer.css("transform", "scale(1)");
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
    liveIndex += 1;
    if (liveIndex >= live.length) {
        liveIndex = 0;
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}