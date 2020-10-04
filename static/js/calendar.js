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

let members = {};
let live = [];
let liveButton = $("#liveButton");
// fetch data from api
$.ajax({
    url: "/static/json/members.json",
    type: "GET",
    cache: true,
    async: false,
    success: function (data) {
        members = swap(data);
    }
});

let apiRequest = $.ajax({
    url: "/api/",
    type: "GET",
    cache: true,
});

// fetch successful
// build calendar
apiRequest.done(function (data) {
    // filter results
    let items = JSON.parse(data).streams;
    let calendarContainer = $("#calendarContainer");
    let count = 0;
    // create objects
    items.forEach(stream => {
        let streamTime = parseTime(stream.time);
        // find day container
        let dayContainer = $("#" + (streamTime.getMonth() + 1) + "-" + streamTime.getDate());

        // create day container if not yet made
        if (!dayContainer.length) {
            dayContainer = $("<div/>", {
                id: (streamTime.getMonth() + 1) + "-" + streamTime.getDate(),
                class: "dayContainer",
            });
            dayContainer.appendTo(calendarContainer);
            let dayHeader = $("<h1/>", {
                class: "dayHeader",
                text: (streamTime.getMonth() + 1) + "/" + streamTime.getDate() + '\n' + days[streamTime.getDay()],
            }).appendTo(dayContainer);
            dayHeader.html(dayHeader.html().replace(/\n/g, '<br/>'));
        }

        // container
        let streamContainer = $("<div/>", {
            id: stream.link.slice(32, stream.link.length),
            class: "streamContainer",
        }).appendTo(dayContainer);

        // clickable link
        let clickable = $("<a/>", {
            class: "clickable",
            href: stream.link,
            target: '_blank',
        }).appendTo(streamContainer);

        // thumbnail
        $("<img/>", {
            class: "thumbnail",
            src: stream.thumbnail,
            title: stream.host,
        }).appendTo(clickable);

        // name
        let textContainer = $("<div/>", {
            class: "textContainer",
        }).appendTo(clickable);

        let memberName = $("<h2/>", {
            class: "memberName",
            text: stream.host,
        }).appendTo(textContainer)
            .prepend($("<img/>", {
                class: "avatar",
                src: members[stream.collaborators[0]],
                title: stream.host,
            }));

        // time
        $("<h2/>", {
            class: "streamTime",
            text: streamTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }).appendTo(textContainer);

        // live
        if (stream.live) {
            streamContainer.addClass("live");
            memberName.append($("<span/>", {
                class: "liveDot",
            }));
            live.push(streamContainer);
        }
    });
    // scroll to live
    if (live.length) {
        waitForElement(live, function () {
            liveButton.css("transform", "scale(1)");
        });
    }
});

// fetch failed
apiRequest.fail(function (a, b) {
    console.log(data);
});

// live button
liveButton.on("mouseover", function () {
    $(this).css("transform", "scale(1.35)");
});

liveButton.on("mouseleave", function () {
    $(this).css("transform", "scale(1)");
});

liveButton.on("mousedown", function () {
    $(this).css("transform", "scale(1.35)");
    scrollToLive();
    window.setTimeout(function () {
        liveButton.css("transform", "scale(1)");
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
    if (live.length) {
        let scrollPos = live[liveIndex].offset().top - 120;
        let scrollTime = Math.abs($(document).scrollTop() - scrollPos) / 4;
        if (scrollTime < 250) {
            scrollTime = 250;
        } else if (scrollTime > 550) {
            scrollTime = 550;
        }
        $('html, body').stop();
        $('html, body').animate({
            scrollTop: scrollPos
        }, scrollTime, "swing");
    }
    liveIndex += 1;
    if (liveIndex >= live.length) {
        liveIndex = 0;
    }
}