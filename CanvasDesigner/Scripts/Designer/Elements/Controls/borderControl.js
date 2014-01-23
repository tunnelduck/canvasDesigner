define([], function () {

    var borderControl = function () {

        var self = this;

        self.draw = function(canvasContext, boundingBox) {
            canvasContext.beginPath();
            canvasContext.mozDash = [5, 2];
            canvasContext.mozDashOffset = 10;
            canvasContext.rect(-boundingBox.width / 2, -boundingBox.height / 2, boundingBox.width, boundingBox.height);
            canvasContext.stroke();
        };
        
    };

    return borderControl;
});