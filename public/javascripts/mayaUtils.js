function buildNodeData(nodes) {
	var result = [];
	
	for(var n in nodes)
	{
		if(nodes[n] !== '')
		{
			var temp = nodes[n].split('#');
			var nt = "";
			var atr = "";
			if(temp.length > 1)
				nt = temp[1];
			if(temp.length > 2)
				atr = temp[2];
			var obj = {
				id : temp[0],
				nodeType : nt,
				attr : atr,
			};
			
			result.push(obj);
		}
	}
	
	return result;
}

function buildEdgeData(edges) {
	var result = [];
	
	for(var e in edges)
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


function GetNodeFromArrayByID(nid, arr) {
	for(var i in arr)
	{
		if(nid == arr[i].id)
			return arr[i];
	}
	
	return null;
}

function GetNodeFromForceNodesByID(nid) {
	var nodes = Force.nodes();
	return GetNodeFromArrayByID(nid, nodes);
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

function DuplicateNode(node) {
	var result = {
		id : node.id,
		nodeType : node.nodeType,
		attr : node.attr
	} ;
	
	return result;
}

function DuplicateNodes(nodes) {
	var result = [];
	
	for(var i in nodes)
	{
		result.push(DuplicateNode(nodes[i]));	
	}
	
	return result;
}

function DuplicateEdge(edge) {
	var result = {
		weight : edge.weight,
		source : edge.source,
		target : edge.target
	};
	
	return result;
}

function DuplicateEdges(edges) {
	var result = [];
	
	for(var i in edges)
	{
		result.push(DuplicateEdge(edges[i]));
	}
	
	return result;
}

function MergeTwoDGs(nodesSrc, edgesSrc, nodesDst, edgesDst) {
	// remove nodes & edges
	for(var i = 0; i < nodesDst.length; ++i)
	{
		if(!NodeIDExistInArray(nodesDst[i].id, nodesSrc))
		{
			nodesDst.splice(i, 1);
			i = i - 1;
		}
	}
	
	for(var i = 0; i < edgesDst.length; ++i)
	{
		var e = edgesDst[i];
		if(!NodeIDExistInArray(e.source, nodesDst)
		|| !NodeIDExistInArray(e.target, nodesDst))
		{
			edgesDst.splice(i, 1);
			i = i - 1;
		}		
	}
	
	///////////////
	var newAddedList = [];
	
	for(var i in nodesSrc)
	{
		if(!NodeIDExistInArray(nodesSrc[i].id, nodesDst))
		{
			nodesDst.push(nodesSrc[i]);
			newAddedList.push(nodesSrc[i]);
		}
		else
		{
			// update node's attr value
			var n = GetNodeFromArrayByID(nodesSrc[i].id, nodesDst);
			n.attr = nodesSrc[i].attr;
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