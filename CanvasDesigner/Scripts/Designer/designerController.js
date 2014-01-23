define(['app', 'Elements/scene'], function (app, scene) {
    
    var scenes = [];

    (function init() {
        scenes.push(new scene());
    })();

    app.controller('DesignerController', function ($scope) {
        $scope.addText = function () {
            scenes[0].addText("asdf");
        };
    });
});