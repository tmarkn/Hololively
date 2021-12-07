let body = $("body");

onElementHeightChange(document.body, function(h) {
    let spacerPos = body.position().top + body.outerHeight(true);
    if (spacerPos < $(window).height() - 40) {
        $("#footerSpacer").css("margin-top", $(window).height() - spacerPos);
        console.log(spacerPos, $(window).height());
    }
});

function onElementHeightChange(elm, callback) {
    var lastHeight = elm.clientHeight, newHeight;

    (function run() {
        newHeight = elm.clientHeight;
        if (lastHeight != newHeight)
            callback(newHeight)
        lastHeight = newHeight

        if (elm.onElementHeightChangeTimer)
            clearTimeout(elm.onElementHeightChangeTimer)

        elm.onElementHeightChangeTimer = setTimeout(run, 200)
    })()
}