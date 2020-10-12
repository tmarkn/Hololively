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

// endpoints
let endpoints = [
    "",
    "hololive",
    "holostars",
    "innk",
    "china",
    "indonesia",
    "english"
];

// variables
let members = {};
let live = [];
let liveContainer = $("#liveContainer");

// query
var url = new URL(window.location.href);
var query = url.searchParams.get("q");
if (query === null) {
    query = "";
}

// validate query
if (query && !endpoints.includes(query)) {
    window.location.href = "/404";
}

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

// get from api
let apiRequest = $.ajax({
    url: "/api/" + query,
    type: "GET",
    cache: true,
});

// fetch successful
// build calendar
apiRequest.done(function (data) {
    // filter results
    let items = JSON.parse(data).streams;
    let calendarContainer = $("#calendarContainer");
    // create objects
    items.forEach(stream => {
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
                                .prepend($("<img/>", { class: "avatar", src: members[stream.collaborators[0]], title: stream.host, loading: "lazy" }))
                                .append($("<span/>", { class: "liveDot" })),
                            // time
                            $("<h2/>", { class: "streamTime", title: timeStr, text: timeStr})
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
        if (stream.host === "癒月ちょこ") {
            let subChIndex = stream.collaborators.indexOf("癒月ちょこ subCh. (Yuzuki Choco subCh.)")
            if (subChIndex >= 0) {
                stream.collaborators.splice(subChIndex, 1);
            }
        }

        // collab stream
        if (stream.collaborators.length > 1) {
            let collabContainer = $("<div/>", { 
                class: "collabContainer", 
                style: "grid-template-columns" + "repeat(" + (3*stream.collaborators.length+1) + ", 1fr)" 
            }).appendTo(clickable);

            // create collab images
            stream.collaborators.forEach(function (collaborator, index) {
                collabContainer.append(
                    $("<img/>", {
                        class: "collabImg",
                        src: members[collaborator].slice(0, members[collaborator].indexOf("=")),
                        title: collaborator,
                        loading: "lazy",
                        style: "grid-column:" + (index*3 + 1) + "/" + (index*3 + 5) + ";"
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
});

// fetch failed
apiRequest.fail(function (a, b) {
    console.log(data);
});

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