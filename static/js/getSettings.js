let acceptCookies = getCookie("acceptCookies") === "true";
let liveInNav = true;
if (getCookie("liveInNav") !== null) {
    liveInNav = getCookie("liveInNav") === "true";
}
let darkMode = true;
if (getCookie("darkMode") !== null) {
    darkMode = getCookie("darkMode") === "true";
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function removeCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function clearCookies() {
    var cookies = document.cookie.split("; ");
    cookies.forEach(cookie => {
        removeCookie(cookie);
    });
}