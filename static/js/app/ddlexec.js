function ddlExec(outputContext, node){
  console.log("ddlExec()", node.nodeName);

  switch (node.nodeName) {
    case AST_ROOT:        //root node, need to iterate each of the children nodes and recurse.
      for (var i = 0; i < node.unnamedChildren.length; i++) {
        ddlExec(outputContext, node.unnamedChildren[i]);
      }
      break;

    case AST_NUMBER_LIT:
      return newVariant(VAR_NUMBER, node.value);
      break;

    case AST_STRING_LIT:
      return newVariant(VAR_STRING, node.value);
      break;

    case AST_ASSIGNMENT:
      outputContext.globalVars[node.value] = ddlExec(outputContext, node.unnamedChildren[0]);
      break;

    case AST_DEREF:
      var v = ddlExec(outputContext, node.unnamedChildren[0]);
      if (v.type != VAR_OBJECT) {
        err = {t: "V_DEREF_FAILED", o: "Cannot dot dereference non-object type: " + v.type};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
        return newVariant(VAR_UNDEFINED, undefined);
      }

      var res = v.value;
      if (node.value in res) {
        return res[node.value];
      }

      err = {t: "V_DEREF_FAILED", o: "Could not find attribute: " + node.value + " on type " + v.type};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      return newVariant(VAR_UNDEFINED, undefined);
      break;

    case AST_IDENTIFIER:
      if (node.value in outputContext.globalVars) {
        return outputContext.globalVars[node.value];
      }
      err = {t: "V_NOT_FOUND", o: "Could not find global: " + node.value};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      return newVariant(VAR_UNDEFINED, undefined);
      break;

    case AST_KEY_VAL_LIT: //lightweight wrapper around another value - just recurse.
      return ddlExec(outputContext, node.unnamedChildren[0]);

    case AST_DESCRIPTOR: //function call, evaluate children nodes then find a corresponding handler and execute it.
      var unorderedParamResults = [];
      for (var i = 0; i < node.unnamedChildren.length; i++) {
        unorderedParamResults[unorderedParamResults.length] = ddlExec(outputContext, node.unnamedChildren[i]);
      }
      //now lets evaluate named parameters
      var orderedParamResults = {};
      for (var key in node.namedChildren) {
        if (node.namedChildren.hasOwnProperty(key)){
          orderedParamResults[key] = ddlExec(outputContext, node.namedChildren[key])
        }
      }
      //now we finally have the results of evaluating all parameters, lets find the function to handle this invocation
      //and call it.
      if (node.value in outputContext.functionHandlers){
        return outputContext.functionHandlers[node.value](outputContext, unorderedParamResults, orderedParamResults);
      } else {
        err = {t: "F_NOT_FOUND", o: "Could not find function: " + node.value};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
      }
      break;
  }

  //return undefined
  return newVariant(VAR_UNDEFINED, null);
}


var VAR_STRING = "VSTRING";
var VAR_NUMBER = "VNUM";
var VAR_OBJECT = "VOBJ";
var VAR_UNDEFINED = "VUNDEF";

function newVariant(typ, value){
  var ret = new Object();
  ret.type = typ;
  ret.value = value;
  return ret;
}


function newOutputContext(){
  var ret = new Object();
  ret.globalVars = {};
  ret.functionHandlers = defaultFunctionHandlers();
  ret.errors = [];

  ret.lastIssuedID = 0;
  ret.newID = function(){
    ret.lastIssuedID++;
    return ret.lastIssuedID;
  }
  ret.addPath = function(name, opList){
    if (name in ret.paths){
      for (var i = 0; i < opList.length; i++)
        ret.paths[name][ret.paths[name].length] = opList[i];
    } else {
      ret.paths[name] = opList;
    }
  }

  ret.paths = {};
  return ret
}
