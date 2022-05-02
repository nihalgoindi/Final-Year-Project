/* Toolbox definition */
var toolbox = document.getElementById("toolbox");

var options = {
    toolbox: toolbox,
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'https://blockly-demo.appspot.com/static/media/',
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true
};

/* Inject workspace */
var workspace = Blockly.inject(blocklyDiv, options);

var workspaceBlocks = document.getElementById("workspaceBlocks");

/* Load blocks to workspace. */
Blockly.Xml.domToWorkspace(workspaceBlocks, workspace);

/* Block definitions */

/* Rule Frame Definition */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "rule_frame",
        "message0": "Rule Frame %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "Rule_Frame"
            }
        ],
        "colour": 60,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* if_then Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "if_then",
        "message0": "if %1 then %2",
        "args0": [
            {
                "type": "input_value",
                "name": "if"
            },
            {
                "type": "input_statement",
                "name": "then"
            }
        ],
        "previousStatement": "rule_frame",
        "colour": 105,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Comparator Crosses Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "comparator_crosses",
        "message0": "%1 Crosses From: %2 %3 %4",
        "args0": [
            {
                "type": "input_value",
                "name": "NAME",
                "check": [
                    "indicator_with_period",
                    "bollinger_bands",
                    "number",
                    "stock_data"
                ]
            },
            {
                "type": "field_dropdown",
                "name": "Crosses",
                "options": [
                    [
                        "Above",
                        "Above"
                    ],
                    [
                        "Below",
                        "Below"
                    ]
                ]
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_value",
                "name": "NAME",
                "check": [
                    "indicator_with_period",
                    "bollinger_bands",
                    "number",
                    "stock_data"
                ]
            }
        ],
        "output": null,
        "colour": 195,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Comparator E,GT,LT Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "comparator_e_gt_lt",
        "message0": "%1 %2 %3 %4",
        "args0": [
            {
                "type": "input_value",
                "name": "indicator1",
                "check": [
                    "indicator_with_period",
                    "bollinger_bands",
                    "number",
                    "stock_data"
                ],
                "align": "CENTRE"
            },
            {
                "type": "field_dropdown",
                "name": "Comparator",
                "options": [
                    [
                        "Equals",
                        "Equals"
                    ],
                    [
                        "Greater Than",
                        "GT"
                    ],
                    [
                        "Less Than",
                        "LT"
                    ]
                ]
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_value",
                "name": "indicator2",
                "check": [
                    "indicator_with_period",
                    "bollinger_bands",
                    "number",
                    "stock_data"
                ],
                "align": "CENTRE"
            }
        ],
        "inputsInline": true,
        "output": null,
        "colour": 195,
        "tooltip": "",
        "helpUrl": ""
    }
]);


/* Indicator with Period Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "indicator_with_period",
        "message0": "Indicator: %1 Period: %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "NAME",
                "options": [
                    [
                        "Simple Moving Average",
                        "SMA"
                    ],
                    [
                        "Exponential Moving Average",
                        "EMA"
                    ],
                    [
                        "Momentum",
                        "M"
                    ],
                    [
                        "Rate of Change",
                        "ROC"
                    ],
                    [
                        "Relative Strength Index",
                        "RSI"
                    ],
                    [
                        "Average True Range",
                        "ATR"
                    ]
                ]
            },
            {
                "type": "field_number",
                "name": "Period",
                "value": 0,
                "min": 0,
                "max": 500
            }
        ],
        "inputsInline": true,
        "output": null,
        "colour": 270,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Bollinger Band Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "bollinger_bands",
        "message0": "Bollinger Bands    Period: %1 Band:  %2",
        "args0": [
            {
                "type": "field_number",
                "name": "Period",
                "value": 0,
                "min": 0,
                "max": 500
            },
            {
                "type": "field_dropdown",
                "name": "Band",
                "options": [
                    [
                        "Upper",
                        "Upper"
                    ],
                    [
                        "Lower",
                        "Lower"
                    ]
                ]
            }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Stock Data Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "stock_data",
        "message0": "Stock Data   Type: %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "type",
                "options": [
                    [
                        "Close",
                        "Close"
                    ],
                    [
                        "Open",
                        "Open"
                    ],
                    [
                        "High",
                        "High"
                    ],
                    [
                        "Low",
                        "Low"
                    ],
                    [
                        "Volume",
                        "Volume"
                    ]
                ]
            }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Number  Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "number",
        "message0": "Number:  %1",
        "args0": [
            {
                "type": "field_number",
                "name": "Number",
                "value": 0,
                "min": 0,
                "max": 500
            }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/*Connector Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "connector",
        "message0": "%1 %2 %3 %4",
        "args0": [
            {
                "type": "input_value",
                "name": "comparator1",
                "check": [
                    "comparator_e_gt_lt",
                    "comparator_crosses"
                ]
            },
            {
                "type": "field_dropdown",
                "name": "Connector",
                "options": [
                    [
                        "AND",
                        "and"
                    ],
                    [
                        "OR",
                        "or"
                    ]
                ]
            },
            {
                "type": "input_dummy"
            },
            {
                "type": "input_value",
                "name": "comparator2",
                "check": [
                    "comparator_e_gt_lt",
                    "comparator_crosses"
                ]
            }
        ],
        "inputsInline": false,
        "output": null,
        "colour": 225,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Sell Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "final_sell",
        "message0": "SELL",
        "previousStatement": "if_do",
        "colour": 0,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/*Buy Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "final_buy",
        "message0": "BUY",
        "previousStatement": "if_do",
        "colour": 120,
        "tooltip": "",
        "helpUrl": ""
    }
]);

rule1Button = document.getElementById('Rule1');
rule1Button.addEventListener('click', function () { load(rule1Button); });

rule2Button = document.getElementById('Rule2');
rule2Button.addEventListener('click', function () { load(rule2Button); });

rule3Button = document.getElementById('Rule3');
rule3Button.addEventListener('click', function () { load(rule3Button); });

rule4Button = document.getElementById('Rule4');
rule4Button.addEventListener('click', function () { load(rule4Button); });

rule5Button = document.getElementById('Rule5');
rule5Button.addEventListener('click', function () { load(rule5Button); });

rule6Button = document.getElementById('Rule6');
rule6Button.addEventListener('click', function () { load(rule6Button); });

rule7Button = document.getElementById('Rule7');
rule7Button.addEventListener('click', function () { load(rule7Button); });

rule8Button = document.getElementById('Rule8');
rule8Button.addEventListener('click', function () { load(rule8Button); });

rule9Button = document.getElementById('Rule9');
rule9Button.addEventListener('click', function () { load(rule9Button); });

rule10Button = document.getElementById('Rule10');
rule10Button.addEventListener('click', function () { load(rule10Button); });

buttonArray = [rule1Button, rule2Button, rule3Button, rule4Button, rule5Button, rule6Button, rule7Button,
    rule8Button, rule9Button, rule10Button];

saveButton = document.getElementById('save');
saveButton.addEventListener('click', function () { save(); });

clearButton = document.getElementById('clear');
clearButton.addEventListener('click', function () { clear(); });

clearAllButton = document.getElementById('ClearAll');
clearAllButton.addEventListener('click', function () { clearAll(); });

function save() {
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    var availableSpace;
    for (let i = 0; i < buttonArray.length; i++) {
        if (buttonArray[i].hasAttribute("disabled")) {
            availableSpace = buttonArray[i];
            availableSpace.removeAttribute("disabled");
            availableSpace.setAttribute("class", "btn btn-success");
            localStorage.setItem(availableSpace.id, xmlText);
            break;
        }
    }  
}

function load(button) {
    var xmlText = localStorage.getItem(button.id);
    if (xmlText) {
        Blockly.mainWorkspace.clear();
        xmlDom = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
        button.setAttribute("disabled", "disabled");
        button.setAttribute("class", "btn btn-danger");
        localStorage.removeItem(button.id);
    }
}

function clear() {
    Blockly.mainWorkspace.clear();
}

function clearAll() {
    for (let i = 0; i < buttonArray.length; i++) {
        if (!(buttonArray[i].hasAttribute("disabled"))) {
            buttonArray[i].setAttribute("disabled", "disabled");
            buttonArray[i].setAttribute("class", "btn btn-danger");
            localStorage.removeItem(buttonArray[i].id);
        }
    }
}