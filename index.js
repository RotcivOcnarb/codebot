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

var maxLines = 10;
var stackIndex = 0;
var variablesStack = [];

function generateCode(){
	variablesStack = [{}];
	return baseCode();
}

function baseCode(){
	var codeBase = [
		(code) => declareVariable(),
		(code) => attribute(),
		(code) => pushToArray(),
		(code) => attributeToRandomArray(),
		(code) => logValue(),
	]

	var lines = [
		(code) => {
			var temp = openIf() + "\n"
			var inside = baseCode();
			inside = inside.split("\n").filter((l) => l.length > 0).map((l) => "  " + l).join("\n");
			temp += inside + "\n"; 
			temp += closeStack() + "\n";
			return temp
		}
	]

	lines = lines.concat(codeBase);

	var code = "";

	var min = 2;
	var max = 6;

	var l = Math.floor(Math.random() * (max - min) + min);

	for(var i = 0; i < l || code.length < 1; i ++){
		if(code.split("\n").length > maxLines) break;
		var p = rand_array(lines)(code);
		if(p){
			code += p + "\n";
		}
	}
	
	return code;
}

//[OK]
function declareVariable(){
	var declares = [
		"let",
		"const",
		"var"
	];
	
	var variableName = rand_array(variableNames);
	while(getCurrentVariablesList()[variableName]){ //Prevents duplicate variables
		variableName = rand_array(variableNames);
	}

	var types = [
		"number",
		"string",
		"array",
		"boolean"
	]

	var type = rand_array(types);

	var newlyCreatedVariable = {
		name: variableName,
		type: type
	};

	variablesStack[stackIndex][variableName] = newlyCreatedVariable;

	var output = rand_array(declares) + " " + variableName + " = " + generateLiteral([type]);
	return output
}

//[OK]
function generateLiteral(types){

	var typeMethods = {
		number: [
			() => Math.random() * 10,
			() => Math.floor(Math.random() * 100)
		],
		string: [() => '"' + randomWords({ min: 1, max: 5, join: ' ' }) + '"'],
		array: [() => "[]"],
		boolean: [
			() => "true",
			() => "false",
		]
	}

	var mts = [];

	if(!types){
		mts = mts.concat(typeMethods.number);
		mts = mts.concat(typeMethods.string);
		mts = mts.concat(typeMethods.array);
		mts = mts.concat(typeMethods.boolean);
	}
	else{
		for(var i = 0; i < types.length; i ++){
			mts = mts.concat(typeMethods[types[i]]);
		}
	}
	
	return rand_array(mts)();
}

//[OK]
function generateValue(types){
	var declaredVariables = objectEntries(getCurrentVariablesList(types));

	if(declaredVariables.length > 0){
		if(Math.random() < 0.5) return generateLiteral(types);
		else {
			return rand_array(declaredVariables);
		}
	}
	else return generateLiteral(types);
}

//[OK]
function openIf(){
	stackIndex ++;
	variablesStack[stackIndex] = {};
	return "if(" + generateBooleanExpression()+ "){";
}

//[OK]
function openElseIf(){
	var openif = openIfFromElse(0);
	return "else " + openif;
}

//[OK]
function openElse(){
	stackIndex ++;
	variablesStack[stackIndex] = [];
	return "else {"
}

//[OK]
function closeStack(){
	variablesStack.splice(stackIndex, 1);
	stackIndex --;
	return "}";
}

//[OK]
function openWhile(){
	stackIndex ++;
	variablesStack[stackIndex] = [];
	return "while(" + generateBooleanExpression()+ "){";
}

//[OK]
function openFor(){
	var forvariable = rand_array(variableNames);
	while(objectEntries(getCurrentVariablesList()).includes(forvariable)){
		forvariable = rand_array(variableNames);
	}

	var comparators = [
		">",
		"<",
		">=",
		"<=",
	]

	var fr = "for (var " + 
		forvariable + " = " + Math.floor(Math.random() * 100) + "; " + 
		forvariable + " " + rand_array(comparators) + " " + generateValue(["number"]) + "; " + 
		forvariable + " " + rand_array(["++", "--", "+= " + generateValue(["number"]), "-= " + generateValue(["number"])]) + "){";

	stackIndex ++;
	variablesStack[stackIndex] = [];
	return fr;
}

//[OK]
function attribute(){

	var vars = objectEntries(getCurrentVariablesList());
	if(vars.length == 0) return false;

	var v = rand_array(vars);
	var type = getCurrentVariablesList()[v].type;

	var attr = generateValue([type]);
	while(attr == v) attr = generateValue([type]);
	if(type == "number" && Math.random() > 0.7) attr = generateArithmeticExpression();
	if(type == "boolean" && Math.random() > 0.7) attr = generateBooleanExpression();

	return getRandomVariable([type]) + " = " + attr;
}

//[OK]
function pushToArray(){
	var v = getRandomVariable(["array"]);
	if(!v) return false;

	return v + ".push(" + generateValue() + ")";
}

//[OK]
function attributeToRandomArray(){
	var v = getRandomVariable(["array"]);
	if(!v) return false;

	return v + "[" + generateValue(["number"]) + "] = " + generateValue();
}

//[OK]
function getRandomVariable(types){
	return rand_array(objectEntries(getCurrentVariablesList(types)));
}

//[OK]
function getCurrentVariablesList(types){
	
	if(!types){
		types = ["number", "string", "array", "boolean"]
	}

	var declaredVariables = {};
	for(var i = 0; i <= stackIndex; i++){

		for(var [k, v] of Object.entries(variablesStack[i])){
			if(types.includes(v.type)){
				declaredVariables[v.name] = v;
			}
		}
	}

	return declaredVariables;
}

//[OK]
function generateBooleanExpression(){

	//As vezes nao tem variavel do tipo q precisa
	
	var comps = [
		(c) => { //Opera 2 valores do mesmo tipo
			var types = ["number", "string", "boolean"];
			var type = rand_array(types);
			
			var v1 = getRandomVariable([type]);
			if(objectEntries(getCurrentVariablesList([type])).length == 0){ //Se não tem nenhuma variavel do q eu preciso, usa literal mesmo
				v1 = generateValue([type]);
			}

			var v2 = generateValue([type]);
			while(v1 == v2) v2 = generateValue([type]);
			

			return v1+ " " + c + " " + v2;
		},
		(c) => { //Compara 2 valores numericos
			var v1 = getRandomVariable(["number"]);
			if(objectEntries(getCurrentVariablesList(["number"])).length == 0){ //Se não tem nenhuma variavel do q eu preciso, usa literal mesmo
				v1 = generateValue(["number"]);
			}

			var v2 = generateValue(["number"]);
			while(v1 == v2) v2 = generateValue(["number"]);

			return v1 + " " + c + " " + v2; 
		},
		(c) => { //Compara 2 boolean
			var v1 = getRandomVariable(["boolean"]);
			if(objectEntries(getCurrentVariablesList(["boolean"])).length == 0){ //Se não tem nenhuma variavel do q eu preciso, usa literal mesmo
				v1 = generateValue(["boolean"]);
			}

			var v2 = generateValue(["boolean"]);
			while(v1 == v2) v2 = generateValue(["boolean"]);

			return v1 + " " + c + " " + v2;  
		},
		(c) => { //nega uma boolean
			var v1 = getRandomVariable(["boolean"]);
			if(objectEntries(getCurrentVariablesList(["boolean"])).length == 0){ //Se não tem nenhuma variavel do q eu preciso, usa literal mesmo
				v1 = generateValue(["boolean"]);
			}

			return "!" + v1;
		}
	];

	var comparators = {
		"==": comps[0],
		"===": comps[0],
		"!=": comps[0],
		">": comps[1],
		"<": comps[1],
		">=": comps[1],
		"<=": comps[1],
		"&&": comps[2],
		"||": comps[2],
		"!": comps[3],
		"": (c) => generateValue(["boolean"]),
		".": (c) => "!(" + generateBooleanExpression() + ")"
	}
	
	var op = rand_array(objectEntries(comparators));
	return comparators[op](op);
}

//[OK]
function generateArithmeticExpression(){

	var operators = [
		"+",
		"-",
		"*",
		"/",
		"%"
	]

	var vals = [
		() => generateValue(["number"]),
		() => generateValue(["number"]),
		() => "(" + generateArithmeticExpression() + ")"
	]

	return rand_array(vals)() + " " + rand_array(operators) + " " + rand_array(vals)();
}

//[OK]
function logValue(){

	var possibles = [
		() => generateValue(),
		() => generateArithmeticExpression(),
		() => generateBooleanExpression()
	]

	return "console.log(" + rand_array(possibles)() + ")";
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

function sendToPage(code){
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
}

function objectEntries(obj){
	return Object.entries(obj).map((o) => o[0]);
}

var token = process.env["CODEBOT_ACCESS_TOKEN"];

var code = generateCode();
generateImage(code);
sendToPage(code);

setInterval(() => {
	var code = generateCode();
	generateImage(code);
	sendToPage(code);
}, 1000 * 60 * 60);