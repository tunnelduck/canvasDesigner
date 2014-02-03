define([], function () {

    var borderControl = function () {

        var self = this;

        self.draw = function (canvasContext, boundingBox, rotation) {

            canvasContext.save();

            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            canvasContext.rotate(rotation * (Math.PI / 180));

            canvasContext.beginPath();

            if (canvasContext.setLineDash) {
                canvasContext.setLineDash([5, 2]);
            }
            else if ('mozDash' in canvasContext) {
                canvasContext.mozDash = [5, 2];
            }
            else if ('webkitLineDash' in canvasContext) {
                canvasContext.webkitLineDash = [5, 2];
            }

            canvasContext.mozDashOffset = 10;
            canvasContext.rect(-boundingBox.width / 2, -boundingBox.height / 2, boundingBox.width, boundingBox.height);
            canvasContext.stroke();

            canvasContext.restore();
        };
        
    };

    return borderControl;
});