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
let live = []
let revMembers = swap(members);
let calendarContainer = $("#calendarContainer");
let liveContainer = $("#liveContainer");
let loadingContainer = $("#loadingContainer");
let dayTemplate = $("#dayTemplate");
let streamTemplate = $("#streamTemplate");
let lastRefresh = Date.now();

// query
var url = new URL(window.location.href);
var query = url.searchParams.get("q");
if (query === null) {
    query = "";
}

$(document).ready(function () {
    live = buildSchedule(streams);
});

// periodically refresh on focus
$(window).on("focus", function () {
    checkRefresh(5);
});

$(window).on("scroll", function () {
    clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(function() {
        checkRefresh(5)
    }, 100));
});

$(window).on("click", function () {
    checkRefresh(5);
});

function checkRefresh(targetMinutes) {
    // difference in minutes is greater than 5
    let now = Date.now();
    let minutesPassed = (now - lastRefresh) / 1000 / 60;
    console.log(minutesPassed);
    if (minutesPassed > minutesPassed) {
        // update data
        $.ajax({
            url: "/api/" + query,
            type: "GET",
            cache: false,
            success: function (data) {
                loadingContainer.css("display", "flex");
                streams = JSON.parse(data).streams;
                live = buildSchedule(streams);
                lastRefresh = now;
                waitForElement(calendarContainer, function () {
                    loadingContainer.css("display", "none");
                });
            }
        });
    }
};

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
    scrollToLive();
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
        let streamTime = parseTime(stream.time);
        // find day container
        let dayContainer = $(`#${streamTime.getMonth() + 1}-${streamTime.getDate()}`);

        // create day container if not yet made
        if (!dayContainer.length) {
            // create day container
            dayContainer = dayTemplate.clone();
            dayContainer.attr("id", `${streamTime.getMonth() + 1}-${streamTime.getDate()}`);
            let dayStr = `${streamTime.getMonth() + 1}/${streamTime.getDate()} - ${days[streamTime.getDay()]}`;
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
            .attr("src", revMembers[stream.collaborators[0]])

        // name
        clickable.find(".mName")
            .text(stream.host);

        // time
        let timeStr = streamTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        let time = clickable.find(".streamTime")
        time.attr("title", timeStr)
            .text(timeStr);

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
    if (newLive.length) {
        waitForElement(newLive[0], function () {
            liveContainer.css("transform", "scale(0.7)");
        });
    } else {
        liveContainer.css("transform", "scale(0)");
    }
    return newLive;
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