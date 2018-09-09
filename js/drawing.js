const defaultCurve = {
    start: {'x': 0, 'y': 165},
    mid1: {'x': 46, 'y': 163},
    mid2: {'x': 51, 'y': 224},
    end: {'x': 104, 'y': 211}
};

function copyToClipboard(element) {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}

function getParameterizedFunctionTerms(start, point1, point2, end, getPoint) {
    const startVal = getPoint(start);
    const point1Val = getPoint(point1);
    const point2Val = getPoint(point2);
    const endVal = getPoint(end);

    const cubedTerm = endVal - startVal + 3 * point1Val - 3 * point2Val;
    const squaredTerm = 3 * (startVal + point2Val - 2 * point1Val);
    const linearTerm = 3 * (point1Val - startVal);
    return [cubedTerm, squaredTerm, linearTerm, startVal];
}

function getParameterizedDerivativeTerms(start, point1, point2, end, getPoint) {
    const funcTerms = getParameterizedFunctionTerms(start, point1, point2, end, getPoint);

    return [
        0,
        3 * funcTerms[0],
        2 * funcTerms[1],
        funcTerms[2]
    ]
}

function stylePolynomial(term1, term2, term3, term4, letter) {
    const sign1 = term2 < 0 ? '-' : '+';
    const sign2 = term3 < 0 ? '-' : '+';
    const sign3 = term4 < 0 ? '-' : '+';

    let result = '';
    if (term1 !== 0) {
        result += `${term1}${letter}^3`;
    }
    if (term2 !== 0) {
        result += ` ${sign1}${Math.abs(term2)}${letter}^2`
    }
    if (term3 !== 0) {
        result += ` ${sign2}${Math.abs(term3)}${letter}`;
    }
    if (term4 !== 0) {
        result += ` ${sign3}${Math.abs(term4)}`;
    }

    return result;
}


function equation(start, cp1, cp2, end, len) {
    const dxTerms = getParameterizedDerivativeTerms(start, cp1, cp2, end, p => p.x);
    const dyTerms = getParameterizedDerivativeTerms(start, cp1, cp2, end, p => p.y);

    const yString = stylePolynomial(...getParameterizedFunctionTerms(start, cp1, cp2, end, p => p.y), 't');
    const xString = stylePolynomial(...getParameterizedFunctionTerms(start, cp1, cp2, end, p => p.x), 't');
    const dxString = stylePolynomial(...dxTerms, 't');
    const dyString = stylePolynomial(...dyTerms, 't');

    const dxdyString = `(${dyString}) / (${dxString})`;
    const javaOutput = `` +
        `(${dyTerms[1]} * Math.pow(t, 2) + ${dyTerms[2]} * t + ${dyTerms[3]}) / ` +
        `(${dxTerms[1]} * Math.pow(t, 2) + ${dxTerms[2]} * t + ${dxTerms[3]})`;


    let endAngle = Math.atan2(end.y - cp2.y, end.x - cp2.x) * 180 / Math.PI;


    $('#xt').text("x(t) = " + xString);
    $('#yt').text("y(t) = " + yString);
    $("#dx").text("dx/dt = " + dxString);
    $('#dy').text("dy/dt = " + dyString);
    $('#len').text("len = " + Math.round(len * 1000) / 1000 + "   end angle: " + Math.round(endAngle * 1000) / 1000) + "&#176;";
    $('#dydx').text("dy/dx = " + dxdyString);

    $('#java').html(`new PathSegment(t -> <br />
		/* ${JSON.stringify({start: start, mid1: cp1, mid2: cp2, end: end})} */<br />
		${javaOutput} <br />
		\n, ${Math.round(len * 1000) / 1000})`);
}

$(document).ready(function () {
    // drawFieldImage(0.5);
    let start = defaultCurve.start;
    let mid1 = defaultCurve.mid1;
    let mid2 = defaultCurve.mid2;
    let end = defaultCurve.end;
    $('input').change(function () {
        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
    });
    $('#startx').change(function () {
        start.x = parseFloat($(this).val());
    });
    $('#starty').change(function () {
        start.y = parseFloat($(this).val());
    });

    $('#mid1x').change(function () {
        mid1.x = parseFloat($(this).val());
    });
    $('#mid1y').change(function () {
        mid1.y = parseFloat($(this).val());
    });

    $('#mid2x').change(function () {
        mid2.x = parseFloat($(this).val());
    });
    $('#mid2y').change(function () {
        mid2.y = parseFloat($(this).val());
    });

    $('#endx').change(function () {
        end.x = parseFloat($(this).val());
    });
    $('#endy').change(function () {
        end.y = parseFloat($(this).val());
    });
    $('#importtext').click(function () {
        let imp = JSON.parse($("#import").val());
        start.x = imp.start.x;
        start.y = imp.start.y;

        mid1.x = imp.mid1.x;
        mid1.y = imp.mid1.y;

        mid2.x = imp.mid2.x;
        mid2.y = imp.mid2.y;

        end.x = imp.end.x;
        end.y = imp.end.y;

        $('#startx').val(start.x);
        $('#starty').val(start.y);

        $('#endx').val(end.x);
        $('#endy').val(end.y);

        $('#mid1x').val(mid1.x);
        $('#mid1y').val(mid1.y);

        $('#mid2x').val(mid2.x);
        $('#mid2y').val(mid2.y);

        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
    });

    $('#mirror').click(() => {
        let old = JSON.parse(JSON.stringify({start: start, mid1: mid1, mid2: mid2, end: end})); // sketchy hack to copy not reference

        start.x = old.start.x;
        start.y = old.start.y;

        mid1.x = old.mid1.x;
        mid1.y = start.y + (old.start.y - old.mid1.y);

        mid2.x = old.mid2.x;
        mid2.y = start.y + (old.start.y - old.mid2.y);

        end.x = old.end.x;
        end.y = start.y + (old.start.y - old.end.y);

        $('#startx').val(start.x);
        $('#starty').val(start.y);

        $('#endx').val(end.x);
        $('#endy').val(end.y);

        $('#mid1x').val(mid1.x);
        $('#mid1y').val(mid1.y);

        $('#mid2x').val(mid2.x);
        $('#mid2y').val(mid2.y);

        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
    });

    $('#reverse').click(() => {
        let old = JSON.parse(JSON.stringify({start: start, mid1: mid1, mid2: mid2, end: end})); // sketchy hack to copy not reference

        start.x = old.end.x;
        start.y = old.end.y;

        mid1.x = old.mid2.x;
        mid1.y = old.mid2.y;

        mid2.x = old.mid1.x;
        mid2.y = old.mid1.y;

        end.x = old.start.x;
        end.y = old.start.y;

        $('#startx').val(start.x);
        $('#starty').val(start.y);

        $('#endx').val(end.x);
        $('#endy').val(end.y);

        $('#mid1x').val(mid1.x);
        $('#mid1y').val(mid1.y);

        $('#mid2x').val(mid2.x);
        $('#mid2y').val(mid2.y);

        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
    });

    $('#offset').click(() => {
        let x = parseFloat($('#offx').val());
        let y = parseFloat($('#offy').val());

        start.x = start.x + x;
        start.y = start.y + y;

        mid1.x = mid1.x + x;
        mid1.y = mid1.y + y;

        mid2.x = mid2.x + x;
        mid2.y = mid2.y + y;

        end.x = end.x + x;
        end.y = end.y + y;

        $('#startx').val(start.x);
        $('#starty').val(start.y);

        $('#endx').val(end.x);
        $('#endy').val(end.y);

        $('#mid1x').val(mid1.x);
        $('#mid1y').val(mid1.y);

        $('#mid2x').val(mid2.x);
        $('#mid2y').val(mid2.y);

        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
        // update();
    });

    function updateFromCurve(otherCurve) {
        if (otherCurve.points.length < 4) {
            return;
        }
        // console.log(otherCurve.points[0]);

        start = otherCurve.points[0];
        mid1 = otherCurve.points[1];
        mid2 = otherCurve.points[2];
        end = otherCurve.points[3];

        // console.log(start)

        delete start.t;
        delete start.d;
        delete end.t;
        delete end.d;

        $('#startx').val(start.x);
        $('#starty').val(start.y);

        $('#endx').val(end.x);
        $('#endy').val(end.y);

        $('#mid1x').val(mid1.x);
        $('#mid1y').val(mid1.y);

        $('#mid2x').val(mid2.x);
        $('#mid2y').val(mid2.y);
        // console.log(start, mid1, mid2, end);
        let curve = new Bezier(start, mid1, mid2, end);
        equation(start, mid1, mid2, end, curve.length());
        draw(curve);
    }

    window.updateFromCurve = updateFromCurve;

    $(document).keyup(() => {
        realUpdate();
    });

    setInterval(realUpdate, 250);
});

window.updateFromCurve = function () {
};

function realUpdate() {
    function get(id) {
        return parseFloat($('#' + id)[0].value);
    }

    const localStart = {x: get('startx'), y: get('starty')};
    const localcp1 = {x: get('mid1x'), y: get('mid1y')};
    const localcp2 = {x: get('mid2x'), y: get('mid2y')};
    const localend = {x: get('endx'), y: get('endy')};


    let curve = new Bezier(localStart, localcp1, localcp2, localend);
    equation(localStart, localcp1, localcp2, localend, curve.length());
    draw(curve);
}

window.curve = new Bezier(0, 165, 46, 163, 51, 224, 104, 211);