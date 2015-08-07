(function () {

    angular.module('baseApp')
        .controller('mainController', ['$mdSidenav', mainController]);

    function mainController($mdSidenav) {
        var self = this;

        self.focus = 'logging';
	self.logMessages = [[0,"System started."]];
	self.startTime = Date.now();

        self.activate = function (element) {
            self.focus = element;
        };

        self.toggle = function () {
            $mdSidenav('left').toggle();
        };

	self.log = function(message) {
		self.logMessages[self.logMessages.length] = [Date.now() - self.startTime, message];
	};
	self.log("Main controller initialised.");
    }
})();
