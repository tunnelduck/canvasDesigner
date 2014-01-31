define(['Logic/Matrix2D'], function(matrix2d) {
    var collision = {
        
        isPointInArea: function (point, boundingBox, origin, rotation, scale) {

            scale = scale || 1;

            if (rotation == 0 && scale == 1) {
                //simple case, probably keep around since most items will not be rotated

                if (point.x > boundingBox.x && point.x < boundingBox.x + boundingBox.width &&
                    point.y > boundingBox.y && point.y < boundingBox.y + boundingBox.height) {
                    return true;
                }

                return false;
            } else {

                //unrotate the point about the origin
                var matrix = new matrix2d().identity().translate(-origin.x, -origin.y).rotate(-rotation * Math.PI / 180).translate(origin.x, origin.y);
                var unRotatedPoint = matrix.transformPoint(point.x, point.y);

                if (unRotatedPoint.x > boundingBox.x && unRotatedPoint.x < boundingBox.x + boundingBox.width &&
                    unRotatedPoint.y > boundingBox.y && unRotatedPoint.y < boundingBox.y + boundingBox.height) {
                    return true;
                }

                return false;
                
            }
        }
    };

    return collision;
})