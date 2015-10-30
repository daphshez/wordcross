// http://knowledgestockpile.blogspot.co.uk/2012/01/using-d3js-to-draw-grid.html
$(document).ready(function () {
    var gridSize = 16;
    var squareSize = 50;
    var stroke = 10;
    var symmetry = true;
    //var dir = $('body').attr('dir');
    var dir = 'ltr';

    var size = stroke * (gridSize + 1) + squareSize * gridSize;

    var svg = d3.select("body").append('svg').attr('height', size).attr('width', size);

    // add black background
    svg.append('rect').attr('height', '100%').attr('width', '100%').attr('fill', 'black');


    function id2x(id) {
        return Math.floor(id / gridSize);
    }

    function id2y(id) {
        return id % gridSize;
    }

    var rectXY = d3.range(0, gridSize * gridSize).map(function (d) {
        return {'x': id2x(d), 'y': id2y(d), 'color': 'white'};
    });


    var rects = svg.selectAll('rect.square')
        .data(rectXY)
        .enter()
        .append('rect')
        .attr('id', function (d) {
            return 'rect-' + d.x + '-' + d.y;
        })
        .attr('class', 'square')
        .attr('x', function (d) {
            return stroke + d.x * (stroke + squareSize)
        })
        .attr('y', function (d) {
            return stroke + d.y * (stroke + squareSize)
        })
        .attr('width', squareSize).attr('height', squareSize)
        .attr('stroke-width', '0')
        .attr('fill', 'white')
        .on('click', function (d) {
            var newColor = (d.color == "white") ? "black" : "white";
            rects.filter(function (d1) {
                if ((d1.x == d.x || d1.x == (gridSize - 1 - d.x)) && (d1.y == d.y || d1.y == (gridSize - 1 - d.y))) {
                    d1.color = newColor;
                    return true;
                }
                return false;
            }).attr('fill', function (d) {
                return d.color;
            })
        });


});
