define(
    ['Elements/Controls/borderControl',
     'Elements/Controls/rotateControl',
     'Elements/Controls/resizeControl',
    'Elements/Controls/deleteControl'],
    function (borderControl, rotateControl, resizeControl, deleteControl) {

    var elementControls = function () {

        var self = this;

        self.canvas = null;
        self.canvasContext = null;
        self.parentBoundingBox = null;
        self.rotation = 0;
        

        self.controls = {
            borderControl: new borderControl(),
            rotateControl: new rotateControl(),
            resizeControl: new resizeControl(),
            deleteControl: new deleteControl()
        };

        self.getControlAtPoint = function(x, y) {
            if (self.controls.rotateControl.isPointInArea({ x: x, y: y }, self.parentBoundingBox, self.rotation || 0)) {
                return self.controls.rotateControl;
            }
            
            if (self.controls.resizeControl.isPointInArea({ x: x, y: y }, self.parentBoundingBox, self.rotation || 0)) {
                return self.controls.resizeControl;
            }
            
            if (self.controls.deleteControl.isPointInArea({ x: x, y: y }, self.parentBoundingBox, self.rotation || 0)) {
                return self.controls.deleteControl;
            }

            return null;
        };

        self.hide = function() {
            //clear canvas
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);
        };

        self.draw = function (boundingBox, rotation) {
            //clear canvas
            self.canvasContext.clearRect(0, 0, self.canvas.width, self.canvas.height);

            //draw element controls
            self.controls.borderControl.draw(self.canvasContext, boundingBox, rotation);
            self.controls.rotateControl.draw(self.canvasContext, boundingBox, rotation);
            self.controls.resizeControl.draw(self.canvasContext, boundingBox, rotation);
            self.controls.deleteControl.draw(self.canvasContext, boundingBox, rotation);

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