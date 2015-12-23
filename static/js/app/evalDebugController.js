(function () {

    angular.module('baseApp')
        .controller('evalDebugController', ['$scope', evalDebugController]);

    function evalDebugController($scope) {
        var self = this;

        self.parseIntoTreeNode = function(node, keyName){
          var out = {'children': []};
          out.nodeName = node.nodeName;

          if (node.nodeName == AST_NUMBER_LIT){
            out.nodeName = String(node.value) +  " (literal)";
          }
          if (node.nodeName == AST_DESCRIPTOR){
            out.nodeName = String(node.value) +  " (function descriptor)";
          }
          if (node.nodeName == AST_STRING_LIT){
            out.nodeName = '\'' + String(node.value) +  "' (literal)";
          }
          if (node.nodeName == AST_KEY_VAL_LIT){
            out.nodeName = String(keyName) +  " (named parameter)";
          }
          if (node.nodeName == AST_ASSIGNMENT){
            out.nodeName = String(node.value) +  " =";
          }
          if (node.nodeName == AST_IDENTIFIER){
            out.nodeName = String(node.value) +  " (variable reference)";
          }

          for(var i = 0; i < node.unnamedChildren.length; i++) {
            out.children[out.children.length] = self.parseIntoTreeNode(node.unnamedChildren[i]);
          }

          for (var key in node.namedChildren) {
            if (node.namedChildren.hasOwnProperty(key)){
              out.children[out.children.length] = self.parseIntoTreeNode(node.namedChildren[key], key);
            }
          }
          return out
        }

        self.parseAstIntoTreeNodes = function(root){
          var out = [];

          for(var i = 0; i < root.unnamedChildren.length; i++) {
            out[out.length] = self.parseIntoTreeNode(root.unnamedChildren[i]);
          }
          $scope.treedata = [{'nodeName': "Root", 'children': out}]
        }

        $scope.execute = function(){
          var toks = lex(document.getElementById("rawcontent_eval").value);
        	var rootNode = ddlParse(toks);
        	self.parseAstIntoTreeNodes(rootNode);
          console.log(rootNode);
          var ctx = newOutputContext();
          rootNode.exec(ctx);
          console.log(ctx);
        };

        $scope.treedata = [];

    }
})();
