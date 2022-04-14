/* TODO: Change toolbox XML ID if necessary. Can export toolbox XML from Workspace Factory. */
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

/* Inject your workspace */ 
var workspace = Blockly.inject(blocklyDiv, options);

/* Load Workspace Blocks from XML to workspace. Remove all code below if no blocks to load */

/* TODO: Change workspace blocks XML ID if necessary. Can export workspace blocks XML from Workspace Factory. */
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