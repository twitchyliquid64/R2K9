


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



  // ========= BUILTIN-FUNCTION: rectangle(...) =========
  funcs.rectangle = function(outputContext, unordered, ordered){
    var name = getName(ordered, outputContext, "rectangle");
    var width = getVariantValueOrUndefined(ordered.width);
    var height = getVariantValueOrUndefined(ordered.height);
    var topLeft = getVariantValueOrUndefined(ordered.topLeft);
    var topRight = getVariantValueOrUndefined(ordered.topRight);
    var bottomLeft = getVariantValueOrUndefined(ordered.bottomLeft);
    var bottomRight = getVariantValueOrUndefined(ordered.bottomRight);

    if(width == undefined || height == undefined){
      err = {t: "PARAM_ERROR", o: "width/height missing or invalid in call to rectangle()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      width = 10;
      height = 10;
    }
    if(topLeft == undefined && topRight == undefined && bottomLeft == undefined && bottomRight == undefined) {
      err = {t: "PARAM_ERROR", o: "topLeft/topRight/bottomLeft/bottomRight missing or invalid in call to rectangle()"};
      outputContext.errors[outputContext.errors.length] = err;
      console.error(err.t, err.o);
      topLeft = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
    }

    //now calculate all the values, depending on what was given
    if (topRight != undefined){
      topLeft = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topRight.x.value - width), y: topRight.y}).value;
    }
    else if (bottomLeft != undefined){
      topLeft = funcs.point(outputContext, [], {x: bottomLeft.x, y: newVariant(VAR_NUMBER, bottomLeft.y.value - height)}).value;
    }
    else if (bottomRight != undefined){
      topLeft = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, bottomRight.x.value - width), y: newVariant(VAR_NUMBER, bottomRight.y.value - height)}).value;
    }
    topRight = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: topLeft.y}).value;
    bottomLeft = funcs.point(outputContext, [], {x: topLeft.x, y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;
    bottomRight = funcs.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;

    var path = constructClosedPolylinePath(name, [{x: topLeft.x.value, y: topLeft.y.value},
                                                  {x: topRight.x.value, y: topRight.y.value},
                                                  {x: bottomRight.x.value, y: bottomRight.y.value},
                                                  {x: bottomLeft.x.value, y: bottomLeft.y.value},]);
    outputContext.addPath(name, path);
    return newVariant(VAR_OBJECT, {
      name: newVariant(VAR_STRING, name),
      width: newVariant(VAR_NUMBER, width),
      height: newVariant(VAR_NUMBER, height),
      topLeft: newVariant(VAR_OBJECT, topLeft),
      topRight: newVariant(VAR_OBJECT, topRight),
      bottomLeft: newVariant(VAR_OBJECT, bottomLeft),
      bottomRight: newVariant(VAR_OBJECT, bottomRight)
    });
  }

  return funcs;
}

function constructClosedPolylinePath(name, vertexList){
  var ret = [];
  var lastCoords = vertexList[0];
  for (var i = 1; i < vertexList.length; i++) {
    ret[i-1] = {'type': 'line', startx: lastCoords.x, starty: lastCoords.y, endx: vertexList[i].x, endy: vertexList[i].y}
    lastCoords = vertexList[i];
  }
  ret[ret.length] = {'type': 'line', startx: vertexList[vertexList.length-1].x, starty: vertexList[vertexList.length-1].y, endx: vertexList[0].x, endy: vertexList[0].y}
  return ret;
}

function getVariantValueOrUndefined(variant){
  if (variant == undefined){
    return undefined
  }
  return variant.value;
}

function getName(variant, outputContext, prefix){
  if (variant.name == undefined){
    return prefix + "_" + String(outputContext.newID());
  }
  return String(variant.name.value);
}

var ddlDocumentationObjects = {};
defaultFunctionHandlers(); //call it to populate the documentation cache
