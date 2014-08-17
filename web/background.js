function fmt_color(r, g, b) {
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function draw_bg_square(ctx, xi, yi, sz, heat1, heat2, heat3) {
    var color = 35;
    if(xi % 2 == yi % 2) {
        color = 50;
    }

    var hf1 = Math.round(3 * heat1) * 25;
    var hf2 = Math.round(3 * heat2) * 25;
    var hf3 = Math.round(3 * heat3) * 25;
    var c = fmt_color(color + hf1, color + hf2, color + hf3);
    if(xi == 10 && yi == 10) {
        console.log(c);
    }
    ctx.fillStyle = c;
    ctx.fillRect(xi * sz, yi * sz, sz, sz);
}

function h1(x, y, t, scale) {
    var h = Math.sin((x+t) / scale) * Math.cos((y+t) / scale);
    return h*h;
}

function h2(x, y, t, scale) {
    var h = Math.sin((x+t) / scale) * Math.cos((y-t) / scale);
    return h*h;
}

function h3(x, y, t, scale) {
    var h = Math.cos((x-t) / scale) * Math.cos((y-t) / scale);
    return h*h;
}

function draw_bg(ctx) {
    var sz = 8;
    var xn = Math.round(window.innerWidth / sz);
    var yn = Math.round(window.innerHeight / sz);

    var t = new Date().getTime() / 300.0;

    for(var x = 0; x < xn; x++) {
        for(var y = 0; y < yn; y++) {
            var heat1 = h1(x, y, t, sz / 1);
            var heat2 = h2(x, y, t, sz / 1);
            var heat3 = h3(x, y, t, sz / 1);
            draw_bg_square(ctx, x, y, sz, heat1, heat2, heat3);
        }
    }
}

function draw(elem) {
    var canvas = document.getElementById(elem);
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw_bg(ctx);
}
