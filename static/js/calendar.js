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
    let items = JSON.parse(data).content;
    let live = null;
    // console.log(data);
    console.log("hi");

    

    // create objects
    items.forEach(item => {
        let day = new Date(Date.parse(item.date));
        console.log(day);
        console.log(day.getDay());

        let dayContainer = $("<div/>", {
            id: days[day.getDay()].substring(0, 3),
            class: "dayContainer",
        });
        console.log("p1");
        dayContainer.appendTo("#calendarContainer");
        console.log("p2");
        let dayHeader = $("<h1/>", {
            class: "dayHeader",
            text: (day.getMonth()+1) + "/" + day.getDate() + '\n' + days[day.getDay()],
        }).appendTo(dayContainer);
        dayHeader.html(dayHeader.html().replace(/\n/g, '<br/>'));

        console.log(item["streams"].toString());
        item.streams.forEach(stream => {
            console.log(stream.link);
            let streamContainer = $("<div/>", {
                id: stream.link,
                class: "streamContainer",
            }).appendTo($('#' + days[day.getDay()].substring(0, 3)));

            let clickable = $("<a/>", {
                class: "clickable",
                href: stream.link,
                target: '_blank',
            }).appendTo(streamContainer);

            $("<img/>", {
                class: "thumbnail",
                src: stream.thumbnail,
                title: stream.host,
            }).appendTo(clickable);

            let textContainer = $("<div/>", {
                class: "textContainer",
            }).appendTo(clickable);

            let memberName = $("<h2/>", {
                class: "memberName",
                text: stream.host,
            }).appendTo(textContainer);

            memberName
            .prepend($("<img/>", {
                class: "avatar",
                src: members[stream.collaborators[0]],
                title: stream.host,
            })
            .appendTo(clickable));

            let streamTime = new Date(Date.parse(stream.time));

            $("<h2/>", {
                class: "streamTime",
                text: streamTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            }).appendTo(textContainer);

            if (stream.live) {
                streamContainer.addClass("live");
                memberName.append($("<span/>", {
                    class: "liveDot",
                }));
                if (live === null) {
                    live = streamContainer;
                }
            }
        });
    });

    if (live) {
        setTimeout(function() {
            $('html, body').animate({
                scrollTop: live.offset().top - 120
            }, 1000, "swing");
        }, 300);
    }

    $("#calendarContainer").hide().fadeIn('fast');
});

// fetch failed
apiRequest.fail(function (a, b) {
    console.log(data);
});

function swap(dict) {
var reverse = {};
for (var key in dict) {
    reverse[dict[key]] = key;
}
return reverse;
}