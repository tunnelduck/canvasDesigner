define(
    ['Elements/Controls/borderControl',
     'Elements/Controls/rotateControl'],
    function (borderControl, rotateControl) {

    var elementControls = function () {

        var self = this;

        self.canvas = null;
        self.canvasContext = null;
        self.parentBoundingBox = null;
        self.rotation = 0;
        

        self.controls = {
            borderControl: new borderControl(),
            rotateControl: new rotateControl()
        };

        self.getControlAtPoint = function(x, y) {
            if (self.controls.rotateControl.isPointInArea({ x: x, y: y }, self.parentBoundingBox, self.rotation || 0)) {
                return self.controls.rotateControl;
            }

            return null;
        };

        self.draw = function (boundingBox, rotation) {
            //clear canvas
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);

            self.canvasContext.save();
            
            //move canvas origin to be in middle of parent bounding box and rotate to match parent
            self.canvasContext.translate(boundingBox.x + (boundingBox.width / 2), boundingBox.y + (boundingBox.height / 2));
            self.canvasContext.rotate(rotation * (Math.PI / 180));

            //draw element controls
            self.controls.borderControl.draw(self.canvasContext, boundingBox);
            self.controls.rotateControl.draw(self.canvasContext, boundingBox);
            
            self.canvasContext.restore();

            self.rotation = rotation;
            self.parentBoundingBox = boundingBox;
        };

        (function init() {
            
            var jCanvas = $($.parseHTML('<canvas width="{0}" height="{1}" style="position:absolute;"></canvas>'.replace('{0}', 500).replace('{1}', 489)));
            var canvas = jCanvas[0];

            self.canvas = canvas;

            self.canvasContext = canvas.getContext("2d");
        })();
    };

    return elementControls;
})