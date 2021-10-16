$(function () {
  $('.number').on('input propertychange', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
  $('#indDrop').dropdown();
  document.getElementById('searchField').value = "A"
  search.search();
  document.getElementById('searchField').value = ""
  changeData("AAPL");
  $(window).on('resize', function (e) {
    fixGraph()
  });

});

function fixGraph() {
  var mainlayout = {
    autosize: true,
    showlegend: true,
    margin: {
      l: 60,
      r: 20,
      b: 40,
      t: 20,
      pad: 5
    },
    title: false,
    yaxis: {
      title: {
        text: 'Value',
      }
    },
    xaxis: {
      visible: false,
      rangebreaks: {
        bounds: ["sat", "mon"],
        values: ["2015-12-25", "2016-01-01"]
      },
      rangeslider: {
        visible: false
      },
    }
  };
  Plotly.relayout('graphDIV', mainlayout);
  if (!$("#secondGraphDIV").hasClass("hide")) {
    console.log("has")
    Plotly.relayout('secondGraphDIV', mainlayout);

  }
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

function checkModal() {
  console.log("checkModal");
  $("#indPeriod2").val(2);
  var valid = true;
  var period1 = ($("#indPeriod").val())
  var period2 = ($("#indPeriod").val())

  if (isNaN(period1) || period1 == 0 || isNaN(period2) || period2 == 0) {
    valid = addError("Indicator Periods have to be a number and not 0");
  }
  console.log(valid);

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

var dateTo = moment().format('DD/MM/YYYY');
var dateFrom = moment().subtract(3, 'MONTH').format('DD/MM/YYYY');
var mainType = "line";
var curdata = undefined;
var currentTicker = undefined;
var title = "Loading stock...";
var indicatorNames = [];
var indicatorcolouring = [];

function changeData(clicked_id) {
  hideSecondary();
  remError();
  indicatorsbtnlist.clear()
  addLoader();
  currentTicker = clicked_id;
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.post(graphURL, {
    params: {
      ticker: clicked_id,
      indicators: stringifyIndicators(),
      mainType: mainType,
      timeFrame: $("#timeFrame option:selected").val(),
      dateTo: dateTo,
      dateFrom: dateFrom,
    },
    headers: {
      "X-CSRFToken": CSRF_TOKEN
    }
  }).then(response => {
    if (response.data.error == "1") {
      return addError(response.data.graph);
    }
    curdata = JSON.parse(response.data.graph, function (key, value) {
      if (key == "date") {
        return new Date(value);
      } else {
        return value;
      }
    });
    title = response.data['title'];
    indicatorNames = response.data['indicatorNames'];
    plotGraph();
    removeLoader()
  })
}

//indicators that belong to main graph
var mainindicators = ["SMA", "EMA", "BBANDS"];
//secondary indicators that belong to under graph
var secindicators = ["MOM", "ROC", "RSI", "ATR"];
var mainTraces = [];
var secondaryTraces = [];

function plotGraph() {
  var date = [];
  var open = [];
  var high = [];
  var low = [];
  var close = [];

  curdata.forEach(item => {
    date.push(moment(item['date']).format("DD/MM/YYYY HH:MM"));
    open.push(item['open']);
    high.push(item['high']);
    low.push(item['low']);
    close.push(item['close']);
  });

  var mainline = {};
  if (mainType == "candleSticks") {
    mainline = {
      type: "candlestick",
      name: "Stock CandleSticks",
      x: date,
      open: open,
      high: high,
      close: close,
      text: date,

      low: low,
    }
  } else if (mainType == "line") {
    mainline = {
      type: "scatter",
      mode: "lines",
      name: "Stock Open",
      x: date,
      y: open,
      text: date,

      line: {
        color: "#8900af"
      }
    }
  }
  mainTraces = [mainline];
  secondaryTraces = [];

  indicatorNames.forEach(indicator => {
    var code = indicator[0].split(" ")[0];
    if (mainindicators.includes(code)) {
      if (code == "BBANDS") {
        console.log(indicator[0])
        mainTraces.push(getTrace(indicator[0] + " U", curdata, date, indicator[1]));
        mainTraces.push(getTrace(indicator[0] + " L", curdata, date, indicator[2]));
        indicatorsbtnlist.addindButton(indicator[0], indicator[1], true);

      } else {
        mainTraces.push(getTrace(indicator[0], curdata, date, indicator[1]));
        indicatorsbtnlist.addindButton(indicator[0], indicator[1], true);
      }
    } else if (secindicators.includes(code)) {
      secondaryTraces.push(getTrace(indicator[0], curdata, date, indicator[1]));
      indicatorsbtnlist.addindButton(indicator[0], indicator[1], true);
    }
  })
  if (secondaryTraces.length > 0) {
    showSecondary();
  }
  var mainlayout = {
    autosize: true,
    showlegend: true,
    margin: {
      l: 60,
      r: 20,
      b: 40,
      t: 20,
      pad: 5
    },
    title: false,
    yaxis: {
      title: {
        text: 'Value',
      }
    },
    xaxis: {
      visible: false,
      rangebreaks: {
        bounds: ["sat", "mon"],
        values: ["2015-12-25", "2016-01-01"]
      },
      rangeslider: {
        visible: false
      },
    }
  };

  $("#title").text(title);

  Plotly.react("graphDIV", mainTraces, mainlayout, {
    displaylogo: false
  });
  Plotly.react("secondGraphDIV", secondaryTraces, mainlayout, {
    displaylogo: false
  });
}

function getTrace(indicatorname, curdata, date, color) {
  var indicvals = [];
  curdata.forEach(item => {
    indicvals.push(item[indicatorname]);
  })
  return ({
    type: "scatter",
    mode: "lines",
    name: indicatorname,
    x: date,

    y: indicvals,
    line: {
      color: color
    }
  })
}

function update() {
  changeData(currentTicker);
  disableUpdate()
}

function disableUpdate() {
  //prevent duplication of btns
  document.getElementById("updatebtn").disabled = true;
  setTimeout(function () {
    document.getElementById("updatebtn").disabled = false;
  }, 500);
}

function addLoader() {
  $("#graphDIV").addClass("load");
}

function removeLoader() {
  $("#graphDIV").removeClass("load");
}

function showSecondary() {
  $("#secondGraphDIV").removeClass("hide");
}

function hideSecondary() {
  $("#secondGraphDIV").addClass("hide");
}

function selectStock(ticker) {
  changeData(ticker);
}

function CandleSticks() {
  if ($("#candleBtn").length == 0) {
    mainType = "candleSticks";
    $("#indicatorList").prepend('<button id="candleBtn" onclick="removeCandleSticks()" class="btn-candle btn-sm mr-1 mb-1" type=""><i class="material-icons md-18">close</i> CandleSticks</button>');
  }
}

function removeCandleSticks() {
  mainType = "line";
  $("#candleBtn").remove();
}

var indCode;
var indColor;
var indColor2;
var indInputs = [];

function openModal(click) {
  $("#color2").hide();
  console.log(click)
  indCode = click.dataset.code;

  if (indCode == "BBANDS") {
    $("#color2").show();
    $("#indTitle").text("Bollinger Bands");
    var bbandtext = '<p>Bollinger bands are standard deviations above and below a moving average, forming an enclosure. Standard deviation determines how much the price is deviating from its normal expected price. Whenever the price approaches either the upper band or the lower band, it indicates that the price is currently either high or low and should soon be moving back to the average.<\/p>';
    $("#indicator-text").html(bbandtext);

  } else if (indCode == "ATR") {
    $("#indTitle").text("Average True Range ");
    var atr = 'The ATR indicator moves up and down as price moves in an asset become larger or smaller. This is an Indicator that measures volatility. When the market is in a low volatility period it is likely to become high volatility soon. '
    $("#indicator-text").html(atr);

  } else if (indCode == "RSI") {
    $("#indTitle").text("Relative Strength Index ");
    var rsi = 'Relative Strength Index measures the strength of recent price changes. It indicates the momentum of the stock and allows the evaluation if the price is currently overbought or oversold. Closer to 0 signifies undervalued stock, when it is closer to 100 it signifies overvalued stock. Traditionally it is considered overbought at 70 and oversold at 30. Although these values may vary depending on market conditions.';
    $("#indicator-text").html(rsi);
  } else if (indCode == "ROC") {
    $("#indTitle").text("Rate of Change");
    var roc = 'The ROC indicator is plotted against zero, with the indicator moving upwards into positive territory if price changes are to the upside, and moving into negative territory if price changes are to the downside.\n '
    $("#indicator-text").html(roc);

  } else if (indCode == "MOM") {
    $("#indTitle").text("Momentum");
    var mom = 'When the price crosses above or below the 0 line, it can represent a buy or sell signal respectively. If the price crosses above the 0 line, the price is starting to gain momentum higher.'
    $("#indicator-text").html(mom);

  } else if (indCode == "SMA") {
    $("#indTitle").text("Simple Moving Average");
    var sma = 'The basic rule for trading with the SMA is that a stock trading above its SMA is in an uptrend, while a stock trading below its SMA is in a downtrend.';
    $("#indicator-text").html(sma);
  } else if (indCode == "EMA") {
    $("#indTitle").text("Exponential Moving Average");
    var ema = 'An exponentially weighted moving average reacts more significantly to recent price changes than a simple moving average';
    $("#indicator-text").html(ema);
  }

  $("#indmodal").modal();
}

function helpTradDialog() {
  $("#tradhelpmodal").modal();
}


var indicatorArr = ["SMA:20:C1-#7ef02b-C2-#000000"];

function addIndicator() {
  //validation
  remError()
  if (checkModal()) {
    var indInputs = [];
    indColor = $("#indColor").val();
    indColor2 = "#000000";
    if (indCode == "BBANDS") {
      indColor2 = $("#indColor2").val();
    }
    indInputs.push($("#indPeriod").val());
    var name = indCode + ":";
    //combine all inputs
    for (var i = 0; i < indInputs.length; i++) {
      if (i == indInputs.length - 1) {
        name = name + indInputs[i];
      } else {
        name = name + indInputs[i] + ".";
      }
    }
    //create link between button and indicator string
    var nrmlname = indCode + " " + indInputs[0]
    var indicatortext = name + ":" + "C1-" + indColor + "-C2-" + indColor2;
    //add button and add to indicator list
    if (!indicatorsbtnlist.has(nrmlname)) {
      indicatorArr.push(indicatortext);
      indicatorsbtnlist.addindButton(nrmlname, indColor, false);
    }
  }
}

function stringifyIndicators() {
  //convert indicator list into a long comma seperated string
  var indicators = "";
  indicatorArr.forEach(indcString => {
    if (indicators == "") {
      indicators = indcString
    } else {
      indicators = indicators + "," + indcString;
    }
  })
  return indicators;
}

var indicatorsbtnlist = new Vue({
  delimiters: ['[[', ']]'],
  el: '#indicatorList',
  data: {
    indicators: [],
  },
  methods: {
    addindButton: function (indicatorname, indColor, added) {
      var color = indColor;
      var textcolor = chooseTextColor(color);
      this.indicators.push({
        name: indicatorname,
        color: hexToRGB(color),
        textcolor: textcolor,
        added: added,
      });
    },
    has: function (name) {
      this.indicators.forEach(ind => {
        if (name.localeCompare(ind.name)) {
          return true;
        }
      })
      return false;
    },
    removeIndicator: function (obj) {
      var id = this.indicators.indexOf(obj);
      var name = obj.name
      var code = name.split(" ")[0]
      if(code == "candleSticks"){
        removeCandleSticks();
      }
      if (obj.added) {

        if (mainindicators.includes(code)) {
          var elementid = "graphDIV";
          if (code == "BBANDS") {
            deleteTrace(document.getElementById(elementid), name + " U");
            deleteTrace(document.getElementById(elementid), name + " L");

          } else {
            deleteTrace(document.getElementById(elementid), name);
          }
        } else if (secindicators.includes(code)) {
          var elementid = "secondGraphDIV";
          deleteTrace(document.getElementById(elementid), name);
          if (document.getElementById(elementid).data.length <= 0) {
            hideSecondary();
          }
        }
      }
      removeIndicatorARR(name);
      this.indicators.splice(id, 1);
    },
    clear: function () {
      this.indicators = [];
    }
  }
});

function removeIndicatorARR(name) {
  console.log(name)
  indicatorArr.forEach((indc, idx) => {
    if (indc.startsWith(name.replace(" ", ":"))) {
      return indicatorArr.splice(idx, 1);
    }
  })
}

function deleteTrace(element, name) {
  element.data.forEach((trace, idx) => {
    if (trace.name == name) {
      console.log(trace)
      return Plotly.deleteTraces(element, idx);
    }
  })
}

function hexToRGB(bgColor) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16);
  var g = parseInt(color.substring(2, 4), 16);
  var b = parseInt(color.substring(4, 6), 16);

  return "rgb(" + +r + "," + +g + "," + +b + ")";
}

function chooseTextColor(bgColor) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16);
  var g = parseInt(color.substring(2, 4), 16);
  var b = parseInt(color.substring(4, 6), 16);
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150) ?
    'black' : 'white';
}