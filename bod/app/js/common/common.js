window.Kiiro = window.Kiiro || {};
window.Kiiro.BOD = window.Kiiro.BOD || {};

Kiiro.BOD.Common = (function () {
    var _displayLayover = function (url, callback) {
        var options = SP.UI.$create_DialogOptions();
        options.url = url;
        options.dialogReturnValueCallback = function () {
            if (callback) {
                window.top.location = callback //this will redirect to the callback page
            }
            else {
                window.top.location = window.top.location //this will refreshes the page
            }
        };
        SP.UI.ModalDialog.showModalDialog(options);
    }

    var _textTruncate = function (str, length, ending) {
        try {
            if (!length) {
                length = 50;
            }
            if (!ending) {
                ending = '...';
            }
            if (str.length > length) {
                return str.substring(0, length - ending.length) + ending;
            } else {
                return str;
            }
        }
        catch (e) {
            return "";
        }
    };

    var _guidTruncate = function (guid) {
        if (guid) {
            return guid.replace(/{/g, "").replace(/}/g, "");
        }
        else {
            return "";
        }
    }

    var _showContentLoader = function (el, show) {
        var tmpContentLoader = _.template($("#tmpContentLoader").html());

        if (show) {
            $(el).html(tmpContentLoader);
        } else {
            $(el).html("");
        }
    }

    var _showContentSuccess = function (el, show) {
        var tmpContentLoader = _.template($("#tmpContentSuccess").html());

        if (show) {
            $(el).html(tmpContentLoader);
        } else {
            $(el).html("");
        }
    }

    var _showContentFailure = function (el, show) {
        var tmpContentLoader = _.template($("#tmpContentFailure").html());

        if (show) {
            $(el).html(tmpContentLoader);
        } else {
            $(el).html("");
        }
    }

    var _showLoader = function (show) {
        if (show) {
            $("#bodLoader").show();
        } else {
            $("#bodLoader").hide();
        }
    }

    var _showResponseMessage = function (responseMsg, responseType) {
        var tmpCommonComponents = _.template($("#tmpCommonComponents").html()),
            data = {
                Type: responseType,
                Message: responseMsg
            };
        $("#bodResponseMessageWrapper").html(
           tmpCommonComponents(data)
        );
        $("#bodResponseMessageWrapper").addClass("bod-alert-wrapper--active");
        setTimeout(function () {
            $("#bodResponseMessageWrapper").removeClass("bod-alert-wrapper--active");
        }, 5000)
    }

    var _fileUploader = function (el,reset) {
              
        if (el) {
            var inputs = $(el);
			
			if(reset){
	            inputs.siblings(".bod-file-uploader__custom").find(".bod-file-uploader__file").html("");
	            return;
	        }
            $.each(inputs, function (k, v) {
                var label = $(v).siblings(".bod-file-uploader__custom"),
                    labelVal = label.innerHTML;

                $(v).on('change', function (e) {
                    var fileName = '';
                    if (this.files && this.files.length > 1)
                        fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
                    else
                        fileName = e.target.value.split('\\').pop();

                    if (fileName)
                        label.find(".bod-file-uploader__file").html(fileName);
                });

            });
        }
    }

    return {
        displayLayover: _displayLayover,
        textTruncate: _textTruncate,
        guidTruncate: _guidTruncate,
        showLoader: _showLoader,
        showContentLoader: _showContentLoader,
        showResponseMessage: _showResponseMessage,
        fileUploader: _fileUploader,
        showContentSuccess: _showContentSuccess,
        showContentFailure: _showContentFailure
    };
})();

