define(['Logic/collision'], function (collision) {

    var rotateControl = function () {
        
        var self = this;
        var rotateImage = null;

        self.controlType = 'rotate';

        self.getRegistrationPoint = function(boundingBox) {
            return { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y - 30 };
        };

        self.isPointInArea = function (point, boundingBox, rotation) {

            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

            var result = collision.isPointInArea(point,
                { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y - 30, width: 20, height: 20 },
                origin, rotation);

            return result;
        };

        self.draw = function (canvasContext, boundingBox, rotation) {

            if (!rotateImage) {
                rotateImage = new Image();
                rotateImage.onload = function() {
                    drawImage(canvasContext, boundingBox, rotation);
                };
                rotateImage.src = "/images/designer/rotate-handle.png";
            } else {
                drawImage(canvasContext, boundingBox, rotation);
            }
        };

        function drawImage(canvasContext, boundingBox, rotation) {
            canvasContext.save();

            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            canvasContext.rotate(rotation * (Math.PI / 180));
            
            canvasContext.drawImage(rotateImage, boundingBox.width / 2 + 10, -boundingBox.height / 2 - 30);

            canvasContext.restore();
        }
    };

    return rotateControl;
})




//define(['Logic/collision'], function (collision) {

//    var rotateControl = function () {

//        var self = this;
//        var rotateImage = null;

//        self.controlType = 'rotate';

//        self.getRegistrationPoint = function(boundingBox) {
//            return { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y + boundingBox.height / 2};
//        };

//        self.isPointInArea = function (point, boundingBox, rotation) {

//            var origin = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };

//            var result = collision.isPointInArea(point,
//                { x: boundingBox.width + boundingBox.x + 10, y: boundingBox.y + boundingBox.height / 2 -10, width: 20, height: 20 },
//                origin, rotation);

//            return result;
//        };

//        self.draw = function (canvasContext, boundingBox, rotation) {

//            canvasContext.save();

//            //move canvas origin to be in middle of parent bounding box and rotate to match parent
//            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
//            canvasContext.rotate(rotation * (Math.PI / 180));

//            if (!rotateImage) {

//                rotateImage = new Image();
//                rotateImage.onload = function() {
//                    canvasContext.drawImage(rotateImage, boundingBox.width / 2 + 10, -10);
//                };
//                rotateImage.src = "/images/designer/rotate-handle.png";
//            } else {
//                canvasContext.drawImage(rotateImage, boundingBox.width / 2 + 10, -10);
//            }

//            canvasContext.restore();
//        };
//    };

//    return rotateControl;
//})