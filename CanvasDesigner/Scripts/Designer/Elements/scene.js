define(['Elements/textElement'], function (textElement) {

    var scene = function (initialParams) {

        var self = this;
        
        self.selectedElement = null;

        var elements = [];
        var offset = null;

        self.addText = function(initialParams) {
            var newTextElement = new textElement(initialParams);

            self.selectedElement = newTextElement;

            elements.push(newTextElement);
            //todo: add this via angular
            $(".designer-canvas-container").append(newTextElement.canvas);
            $(".designer-canvas-container").append(newTextElement.elementControls.canvas);
        };

        self.setTextColor = function(color) {
            self.selectedElement.setColor(color);
        };
        
        self.updateText = function (text) {
            self.selectedElement.updateText(text);
        };

        self.getDesignerProperties = function() {
            return self.selectedElement.getDesignerProperties();
        };

        self.center = function() {
            self.selectedElement.center();
        };

        self.setTextFont = function(fontName) {
            self.selectedElement.setTextFont(fontName);
        };
        
        self.setTextSize = function (size) {
            self.selectedElement.setTextSize(size);
        };
        
        self.setRotation = function (rotation) {
            self.selectedElement.setRotation(rotation);
        };

        var privateFunctions = {
            getElementOver: function (x, y) {
                //todo: favor selected item over layer order

                var i, matchedElement;
                for (i = 0; i < elements.length; ++i) {
                    if (elements[i].isInElement(x - offset.left, y - offset.top)) {
                        
                        if (elements[i] == self.selectedElement) {
                            //currently selected element gets priority over anything else
                            return elements[i];
                        }

                        if (!matchedElement || (elements[i].layerOrder > matchedElement.layerOrder)) {
                            matchedElement = elements[i];
                        }

                    }
                }
                return matchedElement;
            },
            getElementClicked: function(x, y) {
                var matchedElement = privateFunctions.getElementOver(x, y);
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

            var sceneDiv = $($.parseHTML('<div style="position:absolute;height:489px;width:500px;z-index:888"></div>'));
            $(".designer-canvas-container").append(sceneDiv);

            offset = sceneDiv.offset();
            var prevMouseLocation;

            sceneDiv.mousedown(function (e) {

                var currentElement = privateFunctions.getElementClicked(e.pageX, e.pageY);
                if (!currentElement) {
                    //clicked on nothing
                    if (self.selectedElement) {
                        self.selectedElement.unselect();
                        self.selectedElement = null;
                        initialParams.unselect();
                    }

                    return;
                }
                
                if (self.selectedElement != currentElement) {
                    if (self.selectedElement) {
                        self.selectedElement.unselect();
                    }
                    self.selectedElement = currentElement;
                    initialParams.select(self.selectedElement);
                }

                self.selectedElement.registerClick(e.pageX - offset.left, e.pageY - offset.top);


                if (currentElement.getCurrentOperation() == 'delete') {

                    return;
                }

                prevMouseLocation = { x: e.pageX, y: e.pageY };

                $(window).mousemove(function (e1) {

                    var newMouseLocation = { x: e1.pageX, y: e1.pageY };
                    var changeAmounts = { x: newMouseLocation.x - prevMouseLocation.x, y: newMouseLocation.y - prevMouseLocation.y };
                    prevMouseLocation = newMouseLocation;

                    currentElement.drag(changeAmounts, { x: newMouseLocation.x - offset.left, y: newMouseLocation.y - offset.top });

                });
            }).mouseup(function () {

                $(window).unbind("mousemove");

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