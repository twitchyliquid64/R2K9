
paraTab = function(outputContext, unordered, ordered){
  var side = getVariantValueOrUndefined(ordered.side);
  var displacement = getVariantValueOrUndefined(ordered.displacement);
  var offset = getVariantValueOrUndefined(ordered.offset);
  var length = getVariantValueOrUndefined(ordered.length);

  if(side == undefined || displacement == undefined || offset == undefined || length == undefined){
    err = {t: "PARAM_ERROR", o: "side/displacement/offset/length missing or invalid in call to paraTab()"};
    outputContext.errors[outputContext.errors.length] = err;
    console.error(err.t, err.o);
    ordered.side = newVariant(VAR_STRING, 'top');
    ordered.length = newVariant(VAR_NUMBER, 2);
    ordered.offset = newVariant(VAR_NUMBER, 2);
    ordered.displacement = newVariant(VAR_NUMBER, 2);
  }

  ordered.isModification = newVariant(VAR_NUMBER, 1);
  ordered.modType = newVariant(VAR_STRING, 'tab');
  return newVariant(VAR_OBJECT, ordered);
};


paraOutline = function(outputContext, unordered, ordered){
  var name = getName(ordered, outputContext, "outline");
  var width = getVariantValueOrUndefined(ordered.width);
  var height = getVariantValueOrUndefined(ordered.height);
  var topLeft = getVariantValueOrUndefined(ordered.topLeft);
  var topRight = getVariantValueOrUndefined(ordered.topRight);
  var bottomLeft = getVariantValueOrUndefined(ordered.bottomLeft);
  var bottomRight = getVariantValueOrUndefined(ordered.bottomRight);

  //minimum parameter validation
  if(width == undefined || height == undefined){
    err = {t: "PARAM_ERROR", o: "width/height missing or invalid in call to parametricOutline()"};
    outputContext.errors[outputContext.errors.length] = err;
    console.error(err.t, err.o);
    width = 10;
    height = 10;
  }
  if(topLeft == undefined && topRight == undefined && bottomLeft == undefined && bottomRight == undefined) {
    err = {t: "PARAM_ERROR", o: "topLeft/topRight/bottomLeft/bottomRight missing or invalid in call to parametricOutline()"};
    outputContext.errors[outputContext.errors.length] = err;
    console.error(err.t, err.o);
    topLeft = {x: newVariant(VAR_NUMBER, 10), y: newVariant(VAR_NUMBER, 10)};
  }

  //now calculate all the values, depending on what was given
  if (topRight != undefined){
    topLeft = outputContext.functionHandlers.point(outputContext, [], {x: newVariant(VAR_NUMBER, topRight.x.value - width), y: topRight.y}).value;
  }
  else if (bottomLeft != undefined){
    topLeft = outputContext.functionHandlers.point(outputContext, [], {x: bottomLeft.x, y: newVariant(VAR_NUMBER, bottomLeft.y.value - height)}).value;
  }
  else if (bottomRight != undefined){
    topLeft = outputContext.functionHandlers.point(outputContext, [], {x: newVariant(VAR_NUMBER, bottomRight.x.value - width), y: newVariant(VAR_NUMBER, bottomRight.y.value - height)}).value;
  }
  topRight = outputContext.functionHandlers.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: topLeft.y}).value;
  bottomLeft = outputContext.functionHandlers.point(outputContext, [], {x: topLeft.x, y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;
  bottomRight = outputContext.functionHandlers.point(outputContext, [], {x: newVariant(VAR_NUMBER, topLeft.x.value + width), y: newVariant(VAR_NUMBER, topLeft.y.value + height)}).value;

  //order the modifications based on the sides
  var modificationSet = genOrderedModificationSet(unordered, width, height);
  console.log(modificationSet);
  var path = [];

  //generate the operations for the top of the outline
  var x = topLeft.x.value;
  var y = topLeft.y.value;
  while (x < (x+width)){
    var mod = modificationSet.top.shift();
    if (mod == undefined){//no remaining modifications, draw a line to the end of the section
      path[path.length] = {'type': 'line', startx: x, starty: y, endx: topRight.x.value, endy: y};
      break;
    }else{
      if((topLeft.x.value+mod.offset) > x){//generate a line up to the modification
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: (topLeft.x.value+mod.offset), endy: y};
        x = topLeft.x.value+mod.offset;
      } else if((topLeft.x.value+mod.offset) == x){
        //dont do anything, line up to the right spot
      } else {
        err = {t: "LOGIC_ERROR", o: "modification passed to parametricOutline() specifies an offset for which a line has already been generated beyond"};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
        return newVariant(VAR_UNDEFINED, undefined);
      }

      //generate the actual modification
      if (mod.mType == 'tab'){
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: y-mod.displacement};
        y -= mod.displacement;
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x+mod.length, endy: y};
        x += mod.length
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: topLeft.y.value};
        y = topLeft.y.value;
      }
    }
  }

  //generate the operations for the right of the outline
  x = topRight.x.value;
  y = topRight.y.value;
  while (y < (y+height)){
    var mod = modificationSet.right.shift();
    if (mod == undefined){//no remaining modifications, draw a line to the end of the section
      path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: bottomRight.y.value};
      break;
    }else{
      if((topRight.y.value+mod.offset) > y){//generate a line up to the modification
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: (topRight.y.value+mod.offset)};
        y = topRight.y.value+mod.offset;
      } else if((topRight.x.value+mod.offset) == x){
        //dont do anything, line up to the right spot
      } else {
        err = {t: "LOGIC_ERROR", o: "modification passed to parametricOutline() specifies an offset for which a line has already been generated beyond"};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
        return newVariant(VAR_UNDEFINED, undefined);
      }

      //generate the actual modification
      if (mod.mType == 'tab'){
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x+mod.displacement, endy: y};
        x += mod.displacement;
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: y+mod.length};
        y += mod.length
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x-mod.displacement, endy: y};
        x = topRight.x.value;
      }
    }
  }

  //generate the operations for the bottom of the outline
  x = bottomLeft.x.value;
  y = bottomLeft.y.value;
  while (x < (x+width)){
    var mod = modificationSet.bottom.shift();
    if (mod == undefined){//no remaining modifications, draw a line to the end of the section
      path[path.length] = {'type': 'line', startx: x, starty: y, endx: bottomRight.x.value, endy: y};
      break;
    }else{
      if((bottomLeft.x.value+mod.offset) > x){//generate a line up to the modification
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: (bottomLeft.x.value+mod.offset), endy: y};
        x = bottomLeft.x.value+mod.offset;
      } else if((bottomLeft.x.value+mod.offset) == x){
        //dont do anything, line up to the right spot
      } else {
        err = {t: "LOGIC_ERROR", o: "modification passed to parametricOutline() specifies an offset for which a line has already been generated beyond"};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
        return newVariant(VAR_UNDEFINED, undefined);
      }

      //generate the actual modification
      if (mod.mType == 'tab'){
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: y+mod.displacement};
        y += mod.displacement;
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x+mod.length, endy: y};
        x += mod.length
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: bottomLeft.y.value};
        y = bottomLeft.y.value;
      }
    }
  }



  //generate the operations for the left of the outline
  x = topLeft.x.value;
  y = topLeft.y.value;
  while (y < (y+height)){
    var mod = modificationSet.left.shift();
    if (mod == undefined){//no remaining modifications, draw a line to the end of the section
      path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: bottomLeft.y.value};
      break;
    }else{
      if((topLeft.y.value+mod.offset) > y){//generate a line up to the modification
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: (topLeft.y.value+mod.offset)};
        y = topLeft.y.value+mod.offset;
      } else if((topLeft.x.value+mod.offset) == x){
        //dont do anything, line up to the right spot
      } else {
        err = {t: "LOGIC_ERROR", o: "modification passed to parametricOutline() specifies an offset for which a line has already been generated beyond"};
        outputContext.errors[outputContext.errors.length] = err;
        console.error(err.t, err.o);
        return newVariant(VAR_UNDEFINED, undefined);
      }

      //generate the actual modification
      if (mod.mType == 'tab'){
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x-mod.displacement, endy: y};
        x -= mod.displacement;
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x, endy: y+mod.length};
        y += mod.length
        path[path.length] = {'type': 'line', startx: x, starty: y, endx: x+mod.displacement, endy: y};
        x = topLeft.x.value;
      }
    }
  }


  outputContext.addPath(name, path);
  return newVariant(VAR_OBJECT, {
    isParametricOutline: newVariant(VAR_NUMBER, 1),
    name: newVariant(VAR_STRING, name),
    width: newVariant(VAR_NUMBER, width),
    height: newVariant(VAR_NUMBER, height),
    topLeft: newVariant(VAR_OBJECT, topLeft),
    topRight: newVariant(VAR_OBJECT, topRight),
    bottomLeft: newVariant(VAR_OBJECT, bottomLeft),
    bottomRight: newVariant(VAR_OBJECT, bottomRight)
  });}



function genOrderedModificationSet(parameters, width, height){
  var top = [];
  var right = [];
  var bottom = []
  var left = [];

  for (var i = 0; i < parameters.length; i++) {
    var mod = parameters[i];

    if (mod.type == VAR_OBJECT && mod.value.isModification != undefined){
      console.log(mod);

      var side = getVariantValueOrUndefined(mod.value.side);
      var displacement = getVariantValueOrUndefined(mod.value.displacement);
      var length = getVariantValueOrUndefined(mod.value.length);
      var offset = getVariantValueOrUndefined(mod.value.offset);
      var mType = getVariantValueOrUndefined(mod.value.modType);
      if (offset < 0) {
        switch (side){
          case 'left':
          case 'right':
            offset = height + offset - length; //(offset is a neg number)
            break;
          case 'top':
          case 'bottom':
            offset = width + offset - length; //(offset is a neg number)
            break;
        }
      }

      switch (side){
        case 'left':
          left[left.length] = {displacement: displacement, length: length, offset: offset, mType: mType};
          break;
        case 'right':
          right[right.length] = {displacement: displacement, length: length, offset: offset, mType: mType};
          break;
        case 'top':
          top[top.length] = {displacement: displacement, length: length, offset: offset, mType: mType};
          break;
        case 'bottom':
          bottom[bottom.length] = {displacement: displacement, length: length, offset: offset, mType: mType};
          break;
      }
    }
  }

  var sortFunc = function(a, b) {
    return a.offset - b.offset;
  }
  top.sort(sortFunc);
  left.sort(sortFunc);
  right.sort(sortFunc);
  bottom.sort(sortFunc);

  return {
    top: top,
    left: left,
    right: right,
    bottom: bottom
  };
}
