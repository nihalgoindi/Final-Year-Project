/* Toolbox definition */
var toolbox = document.getElementById("toolbox");

var options = { 
	toolbox : toolbox, 
	collapse : true, 
	comments : true, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : true, 
	horizontalLayout : false, 
	toolboxPosition : 'start', 
	css : true, 
	media : 'https://blockly-demo.appspot.com/static/media/', 
	rtl : false, 
	scrollbars : true, 
	sounds : true, 
	oneBasedIndex : true
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
		"message0": "Rule Name %1 %2 %3",
		"args0": [
			{
				"type": "field_input",
				"name": "NAME",
				"text": "Enter a rule name..."
			},
			{
				"type": "input_dummy"
			},
			{
				"type": "input_statement",
				"name": "RuleBody"
			}
		],
		"output": null,
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
				"name": "final"
			},
			{
				"type": "input_statement",
				"name": "rule_body"
			}
		],
		"inputsInline": false,
		"previousStatement": null,
		"colour": 120,
		"tooltip": "",
		"helpUrl": ""
	}
]);

/* Comparators Block */
Blockly.defineBlocksWithJsonArray([
	{
		"type": "comparators",
		"message0": "%1 %2 %3 %4",
		"args0": [
			{
				"type": "input_value",
				"name": "Indicator1",
				"check": "indicators"
			},
			{
				"type": "field_dropdown",
				"name": "NAME",
				"options": [
					[
						"Equals",
						"EQ"
					],
					[
						"Greater Than",
						"GT"
					],
					[
						"Less Than",
						"LT"
					],
					[
						"Crosses",
						"CR"
					]
				]
			},
			{
				"type": "input_dummy"
			},
			{
				"type": "input_value",
				"name": "Indicator2",
				"check": "indicators"
			}
		],
		"output": null,
		"colour": 195,
		"tooltip": "",
		"helpUrl": ""
	}
]);

/* Indicator Block */
Blockly.defineBlocksWithJsonArray([
	{
		"type": "indicators",
		"message0": "%1",
		"args0": [
			{
				"type": "field_dropdown",
				"name": "indicator",
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
					],
					[
						"Bollinger Bands",
						"BB"
					],
					[
						"Number",
						"N"
					],
					[
						"Stock Data",
						"SD"
					]
				]
			}
		],
		"inputsInline": true,
		"output": null,
		"colour": 270,
	}
]);

/* Sell Block */
Blockly.defineBlocksWithJsonArray([
	{
		"type": "sell",
		"message0": "SELL",
		"previousStatement": null,
		"colour": 0,
		"tooltip": "",
		"helpUrl": ""
	}	
]);

/*Buy Block */
Blockly.defineBlocksWithJsonArray([
	{
		"type": "buy",
		"message0": "BUY",
		"previousStatement": null,
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
saveButton.addEventListener('click', function(){ save(); });

clearButton = document.getElementById('clear');
clearButton.addEventListener('click', function () { clear(); });

clearAllButton = document.getElementById('ClearAll');
clearAllButton.addEventListener('click', function () { clearAll(); });

function save(){
	var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
	var availableSpace;
	for (let i = 0; i <  buttonArray.length; i++){
		if (buttonArray[i].hasAttribute("disabled")){
			availableSpace = buttonArray[i];
			break;
		}
	}
	availableSpace.removeAttribute("disabled");
	availableSpace.setAttribute("class", "btn btn-success");
	localStorage.setItem(availableSpace.id, xmlText);
}

function load(button){
	var xmlText = localStorage.getItem(button.id);
	if (xmlText) {
		Blockly.mainWorkspace.clear();
		xmlDom = Blockly.Xml.textToDom(xmlText);
		Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDom);
		button.setAttribute("disabled","disabled");
		button.setAttribute("class", "btn btn-danger");
		localStorage.removeItem(button.id);
	}
}

function clear(){
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