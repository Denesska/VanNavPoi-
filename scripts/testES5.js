var line_nr = 0;
var pointed_nr = 0;
var temp_nr = 0;
var lines = [];
var points = [];
var temporary = [];
var active_id = "nan";
var points_data_list;

console.log(sessionStorage);

function Lines(left, top, A, B, typeA, typeB, del) {
    this.x1 = left + 35;
    this.x2 = left + 98;
    this.y1 = top + 35;
    this.y2 = top + 98;
    this.A = A;
    this.typeA = typeA;
    this.typeB = typeB;
    this.B = B;
    this.id = "lines_" + lines.length;
    this.del = del;
    this.initial = get_initial();
}

function get_initial() {
    return {
        "x1": this.x1,
        "y1": this.y1,
        "x2": this.x2,
        "y2": this.y2,
        "stroke": "black",
        "id": this.id,
        "class": this.A,
        "ondblclick": "remove_line(this)"
    };
}
function Points(nr, left, top, type, accepted, classes) {
    this.nr = nr;
    this.id = "pointed_" + this.nr;
    this.x = left;
    this.y = top;
    this.type = type;
    this.line = false;
    this.acceptance = accepted;
    this.classes = classes;
    this.code = random_code();
    this.title = type + " " + nr;
    this.description = "Some description of this mark.";
    this.del = false;
}
function Temp(id, left, top, type, classes) {
    this.id = id;
    this.x = left;
    this.y = top;
    this.type = type;
    this.classes = classes;
    this.del = false;
}

$(document).mousedown(ShowMarkerDetails);
$(document).ready(function (event, ui) {
    var div_constructor = $("#div_constructor");
    var svg_constructor = $("#svg_constructor");
    if (sessionStorage !== null && sessionStorage.getItem("points") !== null) {
        var restore_div, filtered;
        points = JSON.parse(sessionStorage.points);
        for (j = 0; j < points.length; j++) {
            if (points[j].del === false) {
                restore_div = $("#destination_marker").clone().appendTo(div_constructor)
                    .css({"position": "absolute", "left": points[j].x, "top": points[j].y})
                    .attr({"id": points[j].id, "class": points[j].classes});
                restore_div.children().html(points[j].nr);
                make_draggable(restore_div);
                make_droppable(restore_div);
            }
        }
        temporary = JSON.parse(sessionStorage.temp);
        temp_nr = temporary.length;
        filtered = temporary.filter(function (filtered) {
            return filtered.del === false;
        });
        for (j = 0; j < filtered.length; j++) {
            restore_div = $("#line").clone().appendTo(div_constructor)
                .css({"position": "absolute", "left": filtered[j].x, "top": filtered[j].y})
                .attr({"id": filtered[j].id, "class": filtered[j].classes});
            make_draggable(restore_div);
        }
        lines = JSON.parse(sessionStorage.lines);
        line_nr = lines.length;
        filtered = lines.filter(function (filtered) {
            return filtered.del === false;
        });
        for (j = 0; j < filtered.length; j++) {
            if (lines[j].del === false && lines[j].B.substr(0, 4) === "temp") {
                restore_div = $(".pointA").first().clone().appendTo(div_constructor)
                    .css({"position": "absolute", "left": filtered[j].x2 - 8, "top": filtered[j].y2 - 8})
                    .attr({"id": filtered[j].B, "class": "x2 dragged " + lines[j].typeA});
                make_draggable(restore_div);
            }
            $("#replace_line").clone().appendTo(svg_constructor)
                .attr({
                    "id": filtered[j].id,
                    "x1": filtered[j].x1,
                    "x2": filtered[j].x2,
                    "y1": filtered[j].y1,
                    "y2": filtered[j].y2,
                    stroke: "black",
                    "ondblclick": "remove_line(this)"
                });

        }
        if (!!sessionStorage.active_id) {
            active_id = extNum(sessionStorage.active_id);
        } else {
            active_id = "nan"
        }
    }
    if (sessionStorage !== null && !!sessionStorage.bg_img) {
        $("#div_constructor").css({
            "background-image": "url(" + sessionStorage.bg_img + ")",
            "width": sessionStorage.w_bg_img,
            "height": sessionStorage.h_bg_img
        });
    }
    $(".draggable").draggable({
        start: function (event, ui) {
            ui.helper.css({"z-index": 6});
            console.log("start dragging");
        },
        revert: "invalid",
        helper: "clone",
        cursor: "move",
    });
    div_constructor.droppable({
        accept: ".draggable, .dragged, .point, .any",
        hoverClass: "highlight",
        tolerance: "intersect",
        containment: "parent",
        drop: function (event, ui) {
            var left = ui.helper.position().left - svg_constructor.offset().left;
            var top = ui.helper.position().top - svg_constructor.offset().top;
            if (ui.draggable.is(".draggable")) {
                if (ui.draggable.attr("id") === "destination_marker") {
                    ui.draggable.clone().appendTo(div_constructor).addClass("dragged destination new");
                    points[pointed_nr] = new Points(pointed_nr, left, top, "destination", ".point, .route", "element marker dragged destination");
                    $(".new p").html(pointed_nr);
                } else if (ui.draggable.attr("id") === "route_marker") {
                    ui.draggable.clone().appendTo(div_constructor).addClass("dragged route new");
                    points[pointed_nr] = new Points(pointed_nr, left, top, "route", ".point, .route, .destination", "element marker dragged route");
                    $(".new p").html(pointed_nr);
                } else if (ui.draggable.attr("id") === "line") {
                    ui.draggable.clone().appendTo(div_constructor).addClass("dragged new");
                    temporary[temp_nr] = new Temp("temp_" + temp_nr, left, top, "not_pointed", "point element line dragged")
                } else {
                    ui.draggable.clone().appendTo(div_constructor).addClass("dragged new");
                }
                var mark_clone = $(".dragged.new");
                mark_clone.css({'left': left, 'top': top, 'position': "absolute"})
                    .removeClass("draggable new")
                    .removeAttr("onmousedown id");
                if (mark_clone.is(".line")) {
                    mark_clone.addClass("point").attr({"id": "temp_" + temp_nr++});
                    make_draggable(mark_clone);
                } else if (mark_clone.is(".marker")) {
                    make_draggable(mark_clone);
                    make_droppable(mark_clone);
                }
                updatesessionStorage();
            }
        }
    });
    if (!isNaN(active_id)) {
        replaceMarkerDetails(active_id);
    }
});

function make_draggable(item, id) {
    if (item.hasClass("temporary")) {
        $(item).removeClass("temporary").attr({"id": "tempB_" + line_nr++});
    }
    var top, left, add, str, strA, strB;
    item.draggable({
        revert: "invalid",
        containment: "parent",
        start: function () {
            var id = $(this).attr("id");
            if ($(this).hasClass("point")) {
                str = "#" + $(item).attr("id");
                add = 0;
            } else if ($(this).hasClass("x2")) {
                var pointed_lines = lines.filter(function (pointed_lines) {
                    return pointed_lines.A === id || pointed_lines.B === id;
                });
                var pointed = [];
                for (var j = 0; j < pointed_lines.length; j++) {
                    pointed[j] = "#" + pointed_lines[j].id;
                }
                str = pointed.join();
                add = 9;
            } else {
                if (lines.length > 0) {
                    var pointed_lines = lines.filter(function (pointed_lines) {
                        return pointed_lines.A === id || pointed_lines.B === id;
                    });
                    var pointedA = [], pointedB = [];
                    for (var j = 0; j < pointed_lines.length; j++) {

                        if (pointed_lines[j].A === id) {
                            pointedA.push("#" + pointed_lines[j].id);
                        } else {
                            pointedB.push("#" + pointed_lines[j].id);
                        }
                    }
                    strA = pointedA.join();
                    strB = pointedB.join();
                    add = 35;
                }
            }
        },
        drag: function (event, ui) {
            left = $(this).position().left + add;
            top = $(this).position().top + add;
            if ($(this).hasClass("x2")) {
                $(str).attr({"x2": left, "y2": top})
            } else if ($(this).hasClass("marker")) {
                $(strA).attr({"x1": left, "y1": top});
                $(strB).attr({"x2": left, "y2": top})
            }
        },
        stop: function (event, ui) {
            var id = $(this).attr("id");
            var x = extNum(id);
            if ($(this).hasClass("marker")) {
                points[x].x = $(this).position().left;
                points[x].y = $(this).position().top;
                for (j = 0; j < lines.length; j++) {
                    if (lines[j].A === id) {
                        lines[j].x1 = $(this).position().left + 35;
                        lines[j].y1 = $(this).position().top + 35;
                    } else if (lines[j].B === id) {
                        lines[j].x2 = $(this).position().left + 35;
                        lines[j].y2 = $(this).position().top + 35;
                    }
                }
            } else if ($(this).hasClass("x2")) {
                if (lines[x].B.substr(0, 4) === "temp") {
                    lines[x].x2 = $(this).position().left + 8;
                    lines[x].y2 = $(this).position().top + 8;
                }
            } else {
                temporary[x].x = $(this).position().left;
                temporary[x].y = $(this).position().top;
            }
            updatesessionStorage()
        }
    });
}

function make_droppable(item) {
    $(item).attr({"id": points[pointed_nr].id});
    var acceptance = points[pointed_nr++].acceptance;
    item.droppable({
        accept: acceptance,
        tolerance: "pointer",
        drop: function (event, ui) {
            var left = $(item).position().left;
            var top = $(item).position().top;
            var id = $(item).attr("id");
            if (ui.helper.hasClass("x2")) {
                var x = extNum($(ui.helper).attr("id"));
                lines[x].B = $(this).attr("id");
                lines[x].x2 = left + 35;
                lines[x].y2 = top + 35;

            } else {
                if (item.hasClass("destination")) {
                    lines[line_nr] = new Lines(left, top, $(item).attr("id"), "tempB_" + line_nr, "destination", "route", false);
                    temporary[extNum(ui.draggable.attr("id"))].del = true;
                    updatesessionStorage()
                } else {
                    lines[line_nr] = new Lines(left, top, id, "tempB_" + line_nr, "route", "any", false);
                    temporary[extNum(ui.draggable.attr("id"))].del = true;
                    updatesessionStorage()
                }
                $(".x2.hidden").clone().appendTo("#div_constructor").css({
                    "top": top + 90,
                    "left": left + 90,
                    "position": "absolute"
                }).removeClass("hidden").addClass("temporary dragged " + lines[line_nr].typeA);
                $("#replace_line").clone().appendTo("#svg_constructor").attr(lines[line_nr].initial());
                make_draggable($(".temporary"), id);
            }
            points[extNum($(item).attr("id"))].line = true;
            ui.draggable.remove();
        }
    });
}

function remove_line(item) {
    var x = parseInt($(item).attr("id").substr(6, 7));
    lines[x].del = true;
    item.remove();
    $("#tempB_" + x).remove();
    updatesessionStorage();
}

function extNum(str) {
    return parseInt(str.replace(/[^0-9]/g, ''));
}

function active_mark_on_top(item) {
    var id = item.getAttribute("id");
    $(".dragged").css("z-index", 5);
    item.css({"z-index": 6});
}

function updatesessionStorage() {
    sessionStorage.setItem("points", JSON.stringify(points));
    sessionStorage.setItem("temp", JSON.stringify(temporary));
    sessionStorage.setItem("lines", JSON.stringify(lines));
}

function show_marker_details(item) {
    var html_block = ""
    $("#p_template").clone().appendTo("#markers_info").html(pointed_nr + " : " + points[pointed_nr].type + " -> <input type='text' id='" + points[pointed_nr].type + "_" + pointed_nr + "' value='marker&quot;s info'/>")
}

function remove_active_class() {
    $(".active").removeClass()
}

function random_code() {
    return Math.floor((Math.random() * 10000) + 99999);
}

function ShowMarkerDetails(e) {
    var target = $(e.target);
    if (target.is(".marker p")) {
        var div = target.closest("div");
        var x = extNum(div.attr("id"));
        replaceMarkerDetails(x);
    } else if (target.is("#svg_constructor")) {
        $("#markers_info").addClass("hidden");
        $(".marker").removeClass("active");
        updatesessionStorageActiveId("nan");

    }
}

function replaceMarkerDetails(x) {
    $(".marker").removeClass("active");
    $("#pointed_" + x).addClass("active");
    $(".connections_link").remove();
    $("#markers_info").removeClass("hidden");
    $("#marker_name").html(points[x].type + " " + points[x].nr);
    $("#marker_number").val(points[x].code);
    $("#marker_title").val(points[x].title);
    $("#marker_description").val(points[x].description);
    $("#save_it").attr({"onclick": "saveMarkerDetails(" + x + ")"});
    $("#remove_it").attr({"onclick": "removeMarker(" + x + ")"});
    updatesessionStorageActiveId(x);
    var con;
    var id = points[x].id;
    for (j = 0; j < lines.length; j++) {
        if (lines[j].del === false) {
            if (lines[j].A === id) {
                con = $("#marker_connection").clone().appendTo("#marker_connections").attr({"id": "new_connections"});
                $("<a href='#'></a>").text(lines[j].B).appendTo('#new_connections').attr({"onclick": "replaceMarkerDetails(" + extNum(lines[j].B) + ")"});
                con.removeAttr("id").removeClass("hidden").addClass("connections_link");
            } else if (lines[j].B === id) {
                con = $("#marker_connection").clone().appendTo("#marker_connections").attr({"id": "new_connections"});
                $("<a href='#'></a>").text(lines[j].A).appendTo('#new_connections').attr({"onclick": "replaceMarkerDetails(" + extNum(lines[j].A) + ")"});
                con.removeAttr("id").removeClass("hidden").addClass("connections_link");
            }
        }
    }
}

function saveMarkerDetails(x) {
    points[x].code = $("#marker_number").val();
    points[x].title = $("#marker_title").val();
    points[x].description = $("#marker_description").val();
    console.log("details saved for item pointed_" + x);
    updatesessionStorage();
}

function removeMarker(x) {
    var r = confirm("Are you sure want to delete this POINT ?");
    if (r === true) {
        var id_str = [];
        for (j = 0; j < lines.length; j++) {
            if (lines[j].A === "pointed_" + x || lines[j].B === "pointed_" + x) {
                lines[j].del = true;
                id_str.push("#" + lines[j].id);
            }
        }
        $(id_str.join(",")).remove();
        $("#pointed_" + x).remove();
        points[x].del = true;
        console.log("removed point with id pointed_" + x);
    }
    updatesessionStorage();
    $("#markers_info").addClass("hidden");
    $(".marker").removeClass("active");
    return false;
}

function updatesessionStorageActiveId(x) {
    active_id = x;
    window.sessionStorage.setItem("active_id", active_id);
}

function openSideGrid() {
    kendoGrid();
    $("#side_grid").css({"width": "50%"});
    if (!isNaN(active_id)) {
        var grid = $("#grid").data("kendoGrid");
        grid.select("tr:eq(" + active_id + ")");
    }

}

function closeSideGrid() {
    $("#side_grid").css({"width": "0"});
    if (!isNaN(active_id)) {
        replaceMarkerDetails(active_id);
    }
}

function onChange() {
    var grid = $("#grid").data("kendoGrid")
    var selectedItem = grid.dataItem(grid.select());
    replaceMarkerDetails(selectedItem.nr);
    console.log(selectedItem);
}

function kendoGrid() {
    if (sessionStorage !== null && sessionStorage.points !== undefined) {
        var dataSource = new kendo.data.DataSource({
            transport: {
                create: function (options) {
                },
                read: function (options) {
                    var localData = JSON.parse(sessionStorage.points);
                    options.success(localData);
                },
                update: function (options) {
                    var localData = JSON.parse(sessionStorage.points);

                    for (var j = 0; j < localData.length; j++) {
                        if (localData[j].nr === options.data.nr) {
                            localData[j].code = options.data.code;
                            localData[j].title = options.data.title;
                            localData[j].description = options.data.description;
                        }
                    }
                    sessionStorage.points = JSON.stringify(localData);
                    points = JSON.parse(sessionStorage.points);
                    options.success(options.data);
                },
                destroy: function (options) {
                    console.log("removed")
                },
            },
            schema: {
                model: {
                    id: "nr",
                    fields: {
                        nr: {type: "number", editable: false},
                        type: {type: "string", editable: false},
                        code: {type: "number"},
                        title: {type: "string"},
                        description: {type: "string"}
                    }
                }
            },
            pageSize: 20
        });

        var grid = $("#grid").kendoGrid({
            dataSource: dataSource,
            pageable: false,
            selectable: "row",
            toolbar: ["save", "cancel"],
            columns: [
                {field: "nr", title: "#", width: "50px", filterable: false},
                {
                    field: "type", title: "Type",
                    filterable: {
                        cell: {
                            template: function (args) {
                                args.element.kendoDropDownList({
                                    dataSource: args.dataSource,
                                    dataTextField: "type",
                                    dataValueField: "type",
                                    valuePrimitive: true
                                });
                            },
                            showOperators: false
                        }
                    }
                },
                {field: "code", title: "Code", filterable: false},
                {field: "title", title: "Title", filterable: false},
                {field: "description", title: "Description", filterable: false},
            ],
            filterable: {mode: "row"},
            editable: "incell",
            change: onChange
        }).data("kendoGrid");
    }
}

// replace div constructor background-img
function uploadMapBackground() {
    document.getElementById('bg_maps_upload').addEventListener('change', readURL, true);
}

function readURL() {
    var file = document.getElementById("bg_maps_upload").files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        var image = new Image();
        image.src = reader.result;
        image.onload = function () {
            var width = image.width;
            var height = image.height;
            $("#div_constructor").css({
                "background-image": "url(" + reader.result + ")",
                "width": width,
                "height": height
            });
            sessionStorage.setItem("bg_img", reader.result);
            sessionStorage.setItem("w_bg_img", width);
            sessionStorage.setItem("h_bg_img", height);
        };
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}