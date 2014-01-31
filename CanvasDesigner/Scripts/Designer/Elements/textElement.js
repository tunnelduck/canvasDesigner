define(['Elements/elementControls', 'Logic/collision', 'Logic/Matrix2D'], function (elementControls, collision, matrix2d) {

    var textElement = function (initialParams) {

        var self = this;
        var textImage = null;
        var isElementSelected = false;

        self.rotation = 0;
        self.scale = 1;
        self.color = initialParams.color;
        self.elementType = 'text';
        self.size = 48;
        
        self.elementControls = new elementControls();

        self.layerOrder = 1;

        var selectedOperation = 'move';

        self.getCurrentOperation = function() {
            return selectedOperation;
        };
        
        self.updateText = function (text) {
            self.text = text;
            loadImage();
        };

        self.setColor = function(color) {
            self.color = color;
            loadImage();
        };

        self.getDesignerProperties = function() {
            var result = {
                fontName: self.fontName,
                size: self.scaledBoundingBox ? self.scaledBoundingBox.height : self.size, //will use size if before image initially loaded (and thus wouldnt be scaled at that point)
                rotation: self.rotation,
                color: self.color,
                text: self.text
            };

            return result;
        };

        self.setTextFont = function(fontName) {
            self.fontName = fontName;
            loadImage();
        };

        self.setTextSize = function(size) {
            //todo: calculate scale to get bounding box that size
            self.scale = size / self.boundingBox.height;
            self.scaledBoundingBox = getScaledBoundingBox();
            draw();
        };

        self.setRotation = function(rotation) {
            self.rotation = rotation;
            draw();
        };

        self.getCursorType = function(x, y) {
            if (collision.isPointInArea({ x: x, y: y },
                self.scaledBoundingBox,
                { x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2, y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2 }, self.rotation, self.scale)) {
                return 'move';
            }

            var controlElement = self.elementControls.getControlAtPoint(x, y);
            if (controlElement.controlType == 'rotate' || controlElement.controlType == 'resize' || controlElement.controlType == 'delete') {
                return 'pointer';
            }

            return 'inherit';
        };

        self.registerClick = function (x, y) {
            //this is really just to render the controls, perhaps call something that just does that only
            draw();

            if (collision.isPointInArea({ x: x, y: y }, self.scaledBoundingBox,
                { x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2, y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2 }, self.rotation, self.scale)) {
                selectedOperation = 'move';
                return;
            }

            var controlElement = self.elementControls.getControlAtPoint(x, y);
            if (controlElement && controlElement.controlType == 'rotate') {
                selectedOperation = 'rotate';
                return;
            }

            if (controlElement && controlElement.controlType == 'resize') {
                selectedOperation = 'resize';
                return;
            }
            
            if (controlElement && controlElement.controlType == 'delete') {
                selectedOperation = 'delete';
                return;
            }

            selectedOperation = null;
        };

        self.registerMouseup = function() {
            selectedOperation = null;
        };

        self.unselect = function() {
            //todo: hide controls
            hideControls();
        };

        self.isInElement = function (x, y) {
            
            if (!self.scaledBoundingBox) {
                return false;
            }

            //todo: base element function candidate

            var result = collision.isPointInArea({ x: x, y: y }, self.scaledBoundingBox,
                { x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2, y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2 },
                self.rotation, self.scale);
            
            if (self.elementControls.getControlAtPoint(x, y)) {
                return true;
            }

            return result;
        };

        self.center = function() {
            var center = self.canvas.width / 2;
            self.boundingBox.x = center - (self.boundingBox.width / 2);;
            self.scaledBoundingBox = getScaledBoundingBox();
            draw();
        };

        self.drag = function(delta, newPosition) {
            //todo: base element function candidate
            
            if (!selectedOperation) {
                return;
            }
            
            //clear the canvas of everything
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);

            if (selectedOperation == 'move') {

                self.boundingBox.x += delta.x;
                self.boundingBox.y += delta.y;

                self.scaledBoundingBox.x += delta.x;
                self.scaledBoundingBox.y += delta.y;
                
            } else if (selectedOperation == 'rotate') {
                var angle = Math.atan2(newPosition.y - (self.boundingBox.y - 7.5), newPosition.x - (self.boundingBox.x + self.boundingBox.width / 2));
                self.rotation = Math.floor(angle * 180 / Math.PI);
                initialParams.rotationUpdate(self.rotation);
            } else if (selectedOperation == 'resize') {
                //for now, allow only equal x and y scaling
                
                var xOffset = self.boundingBox.x + self.boundingBox.width / 2;
                var yOffset = self.boundingBox.y + self.boundingBox.height / 2;

                var rotationMatrix = new matrix2d().identity().translate(-xOffset, -yOffset).rotate(-self.rotation * Math.PI / 180).translate(xOffset, yOffset);
                var unrotatedPoint = rotationMatrix.transformPoint(newPosition.x, newPosition.y);

                //todo: scaling should really just be based on how far mouse is from center

                //hard coded value comes from resize handle positioning
                var xEdge = self.scaledBoundingBox.x + self.scaledBoundingBox.width + 20;
                var yEdge = self.scaledBoundingBox.y + self.scaledBoundingBox.height + 20;

                var scaleX = (self.scaledBoundingBox.width + delta.x) / (self.boundingBox.width);
                var scaleY = (self.scaledBoundingBox.height + delta.y) / (self.boundingBox.height);

                if (unrotatedPoint.x > xEdge && unrotatedPoint.y > yEdge && scaleX > 0.2 && scaleY > 0.2) {
                    self.scale = scaleX > scaleY ? scaleX : scaleY;
                } else if (scaleX > 0.2 && scaleY > 0.2) {
                    self.scale = scaleX < scaleY ? scaleX : scaleY;
                }

                self.scaledBoundingBox = getScaledBoundingBox();
                initialParams.sizeUpdate(self.scaledBoundingBox.height);
            }

            draw();
        };

        function roundUp(numToRound, multiple) {
            if (multiple == 0) {
                return numToRound;
            }

            var remainder = numToRound % multiple;
            if (remainder == 0) {
                return numToRound;
            }
            
            return numToRound + multiple - remainder;
        }

        function getScaledBoundingBox() {
            var xOffset = self.boundingBox.x + self.boundingBox.width / 2;
            var yOffset = self.boundingBox.y + self.boundingBox.height / 2;
            

            var scaleMatrix = new matrix2d().identity().translate(-xOffset, -yOffset).scale(self.scale, self.scale).translate(xOffset, yOffset);
            var newTopLeft = scaleMatrix.transformPoint(self.boundingBox.x, self.boundingBox.y);
            var newBottomRight = scaleMatrix.transformPoint(self.boundingBox.x + self.boundingBox.width, self.boundingBox.y + self.boundingBox.height);

            var newWidth = newBottomRight.x - newTopLeft.x;
            var newHeight = newBottomRight.y - newTopLeft.y;

            return { x: newTopLeft.x, y: newTopLeft.y, width: newWidth, height: newHeight };
        }

        
        function draw() {
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);

            self.canvasContext.save();

            self.canvasContext.translate(self.boundingBox.x + (self.boundingBox.width / 2), self.boundingBox.y + (self.boundingBox.height / 2));
            self.canvasContext.rotate(self.rotation * (Math.PI / 180));
            self.canvasContext.scale(self.scale, self.scale);

            self.canvasContext.drawImage(textImage, -self.boundingBox.width / 2, -self.boundingBox.height / 2);
            self.canvasContext.restore();

            self.elementControls.draw(self.scaledBoundingBox, self.rotation);
        }
        
        function hideControls() {
            self.elementControls.hide();
        }
        
        function loadImage() {

            textImage = new Image();
            textImage.onload = function () {
                
                

                var priorBoundingBox = self.boundingBox;
                if (priorBoundingBox) {
                    var widthDelta = priorBoundingBox.width - this.width;

                    self.boundingBox.width = this.width;
                    self.boundingBox.height = this.height;
                    self.boundingBox.x += widthDelta / 2;

                    self.scaledBoundingBox = getScaledBoundingBox();
                } else {
                    self.boundingBox = { width: this.width, height: this.height, x: (500 / 2) - (this.width / 2), y: 120 };
                    self.scaledBoundingBox = { width: this.width, height: this.height, x: self.boundingBox.x, y: self.boundingBox.y };
                }


                draw();
            };

            var textImageSrc = "http://pdf.buildasign.com/DynamicImages.ashx?action=GetTextImage&Text={0}&Font={2}&FontSize={3}&Color=HEX{1}&T=6F6B41686A306E59667732416243784B384E757035673D3D"
                .replace("{0}", encodeURIComponent(self.text))
                .replace("{1}", self.color)
                .replace("{2}", self.fontName)
                .replace("{3}", self.size);

            textImage.src = textImageSrc;
        }
        
        (function init() {
            var jCanvas = $($.parseHTML('<canvas width="{0}" height="{1}" style="position:absolute;"></canvas>'.replace('{0}', 500).replace('{1}', 489)));
            var canvas = jCanvas[0];

            self.canvasContext = canvas.getContext("2d");
            
            //clip region to hide anything that goes outside the design area
            self.canvasContext.rect(120, 60, 240, 343);
            self.canvasContext.clip();
            self.canvas = canvas;
            self.text = initialParams.text;
            self.color = initialParams.color;
            self.fontName = initialParams.fontName;

            loadImage();
            

        })();

    };
    
    return textElement;

});