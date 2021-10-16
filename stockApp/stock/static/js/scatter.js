$(function () {
    //resizable
    var resize = interact('.resize-drag')
        .resizable({
            // resize from all edges and corners
            edges: {
                left: false,
                right: true,
                bottom: true,
                top: false
            },

            listeners: {
                move(event) {
                    var target = event.target
                    var x = (parseFloat(target.getAttribute('data-x')) || 0)
                    var y = (parseFloat(target.getAttribute('data-y')) || 0)

                    // update the element's style
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'
                    resizeGraph(target.dataset.plotid, event.rect.width - 10, event.rect.height - 50);

                },

            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: {
                        width: 100,
                        height: 50
                    },
                    max: 'parent'
                })
            ],

            inertia: true
        })
        .draggable({
            listeners: {
                move: window.dragMoveListener
            },
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ]
        })
});
var ticker = "";
var dateTo = moment().format('DD/MM/YYYY');
var dateFrom = moment().subtract(3, 'MONTH').format('DD/MM/YYYY');

function stratSelector(click) {
    stratModal.getStrats();
    $("#indicmodal").modal();
}

function stockSelector() {
    $("#stockmodal").modal();
}

function selectStock(symb) {
    $("#stockSelect").val(symb);
    ticker = symb;
    $("#stockmodal").modal('hide');
}



var currdata = [];
var currpltname = '';
var name = "";
var indicator1 = "Select Indicator 1";
var period1 = 2;
var indicator2 = "Select Indicator 2";
var period2 = 2;

var currticker = "undefined";
var currdate = "undefined";
var indicator1name = "undefined";
var indicator2name = "undefined";

function updateScatter() {
    remError();
    var newindicator1 = $("#stock1 option:selected").val();
    var newperiod1 = $("#type1period").val();
    var newindicator2 = $("#stock2 option:selected").val();
    var newperiod2 = $("#type2period").val();

    var newindicator1name = getname(newindicator1, newperiod1, $("#stock1 option:selected").attr('data-UL'));
    var newindicator2name = getname(newindicator2, newperiod2, $("#stock2 option:selected").attr('data-UL'));
    //check to see if need to get new data
    if (newindicator1name != indicator1name || newindicator2name != indicator2name || !currplotvalid || ticker != currticker || currdate != dateFrom) {
        currplotvalid = false;
        indicator1name = newindicator1name;
        indicator2name = newindicator2name;
        indicator1 = newindicator1;
        indicator2 = newindicator2;
        period1 = newperiod1;
        period2 = newperiod2;
        currdate = dateFrom;
        currticker = ticker;
        if (checkplot()) {
            axios.post(sctrURL, {
                params: {
                    ticker: ticker,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    dataType: $("#timeFrame option:selected").val(),
                    indicator1: indicator1,
                    period1: period1,
                    indicator2: indicator2,
                    period2: period2,
                },
                headers: {
                    "X-CSRFToken": CSRF_TOKEN
                }
            }).then(response => {
                var arr = JSON.parse(response.data.table, function (key, value) {
                    if (key == "date") {
                        return new Date(value);
                    } else {
                        return value;
                    }
                });
                currdata = arr;
                currpltname = response.data.name;
                displayConnectedScatter(currdata);
            })
        }
    } else {
        if (checkplot()) {
            name = $("#scattername").val();
            displayConnectedScatter(currdata);
        }
    }

}

function getname(indicator, period, UL) {
    if (indicator.startsWith("open")) {
        return "open";
    }
    if (indicator.startsWith("BBANDS")) {
        return "BBANDS " + period + " " + UL;
    }
    return indicator + " " + period;
}
var currplotvalid = false;
var currtraces = undefined;
var currlayout = undefined;
var frequency = 1;
var numberingfreq = 1;
var defwidth = 500;

function displayConnectedScatter(data) {
    frequency = $('#frequency').val()
    numberingfreq = $('#numfreq').val()

    defwidth = $('#defwidth').val()
    var markercolors = [];
    //base graph

    var mrksymbol = [];
    var annotation = [];
    var x = [];
    var y = [];
    var cnt = 0;
    var numbering = [];
    var actcnt = 0;
    var mrksize = [];
    data.forEach((item, idx) => {
        cnt++;
        if (cnt % frequency == 0 || idx == data.length - 1) {
            if (item[indicator1name] != null && item[indicator2name] != null) {
                actcnt++;
                //create indicator for chart for each
                var itx = item[indicator1name];
                var ity = item[indicator2name];
                if (actcnt % numberingfreq == 0 || actcnt < 2 || idx == data.length - 1) {
                    mrksymbol.push("circle-open");
                    mrksize.push(22);
                    markercolors.push("black");
                    numbering.push({
                        x: itx,
                        y: ity,
                        xref: 'x',
                        yref: 'y',
                        text: actcnt,
                        showarrow: false,
                        font: {
                            color: "black",
                            weigght: 5,
                            size: 12
                        },
                        ax: 0,
                        ay: 0,
                    }, )
                } else {
                    mrksymbol.push("circle");
                    mrksize.push(10);
                    markercolors.push("#cc79a799");
                }
                var anotate = moment(item.date).format("DD/MM/YYYY HH:MM") + "<br>"
                 + indicator1name + ": " + itx.toFixed(2) + "<br>" + indicator2name + ": " + ity.toFixed(2);
                annotation.push(anotate);
                x.push(itx);
                y.push(ity);

                //adding arrows - feature currently unsupported
                /*   if(data[idx+1]){
                      var next = data[idx+1];
                      var directionx = next[indicator1name] - itx;
                      var directiony = next[indicator2name] - ity;
                      var angle =((Math.atan(directiony/directionx)*180)/Math.PI);
                      if( angle < 0){
                          //convert to positive angle
                          angle =+ 360;
                      }
                      console.log(angle)
                      //arrow direction
                      if(angle <= 22){
                          symbols.push("triangle-up-open");
                      }else if(angle > 22 && angle <= 56 ){
                          symbols.push("triangle-ne-open");
                      }else if(angle > 56 && angle <= 112 ){
                          symbols.push("triangle-right");
                      }else if(angle > 112 && angle <= 157 ){
                          symbols.push("triangle-se-open");
                      }else if(angle > 157 && angle <= 202 ){
                          symbols.push("triangle-down-open");
                      }else if(angle > 202 && angle <= 247){
                          symbols.push("triangle-sw-open");
                      }else if(angle > 247 && angle <= 292 ){
                          symbols.push("triangle-left-open");
                      }else if(angle > 292 && angle <= 337 ){
                          symbols.push("triangle-nw-open");
                      }else if(angle > 292 && angle <= 360 ){
                          symbols.push("triangle-up-open");
                      }
                  } */
            }
        }
    });
    currplotvalid = x.some(function (el) {
        return el != null;
    });
    currplotvalid = y.some(function (el) {
        return el != null;
    });

    var points = {
        type: "scatter",
        mode: "markers",
        name: 'Points',
        x: x,
        y: y,
        marker: {
            size: mrksize,
            symbol: mrksymbol,
            color: markercolors
        },
    }
    var line = {
        type: "scatter",
        mode: "lines",
        name: 'line',
        x: x,
        y: y,
        text: annotation,
        hoverinfo: 'text',
        line: {
            color: '#cc79a799'
        },

    }
    var traces = [points, line];
    var layout = {
        annotations: numbering,
        autosize: true,
        showlegend: false,
        margin: {
            b: 60,
            t: 60,
            r: 20,
            pad: 5
        },
        title: true,
        title: {
            text: currpltname,
        },
        xaxis: {
            title: {
                text: indicator1name,
            },
        },
        yaxis: {
            title: {
                text: indicator2name,
            },
        }
    };
    try {
        figure = Plotly.newPlot('conScatter', traces, layout, {
            displaylogo: false
        });
        currtraces = traces;
        currlayout = layout;
    } catch (e) {
        console.log(e);
    }
}


//Chris Coyier - lighten darken colors @https://css-tricks.com/snippets/javascript/lighten-darken-color/
function LightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}

function newid() {
    return "plot-" + (Math.random().toString(36).substring(7).toString());
}


var scatterplots = new Vue({
    delimiters: ['[[', ']]'],
    el: '#scatterplot',
    data: {
        plots: [],
    },
    methods: {
        addtolist: function () {
            name = $("#scattername").val();
            remError();
            if (checkaddto()) {
                var id = newid();
                this.plots.push({
                    'name': name,
                    'id': id
                });
                copyPlot(id)
            }

        }
    }
});

function copyPlot(plotid) {
    var checkExist = setInterval(function () {
        if ($('#' + plotid).length) {
            $('#' + plotid).width(defwidth + "px");
            Plotly.newPlot(plotid, currtraces, currlayout, {
                displaylogo: false
            });
            resizeGraph(plotid, defwidth, 500);
            clearInterval(checkExist);
        }
    }, 100);
}

function addError(msg) {
    $("#errors").removeClass("hide");
    $('#errors').html($('#errors').html() + "<br>" + msg);
    return false;
}

function remError() {
    $('#errors').html("");
    $("#errors").addClass("hide");
}

function checkaddto() {
    var valid = true;
    valid = checkplot();
    if (name == undefined || name == "") {
        valid = addError("Missing plot Name.");
    }
    if (!currplotvalid) {
        valid = addError("Missing or empty scatterplot.");
    }
    if (defwidth == 0 || isNaN(defwidth)) {
        valid = addError("Default width should be 1 or more.");
    }
    return valid;
}

function checkplot() {
    console.log(indicator1)
    var valid = true;
    if (ticker == "") {
        valid = addError("Missing Stock.");
    }
    if (isNaN(numberingfreq)) {
        valid = addError("Numbering is missing or is not a number.");
    }
    if (indicator1 == 0) {
        valid = addError("Missing indicator 1.");
    }
    if (indicator2 == 0) {
        valid = addError("Missing indicator 2.");
    }
    if (period1 == 0 || period2 == 0) {
        valid = addError("Indicators Period cannot be 0.");
    }
    if (isNaN(period1) || isNaN(period2)) {
        valid = addError("Indicators Period has to be a number.");
    }
    if (frequency == 0 || isNaN(frequency)) {
        valid = addError("Frequency(use every) should be 1 or more.");
    }
    return valid;
}



function resizeGraph(id, width, height) {
    console.log("w:" + width + " h:" + height)
    var update = {
        autosize: false,
        width: width - 50,
        height: height - 50
    }
    Plotly.relayout(id, update)
}

var hidden = false;

function togglehide() {
    console.log(hidden)
    if (hidden) {
        $("#scatterbody").removeClass("hide");
        $("#hideicon").text("keyboard_arrow_up");
        $("#hidetext").text("Hide");
        hidden = false;
    } else {
        $("#scatterbody").addClass("hide");
        $("#hideicon").text("keyboard_arrow_down");
        $("#hidetext").text("Show");
        hidden = true;

    }

}

function deleteplot(obj) {
    $(obj).parent().parent().parent().remove();
}

function helpScatter() {
    $("#scatterHelpDialog").modal();
}