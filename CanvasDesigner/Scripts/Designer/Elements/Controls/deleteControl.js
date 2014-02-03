define(['Logic/collision'], function (collision) {

    var rotateControl = function () {

        var self = this;
        var deleteImage = null;

        self.controlType = 'delete';

        self.isPointInArea = function (point, boundingBox, rotation) {

            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

            var result = collision.isPointInArea(point,
                { x: boundingBox.width / 2 + boundingBox.x - 10, y: boundingBox.y + boundingBox.height + 10, width: 20, height: 20 },
                origin, rotation);

            return result;
        };

        self.draw = function (canvasContext, boundingBox, rotation) {

            if (!deleteImage) {

                deleteImage = new Image();
                deleteImage.onload = function () {
                    drawImage(canvasContext, boundingBox, rotation);
                };
                deleteImage.src = "/images/designer/trash-handle.png";
            } else {
                drawImage(canvasContext, boundingBox, rotation);
            }
            
            
        };

        function drawImage(canvasContext, boundingBox, rotation) {
            canvasContext.save();

            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            canvasContext.rotate(rotation * (Math.PI / 180));
            
            canvasContext.drawImage(deleteImage, -10, boundingBox.height / 2 + 10);

            canvasContext.restore();
        }
    };

    return rotateControl;
})