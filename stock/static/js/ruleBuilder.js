$(function () {
    $(".stratld").addClass("load");
    $('.number').on('input propertychange', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    $('.nav-tabs a').click(function () {
        $(this).tab('show');
    });
    $("#stratBuilder").click(function () {
        allRules.getRules();
    });
    getAccount();
    $(window).on('resize', function(e) {
        fixGraph()
      });
    
});

function fixGraph(){
    updateGraphSize("ind");
    updateGraphSize("ove");
}
function getAccount() {
    axios.post(ruleURL, {
        params: {},
        headers: {
            "X-CSRFToken": CSRF_TOKEN
        }
    }).then(response => {
        if (response.data.error == 0) {
            buyRules.items = response.data.buyrules
            sellRules.items = response.data.sellrules
            strategies.items = response.data.strategy
        } else {

            var br = '                <div class=\"rule-style mt-2\">\n                        <input class=\"rule-start\" id=\"rulename\" placeholder=\"Enter rule name...\">\n                    <\/div>\n                    \n                <div data-code=\"SMA\" data-drop=\".indicator\" class=\"rule-block indicator drag-dropped\" style=\"opacity: 1; position: relative;\" data-x=\"663\" data-y=\"63\">\n                            Simple Moving Average\n                            <div id=\"extra\">\n                                <a class=\"\">Period: <\/a><input data-value=\"true\" type=\"number\" value=\"14\" class=\"number frm-text\">\n                            <\/div>\n                        <\/div><div data-code=\"CROSS\" data-drop=\".comparison\" class=\"rule-block comparison drag-dropped\" style=\"opacity: 1; position: relative;\" data-x=\"914\" data-y=\"-200\">\n                                Crosses\n                                <div id=\"extra\">\n                                    From:\n                                    <select data-value=\"true\" class=\"frm-text\" id=\"from\">\n                                        <option selected=\"\" value=\"A\">Above<\/option>\n                                        <option value=\"B\">Below<\/option>\n                                    <\/select>\n                                <\/div>\n                            <\/div><div data-code=\"STOCK\" data-drop=\".indicator\" class=\"rule-block indicator special-rule drag-dropped\" style=\"opacity: 1; position: relative;\" data-x=\"676\" data-y=\"-73\">\n                            Stock Data\n                            <div id=\"extra\">\n                                Type:\n                                <select data-value=\"true\" class=\"frm-text\" id=\"Band\">\n                                    <option selected=\"\" value=\"C\">Close<\/option>\n                                    <option value=\"O\">Open<\/option>\n                                    <option value=\"H\">High<\/option>\n                                    <option value=\"L\">Low<\/option>\n                                    <option value=\"V\">Volume<\/option>\n                                <\/select>\n                            <\/div>\n                        <\/div><div data-code=\"BUY\" data-drop=\".final\" data=\"\" class=\"buy rule-block connector final drag-dropped\" style=\"opacity: 1; position: relative;\" data-x=\"907\" data-y=\"-268\">\n                                BUY\n                                <div id=\"extra\">\n                                    Strength: <input data-value=\"true\" type=\"number\" value=\"1\" class=\"number frm-text\">\n                                <\/div>\n                            <\/div>';


            buyRules.items = [{
                name: "SMA 14 CROSS ABOVE STOCK OPEN",
                rule: "INDIC:SMA:14,CROSS:A,INDIC:STOCK:O,BUY:1",
                html: br
            }]

            var sr = '<div class="rule-style mt-2"><input class="rule-start" id="rulename" placeholder="Enter rule name..."> </div><div data-code="SMA" data-drop=".indicator" class="rule-block indicator drag-dropped" style="opacity: 1; position: relative;" data-x="779" data-y="67">' +
                '                            Simple Moving Average' +
                '                            <div id="extra">' +
                '                                <a class="">Period: </a><input data-value="true" type="number" value="14" class="number frm-text">' +
                '                            </div>' +
                '                        </div><div data-code="CROSS" data-drop=".comparison" class="rule-block comparison drag-dropped" style="opacity: 1; position: relative;" data-x="934" data-y="-217">' +
                '                                Crosses' +
                '                                <div id="extra">' +
                '                                    From:' +
                '                                    <select data-value="true" class="frm-text" id="from">' +
                '                                        <option selected="" value="A">Above</option>' +
                '                                        <option value="B">Below</option>' +
                '                                    </select>' +
                '                                </div>' +
                '                            </div><div data-code="STOCK" data-drop=".indicator" class="rule-block indicator special-rule drag-dropped" style="opacity: 1; position: relative;" data-x="758" data-y="-84">' +
                '                            Stock Data' +
                '                            <div id="extra">' +
                '                                Type:' +
                '                                <select data-value="true" class="frm-text" id="Band">' +
                '                                    <option selected="" value="C">Close</option>' +
                '                                    <option value="O">Open</option>' +
                '                                    <option value="H">High</option>' +
                '                                    <option value="L">Low</option>' +
                '                                    <option value="V">Volume</option>' +
                '                                </select>' +
                '                            </div>' +
                '                        </div><div data-code="SELL" data-drop=".final" class="sell rule-block connector final drag-dropped" style="opacity: 1; position: relative;" data-x="633" data-y="-318">' +
                '                                SELL' +
                '                                <a id="extra">' +
                '                                    Strength: <input data-value="true" type="number" value="1" class="number frm-text">' +
                '                                </a>' +
                '                            </div>';


            sellRules.items = [{
                name: "SMA 14 CROSS BELOW STOCK OPEN",
                rule: "INDIC:SMA:14,CROSS:B,INDIC:STOCK:O,SELL:1",
                html: sr
            }]

            var strat = '<div class="rule-style mt-2">' +
                '                            <input class="rule-start" id="strategyname" placeholder="Enter strategy name...">' +
                '                        </div>' +
                '                        ' +
                '                    <div data-code="BUYRULE" data-rule="INDIC:SMA:14,CROSS:A,INDIC:STOCK:O,BUY:1" data-drop=".rule" class="btn-sm btn-buy mt-1 rule buyrule rule-dropped mx-auto" style="opacity: 1; position: relative;" data-x="943" data-y="12">' +
                '                                        SMA 14 CROSS ABOVE STOCK OPEN' +
                '                                    </div><div data-code="SELLRULE" data-rule="INDIC:SMA:14,CROSS:B,INDIC:STOCK:O,SELL:1" data-drop=".rule" class="btn-sm btn-sell mt-1 rule sellrule rule-dropped mx-auto" style="opacity: 1; position: relative;" data-x="640" data-y="-19">' +
                '                                        SMA 14 CROSS BELOW STOCK OPEN' +
                '                                    </div><div data-code="STOP" data-drop=".final" class="rule-block rule final drag-dropped" style="opacity: 1; position: relative;" data-x="625" data-y="189">' +
                '                                END STRATEGY' +
                '                            </div>';


            strategies.items = [{
                name: "SMA 14 CROSS STOCK OPEN",
                strategy: "INDIC:SMA:14,CROSS:A,INDIC:STOCK:O,BUY:1!INDIC:SMA:14,CROSS:B,INDIC:STOCK:O,SELL:1!STOP",
                html: strat
            }, ]
        }
    });
}
var allRules = new Vue({
    delimiters: ['[[', ']]'],
    el: '#stratRules',
    data: {
        buyRules: undefined,
        sellRules: undefined,
    },
    methods: {
        getRules: function () {
            this.buyRules = buyRules.items;
            this.sellRules = sellRules.items;
        }
    }
});

var stratList = [];
var inIF = false;
var countIf = 0;
var hasBuy = false;
var hasSell = false;
var dragdropStrat = interact('.strat-drop').dropzone({
    accept: ".rule",
    overlap: 0.3,
    ondropactive: function (event) {
        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target

    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target
        // feedback the possibility of a drop
        draggableElement.classList.add('drag-enter')
    },
    ondragleave: function (event) {
        dropAllowed = false;
        // remove the drop feedback style
        event.target.classList.remove('drop-target')
        event.relatedTarget.classList.remove('drag-enter')
    },
    ondrop: function (event) {
        $("#stratErrorMSG").prop("hidden", true);

        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target
        // remove active dropzone feedback
        event.target.classList.remove('drop-active')
        event.target.classList.remove('drop-target')
        draggableElement.style.transform =
            'translate(' + 0 + 'px, ' + 0 + 'px)'
        if (draggableElement.firstElementChild) {
            draggableElement.firstElementChild.removeAttribute("hidden");
        }
        draggableElement.style.position = "relative"
        draggableElement.style.zIndex = origZ;
        draggableElement.style.opacity = 1;
        draggableElement.style.removeProperty('transform')
        draggableElement.classList.add('drag-dropped')
        draggableElement.classList.remove('rule-drag')
        draggableElement.classList.remove('drag-enter')
        var drop = draggableElement.dataset.drop;
        var code = draggableElement.dataset.code;
        var valid = false;

        if (drop == dragdropStrat.options.drop.accept || drop == ".final") {
            if (drop == ".rule") {
                if (code == "BUYRULE") {
                    hasBuy = true;
                    valid = true;
                } else if (code == "SELLRULE") {
                    hasSell = true;
                    valid = true;
                }
                if (drop == ".rule") {
                    draggableElement.classList.add('rule-dropped')
                    draggableElement.classList.add('mx-auto')

                    draggableElement.classList.remove('drag-dropped')
                }
                if (valid) {
                    dropzoneElement.parentNode.appendChild(draggableElement);
                    stratList.push(draggableElement);
                    //updateScroll(dropzoneElement.parentNode);
                }
            }

            if (drop == ".final") {
                if (stratList.length == 0) {

                    $("#stratErrorMSG").text("Empty Strategy");
                    $("#stratErrorMSG").prop("hidden", false);
                } else if (hasBuy && hasSell) {

                    dropzoneElement.parentNode.appendChild(draggableElement);
                    stratList.push(draggableElement.dataset.code);
                    dropzoneElement.remove();
                    $("#saveStratbtn").prop("disabled", false);
                } else {

                    $("#stratErrorMSG").text("Need atleast 1 buy and 1 sell rule");
                    $("#stratErrorMSG").prop("hidden", false);
                }
            } else if (valid) {
                draggableElement.parentNode.appendChild(dropzoneElement);
            }
        }
    }
});


var stratModal = new Vue({
    delimiters: ['[[', ']]'],
    el: '#stratmodal',
    data: {
        items: undefined,
        selected: undefined,
    },
    methods: {
        getStrats: function () {
            this.items = strategies.items;
        }
    }
});

var strategies = new Vue({
    delimiters: ['[[', ']]'],
    el: '#allStrategies',
    data: {
        items: [],
    },
    methods: {
        remove: function (item, index) {
            if (this.items[index] === item) {
                this.items.splice(index, 1)
            } else {
                let found = this.items.indexOf(item)
                this.items.splice(found, 1)
            }
            sendStrategyRemove(item);
        },
        edit: function (item, index) {
            $("#strat-builder").html(item.html);
            $("#saveStratbtn").prop("disabled", false);

        },

        addItem: function (item) {
            if (!checkExists(this.items, item)) {
                this.items.push(item);
            }
        }
    }
});

function saveStrategy() {
    var msg = $("#stratErrorMSG");
    if (!$("#strategyname").val()) {
        msg.text("Missing Strategy name");
        msg.prop("hidden", false);
        return;
    } else {
        msg.prop("hidden", true);
        var strategyString = "failed parsing";
        try {
            var strategyString = parseStrategy();
        } catch (error) {
            msg.text(error);
            msg.prop("hidden", false);
            return;
        }
        var strat = {
            name: $("#strategyname").val(),
            strategy: strategyString,
            html: $("#strat-builder").html()
        };
        strategies.addItem(strat);
        sendStrategy(strat)
    }
}

function sendStrategy(strategy) {
    if (loggeduser != "Anonymoususer") {
        axios.post(sendStratURL, {
            params: {
                name: strategy.name,
                strategy: strategy.strategy,
                html: strategy.html,
            },
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            }
        })

    }
}

function sendStrategyRemove(strategy) {
    if (loggeduser != "Anonymoususer") {
        axios.post(sendStratRemoveURL, {
            params: {
                name: strategy.name,
                strategy: strategy.strategy,
                html: strategy.html,
            },
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            }
        })

    }
}

function clearStrategyBuilder() {
    $("#strat-builder").replaceWith('<div id="strat-builder" class="rule-builder"> <div class="rule-style mt-2"><input class="rule-start" id="strategyname" placeholder="Enter strategy name..."></div><div class="strat-drop dropzone">DROP:<br> Rules or Logic</div></div>');
    dragdrop.options.drop.accept = ".indicator";
    ruleList = [];
    hasBuy = false;
    hasSell = false;
    $("#saveStratbtn").prop("disabled", true);
    $("#stratErrorMSG").prop("hidden", true);
}

function parseStrategy() {
    var string = "";
    var hasEnd = false;
    $("#strat-builder").children(".rule").each(function (index) {
        var code = this.dataset.code;
        if (code != "STOP") {
            if (this.children[0]) {
                var vari = this.children[0].children;
                for (var i = 0; i < vari.length; i++) {
                    if (vari[i].dataset.value) {
                        string += ":" + vari[i].value;
                    }
                }
            } else if (code == "BUYRULE") {
                hasBuy = true;
                string += this.dataset.rule;
            } else if (code == "SELLRULE") {
                hasSell = true;
                string += this.dataset.rule;
            }
            string += "!";
        } else {
            hasEnd = true;
            string += this.dataset.code;
        }
    });
    if (!hasEnd) {
        throw "Missing End Block";
    } else if (!hasBuy || !hasSell) {
        throw "Missing: " + (hasBuy ? "" : "BUY ") + (hasSell ? "" : "SELL ") + "Rule";
    } else {
        return string;
    }
}
var buyRules = new Vue({
    delimiters: ['[[', ']]'],
    el: '#buyRules',
    data: {
        items: [],
    },
    methods: {
        remove: function (item, index) {
            if (this.items[index] === item) {
                this.items.splice(index, 1)
            } else {
                let found = this.items.indexOf(item)
                this.items.splice(found, 1)
            }
            sendRuleRemove(item, "BUY")
        },
        edit: function (item, index) {
            $("#rule-builder").html(item.html);
            $("#savebtn").prop("disabled", false);

        },
        addItem: function (item) {
            if (!checkExists(this.items, item)) {
                this.items.push(item);
            }
        }
    }
});

function checkExists(array, item) {
    if (array == undefined) {
        return false;
    }
    for (var i = 0; i < array.length; i++) {
        if (array[i].name == item.name && array[i].rule == item.rule) {
            return true;
        }
    }
    return false;
}
var sellRules = new Vue({
    delimiters: ['[[', ']]'],
    el: '#sellRules',
    data: {
        items: [],
    },
    methods: {
        remove: function (item, index) {
            if (this.items[index] === item) {
                this.items.splice(index, 1)
            } else {
                let found = this.items.indexOf(item)
                this.items.splice(found, 1)
            }
            sendRuleRemove(item, "SELL")
        },
        edit: function (item, index) {
            $("#rule-builder").html(item.html);
            $("#savebtn").prop("disabled", 
            false);

        },
        addItem: function (item) {
            if (!checkExists(this.items, item)) {
                this.items.push(item);
            }
        }
    }
});

function sendRuleRemove(item, buyorsell) {
    if (loggeduser != "AnonymousUser") {
        axios.post(sendRuleRemoveURL, {
            params: {
                buyorsell: buyorsell,
                name: item.name,
                rule: item.rule,
                html: item.html,
            },
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            }
        })

    }
}

function updateScroll(element) {
    element.scrollTop = element.scrollHeight;
}

function clearRuleBuilder() {
    $("#rule-builder").replaceWith('<div id="rule-builder" class="rule-builder"><div class="rule-style mt-2"><input class="rule-start" id="rulename" placeholder="Enter rule name..."> </div><div class="rule-drop dropzone">DROP:<br> Indicator</div></div>');
    dragdrop.options.drop.accept = ".indicator";
    ruleList = [];
    $("#savebtn").prop("disabled", true);
    $("#errorMSG").prop("hidden", true);
}


function sendRule(buyorsell, rule) {
    if (loggeduser != "AnonymousUser") {
        axios.post(sendRuleURL, {
            params: {
                buyorsell: buyorsell,
                name: rule.name,
                rule: rule.rule,
                html: rule.html,
            },
            headers: {
                "X-CSRFToken": CSRF_TOKEN
            }
        })

    }
}

function saveRule() {
    //create error msg
    var msg = $("#errorMSG");
    //check if rulename exists
    if (!$("#rulename").val()) {
        msg.text("Missing rule name");
        msg.prop("hidden", false);
        return;
    } else {
        //create rule string
        msg.prop("hidden", true);
        var parsedrule = parseRule();
        var isbuy = parsedrule[0];
        var ruleString = parsedrule[1];
        var rule = {
            name: $("#rulename").val(),
            rule: ruleString,
            html: $("#rule-builder").html()
        };
        //check if buy or sell rule
        if (isbuy) {
            buyRules.addItem(rule);
            sendRule("BUY", rule);
        } else {
            sellRules.addItem(rule);
            sendRule("SELL", rule);
        }
    }
}


function parseRule() {
    var string = "";
    var isbuy = true;
    $("#rule-builder").children().each(function (index) {
        if (index != 0) {
            var type = this.dataset.drop;
            if (type == ".indicator" || type == ".comparison" || type == ".connector") {
                if (type == ".indicator") {
                    string += "INDIC:"
                }
                string += this.dataset.code;
                if (this.children[0]) {
                    string += ":";
                    var ind = this.children[0].children;
                    for (var i = 0; i < ind.length; i++) {
                        if (ind[i].dataset.value) {
                            string += ind[i].value;
                        }
                        if (i != ind.length - 1 && i != 0) {
                            string += "."
                        }
                    }
                }
                string += ","
            } else if (type == ".final") {
                finalcode = this.dataset.code
                strength = this.children[0].children[0].value;
                if(finalcode == "SELL"){
                    isbuy = false;
                }
                string += this.dataset.code + ":" + strength;
            }
        }
    });
    return [isbuy, string];
}
var indicDrop = '<div class="rule-drop">DROP:<br> Indicator</div>';
var finalDrop = '<div class="rule-drop">DROP:<br> Connector</div>';
var connectorDrop = "";
let clone
let parentNode
let origZ
var dropAllowed = false


//draggable-rules
interact('.rule-drag')
    .draggable({
        onmove: dragMoveListener,
        autoScroll: false,
        onstart: function (event) {
            //on starting drag
            dropAllowed = false;
            window.addEventListener('selectstart', disableSelect);
            var target = event.target
            clone = target.cloneNode(true);
            parentNode = target.parentNode;
            origZ = target.style.zIndex;
            target.style.zIndex = 10000;
            target.style.opacity = 0.9;
        },
        onend: function (event) {
            var target = event.target
            parentNode.appendChild(clone);
            //check allowed
            if (!dropAllowed) {
                target.remove()
            }
            //remove text-selection
            var sel = window.getSelection ? window.getSelection() : document.selection;
            if (sel) {
                if (sel.removeAllRanges) {
                    sel.removeAllRanges();
                } else if (sel.empty) {
                    sel.empty();
                }
            }
            window.removeEventListener('selectstart', disableSelect);
        },
    });
function disableSelect(event) {
    event.preventDefault();
}

function dragMoveListener(event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
    // translate the element
    target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)'
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

var ruleList = [];

//drop down check
var dragdrop = interact('.rule-drop').dropzone({
    accept: ".indicator", //what is allowed
    overlap: 0.3, //how much rule has to be on the drop
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget
        // feedback the possibility of a drop
        draggableElement.classList.add('drag-enter')
    },
    ondragleave: function (event) {
        dropAllowed = false;
        // remove the drop feedback style
        event.target.classList.remove('drop-target')
        event.relatedTarget.classList.remove('drag-enter')
    },
    ondrop: function (event) {
        var draggableElement = event.relatedTarget
        var dropzoneElement = event.target
        // remove active dropzone feedback
        event.target.classList.remove('drop-active')
        event.target.classList.remove('drop-target')
        //reset movement
        draggableElement.style.transform =
            'translate(' + 0 + 'px, ' + 0 + 'px)'
        //inputs
        if (draggableElement.firstElementChild) {
            draggableElement.firstElementChild.removeAttribute("hidden");
        }
        //reshape for static element
        draggableElement.style.position = "relative"
        draggableElement.style.zIndex = origZ;
        draggableElement.style.opacity = 1;
        draggableElement.style.removeProperty('transform')
        draggableElement.classList.add('drag-dropped')
        draggableElement.classList.remove('rule-drag')
        draggableElement.classList.remove('drag-enter')
        var drop = draggableElement.dataset.drop;
        //check validity
        if (drop == dragdrop.options.drop.accept || drop == ".final") {
            dropAllowed = true;
            ruleList.push(draggableElement);
            dropzoneElement.parentNode.appendChild(draggableElement);
            if (drop == ".indicator" && ruleList.length > 2 && (".comparison" ==
                     ruleList[ruleList.length - 2].dataset.drop)) {
                dragdrop.options.drop.accept = ".connector";
                dropzoneElement.innerHTML = "DROP:<br> Connector or Final";
            } else if (drop == ".indicator") {
                dragdrop.options.drop.accept = ".comparison";
                dropzoneElement.innerHTML = "DROP:<br> Comparator";
            } else if (drop == ".comparison") {
                dragdrop.options.drop.accept = ".indicator";
                dropzoneElement.innerHTML = "DROP:<br> Indicator";
            } else if (drop == ".connector") {
                dragdrop.options.drop.accept = ".indicator";
                dropzoneElement.innerHTML = "DROP:<br> Indicator";
            }
            if (drop == ".final") {
                dropzoneElement.remove();
                $("#savebtn").prop("disabled", false);
            } else {
                draggableElement.parentNode.appendChild(dropzoneElement);
            }
        }
    },
});

function stratSelector(click) {
    stratModal.getStrats();
    $("#stratmodal").modal();
}

function stockSelector(click) {
    $("#stockmodal").modal();
}

var strategyString = undefined;
var stockSymbol = undefined;

function selectStock(symbol) {
    $("#stockSelect").val(symbol);
    stockSymbol = symbol;
    $("#stockmodal").modal('hide');
}

function selectStrat(item) {
    $("#stratSelect").val(item.id);
    strategyString = item.dataset.strategy;
    $("#stratmodal").modal('hide');
}

function stratGraph(data) {
    var finaltotal = data[data.length - 1].total;
    //overview info
    $("#stratEndingValue").text(finaltotal);
    $("#stratProfit").text((finaltotal - datalist.money).toFixed(2));
    $("#stratGrowth").text((((finaltotal - datalist.money) / datalist.money) * 100).toFixed(2));

    //base graph
    var date = [];
    var Sopen = [];
    var Sopennot0 = [];

    var total = [];
    var value = [];

    //stock steps
    var valuenot0 = [];
    var datevaluenot0 = [];
    var markercolor = [];
    var markersymbol = [];
    var markersize = [];
    var markeroutline = [];

    //annotations
    var money = [];
    var annotate = [];
    var numtrades = 0;

    //create indicatorchart
    var knowncolnames = ["close", "high", "low", "s", "date", "volume", "buysell", "value",
        "stockcount", "money", "total", "profit", "inifTrue", "Diff", "newTransaction", ""
    ]

    var indicatorNamesToAdd = []

    var biggestProfit = Number.MIN_VALUE
    var biggestLoss = Number.MAX_VALUE
    var gaincount = 0;
    var losscount = 0;
    //get attribute list



    if (data.length > 0) {
        Object.keys(data[0]).forEach(string => {
            if (!knowncolnames.includes(string)) {
                //all indicator names
                indicatorNamesToAdd.push(string);
            }
        })
    }
    //grab data

    data.forEach((item, idx) => {
        //create indicator for chart for each
        date.push(item.date);
        Sopen.push(item.open);
        total.push(item.total);
        value.push(item.value);
        money.push(item.money);

        if (item.value != 0) {
            valuenot0.push(item.value);
            Sopennot0.push(item.open);
            datevaluenot0.push(item.date)

            if (item.buysell >= buythreshold && item.newTransaction) {
                havebought = true;
                numtrades++;
                lastboughtstocknum = item.stockcount
                annotate.push("<b>Buying!</b> Stength: " + item.buysell + "<br>Have " + item.stockcount + " valued at: " + item.value + "<br>" + "Single Price: " + item.open + " ");
                markercolor.push("#458B00");
                markeroutline.push("#224500");
                markersymbol.push("cross");
                markersize.push(13);

            } else if (item.buysell <= sellthreshold && item.newTransaction) {
                havebought = false;
                lastboughtstocknum = 0;
                numtrades++;
                annotate.push("<b>Selling!</b> Stength: " + item.buysell + "<br>Sold " + item.stockcount + " for: " + item.value + "<br>" + "Single Price: " + item.open + ((item.profit > 0)? "<br>Profit: " + item.profit: "<br>Loss: " + item.profit));
                if (item.profit > 0) {
                    markersize.push(14);
                    markeroutline.push("#224500");
                    markersymbol.push("triangle-up");
                } else {
                    markersize.push(12);
                    markeroutline.push("#450000");
                    markersymbol.push("triangle-down");
                }
                markercolor.push("#8B000099");

            } else {
                if (item.stockcount != 0) {
                    annotate.push("<b>Holding!</b> Stength: " + item.buysell + "<br>Holding: " + item.stockcount + " valued at: " + item.value + "<br>" + "Single Price: " + item.open);
                    markercolor.push("#FCDD55");
                    markeroutline.push("#C9B044");
                    markersymbol.push("square");
                    markersize.push(10);
                }
            }
        }
        if (item.profit > 0) {
            gaincount++;
            if (item.profit > biggestProfit) {
                biggestProfit = item.profit;
            }
        }
        if (item.profit < 0) {
            losscount++;
            if (item.profit < biggestLoss) {
                biggestLoss = item.profit;
            }
        }
    });
    $("#tradeCount").text(numtrades);
    $("#stratCountGain").text(gaincount);
    $("#stratCountLoss").text(losscount);


    if (biggestProfit != Number.MIN_VALUE) {
        $("#stratHighestGain").text(biggestProfit);
    } else {
        $("#stratHighestGain").text(0);
    }
    if (biggestLoss != Number.MAX_VALUE) {
        $("#stratHighestLoss").text(biggestLoss);
    } else {
        $("#stratHighestLoss").text(0);
    }

    var stockvalue = {
        type: "line",
        mode: 'markers',
        name: 'Stock Activity',
        hoverinfo: 'text',
        x: datevaluenot0,
        y: valuenot0,
        text: annotate,
        marker: {
            color: markercolor,
            size: markersize,
            symbol: markersymbol,
            line: {
                color: markeroutline,
                width: 2
            }
        },
    }

    var total = {
        type: "scatter",
        mode: "lines",
        name: 'Total',
        x: date,
        y: total,
        line: {
            color: '#cc79a7'
        }
    }

    var overvtraces = [total, stockvalue];
    var layout = {
        autosize: true,
        height: 500,
        margin: {
            b: 20,
            t: 20,
            pad: 5
        },
        title: false,
        width: $("#overview").width(),
        yaxis: {
            title: {
                text: 'Value',
            }
        },
        xaxis: {
            rangebreaks: {
                bounds: ["sat", "mon"],
                values: ["2015-12-25", "2016-01-01"]
            }
        }
    };
    try {
        Plotly.react('stratGraph', overvtraces, layout, {
            displaylogo: false
        });
    } catch (e) {
        console.log(e);
    }

    var sopenannotate = {
        type: "line",
        mode: 'markers',
        name: 'Stock Activity',
        hoverinfo: 'text',
        x: datevaluenot0,
        y: Sopennot0,
        text: annotate,
        marker: {
            color: markercolor,
            size: markersize,
            symbol: markersymbol,
            line: {
                color: markeroutline,
                width: 2
            }
        },
    }
    //create indicator graph:
    var indicatorTraces = [sopenannotate]

    indicatorNamesToAdd.forEach(indicatorname => {
        var indicvals = [];
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        data.forEach(item => {
            indicvals.push(item[indicatorname]);
        })

        indicatorTraces.push({
            type: "scatter",
            mode: "lines",
            name: indicatorname,
            x: date,
            y: indicvals,
            line: {
                color: "#" + randomColor + "99"
            }
        })
    })
    var layoutind = {
        autosize: true,
        width: $("#overview").width(),
        height: 500,
        margin: {
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
            rangebreaks: {
                bounds: ["sat", "mon"],
                values: ["2015-12-25", "2016-01-01"]
            }
        }
    };
    try {
        Plotly.react('stratGraphindicators', indicatorTraces, layoutind);
    } catch (e) {
        console.log(e);
    }
}

function updateGraphSize(which) {
    if (which == "ind") {
        var layout = {
            autosize: true,
            width: $("#overview").width(),
            height: 500,
            yaxis: {
                title: {
                    text: 'Value',
                }
            },
            xaxis: {
                rangebreaks: {
                    bounds: ["sat", "mon"],
                    values: ["2015-12-25", "2016-01-01"]
                }
            }
        };
        Plotly.relayout('stratGraphindicators', layout);
    } else {
        var layout = {
            autosize: true,
            width: $("#indicator").width(),
            height: 500,
            yaxis: {
                title: {
                    text: 'Value',
                }
            },
            xaxis: {
                rangebreaks: {
                    bounds: ["sat", "mon"],
                    values: ["2015-12-25", "2016-01-01"]
                }
            }
        };
        Plotly.relayout('stratGraph', layout);
    }
}

var buythreshold = 1;
var sellthreshold = -1;

var datalist = new Vue({
    delimiters: ['[[', ']]'],
    el: '#strategyTester',
    data: {
        data: undefined,
        filter: "Everything",
        money: 0,
    },
    computed: {
        datadisplay: function () {
            if (this.filter == "Everything") {
                return this.data;
            } else if (this.filter == "BuyingSelling") {
                return this.data.filter(function (item) {
                    return ((item.buysell >= buythreshold) || (item.buysell <= sellthreshold)) && item.newTransaction;
                });
            } else if (this.filter == "Buying") {
                return this.data.filter(function (item) {
                    return item.buysell >= buythreshold && item.newTransaction;
                });
            } else if (this.filter == "Selling") {
                return this.data.filter(function (item) {
                    return item.buysell <= sellthreshold && item.newTransaction;
                });
            } else if (this.filter == "Profit") {
                return this.data.filter(function (item) {
                    return item.profit > 0;
                });
            } else if (this.filter == "Loss") {
                return this.data.filter(function (item) {
                    return item.profit < 0;
                });
            }
        },

    },
    methods: {
        testStrategy: function () {
            loadTesting();
            remTestError()
            if (checkSelect()) {
                buythreshold = $("#buyingThreshold").val();
                sellthreshold = ($("#sellingThreshold").val() * -1);
                $("#stratStartValue").text($("#moneyInput").val());
                axios.post(testStratURL, {
                    params: {
                        strategy: strategyString,
                        stock: stockSymbol,
                        money: $("#moneyInput").val(),
                        dataType: $("#timeFrame option:selected").val(),
                        dateFrom: dateFrom,
                        dateTo: dateTo,
                        sellingThreshold: $("#sellingThreshold").val(),
                        buyingThreshold: $("#buyingThreshold").val(),
                    },
                    headers: {
                        "X-CSRFToken": CSRF_TOKEN
                    }
                }).then(response => {
                    if (response.data.error != "0") {
                        if(response.data.error == "3"){
                            unloadTesting();
                            return addTestError("Strategy has no pair of buy and sell points. Try different data, or adjust strategy.");
                        }
                        return addTestError(response.data.table);
                    }
                    var arr = JSON.parse(response.data.table, function (key, value) {
                        if (key == "date") {
                            return new Date(value);
                        } else {
                            return value;
                        }
                    });
                    this.data = arr.slice().reverse();
                    this.money = response.data.money;
                    stratGraph(arr);
                    unloadTesting();

                }).catch(response => {
                    this.items = "fail";
                    unloadTesting();

                })
            }
        },
    }
});

function loadTesting() {
    $(".stratld").addClass("load");
}

function unloadTesting() {
    $(".stratld").removeClass("load");
}

function filterEverything(obj) {
    removeActive(obj);
    datalist.filter = "Everything";
}

function filterBuyingSelling(obj) {
    removeActive(obj);
    datalist.filter = "BuyingSelling";

}

function filterSelling(obj) {
    removeActive(obj);
    datalist.filter = "Selling";
}

function filterBuying(obj) {
    removeActive(obj);
    datalist.filter = "Buying";
}

function filterProfit(obj) {
    removeActive(obj);
    datalist.filter = "Profit";
}

function filterLoss(obj) {
    removeActive(obj);
    datalist.filter = "Loss";
}

function removeActive(obj) {
    $(obj).addClass('btn-black-active').siblings().removeClass('btn-black-active');
}

function addTestError(msg) {
    $("#testerrors").removeClass("hide");
    $('#testerrors').html($('#testerrors').html() + msg + "<br>");
    return false;
}

function remTestError() {
    $('#testerrors').html("");
    $("#testerrors").addClass("hide");
}

function checkSelect() {
    var valid = true;
    var money = ($("#moneyInput").val())
    var bth = ($("#buyingThreshold").val())
    var sth = ($("#sellingThreshold").val())
    var stock = ($("#stockSelect").val())
    var strat = ($("#stratSelect").val())
    if (isNaN(money) || money <= 0) {
        valid = addTestError("Money has to be more than 0 and a number.");
    }
    if (isNaN(bth) || bth <= 0) {
        valid = addTestError("Buying Strength has to be more than 0 and a number.");
    }
    if (isNaN(sth) || sth <= 0) {
        valid = addTestError("Selling Strength has to be more than 0 and a number.");
    }
    if (stock == "" || stock == undefined) {
        valid = addTestError("Stock needs to be selected.");
    }
    if (strat == "" || strat == undefined) {
        valid = addTestError("Strategy needs to be selected.");
    }
    return valid;
}

function ruleHelp() {
    $("#ruleHelpDialog").modal();
}