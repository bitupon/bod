window.Kiiro = window.Kiiro || {};
window.Kiiro.BOD = window.Kiiro.BOD || {};

Kiiro.BOD.Meetings = (function () {
    //SP Page Context Variables
    var relativeUrl,
        absoluteUrl,
        currentUserId,
        isSiteOwner,
        userDisplayName,
    //Other Global Variables
        projectArr,
        bodSalt,
        meetingSiteTemplate,
    //Selectors
        sel = {
            bodMainFrm: "#aspnetForm",
            bodModalAddMeeting: "#modalAddMeeting",
            bodModalMeetingSuccess: "#modalMeetingSuccess",
            bodBtnOpenAddEditMeetingModal: "#btnOpenAddEditMeetingModal",
            btnSaveMeeting: "#btnSaveMeeting"
        },
    //Underscore Templates
        mdTemplates;

    //Fail Methods
    var _restFailure = function (xhs) {
        Kiiro.BOD.Common.showResponseMessage('Request failed. ' + xhs.status + ': ' + xhs.statusText, "failure");
        Kiiro.BOD.Common.showLoader(false);
    };

    var _jsomDataFailure = function (sender, args) {
        Kiiro.BOD.Common.showResponseMessage('Request failed. ' + args.get_message() + args.get_stackTrace(), "failure");
        Kiiro.BOD.Common.showLoader(false);
    };

    var _disableSiteAction = function () {
        $("#btnSaveMeeting").attr("disabled", "disabled");
        var modalHeader = $("#modalAddMeeting .modal-title").html();
        $("#modalAddMeeting .modal-title").html("Please wait! While we " + modalHeader);
    }

    //Delete Meeting
    var _deleteMeetingSuccess = function (param) {
        $(sel.bodModalAddMeeting).modal('hide');
        _getMeetings();
        Kiiro.BOD.Common.showResponseMessage("Meeting (" + param.Url + ") is successfully deleted", "success");
    }

    var _deleteMeeting = function (title, desc, url) {
        Kiiro.BOD.JSOMUtil.deleteSite(url, Kiiro.BOD.Meetings.deleteMeetingSuccess, Kiiro.BOD.Meetings.jsomDataFailure, { Url: url });
        _disableSiteAction();
    }

    //Update Meeting
    var _updateMeetingSuccess = function (param) {
        $(sel.bodModalAddMeeting).modal('hide');
        _getMeetings();
        Kiiro.BOD.Common.showResponseMessage("Meeting (" + param.Url + ") is successfully updated", "success");
    }

    var _updateMeeting = function (title, desc, url) {
        Kiiro.BOD.JSOMUtil.updateSite(title, desc, url, Kiiro.BOD.Meetings.updateMeetingSuccess, Kiiro.BOD.Meetings.jsomDataFailure, { Url: url });
        _disableSiteAction();
    }

    //Provision Meeting 
    var _provisonMeetingSuccess = function (url) {
        setTimeout(function () {
            $(sel.bodModalMeetingSuccess).modal('hide');
            _getMeetings();
            Kiiro.BOD.Common.showResponseMessage("Meeting (" + url + ") is successfully created", "success");
        }, 1000);
    }

    var _provisonMeetingFailure = function (sender, args, el, url) {
        var errorMessage;

        if (args) {
            errorMessage = args.get_message();
        }
        else {
            errorMessage = sender.statusText;
        }

        console.log(el + errorMessage);

        Kiiro.BOD.Common.showContentFailure(el, true);

        setTimeout(function () {
            $(sel.bodModalMeetingSuccess).modal('hide');
            _getMeetings();
            Kiiro.BOD.Common.showResponseMessage("Error while creating Meeting (" + url + ").<br/>" + errorMessage, "failure");
        }, 1000);
    }

    var _provisonMeeting = function (title, desc) {
        $(sel.bodModalAddMeeting).modal('hide');
        $("#bodMeetingsSuccessModalWrapper").html(
            mdTemplates.tmpMeetingSuccessModal()
        );
        $(sel.bodModalMeetingSuccess).modal('show');

        Kiiro.BOD.Common.showContentLoader(".bod-meeting-success-status", true);

        var hashids = new Hashids(bodSalt);
        var currDate = new Date();
        var hasidsKey = currDate.getTime();
        var url = hashids.encode(hasidsKey);

        $.when(Kiiro.BOD.JSOMUtil.createSite(title, url, meetingSiteTemplate, desc))
        .then(
            function () {
                var meetingSiteUrl = absoluteUrl + "/" + url;
                var meetingSiteRelativeUrl = relativeUrl + "/" + url;

                var ownerGroupName = url + " Owners";
                var ownerGroupDescription = url + " Owners Group";
                var ownerGroupPermission = "Full Control";

                var memberGroupName = url + " Members";
                var memberGroupDescription = url + " Members Group";
                var memberGroupPermission = "Edit";

                var visitorGroupName = url + " Visitors";
                var visitorGroupDescription = url + " Visitors Group";
                var visitorGroupPermission = "Read";

                //Site creation success
                Kiiro.BOD.Common.showContentSuccess("#create-meeting", true);

                $.when(Kiiro.BOD.JSOMUtil.createGroup(meetingSiteUrl, ownerGroupName, ownerGroupDescription, ownerGroupPermission),
                       Kiiro.BOD.JSOMUtil.createGroup(meetingSiteUrl, memberGroupName, memberGroupDescription, memberGroupPermission),
                       Kiiro.BOD.JSOMUtil.createGroup(meetingSiteUrl, visitorGroupName, visitorGroupDescription, visitorGroupPermission))
                .then(
                    function () {
                        //Site Group Creation success
                        Kiiro.BOD.Common.showContentSuccess("#create-meeting-permission", true);

                        var meetingsName = "Meetings";
                        var meetingsListTemplate = SP.ListTemplateType.events;
                        var meetingsOldContentType = "Event";
                        var meetingsContentTypeId = "0x010200105EAC5B0F3045CE98C20824D2E80E78";

                        var meetingAttendancesName = "MeetingAttendances";
                        var meetingAttendancesListTemplate = SP.ListTemplateType.genericList;
                        var meetingAttendancesOldContentType = "Item";
                        var meetingAttendancesContentTypeId = "0x0100B8F984013B914F05B3110C96D1555FC1";

                        var agendasName = "Agendas";
                        var agendasListTemplate = SP.ListTemplateType.genericList;
                        var agendasOldContentType = "Item";
                        var agendasContentTypeId = "0x0100C10E2DAF8DD647B99EFC2ECD1B3BD96E";

                        var agendaAttachmentsName = "AgendaAttachments";
                        var agendaAttachmentsListTemplate = SP.ListTemplateType.documentLibrary;
                        var agendaAttachmentsOldContentType = "Document";
                        var agendaAttachmentsContentTypeId = "0x010100B204C490E6DC48A088160268F3DE5E63";

                        var agendaCommentsName = "AgendaComments";
                        var agendaCommentsListTemplate = SP.ListTemplateType.genericList;
                        var agendaCommentsOldContentType = "Item";
                        var agendaCommentsContentTypeId = "0x010026C954C5F7A9483ABF23013498CA99B8";

                        var agendaVotesName = "AgendaVotes";
                        var agendaVotesListTemplate = SP.ListTemplateType.genericList;
                        var agendaVotesOldContentType = "Item";
                        var agendaVotesContentTypeId = "0x0100A72A1E1D8D8D4CBDAE8EEE9C7147579F";

                        $.when(Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, meetingsName, meetingsListTemplate, meetingsContentTypeId, meetingsOldContentType),
                               Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, meetingAttendancesName, meetingAttendancesListTemplate, meetingAttendancesContentTypeId, meetingAttendancesOldContentType),
                               Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, agendasName, agendasListTemplate, agendasContentTypeId, agendasOldContentType),
                               Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, agendaAttachmentsName, agendaAttachmentsListTemplate, agendaAttachmentsContentTypeId, agendaAttachmentsOldContentType),
                               Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, agendaCommentsName, agendaCommentsListTemplate, agendaCommentsContentTypeId, agendaCommentsOldContentType),
                               Kiiro.BOD.JSOMUtil.createList(meetingSiteUrl, agendaVotesName, agendaVotesListTemplate, agendaVotesContentTypeId, agendaVotesOldContentType))
                        .then(
                            function () {
                                //List Creation success
                                var nfMeetingsScriptPath = relativeUrl + "/Style Library/bod/widgets/meeting-dashboard/meetings-script.webpart";
                                var nfMeetingsPage = meetingSiteRelativeUrl + "/Lists/Meetings/NewForm.aspx";
                                var nfMeetingsZoneName = "MSOZone";
                                var nfMeetingsZoneId = 5;

                                $.when(Kiiro.BOD.JSOMUtil.addWebPart(meetingSiteUrl, nfMeetingsScriptPath, nfMeetingsPage, nfMeetingsZoneName, nfMeetingsZoneId, { SiteAbsoluteUrl: absoluteUrl }))
                                .then(
                                    function () {
                                        //Add webpart to meeting list success
                                        Kiiro.BOD.Common.showContentSuccess("#create-list", true);

                                        var meetingDashboardPageName = "MeetingDashboard";
                                        var meetingDashboardPageLayout = "bod.pl.meeting-dashboard";

                                        $.when(Kiiro.BOD.JSOMUtil.createPage(meetingSiteUrl, meetingDashboardPageName, meetingDashboardPageLayout))
                                        .then(
                                            function () {
                                                //Page Creation success
                                                Kiiro.BOD.Common.showContentSuccess("#create-page", true);

                                                var meetingsScriptPath = relativeUrl + "/Style Library/bod/widgets/meeting-dashboard/meeting-dashboard.dwp";
                                                var meetingsPage = meetingSiteRelativeUrl + "/Pages/MeetingDashboard.aspx";
                                                var meetingsZoneName = "bodMeetingDashboardTmp";
                                                var meetingsZoneId = 0;

                                                $.when(Kiiro.BOD.JSOMUtil.addWebPart(meetingSiteUrl, meetingsScriptPath, meetingsPage, meetingsZoneName, meetingsZoneId, { SiteRelativeUrl: relativeUrl }))
                                                .then(
                                                    function () {
                                                        //Add Webpart success
                                                        Kiiro.BOD.Common.showContentSuccess("#create-add-web-part", true);

                                                        $.when(Kiiro.BOD.JSOMUtil.checkInPage(meetingSiteUrl, meetingDashboardPageName, relativeUrl, url))
                                                        .then(
                                                            function () {
                                                                //Page Check In success
                                                                $.when(Kiiro.BOD.JSOMUtil.setWelcomePage(meetingSiteUrl, meetingDashboardPageName))
                                                                .then(
                                                                    function () {
                                                                        //Set Welcome page success
                                                                        Kiiro.BOD.Common.showContentSuccess("#set-welcome-page", true);

                                                                        var customMasterPageUrl = relativeUrl + "/_catalogs/masterpage/bod.master";
                                                                        $.when(Kiiro.BOD.JSOMUtil.setMasterPage(meetingSiteUrl, customMasterPageUrl, null))
                                                                        .then(
                                                                            function () {
                                                                                //Set master page success 
                                                                                Kiiro.BOD.Common.showContentSuccess("#set-master-page", true);

                                                                                _provisonMeetingSuccess(meetingSiteUrl);
                                                                            },
                                                                            function (sender, args) {
                                                                                //Set master page failed
                                                                                _provisonMeetingFailure(sender, args, "#set-master-page", url);
                                                                            }
                                                                        )
                                                                    },
                                                                    function (sender, args) {
                                                                        //Set Welcome page failed
                                                                        _provisonMeetingFailure(sender, args, "#set-welcome-page", url);
                                                                    }
                                                                )
                                                            },
                                                            function (sender, args) {
                                                                //Page Check In failed                                                        
                                                                console.log("Page Check In failed : " + args.get_message());
                                                            }
                                                        )
                                                    },
                                                    function (sender, args) {
                                                        //Add Webpart failed
                                                        _provisonMeetingFailure(sender, args, "#create-add-web-part", url);
                                                    }
                                                )
                                            },
                                            function (sender, args) {
                                                //Page Creation failed
                                                _provisonMeetingFailure(sender, args, "#create-page", url);
                                            }
                                        )
                                    },
                                    function (sender, args) {
                                        //Add webpart to meeting list failed
                                        _provisonMeetingFailure(sender, args, "#create-list", url);
                                    }
                                )
                            },
                            function (sender, args) {
                                //List Creation failed
                                _provisonMeetingFailure(sender, args, "#create-list", url);
                            }
                        )
                    },
                    function (sender, args) {
                        //Site Group Creation failed
                        _provisonMeetingFailure(sender, args, "#create-meeting-permission", url);
                    }
                )
            },
            function (sender, args) {
                //Site creation failed 
                _provisonMeetingFailure(sender, args, "#create-meeting-permission", url);
            }
        )
    }

    //Render Methods
    var _renderUserProfile = function (data) {
        if (data) {
            $("#bodUserProfile").html(
               mdTemplates.tmpUserProfile(data)
            );
        }
    }

    var _renderMeetings = function (data) {
        if (data) {
            $("#bodMeetings").html(
               mdTemplates.tmpMeetings(data)
            );

            _.each(data, function (meeting, key) {
                var meetingUrl = meeting.UrlKey;
                $("#btnMeetingUrl-" + meetingUrl).on('click', function (e) {
                    window.location.href = meeting.Url;
                });
                $("#btnMeetingEdit-" + meetingUrl).on('click', function (e) {
                    meeting.ModalType = "Edit";
                    _renderMeetingModal(meeting);
                    $(sel.bodModalAddMeeting).modal('show');
                });
                $("#btnMeetingDelete-" + meetingUrl).on('click', function (e) {
                    meeting.ModalType = "Delete";
                    _renderMeetingModal(meeting);
                    $(sel.bodModalAddMeeting).modal('show');
                });
            })
        }
    }

    var _renderMeetingModal = function (data) {
        if (data) {
            $("#bodMeetingsModalWrapper").html(
                mdTemplates.tmpMeetingModal(data)
            );

            $(sel.bodMainFrm).validate({
                rules: {
                    // simple rule, converted to {required:true}
                    meeting_title: "required",
                    meeting_description: "required"
                }
            });

            $(sel.btnSaveMeeting).on('click', function (e) {
                if ($(sel.bodMainFrm).valid()) {
                    //Get Data for the inp fields through a submit handler

                    var title = $("#txtMeetingTitle").val(),
                        desc = $("#txtMeetingDescription").val(),
                        url = $("#txtMeetingUrl").val(),
                        modalType = $(e.currentTarget).data("modalType");

                    if (modalType == "Add") {
                        _provisonMeeting(title, desc);
                    } else if (modalType == "Edit") {
                        _updateMeeting(title, desc, url);
                    } else if (modalType == "Delete") {
                        _deleteMeeting(title, desc, url);
                    }
                }
            });
        }
    }

    //Get Methods
    var _getMeetingsSuccess = function (webColl) {
        var webEnumerator = webColl.getEnumerator(),
            currentEnumerator,
            currentTemplate,
            projectArr = [],
            title,
            description,
            url,
            urlKey;

        while (webEnumerator.moveNext()) {
            currentEnumerator = webEnumerator.get_current();
            currentTemplate = currentEnumerator.get_webTemplate();
            if (currentTemplate != "APP") {
                title = currentEnumerator.get_title();
                description = currentEnumerator.get_description();
                url = currentEnumerator.get_url();
                urlKey = url.replace(absoluteUrl + "/", "");

                projectArr.push({
                    Title: title,
                    Description: description,
                    Url: url,
                    UrlKey: urlKey
                })
            }
        }

        _renderMeetings(projectArr);

        Kiiro.BOD.Common.showLoader(false);
    }

    var _getMeetings = function () {
        Kiiro.BOD.Common.showLoader(true);

        Kiiro.BOD.JSOMUtil.getSubWebs(Kiiro.BOD.Meetings.getMeetingsSuccess, Kiiro.BOD.Meetings.jsomDataFailure);
    }

    var _getCurrentUserDetailSuccess = function (data) {
        if (data) {
            var userDetails = {
                UserName: userDisplayName,
                JobTitle: data.d.Title || "NA",
                PictureUrl: "/_layouts/15/userphoto.aspx?size=L&amp;username=" + data.d.EMail
            }
            _renderUserProfile(userDetails)
        }
    };

    var _getCurrentUserDetail = function () {
        var userProfileUrl = absoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=Title";
        Kiiro.BOD.RestUtil.get(userProfileUrl, Kiiro.BOD.Meetings.getCurrentUserDetailSuccess, Kiiro.BOD.Meetings.restFailure);
    }

    var _pageLoad = function () {
        _getMeetings();
        _initEventsBeforeRender();
    }

    var _loadDefaults = function () {
        //SP Page Context Variables
        relativeUrl = _spPageContextInfo.webServerRelativeUrl;
        absoluteUrl = _spPageContextInfo.webAbsoluteUrl;
        currentUserId = _spPageContextInfo.userId;
        isSiteOwner = _spPageContextInfo.hasManageWebPermissions;
        userDisplayName = _spPageContextInfo.userDisplayName;

        //SharePoint Objects

        //Other Global Variables
        bodSalt = "B0d$@lt";
        meetingSiteTemplate = "BLANKINTERNET#0";
        //Templates
        _.templateSettings = {
            interpolate: /\{%=(.+?)%\}/g,
            escape: /\{%-(.+?)%\}/g,
            evaluate: /\{%(.+?)%\}/g,
            variable: 'data'
        };
        mdTemplates = {
            tmpUserProfile: _.template($("#tmpUserProfile").html()),
            tmpMeetings: _.template($("#tmpMeetings").html()),
            tmpMeetingModal: _.template($("#tmpMeetingModal").html()),
            tmpMeetingSuccessModal: _.template($("#tmpMeetingSuccessModal").html())
        }
        //Current User Details
        _getCurrentUserDetail();
    };

    var _initEventsBeforeRender = function () {
        //click
        $(sel.bodBtnOpenAddEditMeetingModal).on('click', function (e) {
            var newMeetingItem = {
                Title: "",
                Description: "",
                ModalType: "Add"
            }
            _renderMeetingModal(newMeetingItem);

            $(sel.bodModalAddMeeting).modal('show');
        });
    }

    var _Init = function () {
        _loadDefaults();
        // Entry Point
        _pageLoad();
    };

    return {
        Init: _Init,
        restFailure: _restFailure,
        jsomDataFailure: _jsomDataFailure,
        getCurrentUserDetailSuccess: _getCurrentUserDetailSuccess,
        getMeetingsSuccess: _getMeetingsSuccess,
        deleteMeetingSuccess: _deleteMeetingSuccess,
        updateMeetingSuccess: _updateMeetingSuccess
    };
})();

/* 
    *On document ready
*/
$(document).ready(function () {
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        SP.SOD.registerSod('SP.publishing.js', SP.Utilities.Utility.getLayoutsPageUrl('SP.publishing.js'));
        SP.SOD.executeFunc('SP.Publishing.js', 'SP.Publishing.PublishingWeb', function () {
            Kiiro.BOD.Meetings.Init();
        });
    });
});
