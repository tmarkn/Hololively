let animelistHeader = $("#listHeader");
let animelist = $("#animeList tbody")
let url_string = window.location.href;
let url = new URL(url_string);
if (user == "") {
    window.location.replace("/animelist/");
}
animelistHeader.text(user.toUpperCase() + "'S ANIMELIST")

let request = $.ajax({
    url: "http://api.jikan.moe/v3/user/" + user + "/animelist",
    type: "GET",
    cache: false,
});
let status = [
    "watching",
    "completed",
    "onHold",
    "dropped",
    "plannedToWatch",
]
let anime = []

request.done(function(data) {
    // animelist
    // console.log(data);
    anime = data.anime;
    console.log(anime);

    // // sort
    anime.sort((a, b) => (a.title > b.title) ? 1 : -1);
    
    buildTable();
});

request.fail(function(a, b, c) {
    let statusCode = a.status;
    if (Math.floor(statusCode / 100) === 4) {
        animelistHeader.text("Profile not found");
    } 
    else if (Math.floor(statusCode / 100) === 5) {
        animelistHeader.text("Problem fetching API")
    }
    console.log(a);
    console.log(a.status);
    console.log(b);
    console.log(c);
    console.log(400 & 100);
});

function buildTable() {
    animelist.find("tr:gt(0)").remove();
    anime.forEach(entry => {
        let row = $("<tr/>", {
            class: "animeRow"
        }).appendTo(animelist);

        row.addClass(status[Number(entry.watching_status) - 1]);

        let posterContainer = $("<td/>").appendTo(row);
        $("<img/>", {
            src: entry.image_url,
            class: "poster"
        }).appendTo(posterContainer);

        $("<td/>", {
            text: entry.title
        }).appendTo(row);

        $("<td/>", {
            text: entry.score
        }).appendTo(row);

        $("<td/>", {
            text: entry.watched_episodes + " / " + entry.total_episodes
        }).appendTo(row);

        $("<td/>", {
            text: "+"
        }).appendTo(row);
    });
}

$("th").on("click", function() {
    if ($(this).hasClass("ignore")) {
        return
    }
    if ($(this).hasClass("active")) {
        if ($(this).hasClass("ascending")) {
            $(this).removeClass("ascending")
        } else {
            $(this).addClass("ascending")
        }
    } else {
        $(".active").removeClass("ascending");
        $(".active").removeClass("active");
        $(this).addClass("active");
        $(this).addClass("ascending")
    }

    let sortBy = $(this).attr("id");
    if (sortBy === "title") {
        if ($(this).hasClass("ascending")) {
            anime.sort((a, b) => (a.title > b.title) ? 1 : -1);
        } else {
            anime.sort((a, b) => (a.title > b.title) ? -1 : 1);
        }
    } else if (sortBy === "score") {
        if ($(this).hasClass("ascending")) {
            anime.sort((a, b) => (a.score === b.score) ? ((a.title > b.title) ? 1 : -1) : (a.score > b.score) ? 1 : -1);
        } else {
            anime.sort((a, b) => (a.score > b.score) ? -1 : 1);
        }
    }

    buildTable();
});

// $(window).scroll(function(){
//     if ($(this).scrollTop() > 100) {
//         $('.TopButton').show().fadeIn();
//     } else {
//         $('.TopButton').fadeOut().hide();
//     }
// });