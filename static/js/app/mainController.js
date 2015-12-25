(function () {

    angular.module('baseApp')
        .controller('mainController', ['$mdSidenav', mainController]);

    function mainController($mdSidenav) {
        var self = this;

        self.focus = 'parse_debug';

        self.activate = function (element) {
            self.focus = element;
        };

        self.toggle = function () {
            $mdSidenav('left').toggle();
        };

    }
})();
