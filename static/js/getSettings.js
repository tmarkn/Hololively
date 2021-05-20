// cookies
let acceptCookies = getCookie("acceptCookies") === "true";
let liveInNav = true;
if (getCookie("liveInNav") !== null) {
    liveInNav = getCookie("liveInNav") === "true";
}
let darkMode = true;
if (getCookie("darkMode") !== null) {
    darkMode = getCookie("darkMode") === "true";
}
let persistentMode = false;
if (getCookie("persistentMode") !== null) {
    persistentMode = getCookie("persistentMode") === "true";
}
let liveMode = false;
if (persistentMode && getCookie("liveMode") !== null) {
    liveMode = getCookie("liveMode") === "true";
}
let tz = null;
if (getCookie("tz") !== null) {
    tz = getCookie("tz");
}
let lang = window.navigator.userLanguage || window.navigator.language;
if (getCookie("lang") !== null) {
    lang = getCookie("lang");
}

// functions
// set cookie with a value and expiration date
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// get value of cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')  {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

// delete cookie
function removeCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// delete all cookies
function clearCookies() {
    var cookies = document.cookie.split("; ");
    cookies.forEach(cookie => {
        removeCookie(cookie);
    });
}