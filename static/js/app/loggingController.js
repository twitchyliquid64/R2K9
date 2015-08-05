(function () {

    angular.module('baseApp')
        .controller('loggingController', ['$mdSidenav', loggingController]);

    function loggingController($mdSidenav) {
        var self = this;

        self.focus = false;

        self.activate = function () {
			alert('l');
            self.focus = true;
        };

        self.toggle = function () {
            $mdSidenav('left').toggle();
        };

    }
})();
