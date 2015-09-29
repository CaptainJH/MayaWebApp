function buildNodeData(nodes) {
	var result = [];
	
	for(n in nodes)
	{
		if(nodes[n] !== '')
		{
			var temp = nodes[n].split('#');
			var color = "black";
			if(temp.length > 1)
				color = "red";
			var obj = {
				id : temp[0],
				col : color
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

function NodeIDExistInArray(nid, arr) {
	for(var i in arr)
	{
		if(nid === arr[i].id)
			return true;
	}
	
	return false;
}

function NodeIDExistInForceNodes(nid) {
	var nodes = Force.nodes();
	return NodeIDExistInArray(nid, nodes);
}

function GetNodeFromForceNodesByID(nid) {
	var nodes = Force.nodes();
	for(var i in nodes)
	{
		if(nid === nodes[i].id)
			return nodes[i];
	}
	
	return null;
}

// the input e should be like this "src-dst"
// the output should be {source: , target:, weight:}
function EdgeTextToObject(e) {
	var ele = e.split('-');
	var obj = {
		weight : 1,
		source : ele[0],
		target : ele[1],	
	};	
	
	return obj;
}


function EdgeExistInArray(e, arr) {
	var obj = EdgeTextToObject(e);
	for(var i in arr)
	{
		if(arr[i].source === obj.source
		&& arr[i].target === obj.target)
		{
			return true;
		}
	}
	
	return false;
}

function MergeTwoDGs(nodesSrc, edgesSrc, nodesDst, edgesDst) {
	var newAddedList = [];
	
	for(var i in nodesSrc)
	{
		if(!NodeIDExistInArray(nodesSrc[i].id, nodesDst))
		{
			nodesDst.push(nodesSrc[i]);
			newAddedList.push(nodesSrc[i]);
		}
	}
	
	for(var i in edgesSrc)
	{
		var e = edgesSrc[i];
		if(NodeIDExistInArray(e.source, newAddedList)
		|| NodeIDExistInArray(e.target, newAddedList))
		{
			edgesDst.push(e);
		}
	}	
}