function Heightmap(w, h) {
    this.hmap = [];
    for(var i = 0; i < w; i++) {
        this.hmap.push([]);
        for(var j = 0; j < h; j++) {
            this.hmap[i].push(0.5);
        }
    }

    this.width = w;
    this.height = h;

    this.avg_at = function(x, y) {
        function get(x, y, heightmap) {
            if(x < 0) {
                x = 0;
            }
            else if(x >= heightmap.length) {
                x = heightmap.length - 1;
            }

            if(y < 0) {
                y = 0;
            }
            else if(y >= heightmap[0].length) {
                y = heightmap[0].length - 1;
            }
            return heightmap[x][y];
        }

        var sum = 0;
        for(var i = x-1; i < x+2; i++) {
            for(var j = y-1; j < y+2; j++) {
                if(i != x || j != y) {
                    sum += get(i, j, this.hmap);
                }
            }
        }
        return sum / 8;
    }

    this.value_at = function(x, y) {
        return this.hmap[x][y];
    }

    this.sample_at = function(x, y, xmax, ymax) {
        var thisx = Math.floor(this.width * (x / xmax));
        var thisy = Math.floor(this.height * (y / ymax));
        return this.hmap[thisx][thisy];
    }

    this.set_at = function(x, y, value) {
        var v = Math.max(0.0, value);
        this.hmap[x][y] = v;
    }

    this.next_state = function() {
        var copy = [];
        for(var i = 0; i < this.width; i++) {
            copy.push([]);
            for(var j = 0; j < this.height; j++) {
                copy[i].push(this.avg_at(i, j));
            }
        }
        this.hmap = copy;
    }
}


function fmt_color(r, g, b) {
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

function draw_bg_square(ctx, xi, yi, sz, height) {
    var color = 35;
    if(xi % 2 == yi % 2) {
        color = 50;
    }

    var hf = Math.round(75 * height);
    var c = fmt_color(color + hf, color + hf, color + hf);
    ctx.fillStyle = c;
    ctx.fillRect(xi * sz, yi * sz, sz, sz);
}

function draw_bg(ctx, heightmap) {
    var sz = 8;
    var xn = Math.round(window.innerWidth / sz);
    var yn = Math.round(window.innerHeight / sz);

    var t = new Date().getTime() / 30.0;

    for(var x = 0; x < xn; x++) {
        for(var y = 0; y < yn; y++) {
            var height = heightmap.sample_at(x, y, xn, yn);
            draw_bg_square(ctx, x, y, sz, height);
        }
    }
}

function draw(elem, hmap) {
    var canvas = document.getElementById(elem);
    var ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw_bg(ctx, hmap);
}
