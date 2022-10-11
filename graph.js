/**
 * Simpe graph generator (from an array of tuple[int,int,int]).
 */


// V,E = Number of Vertices, Edges respectively.
// Assume that input is 1-based so decreasing 'V's by one.
function createGraph(V, E) {
    let adjacency_list = [];

    for(let i = 0; i < V; i++){
        adjacency_list.push([]);
    }

    // bidirectional graph.
    for(let i = 0; i < E.length; i++) {
        adjacency_list[E[i][0]].push([E[i][1], E[i][2]]);
        adjacency_list[E[i][1]].push([E[i][0], E[i][2]]);
    }
    return adjacency_list;
}

// example to verify
let V = 5;
const E = [[0,1,3],[0,3,2],[2,4,1],[2,3,3]];
let graph = createGraph(V,E);
console.log(graph);
