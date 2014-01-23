define(['Elements/textElement'], function (textElement) {

    var scene = function () {

        var self = this;
        
        self.selectedElement = null;

        var elements = [];
        var offset = null;

        self.addText = function(text) {
            var newTextElement = new textElement(text);

            elements.push(newTextElement);
            //todo: add this via angular
            $(".designer-canvas-container").append(newTextElement.canvas);
            $(".designer-canvas-container").append(newTextElement.elementControls.canvas);
        };

        var privateFunctions = {
            getElementOver: function (x, y) {
                //todo: favor selected item over layer order

                var i, matchedElement;
                for (i = 0; i < elements.length; ++i) {
                    if (elements[i].isInElement(x - offset.left, y - offset.top) &&
                        (!matchedElement || elements[i].layerOrder > matchedElement.layerOrder)) {
                        matchedElement = elements[i];
                    }
                }
                return matchedElement;
            },
            getElementClicked: function(x, y) {

                var matchedElement = privateFunctions.getElementOver(x, y);
                if (matchedElement) {
                    matchedElement.click(x - offset.left, y - offset.top);
                }
                return matchedElement;
            },
            getCursorType: function(x, y) {

                var matchedElement = privateFunctions.getElementOver(x, y);
                return !matchedElement ? 'inherit' : matchedElement.getCursorType(x - offset.left, y - offset.top);
            },
            isMouseOverElement: function(x, y) {
                return privateFunctions.getElementOver(x, y) != null;
            }
        };

        (function init() {

            var sceneDiv = $($.parseHTML('<div style="position:absolute;height:489px;width:500px;z-index:9999"></div>'));
            $(".designer-canvas-container").append(sceneDiv);

            offset = sceneDiv.offset();
            var isDragging = false;
            var prevMouseLocation;

            sceneDiv.mousedown(function (e) {

                var currentElement = privateFunctions.getElementClicked(e.clientX, e.clientY);
                if(!currentElement) {
                    return;
                }

                prevMouseLocation = { x: e.clientX, y: e.clientY };

                $(window).mousemove(function (e1) {

                    var newMouseLocation = { x: e1.clientX, y: e1.clientY };
                    var changeAmounts = { x: newMouseLocation.x - prevMouseLocation.x, y: newMouseLocation.y - prevMouseLocation.y };
                    prevMouseLocation = newMouseLocation;

                    isDragging = true;

                    currentElement.drag(changeAmounts, newMouseLocation);

                });
            }).mouseup(function () {
                var wasDragging = isDragging;
                isDragging = false;
                $(window).unbind("mousemove");
                if (!wasDragging) {

                }
            });


            var currentCursorType = 'inherit';
            sceneDiv.mousemove(function (e) {

                var cursorType = privateFunctions.getCursorType(e.pageX, e.pageY);
                
                if (cursorType != currentCursorType) {
                    currentCursorType = cursorType;
                    sceneDiv.css({ cursor: cursorType });
                } 
            });
        })();
    };

    return scene;
});