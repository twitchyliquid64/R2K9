function newTokenObject(tokenType, tokenParam){
	var ret = new Object();
	ret.is = "TOKEN";
	ret.ttype = tokenType;
	ret.param = tokenParam;
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
	return false;
}

function lex(){
	var rawContent = document.getElementById("rawcontent").value;
	var outputTokens = [];

	var mode = MODE_NOT_PARSING;
	for (var i = 0; i < rawContent.length; i++) //loop through each character
	{
		if (!isNaN(parseInt(rawContent[i]))) {	//if its not an invalid number (its a number)
			var buff = "";
			while (!isNaN(parseInt(rawContent[i]))) {
				buff += rawContent[i];
				i++;
			}
			outputTokens[outputTokens.length] = newTokenObject(TOKEN_NUMBER, parseInt(buff));
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
};

function printTokens(outputTokens) {
	for (var i = 0; i < outputTokens.length; i++) {
		console.log(outputTokens[i]);
	}
}
