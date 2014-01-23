define(['Logic/Matrix2D'], function(matrix2d) {
    var collision = {
        
        isPointInArea: function (point, boundingBox, origin, rotation) {

            if (rotation == 0) {
                //simple case, probably keep around since most items will not be rotated

                if (point.x > boundingBox.x && point.x < boundingBox.x + boundingBox.width &&
                    point.y > boundingBox.y && point.y < boundingBox.y + boundingBox.height) {
                    return true;
                }

                return false;
            } else {
                //todo: clean up the math, did the translations outside of matrix math for simplicty, should be done completely in matrix math though
                var originX = boundingBox.x + boundingBox.width / 2;
                var originY = boundingBox.y + boundingBox.height / 2;

                var point1 = { x: point.x - origin.x, y: point.y - origin.y};
                

                var matrix = new matrix2d().identity().rotate(-rotation * Math.PI / 180); 
                var unRotatedPoint = matrix.transformPoint(point1.x, point1.y);

                var originOffset = { x: (boundingBox.x + boundingBox.width / 2) - origin.x, y: (boundingBox.y + boundingBox.height / 2) - origin.y };


                if (unRotatedPoint.x > -boundingBox.width / 2 + originOffset.x && unRotatedPoint.x < boundingBox.width / 2 + originOffset.x &&
                    unRotatedPoint.y > -boundingBox.height / 2 + originOffset.y && unRotatedPoint.y < boundingBox.height / 2 + originOffset.y) {
                    return true;
                }

                //console.log('point: ' + point.x + ' x ' + point.y);
                //console.log('un-rotated: ' + unRotatedPoint.x + ' x ' + unRotatedPoint.y);
                //console.log('origin: ' + originX + ' x ' + originY);


                return false;
                
            }
        }
    };

    return collision;
})