var Force = null;
var DGAll = {};

function MainInit() {
	
	//var url = 'ws://localhost:3001';
	// for remote access
	var url = 'ws://10.148.207.170:3001';
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
	
	var nodeDataCpy = nodeData.slice();
	var edgeDataCpy = edgeData.slice();	
	
	var nodeHash = {};
	for(var x in nodeDataCpy)
	{
		nodeHash[nodeDataCpy[x].id] = nodeDataCpy[x];
	}
	for(var x in edgeDataCpy)
	{
		var ele = {};
		ele.weight = parseInt(edgeData[x].weight);
		ele.source = nodeHash[edgeData[x].source];
		ele.target = nodeHash[edgeData[x].target];
		edgeDataCpy[x] = ele;
	}
	
	var weightScale = d3.scale.linear()
		.domain(d3.extent(edgeDataCpy, function(d){ return d.weight; }))
		.range([0.1, 1]);
	
	if(Force === null)
	{
		Force = d3.layout.force().charge(-1200)
			.size([1500, 1000])
			.nodes(nodeDataCpy)
			.links(edgeDataCpy)
			.on("tick", forceTick);
			
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
	}
	else
	{	
		/// update for new nodes
		for(var n in nodeDataCpy)
		{
			if(!NodeIDExistInForceNodes(nodeDataCpy[n].id))
			{
				var newNodeID = nodeDataCpy[n].id;
				var color = nodeDataCpy[n].col;
				var newNode = {id: newNodeID, col: color, x: 100, y: 100};
				Force.nodes().push(newNode);
				
				for(var l in edgeDataCpy)
				{
					var edge = edgeDataCpy[l];
					if(edge.source.id === newNodeID
						||
						edge.target.id === newNodeID)
						{
							if(NodeIDExistInForceNodes(edge.source.id)
								&& NodeIDExistInForceNodes(edge.target.id))
							{
								if(newNodeID === edge.source.id)
								{
									var otherNode = GetNodeFromForceNodesByID(edge.target.id);
									newNode.x = otherNode.x;
									newNode.y = otherNode.y;
									Force.links().push({source: newNode, target: otherNode});
								}
								else if(newNodeID === edge.target.id)
								{
									var otherNode = GetNodeFromForceNodesByID(edge.source.id);
									Force.links().push({source: otherNode, target: newNode});
								}
							}
						}
				}
				
			}
		}
		
		/// update for removed nodes
		var updatedNodes = [];
		var updatedLinks = [];
		Force.nodes().forEach(function(n) {
			if(NodeIDExistInArray(n.id, nodeDataCpy))
			{
				updatedNodes.push(n);
			}
		});
		Force.links().forEach(function(l) {
			var srcID = l.source.id;
			var dstID = l.target.id;
			if(NodeIDExistInArray(srcID, updatedNodes)
				&& NodeIDExistInArray(dstID, updatedNodes))
			{
				updatedLinks.push(l);
			}
		});
		Force.nodes(updatedNodes);
		Force.links(updatedLinks);
		

	}
		
	var linkSel = d3.select("svg").selectAll("line.link")
		.data(Force.links(), function(d) { return d.source.id + "-" + d.target.id;});
		
	linkSel.enter()
		.append("line")
		.attr("class", "link")
		.style("stroke", "#ccc")
		.style("opacity", 0.8)
		.style("stroke-width", function(d){ return d.weight})
		;
		
	linkSel.exit()
		.transition()
		.duration(1000)
		.style("opacity", 0)
		.remove()
		;
		
		
	var nodeSel = d3.select("svg").selectAll("g.node")
		.data(Force.nodes(), function(d){ return d.id})
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
		.style("fill", function(d) { return d.col; })
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
	
	d3.selectAll("g.node").on("click", function(d){
		d3.select(this).select("circle").style("stroke-width", 4);
		d.fixed = true;			
	})
	.on("dblclick", function(d){
		d3.select(this).select("circle").style("stroke-width", 1);
		d.fixed = false;
	})
	.call(Force.drag()); // enable node dragging
	
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
	var key = content[0];
	var nodes = content[1].split(',');
	var edges = content[2].split(',');
	
	var nodeData = buildNodeData(nodes);
	var edgeData = buildEdgeData(edges);
	
	var v = DGAll[key];
	if(v == null) {
		
		DGAll[key] = {nodes: nodeData, edges: edgeData};
		d3.select("#dgList").append("button")
			.on("click", onClickListItem).html(key);
		function onClickListItem() {
			var key = this.outerText;
			var nodes = DGAll[key].nodes;
			var edges = DGAll[key].edges;
			console.log(nodes);
			console.log(edges);
			createForceLayout(nodes, edges);
		}
	}
	else
	{
		var nodes = DGAll[key].nodes;
		var edges = DGAll[key].edges;
		
		MergeTwoDGs(nodeData, edgeData, nodes, edges);
	}
	//createForceLayout(nodeData, edgeData);

 }