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

/* Strategy Frame Definition */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "strategyframe",
        "message0": "Strategy Frame %1",
        "args0": [
            {
                "type": "input_statement",
                "name": "StrategyFrame"
            }
        ],
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    }
]);
   

/* Buy Rule Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "buyrule",
        "message0": "Buy Rule",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* Sell Rule Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "sellrule",
        "message0": "Sell Rule",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 0,
        "tooltip": "",
        "helpUrl": ""
    }
]);

/* End Strategy Block */
Blockly.defineBlocksWithJsonArray([
    {
        "type": "end",
        "message0": "END Strategy",
        "previousStatement": null,
        "colour": 180,
        "tooltip": "",
        "helpUrl": ""
    }
]);



strategy1Button = document.getElementById('Strategy1');
strategy1Button.addEventListener('click', function () { load(strategy1Button); });

strategy2Button = document.getElementById('Strategy2');
strategy2Button.addEventListener('click', function () { load(strategy2Button); });

strategy3Button = document.getElementById('Strategy3');
strategy3Button.addEventListener('click', function () { load(strategy3Button); });

strategy4Button = document.getElementById('Strategy4');
strategy4Button.addEventListener('click', function () { load(strategy4Button); });

strategy5Button = document.getElementById('Strategy5');
strategy5Button.addEventListener('click', function () { load(strategy5Button); });


buttonArray = [strategy1Button, strategy2Button, strategy3Button, strategy4Button, strategy5Button];

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