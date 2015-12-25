(function () {

    angular.module('baseApp')
        .controller('evalDebugController', ['$scope', evalDebugController]);

    function evalDebugController($scope) {
        var self = this;

        self.readVariantIntoTreeNode = function(variant, name){
          if (variant.type == VAR_NUMBER){
            return {'children': [], 'n': name + " = " + variant.value + " (number)"};
          }
          if (variant.type == VAR_STRING){
            return {'children': [], 'n': name + " = " + variant.value + " (string)"};
          }
          if (variant.type == VAR_OBJECT){
            var c = [];
            for (var key in variant.value) {
              if (variant.value.hasOwnProperty(key)){
                c[c.length] = self.readVariantIntoTreeNode(variant.value[key], key);
              }
            }
            return {'collapsed': true, 'children': c, 'n': name + " (object)"};
          }
          if (variant.type == VAR_UNDEFINED){
            return {'children': [], 'n': name + " = UNDEFINED"};
          }
        }


        self.genGlobalsList = function(globals){
          var out = [];

          for (var key in globals) {
            if (globals.hasOwnProperty(key)){
              out[out.length] = self.readVariantIntoTreeNode(globals[key], key);
            }
          }
          return out;
        }

        self.genErrorsList = function(errors){
          var out = [];
          for(var i = 0; i < errors.length; i++) {
            out[out.length] = {n: errors[i].o, children: []};
          }
          return out;
        }

        $scope.execute = function(){
          var toks = lex(document.getElementById("rawcontent_eval").value);
        	var rootNode = ddlParse(toks);
          console.log(rootNode);
          var ctx = newOutputContext();
          rootNode.exec(ctx);
          console.log(ctx);
          $scope.treedata = [{n: 'Globals', children: self.genGlobalsList(ctx.globalVars)},
                             {n: 'Errors' , children: self.genErrorsList(ctx.errors)}];
          console.log($scope.treedata);
        };

        $scope.treedata = [];
        $scope.errors = [];

    }
})();
