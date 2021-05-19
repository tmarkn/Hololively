let localTimeZone = moment.tz.guess();
let defaultLanguage = window.navigator.userLanguage || window.navigator.language;
let acceptCookiesToggle = $("#acceptCookies");
let cookButton = $(".cookButton");
let timeZoneDrop = $("#timeZoneDrop");
let languageDrop = $("#languageDrop");

// switches with a default value of checked
let defaultOn = [
    [liveInNav, liveInNavToggle = $("#liveInNav")],
    [darkMode, darkModeToggle = $("#darkMode")]
];
// switches with a default value of unchecked
let defaultOff = [

];

$(document).ready(function () {
    // check if cookies are not accepted
    if (!acceptCookies) {
        // disable other buttons
        cookButton.prop('disabled', true)
            .parent().addClass("greyed");
    }
    // cookies are accepted
    else {
        // set as checked
        acceptCookiesToggle.prop('checked', true);

        // check each cookie for buttons
        defaultOn.concat(defaultOff).forEach(pair => {
            [cookie, toggle] = pair;
            if (cookie) {
                $(toggle).prop('checked', true);
            }
        });
    }

    let timeZoneNames = moment.tz.names();
    timeZoneNames.forEach(timeZone => {
        $("<option/>").text(timeZone).val(timeZone).appendTo(timeZoneDrop);
        if (tz === null) {
            timeZoneDrop.val(localTimeZone);
        } else {
            timeZoneDrop.val(tz);
        }
    });

    if (lang == "ja-jp") {
        languageDrop.val("ja-jp");
    } else {
        languageDrop.val("en-us");
    }
});

// when acceptCookies is toggled
acceptCookiesToggle.on("input", function () {
    // when checked 
    // set cookie
    // enable other settings
    if ($(this).prop('checked')) {
        // set cookie for cookies
        setCookie("acceptCookies", "true", 30);
        // disable buttons
        cookButton.prop('disabled', false)
            .parent().removeClass("greyed");
    } 
    // when unchecked 
    // clear cookies
    // disable other settings and set them to default
    else {
        clearCookies();
        // disable buttons
        cookButton.prop('disabled', true)
            .prop('checked', false)
            .parent().addClass("greyed");
        // reset other buttons
        defaultOn.forEach(pair => {
            [cookie, toggle] = pair;
            $(toggle).prop('checked', true)
                .change();
        });
        defaultOff.forEach(pair => {
            [cookie, toggle] = pair;
            $(toggle).prop('checked', false)
                .change();
        });
        // reset time zone
        timeZoneDrop.val(localTimeZone);
        // reset language
        if (defaultLanguage == "ja-jp") {
            languageDrop.val("ja-jp");
        } else {
            languageDrop.val("en-us");
        }
    }

});

// when any of the toggle buttons are checked
// not accept cookies button
// set corresponding cookie
$(".switchButton:not(#acceptCookies)").on("change", function () {
    if ($(this).prop('checked')) {
        setCookie($(this).attr("id"), "true", 30);
    } else {
        setCookie($(this).attr("id"), "false", 30);
    }
});

// when dark mode button is checked
// toggle light mode
$(darkModeToggle).on("change", function () {
    if ($(this).prop("checked")) {
        $(":root").removeClass("lightMode");
    } else {
        $(":root").addClass("lightMode");
    }
});

// when timezone value is changed update timezone
timeZoneDrop.on("change", function () {
    setCookie("tz", timeZoneDrop.val(), 30);
});

// when language value is changed update language
languageDrop.on("change", function () {
    setCookie("lang", languageDrop.val(), 30);
});
