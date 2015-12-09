function newTokenObject(tokenType, tokenParam, keys){
	var ret = new Object();
	ret.is = "TOKEN";
	ret.ttype = tokenType;
	ret.param = tokenParam;
	ret.values = keys;
	return ret;
}

var TOKEN_NUMBER = "NUM";
var TOKEN_IDENTIFIER = "IDENT";
var TOKEN_STRING = "STRING";
var TOKEN_OPENING_PARENTHESIS = "(";
var TOKEN_CLOSING_PARENTHESIS = ")";
var TOKEN_SEPARATOR = ",";
var TOKEN_KEY = "KEY";

var MODE_NOT_PARSING = 0;
var MODE_READING_IDENTIFIER = 1;
var MODE_READING_SLITERAL = 2;
var MODE_READING_NLITERAL = 3;

function isLetter(ch) {
	var code = ch.charCodeAt(0);
	if ( ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122)))
		return true;
	if (code == "-".charCodeAt(0))return true;
	return false;
}

function lex(){
	var rawContent = document.getElementById("rawcontent").value;
	var outputTokens = [];

	var mode = MODE_NOT_PARSING;
	for (var i = 0; i < rawContent.length; i++) //loop through each character
	{
		if (!isNaN(parseFloat(rawContent[i]))) {	//if its not an invalid number (its a number)
			var buff = "";
			var isFloat = false;
			while (!isNaN(parseFloat(rawContent[i]))) {
				buff += rawContent[i];
				i++;
			}
			if (rawContent[i] == ".") {
				isFloat = true;
				buff += rawContent[i];
				i++;
				while (!isNaN(parseFloat(rawContent[i]))) {
					buff += rawContent[i];
					i++;
				}
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_NUMBER, parseFloat(buff), {'isFloat': isFloat});
			i--;
		} else if (isLetter(rawContent[i])) {	//if it is a letter
			var buff = "";
			while (isLetter(rawContent[i])) {
				buff += rawContent[i];
				i++;
			}
			while(rawContent[i]==" ")i++; //advance whitespace
			if (rawContent[i] == ":"){
				outputTokens[outputTokens.length] = newTokenObject(TOKEN_KEY, buff);
				i++;
			} else {
				outputTokens[outputTokens.length] = newTokenObject(TOKEN_IDENTIFIER, buff);
			}
			i--;
		} else if ((rawContent[i] == '"') || (rawContent[i] == "'")) {
			i++;
			var buff = "";
			while ((rawContent[i] != '"') && (rawContent[i] != "'")) {
				buff += rawContent[i];
				i++;
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_STRING, buff);
		} else if (rawContent[i] == TOKEN_OPENING_PARENTHESIS) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_OPENING_PARENTHESIS, "(");
		} else if (rawContent[i] == TOKEN_CLOSING_PARENTHESIS) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_CLOSING_PARENTHESIS, ")");
		} else if (rawContent[i] == TOKEN_SEPARATOR) {
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_SEPARATOR, ",");
		}
	}

	printTokens(outputTokens);
	return outputTokens;
};

function printTokens(outputTokens) {
	for (var i = 0; i < outputTokens.length; i++) {
		console.log(outputTokens[i]);
	}
}





var AST_ROOT = "ROOT";
var AST_DESCRIPTOR = "DESC"; //function call / object
var AST_NUMBER_LIT = "NUMBER";
var AST_STRING_LIT = "STRING";
var AST_IDENTIFIER = "IDENTIFIER";
var AST_KEY_VAL_LIT = "KEY_VAL";


function newNode(name){
	var ret = new Object();
	ret.namedChildren = {};
	ret.unnamedChildren = [];
	ret.nodeName = name;
	ret.add = function(name, node){
		if (node == null)return;
		if(name == null){
			ret.unnamedChildren[ret.unnamedChildren.length] = node;
		} else {
			ret.namedChildren[name] = node;
		}
	}
	return ret;
}

function run(){
	var toks = lex();
	console.log(recursiveParse(toks, 0).obj);
}


function recursiveParse( tokenSet, tokenPosition) {
	for (var i = tokenPosition; i < tokenSet.length; i++) {

		if (tokenSet[i].ttype == TOKEN_IDENTIFIER) {
			if( ((i+1) < tokenSet.length) && (tokenSet[i+1].ttype == TOKEN_OPENING_PARENTHESIS)) {//new descriptor
				var descriptor_name = tokenSet[i].param;
				var retNode = newNode(AST_DESCRIPTOR);
				i += 2;
				while ((i < tokenSet.length) && (tokenSet[i].ttype != TOKEN_CLOSING_PARENTHESIS)){//call recursive_parse until we hit closing parenthesis
					var r = recursiveParse(tokenSet, i);
					i = r.pos + 1;
					retNode.add(r.nodeName, r.obj);
				}
				retNode.value = descriptor_name;
				return {obj: retNode, pos: i, nodeName: null};
			} else { //not a function call, must be a literal
				var retNode = newNode(AST_IDENTIFIER);
				retNode.value = tokenSet[i].param;
				return {obj: retNode, pos: i, nodeName: null};
			}
		}

		else if (tokenSet[i].ttype == TOKEN_NUMBER) {
			var retNode = newNode(AST_NUMBER_LIT);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i, nodeName: null};
		}

		else if (tokenSet[i].ttype == TOKEN_STRING) {
			var retNode = newNode(AST_STRING_LIT);
			retNode.value = tokenSet[i].param;
			return {obj: retNode, pos: i, nodeName: null};
		}

		else if (tokenSet[i].ttype == TOKEN_KEY) {
			var retNode = newNode(AST_KEY_VAL_LIT);
			var keyName = tokenSet[i].param;
			i += 1;
			var r = recursiveParse(tokenSet, i); //call recursive parse to parse the value
			i = r.pos;
			retNode.add(r.nodeName, r.obj);
			return {obj: retNode, pos: i, nodeName: keyName};
		}

		else if (tokenSet[i].ttype == TOKEN_SEPARATOR) {
			return {obj: null, pos: i, nodeName: null};
		}

	}
}
