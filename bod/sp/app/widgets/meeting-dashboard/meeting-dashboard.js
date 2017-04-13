window.Kiiro = window.Kiiro || {};
window.Kiiro.BOD = window.Kiiro.BOD || {};

Kiiro.BOD.MeetingDetail = (function () {
    //SP Page Context Variables
    var relativeUrl,
        absoluteUrl,
        siteAbsoluteUrl,
        siteServerRelativeUrl,
        currentUserId,
        isSiteOwner,
        userDisplayName,
        //SharePoint Objects
        agendasList,
        agendaCommentsList,
        agendaVotesList,
        agendaAttachmentsList,
        meetingAttendancesList,
        meetingList,

        newAgendaItem,
        newAgendaItemId,
        agendaDetailsColl,
        masterAgenda,
        masterAgendaLength,
        masterAgendaCounter,
        agendaCommentsColl,
        agendaVotesColl,
        agendaAttachmentsColl,
        attachmentUrl,
        meetingAttendanceColl,
        meetingKey,
        //Other Global Variables
        activeMeeting,
        activeMeetingId,


        meetingCalendarArr,
        //meetingAttendancesArr,              
        agendaArr,
        //agendaCommentsArr,
        //agendaVotesArr,
        // agendaAttachmentsArr,        
        currentAgendaId,
        currentIndex,
        mdTemplates;
    //Selectors
    sel = {
        bodMainFrm: "#aspnetForm",
        bodMeetingDetailsWrapper: "#bodMeetingDetailsWrapper",
        bodAgendaDetailsWrapper: "#bodAgendaDetailsWrapper",
        bodEventDetailsWrapper: "#bodEventDetailsWrapper",
        bodMeetingAttendanceWrapper: "#bodMeetingAttendanceWrapper",
        bodMeetingDesc: "#bodMeetingDesc",
        bodNavigation: "#bodNavigation",
        bodModalAddAgenda: "#modalAddAgenda",
        bodbtnOpenAddEditAgendaModal: "#btnOpenAddEditAgendaModal",
        bodBtnAddMeeting: "#btnAddMeeting",
        bodTimePicker: ".bod-time-picker",
        bodBtnAgendaSave: "#btnSaveAgenda",
        bodRadEventAttendanceAttend: "#radEventAttendanceAttend",
        bodRadEventAttendanceMightAttend: "#radEventAttendanceMightAttend",
        bodAgendaVotesContentLoader: "#bodAgendaVotesContentLoader",
        bodEventAttendance: "#bodEventAttendance",
        bodEventAttendanceContentLoader: "#bodEventAttendanceContentLoader"
    }

    /*
        UPDATE
    */

    var _updateAgendaSuccess = function (listItem) {
        $(sel.bodModalAddAgenda).modal('hide');
        Kiiro.BOD.Common.showResponseMessage("Agenda is successfully updated", "success");
        _getAgendas(activeMeetingId);
        Kiiro.BOD.Common.showLoader(false);
    }

    var _updateAgenda = function (agendaId, title, description, meetingTime) {
        Kiiro.BOD.Common.showLoader(true);

        //TODO Validation

        var listItemArr = [];
        var listItemObj;

        listItemObj = {};
        listItemObj.Key = "Title";
        listItemObj.Value = title;
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODDescription";
        listItemObj.Value = description;
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODMeetingTime"
        listItemObj.Value = meetingTime;
        listItemArr.push(listItemObj);


        Kiiro.BOD.JSOMUtil.updateListItemById(agendasList, agendaId, listItemArr, Kiiro.BOD.MeetingDetail.updateAgendaSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure);
    }

    /*
        CREATE
    */
    var _updateAttendanceSuccess = function (listItem, param) {
        _getMeetingAttendances(activeMeetingId);
        Kiiro.BOD.Common.showContentLoader(sel.bodEventAttendanceContentLoader, false);
    }

    var _addAttendanceSuccess = function (listItem, param) {
        _getMeetingAttendances(activeMeetingId);
        Kiiro.BOD.Common.showContentLoader(sel.bodEventAttendanceContentLoader, false);
    }

    var _getAttendanceSuccess = function (attendancesColl, param) {
        var attendancesCollCount = attendancesColl.get_count();
        var currentMeetingKey = param.MeetingKey;
        var currentAttendanceId = param.AttendanceId;
        var currentAttendanceType = Number(param.AttendanceType);

        if (attendancesCollCount == 0) {
            //Add Attendance
            //TODO Validation

            var listItemArr = [];
            var listItemObj;

            listItemObj = {};
            listItemObj.Key = "BODMeetingKey";
            listItemObj.Value = currentMeetingKey;
            listItemArr.push(listItemObj);

            listItemObj = {};
            listItemObj.Key = "BODAttendanceID";
            listItemObj.Value = currentAttendanceId;
            listItemArr.push(listItemObj);

            listItemObj = {};
            listItemObj.Key = "BODAttendanceType";
            listItemObj.Value = currentAttendanceType;
            listItemArr.push(listItemObj);

            Kiiro.BOD.JSOMUtil.addListItem(meetingAttendancesList, listItemArr, Kiiro.BOD.MeetingDetail.addAttendanceSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
        }
        else {
            var listItemEnumerator = attendancesColl.getEnumerator();
            var attendanceType;
            while (listItemEnumerator.moveNext()) {
                var listItem = listItemEnumerator.get_current();

                attendanceType = listItem.get_item("BODAttendanceType");

                if (attendanceType == currentAttendanceType) {
                    //Do Nothing
                }
                else {
                    //Update Attendance
                    //TODO Validation
                    listItem.set_item('BODAttendanceType', currentAttendanceType);

                    Kiiro.BOD.JSOMUtil.updateListItem(listItem, Kiiro.BOD.MeetingDetail.updateAttendanceSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
                }
            }
        }
    }

    var _addAttendance = function (meetingKey, attendanceId, attendanceType) {
        var agendaAttendanceXml = '<View><Query><Where><Eq><FieldRef Name=\'BODAttendanceID\' />' +
                                  '<Value Type=\'Text\'>' + attendanceId + '</Value></Eq></Where></Query>' +
                                  '</View>';
        Kiiro.BOD.JSOMUtil.getListItem(meetingAttendancesList, agendaAttendanceXml, Kiiro.BOD.MeetingDetail.getAttendanceSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { MeetingKey: meetingKey, AttendanceId: attendanceId, AttendanceType: attendanceType });
    }

    var _addAgendaSuccess = function (listItem) {
        $(sel.bodModalAddAgenda).modal('hide');
        Kiiro.BOD.Common.showResponseMessage("Agenda is successfully added", "success");
        _getAgendas(activeMeetingId);
        Kiiro.BOD.Common.showLoader(false);
    }

    var _addAgenda = function (title, description, meetingKey, meetingTime) {
        Kiiro.BOD.Common.showLoader(true);
        //TODO Validation

        var listItemArr = [];
        var listItemObj;

        listItemObj = {};
        listItemObj.Key = "Title";
        listItemObj.Value = title;
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODDescription";
        listItemObj.Value = description;
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODMeetingKey";
        listItemObj.Value = meetingKey;
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODMeetingTime"
        listItemObj.Value = meetingTime;
        listItemArr.push(listItemObj);

        Kiiro.BOD.JSOMUtil.addListItem(agendasList, listItemArr, Kiiro.BOD.MeetingDetail.addAgendaSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure);
    }

    var _addCommentSuccess = function (listItem, param) {
        Kiiro.BOD.Common.showLoader(false);
        if (typeof param == "object") {
            _getAgendaComments(param.AgendaId);
        }
    }

    var _addComment = function (agendaId, description, parentCommentId) {
        Kiiro.BOD.Common.showLoader(true);
        //TODO Validation
        var listItemArr = [];
        var listItemObj;

        listItemObj = {};
        listItemObj.Key = "BODAgendaID";
        listItemObj.Value = Number(agendaId);
        listItemArr.push(listItemObj);

        listItemObj = {};
        listItemObj.Key = "BODDescription";
        listItemObj.Value = description;
        listItemArr.push(listItemObj);

        if (parentCommentId) {
            listItemObj = {};
            listItemObj.Key = "BODParentCommentID";
            listItemObj.Value = Number(parentCommentId);
            listItemArr.push(listItemObj);
        }

        Kiiro.BOD.JSOMUtil.addListItem(agendaCommentsList, listItemArr, Kiiro.BOD.MeetingDetail.addCommentSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId });
    }

    var _addVoteSuccess = function (listItem, param) {
        _getAgendaVotes(param.AgendaId);
    }

    var _updateVoteSuccess = function (listItem, param) {
        _getAgendaVotes(param.AgendaId);
    }

    var _deleteVoteSuccess = function (param) {
        _getAgendaVotes(param.AgendaId);
    }

    var _getVoteSuccess = function (votesColl, param) {
        var votesCollCount = votesColl.get_count();
        var currentAgendaId = Number(param.AgendaId);
        var currentVoteId = param.VoteId;
        var currentVoteType = Number(param.VoteType);
        if (votesCollCount == 0) {
            //Add Vote
            //TODO Validation

            var listItemArr = [];
            var listItemObj;

            listItemObj = {};
            listItemObj.Key = "BODAgendaID";
            listItemObj.Value = Number(currentAgendaId);
            listItemArr.push(listItemObj);

            listItemObj = {};
            listItemObj.Key = "BODVoteID";
            listItemObj.Value = currentVoteId;
            listItemArr.push(listItemObj);

            listItemObj = {};
            listItemObj.Key = "BODVoteType";
            listItemObj.Value = currentVoteType;
            listItemArr.push(listItemObj);

            Kiiro.BOD.JSOMUtil.addListItem(agendaVotesList, listItemArr, Kiiro.BOD.MeetingDetail.addVoteSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
        }
        else {
            var listItemEnumerator = votesColl.getEnumerator();
            var voteType;
            while (listItemEnumerator.moveNext()) {
                var listItem = listItemEnumerator.get_current();

                voteType = listItem.get_item("BODVoteType");

                if (voteType == currentVoteType) {
                    //Delete Vote
                    Kiiro.BOD.JSOMUtil.deleteListItem(listItem, Kiiro.BOD.MeetingDetail.deleteVoteSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
                }
                else {
                    //Update Vote
                    //TODO Validation
                    listItem.set_item('BODVoteType', currentVoteType);

                    Kiiro.BOD.JSOMUtil.updateListItem(listItem, Kiiro.BOD.MeetingDetail.updateVoteSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
                }
            }
        }
    }

    var _addVote = function (agendaId, voteId, voteType) {
        var agendaVotesXml = '<View><Query><Where><Eq><FieldRef Name=\'BODVoteID\' />' +
                             '<Value Type=\'Text\'>' + voteId + '</Value></Eq></Where></Query>' +
                             '</View>';
        Kiiro.BOD.JSOMUtil.getListItem(agendaVotesList, agendaVotesXml, Kiiro.BOD.MeetingDetail.getVoteSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId, VoteId: voteId, VoteType: voteType });
    }

    var _updateAttachmentPropSuccess = function (listItem, param) {
        // alert("Success : Attachment ID - " + listItem.get_id());
        Kiiro.BOD.Common.showResponseMessage("Attachment is successfully added", "success");
        _getAgendaAttachments(Number(param.AgendaId));
        Kiiro.BOD.Common.showLoader(false);
        Kiiro.BOD.Common.fileUploader("#uploaderAgendaAttachment-" + param.AgendaId, true);
    }

    var _getAttachmentPropSuccess = function (attachmentColl, param) {
        var listItemEnumerator = attachmentColl.getEnumerator();

        while (listItemEnumerator.moveNext()) {
            var listItem = listItemEnumerator.get_current();

            listItem.set_item('BODAgendaID', Number(param.AgendaId));
            listItem.set_item('Title', param.Title);

            Kiiro.BOD.JSOMUtil.updateListItem(listItem, Kiiro.BOD.MeetingDetail.updateAttachmentPropSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
        }
    }

    var _addAttachmentSuccess = function (attachmentUrl, param) {
        var attachmentXml = '<View><Query><Where><Eq><FieldRef Name=\'FileLeafRef\'/>' +
                            '<Value Type=\'File\'>' + attachmentUrl + '</Value></Eq></Where></Query>' +
                            '<RowLimit>1</RowLimit></View>';
        Kiiro.BOD.JSOMUtil.getListItem(agendaAttachmentsList, attachmentXml, Kiiro.BOD.MeetingDetail.getAttachmentPropSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, param);
    }

    var _addAttachment = function (content, title, extension, agendaId) {
        Kiiro.BOD.Common.showLoader(true);
        Kiiro.BOD.JSOMUtil.addFile(agendaAttachmentsList, content, title, extension, relativeUrl, Kiiro.BOD.MeetingDetail.addAttachmentSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId, Title: title });
    }
    /*
        GET
    */
    var _restFailure = function (xhs) {
        Kiiro.BOD.Common.showResponseMessage('Request failed. ' + xhs.status + ': ' + xhs.statusText, "failure");
        Kiiro.BOD.Common.showLoader(false);
    };

    var _jsomDataFailure = function (sender, args) {
        Kiiro.BOD.Common.showResponseMessage('Request failed. ' + args.get_message() + args.get_stackTrace(), "failure");
        Kiiro.BOD.Common.showLoader(false);
    };

    var _getAgendaAttachmentsSuccess = function (agendaAttachmentsColl, param) {
        var listItemEnumerator = agendaAttachmentsColl.getEnumerator(),
            listItem,
            agendaId,
            id,
            title,
            created,
            docFileRef,
            docFileLeafRef,
            woip,
            agendaAttachmentsArr = [],
            createdDate;

        if (typeof param === 'object') {
            agendaId = param.AgendaId;
        }
        while (listItemEnumerator.moveNext()) {
            listItem = listItemEnumerator.get_current();
            id = listItem.get_id();
            //agendaId = listItem.get_item("BODAgendaID").$5E_1;
            title = listItem.get_item("Title");
            created = listItem.get_item("Created");
            docFileRef = listItem.get_item("FileRef");
            docFileLeafRef = listItem.get_item("FileLeafRef");
            woip = absoluteUrl + "/_layouts/15/WopiFrame.aspx?sourcedoc=" + docFileRef + "&file=" + docFileLeafRef + "&action=default";

            createdDate = new Date(created);
            createdDate = createdDate.format("dd/mm/yyyy");

            agendaAttachmentsArr.push({
                //ListItem : listItem,
                Id: id,
                Title: title,
                Created: createdDate,
                DocFileRef: docFileRef,
                DocFileLeafRef: docFileLeafRef,
                Woip: woip
            })
        }

        

        console.log("Attachemnets", agendaAttachmentsArr);
        _renderAgendaAttachments(agendaAttachmentsArr, agendaId);
        Kiiro.BOD.Common.showLoader(false);
    };

    var _getAgendaAttachments = function (agendaId) {
        //Mock Hardcode -- TODO REMOVE
        if (agendaId) {
            var agendaAttachmentsXml = '<View><Query><Where><Eq><FieldRef Name=\'BODAgendaID\' />' +
                                       '<Value Type=\'Number\'>' + agendaId + '</Value></Eq></Where><OrderBy><FieldRef Name=\'ID\' /></OrderBy></Query>' +
                                       '<RowLimit>15</RowLimit></View>'
            Kiiro.BOD.JSOMUtil.getListItem(agendaAttachmentsList, agendaAttachmentsXml, Kiiro.BOD.MeetingDetail.getAgendaAttachmentsSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId });
        }
    }

    var _getAgendaVotesSuccess = function (agendaVotesColl, param) {

        var listItemEnumerator = agendaVotesColl.getEnumerator(),
            agendaVotesArr = [],
            agendaId,
            listItem,
            voteId,
            voteType,
            currentUserVote,
            voteCounts;
        if (typeof param === 'object') {
            agendaId = param.AgendaId;
        }
        while (listItemEnumerator.moveNext()) {
            listItem = listItemEnumerator.get_current();
            voteId = listItem.get_item("BODVoteID");
            //agendaId = voteId.split('*;*')[0];            
            voteType = listItem.get_item("BODVoteType");

            agendaVotesArr.push({
                // ListItem : listItem,
                VoteId: voteId,
                VoteType: voteType
            })
        }

        currentUserVote = _.filter(agendaVotesArr, function (v, k) { return v.VoteId.split("*;*")[1] == _spPageContextInfo.userId })

        voteCounts = {
            AgendaId: agendaId,
            VoteId: agendaId + "*;*" + _spPageContextInfo.userId,
            Likes: _.where(agendaVotesArr, { "VoteType": "1" }).length,
            Dislikes: _.where(agendaVotesArr, { "VoteType": "0" }).length,
            CurrentUserVote: ((currentUserVote.length == 1) ? currentUserVote[0] : null)
        }
        _renderAgendaVotes(voteCounts, agendaId);
        Kiiro.BOD.Common.showLoader(false);
        Kiiro.BOD.Common.showContentLoader(sel.bodAgendaVotesContentLoader + "-" + agendaId, false);
        console.log("Votes", agendaVotesArr)
    };

    var _getAgendaVotes = function (agendaId) {
        if (agendaId) {
            var agendaVotesXml = '<View><Query><Where><Eq><FieldRef Name=\'BODAgendaID\' />' +
                                 '<Value Type=\'Number\'>' + agendaId + '</Value></Eq></Where></Query>' +
                                 '<RowLimit>1000</RowLimit></View>'
            Kiiro.BOD.JSOMUtil.getListItem(agendaVotesList, agendaVotesXml, Kiiro.BOD.MeetingDetail.getAgendaVotesSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId });
        }
    }

    var _getAgendaCommentsSuccess = function (agendaCommentsColl, param) {
        var listItemEnumerator = agendaCommentsColl.getEnumerator(),
            id,
            agendaId,
            Author,
            author,
            authorEmail,
            authorPicUrl,
            listItem,
            description,
            parentCommentId,
            createdDate,
            agendaCommentsArr = [];
        if (typeof param === 'object') {
            agendaId = param.AgendaId;
        }

        while (listItemEnumerator.moveNext()) {
            listItem = listItemEnumerator.get_current();
            id = listItem.get_id();
            //agendaId = listItem.get_item("BODAgendaID").$5E_1;
            Author = new SP.FieldUserValue();
            author = listItem.get_item("Author");
            authorName = author.get_lookupValue()
            authorEmail = author.get_email();
            authorPicUrl = "/_layouts/15/userphoto.aspx?size=L&amp;username=" + authorEmail;
            description = listItem.get_item("BODDescription");
            parentCommentId = listItem.get_item("BODParentCommentID");
            createdDate = listItem.get_item("Created");


            agendaCommentsArr.push({
                Id: id,
                Author: authorName,
                AuthorPicUrl: authorPicUrl,
                Description: description,
                ParentCommentId: parentCommentId,
                CreatedDate: createdDate
            })
        }
        console.log("Comments", agendaCommentsArr);
        _renderAgendaComments(agendaCommentsArr, agendaId);
        Kiiro.BOD.Common.showLoader(false);
    };

    var _getAgendaComments = function (agendaId) {
        if (agendaId) {
            var agendaCommentsXml = '<View><Query><Where><Eq><FieldRef Name=\'BODAgendaID\' />' +
                                    '<Value Type=\'Number\'>' + agendaId + '</Value></Eq></Where><OrderBy><FieldRef Name=\'ID\' Ascending=\'FALSE\' /></OrderBy> </Query>' +
                                    '<RowLimit>100</RowLimit></View>'
            Kiiro.BOD.JSOMUtil.getListItem(agendaCommentsList, agendaCommentsXml, Kiiro.BOD.MeetingDetail.getAgendaCommentsSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure, { AgendaId: agendaId });
        }

    }

    var _getAgendasSuccess = function (agendasColl) {
        var listItemEnumerator = agendasColl.getEnumerator(),
            id,
            listItem,
            title,
            description,
            meetingTime;

        agendaArr = [];
        while (listItemEnumerator.moveNext()) {
            listItem = listItemEnumerator.get_current();
            id = listItem.get_id();
            title = listItem.get_item("Title");
            description = listItem.get_item("BODDescription");
            meetingTime = listItem.get_item("BODMeetingTime");

            agendaArr.push({
                Id: id,
                //ListItem :listItem,
                Title: title,
                Description: description,
                MeetingTime: meetingTime
            })
        }

        _renderAgenda(agendaArr)

        _.each(agendaArr, function (k, v) {
            //Get Agenda Votes
            _getAgendaVotes(k.Id);
            //Get Agenda Attachments
            _getAgendaAttachments(k.Id);
            //Get Agenda Comments
            _getAgendaComments(k.Id);
        })

        if (!agendaArr.length > 0) {
            Kiiro.BOD.Common.showLoader(false);
        }

        console.log("Agenda", agendaArr)
    };

    var _getAgendas = function (activeMeetingId) {
        if (activeMeetingId) {
            var agendasXml = '<View><Query><Where><Eq><FieldRef Name=\'BODMeetingKey\'/>' +
                             '<Value Type=\'Text\'>' + activeMeetingId + '</Value></Eq></Where><OrderBy><FieldRef Name=\'ID\' Ascending=\'FALSE\' /></OrderBy> </Query>' +
                             '<RowLimit>15</RowLimit></View>';
            Kiiro.BOD.JSOMUtil.getListItem(agendasList, agendasXml, Kiiro.BOD.MeetingDetail.getAgendasSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure);
        }
    }

    var _getMeetingAttendancesSuccess = function (meetingAttendancesColl) {
        var listItemEnumerator = meetingAttendancesColl.getEnumerator(),
            listItem,
            id,
            meetingKey,
            attendanceId,
            attendanceType,
            author,
            authorId,
            authorName,
            authorEmail,
            authorPicture,
            meetingAttendancesArr = [];

        while (listItemEnumerator.moveNext()) {
            listItem = listItemEnumerator.get_current();
            id = listItem.get_id();
            meetingKey = listItem.get_item("BODMeetingKey");
            attendanceId = listItem.get_item("BODAttendanceID");
            attendanceType = listItem.get_item("BODAttendanceType");
            author = listItem.get_item("Author");
            authorId = author.get_lookupId();
            authorName = author.get_lookupValue();
            authorEmail = author.get_email();
            authorPicture = "/_layouts/15/userphoto.aspx?size=L&amp;username=" + authorEmail;

            meetingAttendancesArr.push({
                Id: id,
                MeetingKey: meetingKey,
                AttendanceId: attendanceId,
                AttendanceType: attendanceType,
                Author: author,
                AuthorId: authorId,
                AuthorName: authorName,
                AuthorEmail: authorEmail,
                AuthorPicture: authorPicture
            })
        }

        _renderMeetingAttendance(meetingAttendancesArr);
    };

    var _getMeetingAttendances = function (activeMeetingId) {
        if (activeMeetingId) {
            var meetingAttendancesXml = '<View><Query><Where><Eq><FieldRef Name=\'BODMeetingKey\'/>' +
                                        '<Value Type=\'Text\'>' + activeMeetingId + '</Value></Eq></Where></Query>' +
                                        '<RowLimit>1000</RowLimit></View>';

            Kiiro.BOD.JSOMUtil.getListItem(meetingAttendancesList, meetingAttendancesXml, Kiiro.BOD.MeetingDetail.getMeetingAttendancesSuccess, Kiiro.BOD.MeetingDetail.jsomDataFailure);
        }

    }

    var _getFormattedTime = function (eventDate) {
        var currentTime = new Date(String(eventDate)),
            hours = currentTime.getHours(),
            minutes = currentTime.getMinutes();

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (hours > 11) {
            if (hours > 12) {
                return (hours - 12) + ":" + minutes + " " + "PM";
            }
            else {
                return hours + ":" + minutes + " " + "PM";
            }
        }
        else {
            return hours + ":" + minutes + " " + "AM";
        }
    }

    var _applyCalendarData = function (xData, status) {
        var meetingCalendarArrCounter = 0,
            today = new Date(),
            title,
            description,
            workAddress,
            workCity,
            workState,
            workZip,
            date,
            dateString,
            eventId,
            itemURL,
            eventDuration,
            arrDateDiff = [],
            arrDateDiffPos,
            currentIndexObj;

        $(xData.responseXML).SPFilterNode("z:row").each(function () {
            title = $(this).attr("ows_Title");
            description = $(this).attr("ows_Description");
            workAddress = $(this).attr("ows_WorkAddress");
            workCity = $(this).attr("ows_WorkCity");
            workState = $(this).attr("ows_WorkState");
            workZip = $(this).attr("ows_WorkZip");
            date = new Date(String($(this).attr("ows_EventDate")));
            dateString = date.toDateString();
            eventId = $(this).attr("ows_ID");
            itemURL = absoluteUrl + "/Lists/" + meetingList + "/DispForm.aspx?ID=" + eventId;

            if ($(this).attr("ows_fAllDayEvent") == '1') {
                date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
                eventDuration = "(All day event)";
            }
            else {
                eventDuration = '(' + _getFormattedTime($(this).attr("ows_EventDate")) + ' - ' + _getFormattedTime($(this).attr("ows_EndDate")) + ')';
            }

            meetingCalendarArr.push({
                Index: meetingCalendarArrCounter,
                Title: title,
                Description: description,
                WorkAddress: workAddress,
                WorkCity: workCity,
                WorkState: workState,
                WorkZip: workZip,
                Id: eventId,
                EventDate: date,
                EventDateString: dateString,
                ItemUrl: itemURL,
                EventDuration: eventDuration
            })

            var dateToday = moment(), diffDays = 0,
                dateToday = dateToday.startOf('day'),
                dateMeeting = moment(date.toLocaleDateString());

            diffDays = dateMeeting.diff(dateToday, 'days');

            arrDateDiff.push({
                Index: meetingCalendarArrCounter,
                DiffDays: diffDays
            })

            meetingCalendarArrCounter++
        });


        arrDateDiffPos = _.filter(arrDateDiff, function (v) { return (v.DiffDays >= 0) });

        currentIndexObj = _.findWhere(arrDateDiffPos, { DiffDays: _.min(_.pluck(arrDateDiffPos, 'DiffDays')) });

        if (typeof currentIndexObj == 'object') {
            currentIndex = currentIndexObj.Index;
        }
        //meetingCalendarArr = [];
        _renderCalenderNav(meetingCalendarArr, currentIndex);

        if (meetingCalendarArr.length > 0) {
            activeMeeting = meetingCalendarArr[currentIndex],
            activeMeetingId = activeMeeting.EventDate.getTime() + "_" + activeMeeting.Id;
            _loadMeetingDetails(activeMeeting);
            $(sel.bodMeetingDetailsWrapper + "," + sel.bodAgendaDetailsWrapper + "," + sel.bodEventDetailsWrapper + "," + sel.bodMeetingAttendanceWrapper).removeClass("hidden");
        }
        else {
            $(sel.bodMeetingDetailsWrapper + "," + sel.bodAgendaDetailsWrapper + "," + sel.bodEventDetailsWrapper + "," + sel.bodMeetingAttendanceWrapper).addClass("hidden");
            Kiiro.BOD.Common.showLoader(false);
        }
    };

    var _getCalendarData = function () {
        var camlFields = "<ViewFields><FieldRef Name='Title' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='WorkAddress' /><FieldRef Name='WorkCity' /><FieldRef Name='WorkState' /><FieldRef Name='WorkZip' /><FieldRef Name='Description' /><FieldRef Name='fRecurrence' /><FieldRef Name='RecurrenceData' /><FieldRef Name='RecurrenceID' /><FieldRef Name='fAllDayEvent' /><FieldRef Name='fAllDayEvent' /><FieldRef Name='Category' /></ViewFields>",
            camlQuery = "<Query><Where><And><DateRangesOverlap><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='RecurrenceID' /><Value Type='DateTime'>Month</Value></DateRangesOverlap><Eq><FieldRef Name='Category' /><Value Type='Choice'>Meeting</Value></Eq></And></Where><OrderBy><FieldRef Name='EventDate' /></OrderBy></Query>",
            camlOptions = "<QueryOptions><RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion><ExpandRecurrence>TRUE</ExpandRecurrence><DateInUtc>TRUE</DateInUtc></QueryOptions>";

        $().SPServices(
        {
            operation: "GetListItems",
            async: false,
            webURL: absoluteUrl,
            listName: meetingList,
            CAMLViewFields: camlFields,
            CAMLQuery: camlQuery,
            CAMLQueryOptions: camlOptions,
            completefunc: _applyCalendarData
        });
    };

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
        Kiiro.BOD.RestUtil.get(userProfileUrl, Kiiro.BOD.MeetingDetail.getCurrentUserDetailSuccess, Kiiro.BOD.MeetingDetail.restFailure);
    }
    // load/Render Meeting specific data

    var _loadMeetingDetails = function (meeting) {
        if (meeting) {
            activeMeeting = meeting,
                activeMeetingId = activeMeeting.EventDate.getTime() + "_" + activeMeeting.Id;

            $(sel.bodMeetingDesc).html(activeMeeting.Description);

            _renderBreadcrumbs(activeMeeting);
            _renderEvent(activeMeeting);
            //Get Meeting Attendance
            _getMeetingAttendances(activeMeetingId);
            //Get Meeting Agendas
            _getAgendas(activeMeetingId);
        }
    }

    //Render Methods
    var _renderUserProfile = function (data) {
        if (data) {
            $("#bodUserProfile").html(
               mdTemplates.tmpUserProfile(data)
           );
        }
    }

    var _renderUserAttendance = function (data) {
        var attendances = data, attendance;
        attendance = _.filter(attendances, function (v, k) { return v.AttendanceId.split("*;*")[1] == currentUserId });
        if (attendance.length == 0) {
            attendance.push({ AttendanceType: null });
        }
        $("#bodEventAttendance").html(
            mdTemplates.tmpEventAttendance(attendance[0])
        );

        $(sel.bodEventAttendance + " .bod-dropdown__menu > li >a").on('click', function (e) {
            var attendanceType = $(e.currentTarget).data('attendanceType'),
                attendanceId = activeMeetingId + "*;*" + currentUserId;
            _addAttendance(activeMeetingId, attendanceId, attendanceType);
            Kiiro.BOD.Common.showContentLoader(sel.bodEventAttendanceContentLoader, true);
        });

    }

    var _renderCalenderNav = function (data, calIndex) {
    	if(data.length==0){
             data.DashboardSrc = siteServerRelativeUrl;
        }
        $(sel.bodNavigation).html(
            mdTemplates.tmpCalenderNav(data)
        );
        if (data.length > 0) {
            $(sel.bodNavigation).addClass("bod-navigation owl-carousel owl-theme");
            $(sel.bodNavigation).owlCarousel({
                //loop:true,
                margin: 10,
                dots: false,
                nav: true,
                navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
                responsive: {
                    0: {
                        items: 1
                    },
                    600: {
                        items: 3
                    },
                    1000: {
                        items: 5
                    }
                }
            });

            $(sel.bodNavigation).find(".bod-navigation__item").eq(calIndex).addClass("bod-navigation__item--active");
            $(sel.bodNavigation).find(".bod-navigation__item").on('click', function (e) {
                Kiiro.BOD.Common.showLoader(true);
                var activeMeeting = _.findWhere(data, { Id: $(e.currentTarget).data("calenderDateId").toString() });
                $(sel.bodNavigation).find(".bod-navigation__item").removeClass("bod-navigation__item--active");
                $(e.currentTarget).addClass("bod-navigation__item--active");
                _loadMeetingDetails(activeMeeting);
            })
        }

    }

    var _renderBreadcrumbs = function (data) {
        if (data) {
            data.DashboardSrc = siteServerRelativeUrl;
            $("#bodBreadcrumbs").html(
               mdTemplates.tmpBreadcrumbs(data)
           );
        }
    }

    var _renderEvent = function (data) {
        if (data) {
            $("#bodEvent").html(
                mdTemplates.tmpEvent(data)
            );
        }
    }

    var _renderMeetingAttendance = function (data) {
        console.log("Attendences", data);
        //Enum 0 : Not Attending
        //Enum 1 : Attending
        //Enum 2 : Maybe

        if (data) {
            var attendanceGroup = _.groupBy(data, 'AttendanceType'), details = data;
            var data = {
                Attending: ((typeof attendanceGroup["1"] === "object") ? attendanceGroup["1"].length : "0"),
                NotAttending: ((typeof attendanceGroup["0"] === "object") ? attendanceGroup["0"].length : "0"),
                MayBe: ((typeof attendanceGroup["2"] === "object") ? attendanceGroup["2"].length : "0"),
                details: details
            }

            $("#bodMeetingAttendance").html(
                mdTemplates.tmpMeetingAttendance(data)
            );

            _renderUserAttendance(details);
            console.log("AttendenceGroup", data);

        }
    }

    var _renderAgenda = function (data) {
        if (data) {
            $("#bodAgenda").html(
                mdTemplates.tmpAgenda(data)
            );
        }
    }

    var _renderAgendaAttachments = function (data, id) {
        if (data) {
            var agendaId = id;

            $("#bodAgendaAttachmentsItem-" + agendaId).html(
               mdTemplates.tmpAgendaAttachments(data)
           );

            $("#btnAddAgendaAttachment-" + agendaId).on('click', function (e) {
                var content, name, title, extension;
                var fileUploader = $("#uploaderAgendaAttachment-" + agendaId);
                content = fileUploader[0].files[0];
                name = content.name;
                if (name) {
                    title = name.substring(0, name.lastIndexOf("."));
                    extension = name.substring(name.lastIndexOf("."), name.length);
                    _addAttachment(content, title, extension, agendaId);
                    console.log($(e.currentTarget))
                }
            })

            Kiiro.BOD.Common.fileUploader("#uploaderAgendaAttachment-" + agendaId);
        }
    }

    var _renderAgendaVotes = function (data, id) {
        if (data) {
            var agendaId = id;

            $("#bodAgendaVotes-" + agendaId).html(
                mdTemplates.tmpAgendaVotes(data)
            );
            $("#bodAgendaVoteLike-" + agendaId).on('click', function (e) {
                var voteId = $(e.currentTarget).data("agendaVoteId");
                Kiiro.BOD.Common.showContentLoader(sel.bodAgendaVotesContentLoader + "-" + agendaId, true);
                _addVote(agendaId, voteId, 1);
            });
            $("#bodAgendaVoteDislike-" + agendaId).on('click', function (e) {
                var voteId = $(e.currentTarget).data("agendaVoteId");
                Kiiro.BOD.Common.showContentLoader(sel.bodAgendaVotesContentLoader + "-" + agendaId, true);
                _addVote(agendaId, voteId, 0);
            });

            $("#btnAgendaEdit-" + agendaId).on('click', function (e) {
                var existAgendaItem = _.filter(agendaArr, { Id: agendaId })[0];
                existAgendaItem.ModalType = "Edit";
                //agendaId = $(e.currentTarget).data("agendaId");
                if (typeof existAgendaItem == 'object') {
                    _renderAgendaModal(existAgendaItem);
                    $(sel.bodModalAddAgenda).modal('show');
                }

            });

        }
    }

    var _renderAgendaComments = function (data, id) {
        var comments = [], data = data;
        data = _.map(data, function (item) {
            var createdDate = new Date(item.CreatedDate);
            item.CreatedDate = createdDate.format("dd/mm/yyyy");
            return item;
        });

        comments = _.where(data, { ParentCommentId: null });
        _.each(comments, function (v, k) {
            v.Childs = [];
            v.Childs = _.where(data, { ParentCommentId: v.Id });
        });

        var data = comments;

        $("#bodAgendaComments-" + id).html(
            mdTemplates.tmpAgendaComments(data)
        );

        if (data.length > 4) {
            $("#btnAgendaCommentsShowHide-" + id).removeClass('hidden');
        } else {
            $("#btnAgendaCommentsShowHide-" + id).addClass('hidden');
        }


        if (data.length > 0) {
            $("#bodAgendaComments-" + id).removeClass("bod-agenda__posts--empty");
        }

        _.each(data, function (v, k) {
            $("#txtAddAgendaChildComment-" + v.Id).on('keyup', function (e) {
                var commentTxt = $(e.currentTarget).val()
                if (commentTxt == "") {
                    $("#btnAddAgendaChildComment-" + v.Id).attr("disabled", "disabled");
                } else {
                    $("#btnAddAgendaChildComment-" + v.Id).removeAttr("disabled");
                }
            });

            $("#txtAddAgendaChildComment-" + v.Id).val("");
            $("#btnAddAgendaChildComment-" + v.Id).on('click', function (e) {
                var comment = $("#txtAddAgendaChildComment-" + v.Id).val(),
                parentCommentId = $(e.currentTarget).data("parentCommentId")
                if (comment !== "") {
                    _addComment(id, comment, parentCommentId);
                }
            });

        });


        $("#txtAddAgendaComment-" + id).on('keyup', function (e) {
            var commentTxt = $(e.currentTarget).val();
            if (commentTxt == "") {
                $("#btnAddAgendaComment-" + id).attr("disabled", "disabled");
            } else {
                $("#btnAddAgendaComment-" + id).removeAttr("disabled");
            }
        });

        $("#txtAddAgendaComment-" + id).val("");
        $("#btnAddAgendaComment-" + id).on('click', function (e) {
            var comment = $("#txtAddAgendaComment-" + id).val();
            if (comment !== "") {
                _addComment(id, comment, null);
            }
        });

    }

    var _renderAgendaModal = function (data) {
        if (data) {
            $("#bodAgendaModalWrapper").html(
                mdTemplates.tmpAgendaModal(data)
            );

            $(sel.bodTimePicker).datetimepicker({
                format: 'LT'
            });

            $(sel.bodMainFrm).validate({
                rules: {
                    // simple rule, converted to {required:true}
                    agenda_title: "required",
                    agenda_description: "required"
                }
            });

            $(sel.bodBtnAgendaSave).on('click', function (e) {
                if ($(sel.bodMainFrm).valid()) {
                    //Get Data for the inp fields through a submit handler
                    //if($(e.currentTarget).parents("bod-form")){ 
                    var title = $("#txtAgendaTitle").val(),
                        desc = $("#txtAgendaDescription").val(),
                        time = $("#txtAgendaTime").data('date'),
                        modalType = $(e.currentTarget).data("modalType"),
                        agendaId = data.Id;

                    if (modalType == "Add") {
                        _addAgenda(title, desc, activeMeetingId, time);
                    } else if (modalType == "Edit") {
                        _updateAgenda(agendaId, title, desc, time);
                    }
                }
            });
        }
    }

    var _pageLoad = function () {
        _getCalendarData();
        _initEventsBeforeRender();
    }

    var _loadDefaults = function () {
        //SP Page Context Variables
        relativeUrl = _spPageContextInfo.webServerRelativeUrl;
        absoluteUrl = _spPageContextInfo.webAbsoluteUrl;
        siteAbsoluteUrl = _spPageContextInfo.siteAbsoluteUrl;
        siteServerRelativeUrl = _spPageContextInfo.siteServerRelativeUrl;
        currentUserId = _spPageContextInfo.userId;
        isSiteOwner = _spPageContextInfo.hasManageWebPermissions;
        userDisplayName = _spPageContextInfo.userDisplayName;

        //SharePoint Objects
        agendasList = "Agendas";
        agendaCommentsList = "AgendaComments";
        agendaVotesList = "AgendaVotes";
        agendaAttachmentsList = "AgendaAttachments";
        meetingAttendancesList = "MeetingAttendances";
        meetingList = "Meetings";

        //Other Global Variables  
        meetingCalendarArr = [];
        agendaArr = [];
        currentIndex = 0;

        _.templateSettings = {
            interpolate: /\{%=(.+?)%\}/g,
            escape: /\{%-(.+?)%\}/g,
            evaluate: /\{%(.+?)%\}/g,
            variable: 'data'
        };

        mdTemplates = {
            tmpUserProfile: _.template($("#tmpUserProfile").html()),
            tmpCalenderNav: _.template($("#tmpCalenderNavItems").html()),
            tmpBreadcrumbs: _.template($("#tmpBreadcrumbs").html()),
            tmpEvent: _.template($("#tmpEvent").html()),
            tmpEventAttendance: _.template($("#tmpEventAttendance").html()),
            tmpMeetingAttendance: _.template($("#tmpMeetingAttendance").html()),
            tmpAgenda: _.template($("#tmpAgenda").html()),
            tmpAgendaVotes: _.template($("#tmpAgendaVotes").html()),
            tmpAgendaAttachments: _.template($("#tmpAgendaAttachments").html()),
            tmpAgendaComments: _.template($("#tmpAgendaComments").html()),
            tmpAgendaModal: _.template($("#tmpAgendaModal").html())
        }

        _getCurrentUserDetail();
    };

    var _initEventsBeforeRender = function () {
        //click
        $(sel.bodBtnAddMeeting).on('click', function () {
            var newMeetingUrl = relativeUrl + "/Lists/" + meetingList + "/NewForm.aspx?BODSrc=MeetingDashboard";
            Kiiro.BOD.Common.displayLayover(newMeetingUrl)
        });

        $(sel.bodbtnOpenAddEditAgendaModal).on('click', function (e) {
            var newAgendaItem = {
                Title: "",
                Description: "",
                MeetingTime: "",
                ModalType: "Add"
            }
            _renderAgendaModal(newAgendaItem);
            $(sel.bodModalAddAgenda).modal('show');
        });
    }

    var _initEventsAfterRender = function () {

    }

    var _Init = function () {
        _loadDefaults();
        // Entry Point
        _pageLoad();
    };

    return {
        Init: _Init,
        getMeetingAttendancesSuccess: _getMeetingAttendancesSuccess,
        getAgendasSuccess: _getAgendasSuccess,
        getAgendaCommentsSuccess: _getAgendaCommentsSuccess,
        getAgendaVotesSuccess: _getAgendaVotesSuccess,
        getAgendaAttachmentsSuccess: _getAgendaAttachmentsSuccess,
        jsomDataFailure: _jsomDataFailure,
        addAgenda: _addAgenda,
        addAgendaSuccess: _addAgendaSuccess,
        addComment: _addComment,
        addCommentSuccess: _addCommentSuccess,
        addAttachment: _addAttachment,
        addAttachmentSuccess: _addAttachmentSuccess,
        getAttachmentPropSuccess: _getAttachmentPropSuccess,

        //New
        addVoteSuccess: _addVoteSuccess,
        deleteVoteSuccess: _deleteVoteSuccess,
        updateVoteSuccess: _updateVoteSuccess,
        getVoteSuccess: _getVoteSuccess,
        addAttendanceSuccess: _addAttendanceSuccess,
        updateAttendanceSuccess: _updateAttendanceSuccess,
        getAttendanceSuccess: _getAttendanceSuccess,

        addVote: _addVote,
        updateAttachmentPropSuccess: _updateAttachmentPropSuccess,
        getCurrentUserDetailSuccess: _getCurrentUserDetailSuccess,
        updateAgenda: _updateAgenda,
        updateAgendaSuccess: _updateAgendaSuccess,
        restFailure: _restFailure
    };
})();

/* 
    *On document ready
*/
$(document).ready(function () {
    Kiiro.BOD.Common.showLoader(true)
    SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
        Kiiro.BOD.MeetingDetail.Init();
    });
});
