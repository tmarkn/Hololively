let navBarContainer = $("#navBarContainer");
let navBar = $("#navBar");
let mobileButton = $("#mobileButton");
let open = false;
let mobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
let mobileWidth = 800;

if (mobile) {
    $("head").append($("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: mobileUrl,
    }))
}

setTimeout(function () {
    hideNav();
}, 300);

navBarContainer.on("mouseenter", function () {
    if (!mobile && window.innerWidth > mobileWidth) {
        showNav();
    }
});

navBarContainer.on("mouseleave", function () {
    if (!mobile && window.innerWidth > mobileWidth) {
        hideNav();
    }
});

mobileButton.on("mousedown", function (e) {
    if (!open) {
        e.stopPropagation();
        showNav();
    }
});

$('body').on("mousedown", function () {
    if (open) {
        hideNav();
    }
});

navBar.on("mousedown", function (e) {
    e.stopPropagation();
});

$(window).resize(function () {
    if (open) {
        hideNav();
    }
});

function showNav() {
    open = true;
    navBar.stop()
        .show()
        .animate({
            "height": navBar.get(0).scrollHeight
        }, 200);
}

function hideNav() {
    open = false;
    navBar.stop()
        .animate({
            "height": 0
        }, 200, function () {
            navBar.hide();
        });
}
