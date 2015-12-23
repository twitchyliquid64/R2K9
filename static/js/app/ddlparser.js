




var AST_ROOT = "ROOT";
var AST_DESCRIPTOR = "DESC"; //function call / object
var AST_NUMBER_LIT = "NUMBER";
var AST_STRING_LIT = "STRING";
var AST_IDENTIFIER = "IDENTIFIER";
var AST_KEY_VAL_LIT = "KEY_VAL";
var AST_ASSIGNMENT = "ASSIGN";


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
	ret.exec = function(outputContext){
		ddlExec(outputContext, this);
	}
	return ret;
}

function run(){
	var toks = lex(document.getElementById("rawcontent").value);
	var rootNode = ddlParse(toks);
	console.log(rootNode);
	rootNode.exec(newOutputContext());
}

function ddlParse(toks) {
	var rootNode = newNode(AST_ROOT);
	var i = 0;
	while (i < toks.length) {
		var n = recursiveParse(toks, i);
		if (n != null && n != undefined) {
			rootNode.add(n.nodeName, n.obj);
			i = n.pos;
		} else {
			i++;
		}
	}
	return rootNode;
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
			} else if( ((i+1) < tokenSet.length) && (tokenSet[i+1].ttype == TOKEN_ASSIGN)) {//assignment
				var descriptor_name = tokenSet[i].param;
				var retNode = newNode(AST_ASSIGNMENT);
				i += 2;

				var r = recursiveParse(tokenSet, i);
				i = r.pos + 1;
				retNode.add(r.nodeName, r.obj);

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
