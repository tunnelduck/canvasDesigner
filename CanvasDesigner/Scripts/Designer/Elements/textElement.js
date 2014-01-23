define(['Elements/elementControls', 'Logic/collision'], function (elementControls, collision) {

    var textElement = function (initialParams) {

        var self = this;
        var textImage = null;
        var isElementSelected = false;

        self.rotation = 0;
        
        self.elementControls = new elementControls();

        self.layerOrder = 1;

        var selectedOperation = 'move';

        self.getCursorType = function(x, y) {
            if (collision.isPointInArea({ x: x, y: y },
                self.boundingBox,
                { x: self.boundingBox.x + self.boundingBox.width / 2, y: self.boundingBox.y + self.boundingBox.height / 2 }, self.rotation)) {
                return 'move';
            }

            var controlElement = self.elementControls.getControlAtPoint(x, y);
            if (controlElement.controlType == 'rotate') {
                return 'pointer';
            }

            return 'inherit';
        };

        self.click = function(x, y) {
            if (collision.isPointInArea({ x: x, y: y }, self.boundingBox,
                { x: self.boundingBox.x + self.boundingBox.width / 2, y: self.boundingBox.y + self.boundingBox.height / 2 }, self.rotation)) {
                selectedOperation = 'move';
                return;
            }

            var controlElement = self.elementControls.getControlAtPoint(x, y);
            if (controlElement && controlElement.controlType == 'rotate') {
                selectedOperation = 'rotate';
                return;
            }

            selectedOperation = null;
        };

        self.isInElement = function (x, y) {
            //todo: base element function candidate

            var result = collision.isPointInArea({ x: x, y: y }, self.boundingBox,
                { x: self.boundingBox.x + self.boundingBox.width / 2, y: self.boundingBox.y + self.boundingBox.height / 2 },
                self.rotation);
            
            if (self.elementControls.getControlAtPoint(x, y)) {
                return true;
            }

            return result;
        };

        self.drag = function(delta, newPosition) {
            //todo: base element function candidate
            
            if (!selectedOperation) {
                return;
            }
            
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);


            
            

            if (selectedOperation == 'move') {

                self.boundingBox.x += delta.x;
                self.boundingBox.y += delta.y;
            } else if (selectedOperation == 'rotate') {
                var angle = Math.atan2(newPosition.y - self.boundingBox.y, newPosition.x - self.boundingBox.x);
                self.rotation = angle * 180 / Math.PI;
            }
            
            self.canvasContext.save();
            self.canvasContext.translate(self.boundingBox.x + (self.boundingBox.width / 2), self.boundingBox.y + (self.boundingBox.height / 2));
            self.canvasContext.rotate(self.rotation * (Math.PI / 180));
            //self.canvasContext.translate((self.boundingBox.x + (self.boundingBox.width / 2)) * -1, (self.boundingBox.y + (self.boundingBox.y / 2)) * -1);
            self.canvasContext.drawImage(textImage, -self.boundingBox.width / 2, -self.boundingBox.height / 2);
            self.canvasContext.restore();

            
            //self.canvasContext.drawImage(textImage, self.boundingBox.x, self.boundingBox.y);

            self.elementControls.draw(self.boundingBox, self.rotation);
        };
        
        (function init() {
            var jCanvas = $($.parseHTML('<canvas width="{0}" height="{1}" style="position:absolute;"></canvas>'.replace('{0}', 500).replace('{1}', 489)));
            var canvas = jCanvas[0];

            self.canvasContext = canvas.getContext("2d");
            
            //clip region to hide anything that goes outside the design area
            self.canvasContext.rect(120, 60, 240, 343);
            self.canvasContext.clip();


            textImage = new Image();
            textImage.onload = function() {
                self.canvasContext.drawImage(textImage, 0, 50);
                self.boundingBox = { width: this.width, height: this.height, x: 0, y: 50 };
                self.elementControls.draw(self.boundingBox);
            };
            textImage.src = "/images/designer/wootText.png";

            self.canvas = canvas;
            self.text = initialParams.text;
        })();

    };
    
    return textElement;

});