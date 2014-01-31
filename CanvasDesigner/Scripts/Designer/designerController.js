define(['app', 'Elements/scene'], function (app, scene) {
    
    var scenes = [];

    app.controller('DesignerController', function ($scope) {

        $scope.mode = 'addText';

        $scope.currentElement = {};

        $scope.addText = function () {

            $scope.mode = 'editText';
            getCurrentScene().addText({
                text: $scope.addTextInput,
                color: '000000',
                rotationUpdate: rotateUpdateFromDesigner,
                sizeUpdate: sizeUpdateFromDesigner,
                fontName: $scope.currentElement.fontName
            });

            $scope.currentElement = mapDesignerPropertiesToController(getCurrentScene().getDesignerProperties());
        };
        
        function getCurrentScene() {
            var result = scenes[0];
            return result;
        }
        

        function adjustRotationForPresentation(rotation) {
            if (rotation > 360) {
                rotation = rotation % 360;
            }

            return rotation;
        }

        function mapDesignerPropertiesToController(designerProperties) {
            var controllerProperties = {
                text: designerProperties.text,
                color: { 'background-color': '#' + designerProperties.color },
                rotation: adjustRotationForPresentation(designerProperties.rotation),
                fontName: designerProperties.fontName,
                size: parseInt(designerProperties.size, 10)
            };

            return controllerProperties;
        }

        $scope.addTextTabClick = function () {
            $scope.addTextInput = '';
            $scope.mode = 'addText';
        };

        $scope.updateText = function() {
            scenes[0].updateText($scope.addTextInput);
        };
        
        $scope.updateTextColor = function(color) {
            $scope.currentElement.color = { 'background-color': color };
            scenes[0].setTextColor(color.replace('#', ''));
        };

        $scope.center = function() {
            scenes[0].center();
        };

        $scope.updateFont = function (fontName, obj, event) {
            var backgroundPosition = $(event.target).css("background-position");
            $(".js-selected-font").css('background-position', backgroundPosition);
            scenes[0].setTextFont(fontName);
        };

        $scope.onSizeBlur = function() {
            var size = parseInt($scope.currentElement.size.toString().replace(/[^\d.]/g, ""), 10);

            if (size < 10 || isNaN(size)) {
                size = 10;
            }
            
            $scope.currentElement.size = size;
            scenes[0].setTextSize(size);
        };

        $scope.onSizeUpdate = function() {
            var size = parseInt($scope.currentElement.size.toString().replace(/[^\d.]/g, ""), 10);

            
            if (size < 10 || isNaN(size)) {
                return;
            }
            
            if (size > 100) {
                size = 100;
            }

            $scope.currentElement.size = size;
            scenes[0].setTextSize(size);
        };

        $scope.onRotationUpdate = function() {
            var rotation = parseInt($scope.currentElement.rotation.toString().replace(/[^\d.]/g, ""), 10);

            rotation = adjustRotationForPresentation(rotation);

            $scope.currentElement.rotation = rotation;
            scenes[0].setRotation(rotation);
        };

        function rotateUpdateFromDesigner(rotation) {
            
            if (rotation < 0) {
                rotation += 360;
            }

            $scope.currentElement.rotation = rotation;
            $scope.$apply();
        };
        
        function unselectFromDesigner() {
            if ($scope.mode == 'editText') {
                $scope.mode = 'addText';
                $scope.addTextInput = '';
                $scope.$apply();
            }
        }
        
        function selectFromDesigner(element) {
            if (element.elementType == 'text') {
                $scope.mode = 'editText';
                $scope.addTextInput = element.text;
                $scope.currentElement = mapDesignerPropertiesToController(getCurrentScene().getDesignerProperties());
                $scope.$apply();
            }
        }
        
        function sizeUpdateFromDesigner(size) {
            $scope.currentElement.size = Math.floor(size);
            $scope.$apply();
        };

        $scope.changeFont = function(obj, event) {
            //$(event.target).popover({
            //    html: true,
            //    content: function () {
            //        return $('#choose-font-wrapper').html();
            //    }
            //});
        };

        (function () {
            
            scenes.push(new scene({
                unselect: unselectFromDesigner,
                select: selectFromDesigner
            }));

            var isVisible = false;
            $(".js-choose-font")
                .popover({
                    offset: 10,
                    trigger: 'manual',
                    animate: false,
                    html: true,
                    placement: 'right',
                    content: function() {
                        $('.js-choose-font-wrapper').show();
                        return $('.js-choose-font-wrapper')[0];
                    }
                }).on("click", function () {
                    var popoverThis = this;
                    if (isVisible) {
                        $(popoverThis).popover('hide');
                        $(window).off('click');
                    } else {
                        $(popoverThis).popover('show');
                        $(window).on('click', function() {
                            $(popoverThis).popover('hide');
                            $(window).off('click');
                            isVisible = !isVisible;
                        });
                    }

                    isVisible = !isVisible;
                    return false;
                });

            var isVisible1 = false;
            $(".js-choose-font-color")
                .popover({
                    offset: 10,
                    trigger: 'manual',
                    animate: false,
                    html: true,
                    placement: 'right',
                    content: function() {
                        $('.js-choose-font-color-wrapper').show();
                        return $('.js-choose-font-color-wrapper')[0];
                    }
                }).on("click", function () {
                    var popoverThis = this;
                    if (isVisible1) {
                        $(popoverThis).popover('hide');
                        $(window).off('click');
                    } else {
                        $(popoverThis).popover('show');
                        $(window).on('click', function () {
                            $(popoverThis).popover('hide');
                            $(window).off('click');
                            isVisible1 = !isVisible1;
                        });
                    }

                    isVisible1 = !isVisible1;
                    return false;
                });
        })();
    });
});