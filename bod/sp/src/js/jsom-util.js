window.Kiiro = window.Kiiro || {};
window.Kiiro.BOD = window.Kiiro.BOD || {};

Kiiro.BOD.JSOMUtil = (function () {
    var _arrayBufferToBase64 = function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    var _getListItemById = function (listName, id, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var item = list.getItemById(id);

            context.load(item);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(item);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _getListItem = function (listName, viewXml, success, failure, successParam) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml(viewXml);
            var listColl = list.getItems(camlQuery);

            context.load(listColl);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(listColl, successParam);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _getChoices = function (listName, fieldName, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var field = context.castTo(list.get_fields().getByInternalNameOrTitle(fieldName), SP.FieldChoice);

            context.load(field);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(field);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    }

    var _getListAttachment = function (listItem, success, failure) {
        var context = listItem.get_context();
        var attachmentFolderUrl = String.format('{0}/Attachments/{1}', listItem.get_fieldValues()['FileDirRef'], listItem.get_fieldValues()['ID']);
        var folder = context.get_web().getFolderByServerRelativeUrl(attachmentFolderUrl);
        var files = folder.get_files();
        context.load(files);
        context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var attachments = [];
                    var fileCount = files.get_count();
                    for (var i = 0; i < fileCount; i++) {
                        var file = files.get_item(i);
                        attachments.push({ url: file.get_serverRelativeUrl(), name: file.get_name() });
                    }
                    success(attachments);
                }),
                Function.createDelegate(this, function (sender, args) {
                    if (args.get_errorTypeName() == "System.IO.FileNotFoundException") {
                        var attachments = [];
                        success(attachments);
                    }
                    else {
                        failure(sender, args);
                    }
                })
            );
    }

    var _updateListItem = function (listItem, success, failure, param) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            listItem.update();
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(listItem, param);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _updateListItemById = function (listName, listItemId, listItemArr, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var listItem = list.getItemById(listItemId);
            for (var i = 0; i < listItemArr.length; i++) {
                listItem.set_item(listItemArr[i].Key, listItemArr[i].Value);
            }
            listItem.update();
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(listItem);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _deleteListItem = function (listItem, success, failure, param) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            listItem.deleteObject();
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(param);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _addListItem = function (listName, listItemArr, success, failure, successParam) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var itemCreateInfo = new SP.ListItemCreationInformation();
            var listItem = list.addItem(itemCreateInfo);

            for (var i = 0; i < listItemArr.length; i++) {
                listItem.set_item(listItemArr[i].Key, listItemArr[i].Value);
            }
            listItem.update();
            context.load(listItem);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(listItem, successParam);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _getContentType = function (listName, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var web = context.get_web();
            var list = web.get_lists().getByTitle(listName);
            var contentTypeColl = list.get_contentTypes();

            context.load(contentTypeColl);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(contentTypeColl);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    };

    var _addFile = function (listName, content, title, extension, relativeUrl, success, failure, successParam) {

        var getFileBuffer = function (content) {

            var deferred = $.Deferred();
            var reader = new FileReader();

            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            }

            reader.onerror = function (e) {
                deferred.reject(e.target.error);
            }

            reader.readAsArrayBuffer(content);

            return deferred.promise();
        };

        getFileBuffer(content).then(function (buffer) {
            _addFileStream(buffer);
        });

        var _addFileStream = function (buffer) {
            SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
                var context = new SP.ClientContext.get_current();
                var web = context.get_web();
                var files = web.getFolderByServerRelativeUrl(relativeUrl + "/" + listName + "/").get_files();
                context.load(files);
                var createInfo = new SP.FileCreationInformation();
                // Convert ArrayBuffer to Base64 string
                createInfo.set_content(_arrayBufferToBase64(buffer));
                // Overwrite if already exists
                createInfo.set_overwrite(true);
                // set target url
                var destUrlName = title + "_" + new Date().getTime() + extension;
                var destUrlString = relativeUrl + "/" + listName + "/" + destUrlName;
                createInfo.set_url(destUrlString);
                // add the new file
                files.add(createInfo);
                // upload file
                context.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        success(destUrlName, successParam);
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        failure(sender, args);
                    })
                );
            });
        }
    }

    var _getSubWebs = function (success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext.get_current();
            var webs = context.get_site().get_rootWeb().getSubwebsForCurrentUser();
            context.load(webs, 'Include(Title,Url,Description,WebTemplate,Created)');

            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success(webs);
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    }

    var _createSite = function (title, url, template, desc) {
        return $.Deferred(function (dfd) {
            SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
                var context = new SP.ClientContext.get_current();
                var web = context.get_web();

                context.load(web);

                var webCreationInfo = new SP.WebCreationInformation();
                webCreationInfo.set_title(title);
                webCreationInfo.set_description(desc);
                webCreationInfo.set_language(1033);
                webCreationInfo.set_url(url);
                webCreationInfo.set_useSamePermissionsAsParentSite(false);
                webCreationInfo.set_webTemplate(template);

                web.get_webs().add(webCreationInfo);
                web.update();

                context.executeQueryAsync(
                    function () {
                        dfd.resolve(web);
                    },
                    function (sender, args) {
                        dfd.reject(sender, args);
                    });
            });
        })
    }

    var _updateSite = function (title, desc, url, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            web.set_title(title);
            web.set_description(desc);
            web.update();

            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success();
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    }

    var _deleteSite = function (url, success, failure) {
        SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            web.deleteObject();

            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    success();
                }),
                Function.createDelegate(this, function (sender, args) {
                    failure(sender, args);
                })
            );
        });
    }

    var _createGroup = function (url, groupName, groupDesc, permissionLevel) {
        return $.Deferred(function (dfd) {
            SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
                var context = new SP.ClientContext(url);
                var web = context.get_web();
                var groupColl = web.get_siteGroups();

                var permissionGroup = new SP.GroupCreationInformation();
                permissionGroup.set_title(groupName);
                permissionGroup.set_description(groupDesc);

                var oPermissionsGroup = groupColl.add(permissionGroup);

                var rollDef = web.get_roleDefinitions().getByName(permissionLevel);
                var collBind = SP.RoleDefinitionBindingCollection.newObject(context);
                collBind.add(rollDef);

                var assignments = web.get_roleAssignments();
                var roleAssignment = assignments.add(oPermissionsGroup, collBind);

                context.load(web);
                context.load(oPermissionsGroup);
                context.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        dfd.resolve();
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        dfd.reject(sender, args);
                    })
                );
            });
        })
    }

    var _createList = function (url, listName, listTemplate, contentTypeId) {
        return $.Deferred(function (dfd) {
            SP.SOD.executeFunc("SP.js", "SP.ClientContext", function () {
                var context = new SP.ClientContext(url);
                var web = context.get_web();
                var contentType = context.get_site().get_rootWeb().get_contentTypes().getById(contentTypeId);

                context.load(web);
                context.load(contentType);
                context.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        var lci = new SP.ListCreationInformation();
                        lci.set_title(listName);
                        lci.set_templateType(listTemplate);
                        var newList = web.get_lists().add(lci);
                        newList.set_contentTypesEnabled(true);
                        var contentTypes = newList.get_contentTypes();
                        context.load(newList);
                        context.load(contentTypes);

                        context.executeQueryAsync(
                            Function.createDelegate(this, function () {
                                contentTypes.addExistingContentType(contentType);
                                newList.update();
                                context.executeQueryAsync(
                                    Function.createDelegate(this, function () {
                                        dfd.resolve();
                                    }),
                                    Function.createDelegate(this, function (sender, args) {
                                        dfd.reject(sender, args);
                                    })
                                );
                            }),
                            Function.createDelegate(this, function (sender, args) {
                                dfd.reject(sender, args);
                            })
                        );
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        dfd.reject(sender, args);
                    })
                );
            });
        })
    }

    var _createPage = function (url, pageName, pageLayoutName) {
        return $.Deferred(function (dfd) {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            var list = context.get_site().get_rootWeb().get_lists().getByTitle('Master Page Gallery');
            //Get the page layout by ID using which we will create a publishing page 
            var camlQuery = new SP.CamlQuery();
            var pageLayoutLeafRef = pageLayoutName + ".aspx";
            camlQuery.set_viewXml(
                '<View><Query><Where><Eq><FieldRef Name=\'FileLeafRef\'/>' +
                '<Value Type=\'File\'>' + pageLayoutLeafRef + '</Value></Eq></Where></Query>' +
                '<RowLimit>1</RowLimit></View>'
            );

            var listItemColl = list.getItems(camlQuery);
            context.load(web);
            context.load(listItemColl);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    var itemCount = listItemColl.get_count();
                    if (itemCount > 0) {
                        var listItemEnumerator = listItemColl.getEnumerator();
                        while (listItemEnumerator.moveNext()) {
                            var pageLayoutitem = listItemEnumerator.get_current();
                            //Create Publishing Page using PublishingPageInformation object   
                            var newPublishingPage = SP.Publishing.PublishingWeb.getPublishingWeb(context, web);
                            var pageInfo = new SP.Publishing.PublishingPageInformation();
                            pageInfo.set_name(pageName + ".aspx");
                            pageInfo.set_pageLayoutListItem(pageLayoutitem);
                            var newPage = newPublishingPage.addPublishingPage(pageInfo);
                            //Load the new page object to the client context   
                            context.load(newPage);
                            context.executeQueryAsync(
                                Function.createDelegate(this, function () {
                                    dfd.resolve();
                                }),
                                Function.createDelegate(this, function (sender, args) {
                                    dfd.reject(sender, args);
                                })
                            );
                        }
                    }
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject(sender, args);
                })
            );
        });
    }

    var _addWebPart = function (url, webPartPath, pageName, zoneName, zoneId, relativeUrl, subSiteUrl, listGuid) {
        return $.Deferred(function (dfd) {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            var newWeb = context.get_site().get_rootWeb();
            context.load(web);
            context.load(newWeb);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    $.ajax({
                        url: webPartPath,
                        type: "GET"
                    })
                    .done(Function.createDelegate(this, function (data) {
                        var webPartXml = data;
                        if (relativeUrl) {
                            webPartXml = webPartXml.replace("relative--url", relativeUrl);
                            if (subSiteUrl) {
                                webPartXml = webPartXml.replace("site--url", relativeUrl + "/" + subSiteUrl);
                            }
                        }
                        if (listGuid) {
                            webPartXml = webPartXml.replace("list--id", listGuid);
                        }

                        var file = newWeb.getFileByServerRelativeUrl(relativeUrl + "/" + subSiteUrl + "/Pages/" + pageName + ".aspx");
                        var webPartMngr = file.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
                        var webPartDef = webPartMngr.importWebPart(webPartXml);
                        var webPart = webPartDef.get_webPart();
                        webPartMngr.addWebPart(webPart, zoneName, zoneId);

                        context.load(webPart);
                        context.executeQueryAsync(
                            Function.createDelegate(this, function () {
                                dfd.resolve();
                            }),
                            Function.createDelegate(this, function (sender, args) {
                                dfd.reject(sender, args);
                            })
                        );
                    }))
                    .fail(Function.createDelegate(this, function (xhs) {
                        dfd.reject(xhs);
                    }));
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject(sender, args);
                })
            );
        })
    }

    var _checkInPage = function (url, pageName, relativeUrl, subSiteUrl) {
        return $.Deferred(function (dfd) {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            var file = web.getFileByServerRelativeUrl(relativeUrl + "/" + subSiteUrl + "/Pages/" + pageName + ".aspx");
            file.checkIn();
            file.publish();
            context.load(file);
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    dfd.resolve();
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject(sender, args);
                })
            );
        })
    }

    var _setWelcomePage = function (url, pageName) {
        return $.Deferred(function (dfd) {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            var rootFolder = web.get_rootFolder();

            context.load(web);
            context.load(rootFolder);

            rootFolder.set_welcomePage("Pages/" + pageName + ".aspx");

            rootFolder.update();

            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    dfd.resolve();
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject(sender, args);
                })
            );
        })
    }

    var _setMasterPage = function (url, customMasterPageUrl, systemMasterPgeUrl) {
        return $.Deferred(function (dfd) {
            var context = new SP.ClientContext(url);
            var web = context.get_web();
            if (customMasterPageUrl) {
                web.set_customMasterUrl(customMasterPageUrl);
            }
            if (systemMasterPgeUrl) {
                web.set_masterUrl(systemMasterPgeUrl);
            }
            web.update();
            context.executeQueryAsync(
                Function.createDelegate(this, function () {
                    dfd.resolve();
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject(sender, args);
                })
            );
        })
    }

    return {
        getListItemById: _getListItemById,
        getListItem: _getListItem,
        getListAttachment: _getListAttachment,
        updateListItem: _updateListItem,
        updateListItemById: _updateListItemById,
        deleteListItem: _deleteListItem,
        getContentType: _getContentType,
        addFile: _addFile,
        addListItem: _addListItem,
        getChoices: _getChoices,
        getSubWebs: _getSubWebs,
        createSite: _createSite,
        updateSite: _updateSite,
        deleteSite: _deleteSite,
        createGroup: _createGroup,
        createList: _createList,
        createPage: _createPage,
        addWebPart: _addWebPart,
        checkInPage: _checkInPage,
        setWelcomePage: _setWelcomePage,
        setMasterPage: _setMasterPage
    };
})();