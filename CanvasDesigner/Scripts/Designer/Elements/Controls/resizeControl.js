define(['Logic/collision'], function (collision) {
    var rotateControl = function () {

        var self = this;
        var resizeImage = null;

        self.controlType = 'resize';
        
        self.getRegistrationPoint = function (boundingBox) {
            return { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y + boundingBox.height + 10 };
        };
        
        self.isPointInArea = function (point, boundingBox, rotation) {

            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

            var result = collision.isPointInArea(point,
                { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y + boundingBox.height + 10, width: 20, height: 20 },
                origin, rotation);

            return result;
        };

        self.draw = function (canvasContext, boundingBox, rotation) {

            if (!resizeImage) {

                resizeImage = new Image();
                resizeImage.onload = function () {
                    drawImage(canvasContext, boundingBox, rotation);
                };
                resizeImage.src = "/images/designer/resize-handle.png";
            } else {
                drawImage(canvasContext, boundingBox, rotation);
            }
        };
        
        function drawImage(canvasContext, boundingBox, rotation) {
            var halfWidth = boundingBox.width / 2,
                halfHeight = boundingBox.height / 2;

            canvasContext.save();
            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            canvasContext.rotate(rotation * (Math.PI / 180));
            canvasContext.drawImage(resizeImage, halfWidth + 10, halfHeight + 10);
            canvasContext.restore();
        }

    };

    return rotateControl;
});