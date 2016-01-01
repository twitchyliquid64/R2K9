
function dxf_wrapInputWithSectionDeclaration(inp){
  var out = "";
  out += "0\n";
  out += "SECTION\n";
  out += inp;
  out += "0\n";
  out += "ENDSEC\n";
  return out;
}

function genDxfHeader(bounds, options){
  var unit = 4;//4==mm, 1==in, 2==ft, 5==cm, 6==m.

  var out = "";
  out += "2\n";
  out += "HEADER\n";

  out += "9\n"
  out += "$INSUNITS\n";
  out += "70\n";
  out += String(unit) + "\n";
  return dxf_wrapInputWithSectionDeclaration(out);
}

function genDxfEntityForPath(bounds, options, path, pathName){
  var s = '';
  var layer = 0;//default layer

  for(var i = 0; i < path.length; i++) {
    var op = path[i];
    switch (op.type) {

      case 'line':
        s += '0\n';
        s += "LINE\n";
        s += "8\n";
        s += String(layer) + "\n";

        s += "10\n";
        s += String(op.startx) + "\n";
        s += "20\n";
        s += String(op.starty) + "\n";
        s += "11\n";
        s += String(op.endx) + "\n";
        s += "21\n";
        s += String(op.endy) + "\n";
        break;
    }
  }

  return s;
}

function genDxfTrailer(bounds, options) {

  return "0\nEOF";
}

function genDxfEntitiesFromPaths(bounds, options, paths) {
  var out = "";
  out += "2\n";
  out += "ENTITIES\n";

  for (var pathName in paths) {
    if (paths.hasOwnProperty(pathName)) {
      var path = paths[pathName];
      out += genDxfEntityForPath(bounds, options, path, pathName);
    }
  }

  return dxf_wrapInputWithSectionDeclaration(out);
}

(function(){
  ddlRenderTargets['dxf'] = function(execOutputContext, options){
    var bounds = parsePathsForMaxMin(execOutputContext);
    var content_out = genDxfHeader(bounds, options);
    //TODO: Generate layer declaration content (if needed)

    var paths = execOutputContext.paths;
    content_out += genDxfEntitiesFromPaths(bounds, options, paths)

    content_out += genDxfTrailer(bounds, options);
    console.log(content_out);
    return content_out;
  }
})();