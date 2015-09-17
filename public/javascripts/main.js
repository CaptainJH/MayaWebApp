
function buildNodeData(nodes) {
	var result = [];
	
	for(n in nodes)
	{
		if(nodes[n] !== '')
		{
			var obj = {
				id : nodes[n],
			};
			
			result.push(obj);
		}
	}
	
	return result;
}

function buildEdgeData(edges) {
	var result = [];
	
	for(e in edges)
	{	
		if(edges[e] !== '')
		{
			var ele = edges[e].split('-');
			var obj = {
				weight : 1,
				source : ele[0],
				target : ele[1],	
			};
			
			result.push(obj);
		}
	}
	
	return result;
}

var Force = null;

function MainInit() {
	
	var url = 'ws://localhost:3001';
	var socket = new WebSocket(url);
	socket.onopen = function(ev) {
		console.log('onopen');
		//console.log(ev);
	};
	
	socket.onclose = function(ev) {
		console.log('onclose');
		//console.log(ev);
	};
	
	socket.onmessage = function(ev) {
		//console.log('onmessage');
		//console.log(ev);
		//console.log(ev.data);
		
		var texArray = ev.data.split('|');
		if(texArray[0] === "10")
		{
			onMessage10(texArray[1]);
		}
		
	};

}

function clear() {

	d3.select("#controls").selectAll("button").remove();
}

function createForceLayout(nodeData, edgeData) {
	//console.log(nodeData);
	//console.log(edgeData);
		
	
	var nodeHash = {};
	for(x in nodeData)
	{
		nodeHash[nodeData[x].id] = nodeData[x];
	}
	for(x in edgeData)
	{
		edgeData[x].weight = parseInt(edgeData[x].weight);
		edgeData[x].source = nodeHash[edgeData[x].source];
		edgeData[x].target = nodeHash[edgeData[x].target];
	}
	
	var weightScale = d3.scale.linear()
		.domain(d3.extent(edgeData, function(d){ return d.weight; }))
		.range([0.1, 1]);
	
	if(Force === null)
	{
		Force = d3.layout.force().charge(-1200)
			.size([1500, 1000])
			.nodes(nodeData)
			.links(edgeData)
			.on("tick", forceTick);
	}
	else
	{
		Force.nodes(nodeData)
			.links(edgeData)
			;
	}
		
	var linkSel = d3.select("svg").selectAll("line.link")
		.data(edgeData, function(d) { return d.source.id + "-" + d.target.id;});
		
	linkSel.enter()
		.append("line")
		.attr("class", "link")
		.style("stroke", "black")
		.style("opacity", 0.5)
		.style("stroke-width", function(d){ return d.weight})
		;
		
	linkSel.exit()
		.transition()
		.duration(1000)
		.style("opacity", 0)
		.remove()
		;
		
		
	var nodeSel = d3.select("svg").selectAll("g.node")
		.data(nodeData, function(d){ return d.id})
		;
		
		
	var nodeEnter = nodeSel 
		.enter()
		.append("g")
		.attr("class", "node")
		;
		
	nodeEnter.append("circle")
		.attr("r", 5)
		.style("fill", "lightgray")
		.style("stroke", "black")
		.style("stroke-width", "1px");
		
	nodeEnter.append("text")
		.style("text-anchor", "middle")
		.attr("y", 15)
		.text(function(d) { return d.id;});
		
	nodeSel.exit()
		.transition()
		.duration(1000)
		.style("opacity", 0)
		.remove()
		;
		
	var marker = d3.select("svg").append('defs')
		.append('marker')
		.attr("id", "Triangle")
		.attr("refX", 12)
		.attr("refY", 6)
		.attr("markerUnits", 'userSpaceOnUse')
		.attr("markerWidth", 12)
		.attr("markerHeight", 18)
		.attr("orient", 'auto')
		.append('path')
		.attr("d", 'M 0 0 12 6 0 12 3 6');
	d3.selectAll("line").attr("marker-end", "url(#Triangle)");

	
	d3.select("#controls").append("button")
		.on("click", normalSize).html("Normal");
	function normalSize() {
		Force.stop();
		d3.selectAll("circle")
			.attr("r", 5)
			.style("fill", "lightgray")
			;	
	}
	
	d3.select("#controls").append("button")
		.on("click", sizeByDegree).html("Degree Size");
	function sizeByDegree() {
		Force.stop();
		var ar = [];
		d3.selectAll("circle")
			.attr("r", function(d) {
				ar.push(d.weight * 2); 
				return d.weight * 2;
			})
			;
		var colorScale = d3.scale.linear().domain(d3.extent(ar)).range(["lightgray", "red"]);
		d3.selectAll("circle")
			.style("fill", function(d){
				return colorScale(d.weight * 2);
			});
	}
	
	d3.selectAll("g.node").call(Force.drag()); // enable node dragging
	d3.selectAll("g.node").on("click", function(d){
		d3.select(this).select("circle").style("stroke-width", 4);
		d.fixed = true;			
	});
	
	Force.start();
	
	function forceTick() {
			
		d3.selectAll("line.link")
			.attr("x1", function(d) { return d.source.x;})
			.attr("x2", function(d) { return d.target.x;})
			.attr("y1", function(d) { return d.source.y;})
			.attr("y2", function(d) { return d.target.y;});
			
		d3.selectAll("g.node")
			.attr("transform", function(d){
				return "translate("+ d.x + "," + d.y + ")";
			});
	}
 }
 
 
 function onMessage10(text) {
	clear();
	
	var content = text.split(';');
	var nodes = content[0].split(',');
	var edges = content[1].split(',');
	
	var nodeData = buildNodeData(nodes);
	var edgeData = buildEdgeData(edges);
	
	createForceLayout(nodeData, edgeData);

 }