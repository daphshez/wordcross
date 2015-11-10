$(document).ready(function () {
    var urlParameters = {};
    $.each( decodeURIComponent(window.location.search.substring(1)).split('&'), function(i, s){
        var parts = s.split('=');
        urlParameters[parts[0]] = parts[1] === undefined ? true : parts[1];
    });

    var gridSize = urlParameters['gridSize'] | 16;
    var squareSize = 50;
    var stroke = 10;
    // types: none, rotation_180, reflection_xy
    var symmetry = urlParameters['symmetry'] === undefined ? 'rotation_180' : urlParameters['symmetry'];
    var rtl = $('body').attr('dir') == 'rtl';

    var size = stroke * (gridSize + 1) + squareSize * gridSize;

    var svg = d3.select("body").append('svg').attr('height', size).attr('width', size);

    // add black background
    svg.append('rect').attr('height', '100%').attr('width', '100%').attr('fill', 'black');

    // some helper function
    function id2x(id) {
        return id % gridSize;
    }

    function id2y(id) {
        return Math.floor(id / gridSize);
    }

    function xy2id(x, y) {
        return x * squareSize + y;
    }

    function xPosition(d) {
        if (rtl) {
            dx = gridSize - 1 - d.x;
        } else {
            dx = d.x;
        }
        return stroke + dx * (stroke + squareSize);
    }

    function yPosition(d) {
        return stroke + d.y * (stroke + squareSize);
    }

    // create an array of box data
    var boxXY = d3.range(0, gridSize * gridSize).map(function (d) {
        return {'x': id2x(d), 'y': id2y(d)};
    });

    // build the boxes
    var boxes = svg.selectAll('rect.square')
        .data(boxXY)
        .enter()
        .append('rect')
        .attr('id', function (d) {
            return 'box-' + d.x + '-' + d.y;
        })
        .attr('class', 'square')
        .attr('x', xPosition)
        .attr('y', yPosition)
        .attr('width', squareSize)
        .attr('height', squareSize)
        .attr('stroke-width', '0')
        .attr('fill', 'white');

    // find the box object matching the wanted x, y
    function xyToBox(x, y) {
        return boxes[xy2id(x, y)];
    }

    function id2Color(id) {
        return d3.select(boxes[0][id]).attr('fill');
    }

    function is_black(id) {
        return id2Color(id) == 'black';
    }

    function is_symmetric(d, d1) {
        if (symmetry == 'none') {
            return d1.x == d.x && d1.y == d.y;
        }
        else if (symmetry == 'reflection_xy') {
            return (d1.x == d.x || d1.x == (gridSize - 1 - d.x)) && (d1.y == d.y || d1.y == (gridSize - 1 - d.y));
        } else if (symmetry == 'rotation_180') {
            return d1.x == d.x && d1.y == d.y || d1.x == (gridSize - 1 - d.x) && d1.y == (gridSize - 1 - d.y);
        }
        return false;   // this shouldn't happen
    }

    function is_numbered(d, id) {
        if (is_black(id)) return false;

        // case 1: first in row
        if (d.x == 0 && !is_black(id + 1)) return true;
        // case 2: 2nd in row - to (n-1)th in row
        if (d.x > 0 && d.x < gridSize - 1 && is_black(id - 1) && !is_black(id + 1)) return true;

        // verticals
        if (d.y == 0 && !is_black(id + gridSize)) return true;
        if (d.y > 0 && d.y < gridSize - 1 && is_black(id - gridSize) && !is_black(id + gridSize)) return true;

        // in all other cases...
        return false;
    }

    function fill_numbers() {
        // remove the old ones
        svg.selectAll('text').remove();

        var texts = svg.selectAll('text')
            .data(boxXY)
            .enter()
            .append('text')
            .filter(is_numbered)
            .attr('class', 'number')
            .text(function (d, i) {
                return i + 1;
            })
            .attr('x', function (d) {
                if (rtl) {
                    return xPosition(d) + squareSize - 7;
                }
                return xPosition(d) + 5;
            })
            .attr('y', function (d) {
                return yPosition(d) + stroke + 5
            });
    }

    fill_numbers();

    boxes.on('click', function (d, id) {
        var newColor = id2Color(id) == 'white' ? 'black' : 'white';
        boxes.filter(function (d1) {
            return is_symmetric(d1, d);
        }).attr('fill', newColor);
        fill_numbers();
    });


});
