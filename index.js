var randomWords = require('random-words');
const { createCanvas } = require("canvas");
const fs = require("fs");
const https = require("https");
var FormData = require('form-data');

/*

- Declarar variavel [OK]
- Declarar um array [OK]
- Abrir um if [OK]
- Fechar um if [OK]
	Abrir um else ou um elseif [OK]
- Abrir um for [OK]
	Fechar um for [OK]
- Abrir um while [OK]
	Fechar um while [OK]
- Atribuir um valor pra uma variavel [OK]
- Atribuir uma variavel pra outra variavel [OK]
- dar push de um valor ou variavel num array [OK]
- atribuir um valor do array pra uma variavel [OK]
- setar um valor do array a um valor ou variavel [OK]
- Console log um valor [OK]

=====

gerar uma expressão booleana aleatória
gerar uma expressão aritmética aleatória
gerar um valor aleatório (entre literais e variaveis de escopo definido)

*/

var variableNames = [
	"i",
	"j",
	"k",
	"x",
	"y",
	"banana",
	"temp",
	"aux",
	"count",
	"c",
	"text",
	"date",
	"day",
	"index",
	"idx"
]


var stackIndex = 0;
var variablesStack = [];
var stackType = [];

function generateCode(){

	variablesStack.push([]);
	stackType.push("main");

	var availables = [
		declareVariable,
		openIf,
		openWhile,
		openFor,
		logValue,
		logExpression
	];

	var code = "";

	var min = 1;
	var max = 20;

	var rnd = Math.floor(Math.random() * (max - min) + min);

	for(var i = 0; i < rnd; i ++){
		var avs = availables.concat([]);

		if(stackIndex > 0){
			avs.push(closeStack)
		}

		if(getCurrentVariablesList().length > 0){
			avs = avs.concat([
				attribute,
				pushToArray,
				attributeToRandomArray
			])
		}

		var prevStack = stackType[stackIndex];
		var line = rand_array(avs);

		var line_text = line();
		code += line_text + "\n";

		if(line == closeStack){ 
			if(prevStack == "if" || prevStack == "else if"){ //Se e to fechadno um if ou um else if, tem chance de abrir um else
				if(Math.random() < 0.5){
					avs = availables.concat([openElseIf,openElse ]);

					prevStack = stackType[stackIndex];
					line = rand_array(avs);
					line_text = line();
					code += line_text + "\n";
				}
			}
		}
	}

	var stk = stackIndex;
	for(var i = 0; i < stk; i ++){
		var prevStack = stackType[stackIndex];
		var line = closeStack();
		code += line + "\n";
	}
	
	return code;
}


function declareVariable(){
	var declares = [
		"let",
		"const",
		"var"
	];
	
	var variableName = rand_array(variableNames);
	while(variablesStack[stackIndex].includes(variableName)){ //Prevents duplicate variables
		variableName = rand_array(variableNames);
	}

	variablesStack[stackIndex].push(variableName);

	return identTabs(stackIndex) + rand_array(declares) + " " + variableName + " = " + generateLiteral();
}


function generateLiteral(){
	
	var types = [
		() => Math.random() * 10,
		() => Math.floor(Math.random() * 100),
		() => '"' + randomWords({ min: 1, max: 5, join: ' ' }) + '"',
		() => "[]",
		() => "true",
		() => "false"
	]
	
	return rand_array(types)();
}

function generateValue(){
	var declaredVariables = getCurrentVariablesList();

	if(declaredVariables.length > 0){
		if(Math.random() < 0.5) return generateLiteral();
		else {
			var v =  getRandomVariable();
			if(Math.random() < 0.5) v += "[" + generateValue() + "]";
			return v;
		}
	}
	else return generateLiteral();
}

function openIf(){
	return openIfFromElse(stackIndex);
}

function openIfFromElse(idt){
	stackIndex ++;
	stackType[stackIndex] = "if";
	variablesStack[stackIndex] = [];
	return identTabs(idt) + "if(" + generateBooleanExpression()+ "){";
}

function openElseIf(){
	var openif = openIfFromElse(0);
	stackType[stackIndex] = "else if";
	return identTabs(stackIndex-1) + "else " + openif;
}

function openElse(){
	stackIndex ++;
	stackType[stackIndex] = "else";
	variablesStack[stackIndex] = [];
	return identTabs(stackIndex-1) + "else {"
}

function closeStack(){
	variablesStack.splice(stackIndex, 1);
	stackType.splice(stackIndex, 1);
	stackIndex --;
	return identTabs(stackIndex) + "}";
}

function openWhile(){
	stackIndex ++;
	stackType[stackIndex] = "while";
	variablesStack[stackIndex] = [];
	return identTabs(stackIndex-1) + "while(" + generateBooleanExpression()+ "){";
}

function openFor(){
	var forvariable = rand_array(variableNames);

	var comparators = [
		">",
		"<",
		">=",
		"<=",
	]

	var fr = "for (var " + 
		forvariable + " = " + Math.floor(Math.random() * 100) + "; " + 
		forvariable + " " + rand_array(comparators) + " " + generateValue() + "; " + 
		forvariable + " " + rand_array(["++", "--", "+= " + generateValue(), "-= " + generateValue()]) + "){";

	stackIndex ++;
	stackType[stackIndex] = "while";
	variablesStack[stackIndex] = [];
	return identTabs(stackIndex-1) + fr;
}

function attribute(){
	return identTabs(stackIndex) + getRandomVariable() + " = " + generateArithmeticExpression();
}

function pushToArray(){
	return identTabs(stackIndex) + getRandomVariable() + ".push(" + generateValue() + ")";
}

function attributeToRandomArray(){
	return identTabs(stackIndex) + getRandomVariable() + "[" + generateValue() + "] = " + generateArithmeticExpression();
}

function getRandomVariable(){
	return rand_array(getCurrentVariablesList());
}

function getCurrentVariablesList(){
	var declaredVariables = [];
	for(var i = 0; i <= stackIndex; i++){
		declaredVariables = declaredVariables.concat(variablesStack[i]);
	}
	return declaredVariables;
}

function generateBooleanExpression(){
	var comparators = [
		"==",
		"===",
		">",
		"<",
		">=",
		"<=",
		"!="
	]
	return generateValue() + " " + rand_array(comparators) + " " + generateValue();
}

function generateArithmeticExpression(){

	var operators = [
		"+",
		"-",
		"*",
		"/",
		"%"
	]

	var exp = generateValue();
	var cps = Math.floor(Math.random() * 4) + 1;
	for( var i = 0; i < cps; i ++){
		exp += " " + rand_array(operators) + " " + generateValue();
	}
	return exp;
}

function logValue(){
	return identTabs(stackIndex) + "console.log(" + generateValue() + ")";
}

function logExpression(){
	return identTabs(stackIndex) + "console.log(" + generateArithmeticExpression() + ")";
}

function identTabs(amount){
	var idt = "";
	for(var i = 0; i < amount; i ++) idt += "  ";
	return idt;
}

function rand_array(arr){
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateImage(code){
	//Create aux canvas and get metrics
	const oc = createCanvas(100, 100);
	const ct = oc.getContext("2d");
	ct.font = "30px Lucida Console";
	ct.textAlign = "left";
	var txtWidth = ct.measureText(code).width;
	var txtHeight = 30 * code.split("\n").length;

	console.log("Text width: " + txtWidth + "\nText height: " + txtHeight);

	//Create real canvas using metrics
	const canvas = createCanvas(txtWidth + 20, txtHeight + 20);
	const context = canvas.getContext("2d");

	//Background
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

	//Text
	context.fillStyle = "#00ff00";
	context.font = "30px Lucida Console";
	context.textAlign = "left";
	context.fillText(code, 10, 40);

	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync("./output.png", buffer);

	return buffer;
}

var code = generateCode();
generateImage(code);
console.log(code);
var token = process.env["CODEBOT_ACCESS_TOKEN"];

var messages = [
	"Could this be the next AI?",
	"This is definetely the most optimized code i made",
	"I'm sending that to github",
	"Not one of my best, i admit",
	"How does this even work",
	"Don't ask question, just run it",
	code.split("\n").length + " lines of pure chaos",
	"Does this even compile?",
]

form = new FormData();
form.append("file", fs.createReadStream("./output.png"))
form.append("message", rand_array(messages));


const req = https.request(
	{
		hostname: 'graph.facebook.com',
		path: '/v11.0/668461063578750/photos?access_token=' + token,
		method: 'POST',
		headers: form.getHeaders()
	}, res => {
		res.on('data', d => {
			var obj = JSON.parse(d.toString());
			console.log(JSON.stringify(obj, 2, 2));
		});
	}
);

form.pipe(req);

//req.end();