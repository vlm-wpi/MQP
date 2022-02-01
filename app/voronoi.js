  ///this is testing out voronoi stuff
  (function(voronoi) { 
    function randgp(max) {
      return Math.floor(Math.random() * max)
    }
  // HF#2 Random hex color
    function randhclr() {
      return "#" +
      ("00" + randgp(256).toString(16)).slice(-2) + 
      ("00" + randgp(256).toString(16)).slice(-2) + 
      ("00" + randgp(256).toString(16)).slice(-2)
    }
          // HF#3 Metrics: Euclidean, Manhattan and Minkovski 3/20/17
          var D = 1;
          var D2 = Math.sqrt(2);

          function Metric(x, y, heuristic) {
              var dx = Math.abs(x);
              var dy = Math.abs(y);
              if(euclidean) {
                heuristic = final.euclideand;
                console.log('the heuristic is euclidean')
                return Math.sqrt(x * x + y * y)

              } else if (diagonal) {
                heuristic = final.diagonald;
                console.log('the heuristic is diagonal')
                return (D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy))
              
              } else if (manhattan) {
                heuristic = final.manhattand;
                console.log('the heuristic is manhattan')
                return Math.abs(x) + Math.abs(y)
              }
          }
          // Plotting Voronoi diagram. aev 3/10/17
          function pVoronoiD() {
            console.log('call to pVoronoiD')
            // console.log(final.board.exit_locations[0].anchor_i)
              var cvs = document.getElementById("grid");
              var ctx = cvs.getContext("2d");
              var w = cvs.width,
                  h = cvs.height;
              var x = y = d = dm = j = 0,
                  w1 = w - 2,
                  h1 = h - 2;
              var n = data.max['Exit'];
              // document.getElementById("sites").value; //would be num exits for us
              var heuristic = heuristic
              // document.getElementById("mt").value; //would be heuristic checkbox for us
              var X = new Array(n),
                  Y = new Array(n),
                  C = new Array(n);
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, w, h);
              for (var i = 0; i < n; i++) {
                  X[i] = final.vor_exits_i[i];
                  // randgp(w1);
                  Y[i] = final.vor_exits_ii[i];
                  // randgp(h1);
                  C[i] = randhclr();
              }
              console.log(X)
              console.log(Y)
              for (y = 0; y < h1; y++) {
                  for (x = 0; x < w1; x++) {
                      dm = Metric(h1, w1, heuristic);
                      j = -1;
                      for (var i = 0; i < n; i++) {
                          d = Metric(X[i] - x, Y[i] - y, heuristic)
                          if (d < dm) {
                              dm = d;
                              j = i;
                          }
                      } //fend i
                      ctx.fillStyle = C[j];
                      ctx.fillRect(x, y, 1, 1);
                  } //fend x
              } //fend y
              ctx.fillStyle = "black";
              for (var i = 0; i < n; i++) {
                  ctx.fillRect(X[i], Y[i], 3, 3);
              }
            }
            //exported API

              voronoi.pVoronoiD = pVoronoiD;

          })(typeof voronoi === 'undefined' ?
          this['voronoi'] = {} : voronoi);
  
  /////