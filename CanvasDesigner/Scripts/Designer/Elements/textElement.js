define(['Elements/elementControls', 'Logic/collision', 'Logic/affineTransform', 'Logic/matrix2d'], function (elementControls, collision, affineTransform, matrix2d) {

    var textElement = function (initialParams) {

        var self = this;
        var textImage = null;
        var isElementSelected = false;

        self.rotation = 0;
        self.scale = 1;
        self.color = initialParams.color;
        self.elementType = 'text';
        self.size = 48;
        self.layerOrder = initialParams.layerOrder;
        
        self.elementControls = new elementControls();

        var selectedOperation = 'move';

        self.getCurrentOperation = function() {
            return selectedOperation;
        };
        
        self.updateText = function (text) {
            self.text = text;
            loadImage();
        };

        self.setLayerOrder = function(order) {
            self.layerOrder = order;
            $(self.canvas).css({ 'z-index': order });
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

        self.delete = function() {
            $(self.canvas).remove();
            $(self.elementControls.canvas).remove();
            initialParams.onDelete();
        };

        var clickOffset = null;
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
                clickOffset = getOffsetFromControl({ x: x, y: y }, controlElement);
                clickOffset.y += self.scaledBoundingBox.height / 2 + 30;
                selectedOperation = 'rotate';
                return;
            }

            if (controlElement && controlElement.controlType == 'resize') {
                clickOffset = getOffsetFromControl({ x: x, y: y }, controlElement);
                clickOffset.y -= 10;
                clickOffset.x -= 10;
                selectedOperation = 'resize';
                return;
            }
            
            if (controlElement && controlElement.controlType == 'delete') {
                selectedOperation = 'delete';
                return;
            }

            selectedOperation = null;
        };

        function getOffsetFromControl(clickPoint, control) {
            var origin = {
                x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2,
                y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2
            };

            var unrotatedPoint = affineTransform.rotatePoint(origin, clickPoint, self.rotation);
            var registrationPoint = control.getRegistrationPoint(self.scaledBoundingBox);

            var offset = { x: registrationPoint.x - unrotatedPoint.x, y: registrationPoint.y - unrotatedPoint.y };
            return offset;
        }

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
                var origin = {
                    x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2,
                    y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2
                };

                
                var unrotatedOffset = affineTransform.rotatePoint(origin, newPosition, self.rotation);
                unrotatedOffset.x += clickOffset.x;
                unrotatedOffset.y += clickOffset.y;
                unrotatedOffset = affineTransform.rotatePoint(origin, unrotatedOffset, self.rotation * -1);

                var newPositionRegistrationPoint = unrotatedOffset;

                var angle = Math.atan2(newPositionRegistrationPoint.y - origin.y, newPositionRegistrationPoint.x - origin.x);

                //var angle = Math.atan2(newPosition.y - (self.boundingBox.y - 7.5), newPosition.x - (self.boundingBox.x + self.boundingBox.width / 2));
                self.rotation = Math.floor(angle * 180 / Math.PI);
                initialParams.rotationUpdate(self.rotation);
            } else if (selectedOperation == 'resize') {
                //for now, allow only equal x and y scaling
                var origin = {
                    x: self.scaledBoundingBox.x + self.scaledBoundingBox.width / 2,
                    y: self.scaledBoundingBox.y + self.scaledBoundingBox.height / 2
                };
                
                var unrotatedOffset = affineTransform.rotatePoint(origin, newPosition, self.rotation);
                unrotatedOffset.x += clickOffset.x;
                unrotatedOffset.y += clickOffset.y;

                var heightScale = ((unrotatedOffset.y - origin.y) * 2) / self.boundingBox.height;
                var widthScale = ((unrotatedOffset.x - origin.x) * 2) / self.boundingBox.width;

                self.scale = heightScale < widthScale ? heightScale : widthScale;

                //dont allow item to get super small and eventually flip
                if (self.scale < .2) {
                    self.scale = .2;
                }

                self.scaledBoundingBox = getScaledBoundingBox();
                initialParams.sizeUpdate(self.scaledBoundingBox.height);
            }

            draw();
        };

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
            var jCanvas = $($.parseHTML('<canvas width="{0}" height="{1}" style="position:absolute;z-index:{2}"></canvas>'.replace('{0}', 500).replace('{1}', 489).replace("{2}", self.layerOrder)));
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