define(['Logic/Matrix2D'], function (matrix2d) {
    var affineTransform = {
        rotatePoint: function(origin, point, rotation) {
            var matrix = new matrix2d().identity().translate(-origin.x, -origin.y).rotate(-rotation * Math.PI / 180).translate(origin.x, origin.y);
            var result = matrix.transformPoint(point.x, point.y);

            return result;
        }
    };

    return affineTransform;
});