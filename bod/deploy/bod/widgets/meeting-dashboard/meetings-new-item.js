window.Kiiro = window.Kiiro || {};
window.Kiiro.BOD = window.Kiiro.BOD || {};

Kiiro.BOD.NewItem = (function () {
    var _processLocation = function () {
        $('nobr:contains("Location")').closest('tr').hide();
    };
    var _processCategory = function (ctx) {
        var el = $('nobr:contains("Category")').closest('tr');
        el.find("select").val("Meeting");
    };

    return {
        processLocation: _processLocation,
        processCategory: _processCategory
    };
})();

$(document).ready(function () {
    if (GetUrlKeyValue("BODSrc") == "MeetingDashboard") {
        Kiiro.BOD.NewItem.processLocation();
        Kiiro.BOD.NewItem.processCategory();
    }
});