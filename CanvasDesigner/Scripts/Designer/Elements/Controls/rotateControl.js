define(['Logic/collision'], function (collision) {

    var rotateControl = function () {
        
        var self = this;
        var rotateImage = null;

        self.controlType = 'rotate';

        self.isPointInArea = function (point, boundingBox, rotation) {

            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

            var result = collision.isPointInArea(point,
                { x: boundingBox.width + boundingBox.x + 15, y: boundingBox.y - 15, width: 15, height: 15 },
                origin, rotation);

            return result;
        };

        self.draw = function (canvasContext, boundingBox) {

            if (!rotateImage) {

                rotateImage = new Image();
                rotateImage.onload = function() {
                    canvasContext.drawImage(rotateImage, boundingBox.width / 2 + 15, -boundingBox.height / 2 - 15);
                };
                rotateImage.src = "/images/designer/rotate-handle.png";
            } else {
                canvasContext.drawImage(rotateImage, boundingBox.width / 2 + 15, -boundingBox.height / 2 - 15);
            }
        };
    };

    return rotateControl;
})