let width = 1000,
height = 600;

let svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

Promise.all([
  d3.json("airports.json"),
  d3.json("world-110m.json")
]).then(function(data) {
  let airports = data[0];
  let worldData = data[1]

  // default visType 
  let visType = "force";
  
  // map   
  let projection = d3.geoMercator().translate([width / 2, height / 2]);
  let path = d3.geoPath().projection(projection);
  let worldTopo = topojson.feature(worldData, worldData.objects.countries)
  .features;
  
  svg
    .selectAll("path")
    .data(worldTopo)
    .enter()
    .append("path")
    .attr("class", "map")
    .attr("d", path)  
    .style("opacity", 0);
  
  // simulation
  let force = d3
    .forceSimulation(airports.nodes)
    .force("charge", d3.forceManyBody().strength(-25))
    .force("link", d3.forceLink(airports.links).distance(50))
    .force("center", d3.forceCenter()
      .x(width / 2)
      .y(height / 2)
      )
      .on("tick", () => {
        link 
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
      
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });  

  let link = svg
    .append("g")
    .attr("class", "link")
    .selectAll("line")
    .data(airports.links)
    .join("line")

  //Drag event functions
  drag = force => {
    function dragstarted(event) {
      if (!event.active) force.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) force.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
      .filter(event => visType === "force");
    };    
    
  // nodes
  let node = svg
      .append("g")
      .attr("class", "node")
      .selectAll("circle")
      .data(airports.nodes)
      .join("circle")
        .attr("r", function(d) {
          return Math.sqrt(parseInt(d.passengers) *0.0000045);
        })
      .call(drag(force));
      
  node 
      .append("title").text(function(d) {
        return d.name;
      });
  

    

// switching
  d3.selectAll("input[name=layout]").on("change", event=>{
    visType = event.target.value;
    updateViz();
  });


  let updateViz = function() {
    console.log(visType)
      //conditional statements
      if (visType == "map") {
        //stop the simulation
        force.stop();           

        //visible map
        svg
          .selectAll(".map")
          .style("opacity", 1) 

        //setting positions of link and node  
        link
          .transition()
          .duration(600)
          .attr("x1", function(d) {
            return projection([d.source.longitude, d.source.latitude])[0];
          })
          .attr("y1", function(d) {
            return projection([d.sourcelongitude, d.source.latitude])[1];
          })
          .attr("x2", function(d) {
            return projection([d.target.longitude, d.target.latitude])[0];
          })
          .attr("y2", function(d) {
            return projection([d.target.longitude, d.target.latitude])[1];
          });

       
        node
          .transition()
          .duration(600)
          .attr("cx", d => projection([d.longitude, d.latitude])[0])           
          .attr("cy", d => projection([d.longitude, d.latitude])[1]);

     
                
               
    }
    
    else {
      //restart simulation
      //  force.restart()
          link 
            .transition()
            .duration(600)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
          node
            .transition()
            .duration(600)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
      
   
      //hide map
      svg.selectAll(".map")
        .style("opacity", 0);   
  
             
    }
     
       
  };

});