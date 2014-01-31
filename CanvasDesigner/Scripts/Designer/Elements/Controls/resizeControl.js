define(['Logic/collision'], function (collision) {
    var rotateControl = function () {

        var self = this;
        var resizeImage = null;

        self.controlType = 'resize';
        
        self.isPointInArea = function (point, boundingBox, rotation) {

            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

            var result = collision.isPointInArea(point,
                { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y + boundingBox.height + 10, width: 20, height: 20 },
                origin, rotation);

            return result;
        };

        self.draw = function (canvasContext, boundingBox, rotation) {

            canvasContext.save();

            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            canvasContext.rotate(rotation * (Math.PI / 180));

            var halfWidth = boundingBox.width / 2,
                halfHeight = boundingBox.height / 2;

            if (!resizeImage) {

                resizeImage = new Image();
                resizeImage.onload = function () {
                    canvasContext.drawImage(resizeImage, halfWidth + 20, -halfHeight - 15);
                };
                resizeImage.src = "/images/designer/resize-handle.png";
            } else {
                canvasContext.drawImage(resizeImage, halfWidth + 10, halfHeight + 10);
            }

            canvasContext.restore();

        };

    };

    return rotateControl;
});