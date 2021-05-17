let acceptCookiesToggle = $("#acceptCookies");
let cookButton = $(".cookButton");

let defaultOn = [
    [liveInNav, liveInNavToggle = $("#liveInNav")],
    [darkMode, darkModeToggle = $("#darkMode")]
];

$(document).ready(function () {
    if (!acceptCookies) {
        cookButton.prop('disabled', true)
            .prop('checked', false)
            .parent().addClass("greyed");
        liveInNavToggle.prop('checked', true);
    } else {
        acceptCookiesToggle.prop('checked', true);
    }

    defaultOn.forEach(pair => {
        [cookie, toggle] = pair;
        if (cookie) {
            $(toggle).prop('checked', true);
        }
    });
});

acceptCookiesToggle.on("input", function () {
    if ($(this).prop('checked')) {
        setCookie("acceptCookies", "true", 30);
        cookButton.prop('disabled', false)
            .parent().removeClass("greyed");
    } else {
        clearCookies();
        cookButton.prop('disabled', true)
            .prop('checked', false)
            .parent().addClass("greyed");
        defaultOn.forEach(pair => {
            [cookie, toggle] = pair;
            $(toggle).prop('checked', true);
        });
        $(":root").removeClass("lightMode");
    }

});

$(".switchButton:not(#acceptCookies)").on("input", function () {
    if ($(this).prop('checked')) {
        setCookie($(this).attr("id"), "true", 30);
    } else {
        setCookie($(this).attr("id"), "false", 30);
    }
});

$(darkModeToggle).on("input", function () {
    $(":root").toggleClass("lightMode");
});