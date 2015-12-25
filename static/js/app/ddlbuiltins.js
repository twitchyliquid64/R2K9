
var ddlDocumentationObjects = {};


function defaultFunctionHandlers(){
  var funcs = {};
  funcs.debugparams = function(outputContext, unordered, ordered){
    console.log("PARAM DEBUG:", unordered, ordered);
    return newVariant(VAR_UNDEFINED, undefined);
  }



  // ========= BUILTIN-FUNCTION: obj(<named parameters> ...) =========
  funcs.obj = function(outputContext, unordered, ordered){
    return newVariant(VAR_OBJECT, ordered);
  }
  ddlDocumentationObjects['obj'] = {
    type: 'builtin-function',
    name: 'obj',
    desc: 'This function constructs and returns an object which has its named parameters as keys.',
    example: 'test := obj(n: 10)\nvalue_of_n := test.n'
  }



  // ========= BUILTIN-FUNCTION: point([x, y] OR [x: x, y: y]) =========
  funcs.point = function(outputContext, unordered, ordered){
    ordered.isPoint = newVariant(VAR_NUMBER, 1)
    if (unordered.length == 2){
      ordered.x = unordered[0];
      ordered.y = unordered[1];
    }
    return newVariant(VAR_OBJECT, ordered);
  }
  ddlDocumentationObjects['point'] = {
    type: 'builtin-function',
    name: 'point',
    desc: 'This function constructs and returns an object which has keys \'x\' and \'y\' set. You should pass x, then y as unnamed parameters. You may pass additional NAMED parameters to construct additional keys on the object.',
    example: 'test := point(10, 20)\nvalue_x := test.x'
  }
  return funcs;
}
