
Promise.all([ // load multiple files
	d3.json('airports.json'),
	d3.json('world-110m.json')
    ]).then(data=>{ // or use destructuring :([airports, wordmap])=>{ ... 
	let airports = data[0]; // data1.csv
	let worldmap = data[1]; // data2.json
    console.log(airports);

    const airport_nodes = airports.nodes;
    const airport_links = airports.links;

    
    let visType='force';
    const width = 400; 
    const height = 400; 

    
    let worldTopo = topojson.feature(worldmap, worldmap.objects.countries)
    .features; 
    //let projection = d3.geoMercator().translate([width/2, height/2]);
    //let projection = d3.geoMercator().fitExtent([[0,0],[width,height]],topojson.feature(worldmap, worldmap.objects.countries));
    let projection = d3.geoMercator().fitExtent([[-width,-height/2],[width,height/2]], topojson.feature(worldmap, worldmap.objects.countries));
    let path = d3.geoPath().projection(projection);
     

    const svg = d3.select("#chart-area").append('svg')
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
    

    svg
        .selectAll("path")
        .data(worldTopo)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", path)  
        .style("opacity", 0);

        
    const size = d3.scaleLinear()
        .domain(d3.extent(airport_nodes,d=>d.passengers))
        .range([5,10]);


    const force = d3.forceSimulation(airports.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force('link',d3.forceLink(airports.links).distance(50))
        .force('x',d3.forceX())
        .force('y',d3.forceY())
        .on('tick', ()=>{
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });


    let drag =force =>{
        function dragStart(event){
            if(!event.active) force.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event){
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragEnd(event){
            event.subject.fx = null;
            event.subject.fy = null; 
        }
    return d3.drag()
        .on('start',dragStart)
        .on('drag',dragged)
        .on('end',dragEnd)
        .filter(event=>visType==='force');
    };
    
    const link = svg.append('g').selectAll('line')
        .data(airport_links)
        .join('line')
        .attr('class','link')
        .attr('stroke','#999')
        .attr('stroke-width',1);
        //.style('stroke-width',1);
    
    const node = svg.append('g').selectAll('circle')
    .data(airport_nodes)
    .join('circle')
    .attr('fill', 'blue')
    .attr('r', d=>size(d.passengers))
    .call(drag(force));

    node.append('title')
        .text(d=>d.name);

    d3.selectAll('input[name=typeforce]').on('change',event=>{
        type = event.target.value;
        switchLayout();
        //visType='map';
        
    });

    function switchLayout(){
        if (type=='map'){
            visType="map";
            force.stop();
            svg.selectAll('.map')
                .style('opacity',1)
            link
                .transition()
                .duration(500)
                .attr('x1', function(d){
                    return projection([d.source.longitude,d.source.latitude])[0];
                })
                .attr('y1', function(d){
                    return projection([d.source.longitude,d.source.latitude])[1];
                })
                .attr('x2', function(d){
                    return projection([d.target.longitude,d.target.latitude])[0];
                })
                .attr('y2', function(d){
                    return projection([d.target.longitude,d.target.latitude])[1];
                });
            node
                .transition()
                .duration(500)
                .attr('cx', d=>projection([d.longitude,d.latitude])[0])
                .attr('cy', d=>projection([d.longitude,d.latitude])[1]);
    }
        else{
            visType='force';
            link
                .transition()
                .duration(500)
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .transition()
                .duration(500)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            svg.selectAll(".map")
                .style("opacity", 0);  
        }
    };


})


