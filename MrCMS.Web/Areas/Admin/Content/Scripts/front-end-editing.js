﻿(function ($) {
    var settings, methods = {
        init: function (options) {
            settings = {
                editableSelector: '.editable'
            };
            if (options) {
                $.extend(settings, options);
            }
            CKEDITOR.disableAutoInline = true;
            CKEDITOR.on('instanceCreated', function (event) {
                var editor = event.editor;
                editor.on('configLoaded', function () {
                    editor.config.toolbar = 'Basic';
                });
            });

            $("#enable-editing").click(function () {
                $(this).mrcmsinline(!getEditingEnabled() ? 'enable' : 'disable');
            });
            $(this).mrcmsinline(getEditingEnabled() ? 'enable' : 'disable');

            $(".menu-handle").click(function () {
                $(this).mrcmsinline(!getMenuOut() ? 'showMenu' : 'hideMenu');
            });
            $(this).mrcmsinline(getMenuOut() ? 'showMenu' : 'hideMenu');

            return this;
        },
        showMenu: function () {
            setMenuOut(true);
            $("#admin-edit-menu-container").animate({ left: '0', }, 500, function () { });
            $(".menu-handle").attr('src', "/Areas/Admin/Content/Images/button-left.png");
        },
        hideMenu: function () {
            setMenuOut(false);
            var leftPos = -102;
            $("#admin-edit-menu-container").animate({ left: leftPos, }, 500, function () { });
            $(".menu-handle").attr('src', "/Areas/Admin/Content/Images/button-right.png");
        },
        enable: function () {
            setEditingEnabled(true);
            $("#enable-editing").text("Editing: On");

            $(settings.editableSelector).each(function (index, element) {
                var el = $(element);
                if (el.attr('contenteditable') != 'true')
                    el.attr('contenteditable', 'true');
                if (el.data("is-html") == true) {
                    var editor = CKEDITOR.inline(element);
                    var original = null;
                    editor.on('focus', function (e) {
                        $.get('/Admin/InPageAdmin/GetUnformattedBodyContent/', { id: el.data('id'), property: el.data('property'), type: el.data('type') }, function (response) {
                            e.editor.setData(response);
                            original = e.editor.getData();
                        });
                    });
                    editor.on('blur', function (e) {
                        if (original != e.editor.getData()) {
                            $.ajax({
                                type: "POST",
                                url: "/Admin/InPageAdmin/SaveBodyContent",
                                data: {
                                    id: el.data('id'),
                                    property: el.data('property'),
                                    type: el.data('type'),
                                    content: el.html()
                                },
                                success: function (msg) {
                                    showLiveForm(el);
                                }
                            });
                        } else {
                            showLiveForm(el);
                        }
                    });
                } else {
                    el.focus(function () {
                        original = el.html();
                    });
                    el.blur(function () {
                        if (original != el.html()) {
                            $.ajax({
                                type: "POST",
                                url: "/Admin/InPageAdmin/SaveBodyContent",
                                data: {
                                    id: el.data('id'),
                                    property: el.data('property'),
                                    type: el.data('type'),
                                    content: el.html()
                                },
                                success: function (msg) {
                                    showLiveForm(el);
                                }
                            });
                        }
                    });
                }
            });
            //foreach widget add the HTML code
            $("div[data-widget-id]").each(function () {
                $(this).prepend("<div class='edit-indicator'><img src='/Areas/Admin/Content/Images/pencil.png' /></div>");
            });

            $('.edit-indicator').click(function () {
                //what is the layout area?
                var layoutAreaContainerId = $(this).parentsUntil(".layout-area").parent().data('layout-area-id');
                //the widget?
                var widgetId = $(this).parent().data('widget-id');

                var menu = '<div class="admin-tools edit-widget gradient-bg" style="background:#ffffff;"><ul><li><a id="" href="/Admin/Widget/Edit/' + widgetId + '" target="_parent" class="btn btn-mini" style="color:#333;text-decoration:none;">Edit this widget</a></li><li><a href="/Admin/Widget/AddPageWidget?pageId=' + $('#Id').val() + '&layoutAreaId=' + layoutAreaContainerId + '" data-toggle="modal" class="btn btn-mini" style="color:#333;text-decoration:none;">Add new widget here</a></li><li><a href="/Admin/Widget/Delete/' + widgetId + '" data-toggle="modal" class="btn btn-mini" style="color:#333;text-decoration:none;">Delete this widget</a></li></ul></div>';

                $(this).parent().prepend(menu.replace('#widget-id#', widgetId).replace('#layoutid#', layoutAreaContainerId));

                //if click outside hide the menu
                $(document).mouseup(function (e) {
                    var container = $(".edit-widget");
                    if (container.has(e.target).length === 0) {
                        container.hide();
                    }
                });
            });
        },
        disable: function () {
            setEditingEnabled(false);
            $("#enable-editing").text("Editing: Off");
            //remove all edit tools
            $(".edit-indicator").remove();

            //kill all ckeditors
            for (k in CKEDITOR.instances) {
                var instance = CKEDITOR.instances[k];
                instance.destroy(true);
            }
            $(settings.editableSelector).attr("contenteditable", "false");
        }
    };

    $.fn.mrcmsinline = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.mrcms-mrcmsinline');
        }
    };

    function showLiveForm(el) {
        $.get('/Admin/InPageAdmin/GetFormattedBodyContent/', { id: el.data('id'), property: el.data('property'), type: el.data('type') }, function (response) {
            el.html(response);
        });
    };

    function getEditingEnabled() {
        return $.cookie('mrcms-inline-edit') === "true";
    }

    function getMenuOut() {
        return $.cookie('mrcms-inline-edit-menu-out') === "true";
    }

    function setEditingEnabled(value) {
        return $.cookie('mrcms-inline-edit', value, { expires: 1 });
    }

    function setMenuOut(value) {
        return $.cookie('mrcms-inline-edit-menu-out', value, { expires: 1 });
    }
})(jQuery);

$(function () {
    $().mrcmsinline();
});
