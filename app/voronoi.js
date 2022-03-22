/**
 * Deals with voronoi.
 *
 * Not Strictly a voronoi implementation. Only simulates drawing of regions using specified metrics
 */

(function(voronoi) { 
    function randgp(max) {
      return Math.floor(Math.random() * max)
    }

  // HF#2 Random hex color
    function randhclr() {
      return 
      '#' + 
      ("00" + randgp(256).toString(16)).slice(-2) + 
      ("00" + randgp(256).toString(16)).slice(-2) + 
      ("00" + randgp(256).toString(16)).slice(-2)
    }
    // "#" + 'FFFFFF'
    // }

    // HF#3 Metrics: Euclidean, Manhattan and Minkovski 3/20/17
    var D = 1;
    var D2 = Math.sqrt(2);
    
    // be a LIST of LISTs
    voronoi.regions = [];

    function Metric(x1, y1, x2, y2) {
        if(metrics.euclidean) {
            return Math.sqrt((x1-x2) * (x1-x2) + (y1-y2)*(y1-y2))
  }    

        if (metrics.diagonal) {
      var dx = Math.abs(x1-x2);
      var dy = Math.abs(y1-y2);
            return (D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy));
        }    

  if (metrics.manhattan) {
            return Math.abs(x1-x2) + Math.abs(y1-y2)
        }
  console.log("ERROR IN METRIC");
    }

    // Plotting Voronoi diagram. aev 3/10/17
    function pVoronoiD(board) {
        var cvs = document.getElementById("grid");
        var ctx = cvs.getContext("2d");
  
  if (parseInt(data.width_i) > parseInt(data.width_ii)) {
            var width = 600;
            var height = 600 * (data.width_ii / data.width_i);
  } else {
            var width = 600 * (data.width_i / data.width_ii);
            var height = 600;
  }

  var width_cell = width / data.width_i;
  var height_cell = height / data.width_ii;

        var n = data.max['Exit'];
  voronoi.regions = [];
  for (e = 0; e < n; e++) {
      voronoi.regions.push([]);
  }

        var X = new Array(n);
        var Y = new Array(n);
        var C = new Array(255);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        for (var e = 0; e < n; e++) {
            X[e] = final.vor_exits_i[e];
            Y[e] = final.vor_exits_ii[e];
        }
  for (var e = 0; e < 255; e++) {
            C[e] = randhclr();
  }

        for (var i = 0; i < data.width_i; i++) {
            for (var ii = 0; ii < data.width_ii; ii++) {
                var j = -1;
    var dm = 0;
    // all exits
                for (var e = 0; e < n; e++) {
                    d = Metric(i, ii, X[e], Y[e])
        if (j == -1 || d < dm) {
                        dm = d;
                        j = e;
        }
                } //fend e

                ctx.fillStyle = C[j];
                ctx.fillRect(i*width_cell, ii*height_cell, width_cell, height_cell);
    voronoi.regions[j].push([i, ii]);

            } //fend ii
        } //fend i
    }

    // ask for the density of the given region (0 .. #regions).
    function density(r, state) {
  var size = voronoi.regions[r].length; 
  var ct = 0;
  for (var p = 0; p < size; p++) {
      var pt = voronoi.regions[r][p];
      var i  = pt[0];
      var ii = pt[1];
      if (state.temp_grid[i][ii].thing != null) { ct++; }
  }
  return (ct * 1.0) / size;
    }

    // count the number of things in a region (SKIP obstacles)
    function count(r, state) {
  var size = voronoi.regions[r].length; 
  var ct = 0;
  var seen = [];
  for (var p = 0; p < size; p++) {
      var pt = voronoi.regions[r][p];
      var i  = pt[0];
      var ii = pt[1];
      if (state.temp_grid[i][ii].thing != null) { 
    var t = state.temp_grid[i][ii].thing;
    if (t.type != 'Obstacle') {
        if (!seen.includes(t)) {
      seen.push(t);
        }
    }
      }
  }

  return seen.length;
    }

    //exported API
    voronoi.pVoronoiD = pVoronoiD;
    voronoi.count = count;
    voronoi.density = density;

})(typeof voronoi === 'undefined' ?
   this['voronoi'] = {} : voronoi);