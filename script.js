// https://visjs.org/
// onload -> Execute immediately after a page has been loaded.
onload = function () {
    let currData, V, src, dst;

    const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');
    const rightPaneText = document.getElementById('rightPaneText');
    const leftPaneText = document.getElementById('leftPaneText');
    const cities = ['Delhi', 'Mumbai', 'Varanasi', 'Panaji', 'Kanpur', 'Srinagar', 'Hyderabad', 'Bangalore', 'Manipal', 'Lucknow'];

    // initialise graph options
    /* The settings for tweaking edges/nodes 
    can be found here https://visjs.github.io/vis-network/docs/network/nodes.html# */
    const nodeAndEdgesProperty = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 18
            }
        },
        nodes: {
            font: '11px verdana red',
            scaling: {
                label: true
            },
            // Custom icon instead of default nodes are taken from Font Awesome
            // Link : https://fontawesome.com/icons/city?s=solid
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf64f',
                size: 36,
                color: '#0C49F0',
            }
        }
    };

    // initialize the network ("question graph")
    const network = new vis.Network(container);
    network.setOptions(nodeAndEdgesProperty);


    //This is the network for the resultant graph
    const network2 = new vis.Network(container2);
    network2.setOptions(nodeAndEdgesProperty);

    function createData() {

        // (Math.random returns a value between 0 and 1, 
        V = Math.floor(Math.random() * 8) + 3; // Ensures V is between 3 and 10
        let nodes = [];
        for (let i = 1; i <= V; i++) {
            nodes.push({id: i, label: cities[i - 1]})
        }
        // Prepares vis.js style nodes for our data
        nodes = new vis.DataSet(nodes);

        // Creating a tree like underlying graph structure
        let edges = [];
        for (let i = 2; i <= V; i++) {
            const neigh = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1); // Picks a neighbour from i-3 to i-1
            edges.push({
                type: 0,
                from: i,
                to: neigh,
                color: 'orange',
                label: String(Math.floor(Math.random() * 70) + 31)
            });
        }

        // Randomly adding new edges to graph
        // Type of bus is 0
        // Type of plane is 1
        for (let i = 1; i <= V / 2;) {

            let n1 = Math.floor(Math.random() * V) + 1;
            let n2 = Math.floor(Math.random() * V) + 1;
            if (n1 !== n2) {
                if (n1 < n2) {
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }
                // Seeing if an edge between these two vertices already exists
                // And if it does then of which kind
                let works = 0;
                for (let j = 0; j < edges.length; j++) {
                    if (edges[j]['from'] === n1 && edges[j]['to'] === n2) {
                        if (edges[j]['type'] === 0)
                            works = 1;
                        else
                            works = 2;
                    }
                }

                // Adding edges to the graph
                // If works == 0, you can add bus as well as plane between vertices
                // If works == 1, you can only add plane between them
                if (works <= 1) {
                    if (works === 0 && i < V / 3) {
                        // Adding a bus
                        edges.push({
                            type: 0,
                            from: n1,
                            to: n2,
                            color: 'orange',
                            label: String(Math.floor(Math.random() * 70) + 31)
                        });
                    } else {
                        // Adding a plane
                        edges.push({
                            type: 1,
                            from: n1,
                            to: n2,
                            color: 'green',
                            label: String(Math.floor(Math.random() * 28) + 1)
                        });
                    }
                    i++;
                }
            }
        }

        // Setting the new values of global variables
        src = 1;
        dst = V;
        currData = {
            nodes: nodes,
            edges: edges
        };

    }

    genNew.onclick = function () {
        // Create new data and display the data
        createData();
        network.setData(currData);
        leftPaneText.innerText = 'Find least time path from ' + cities[src - 1] + ' to ' + cities[dst - 1];
        rightPaneText.style.display = "inline"; // all in same line
        leftPaneText.style.display = "inline";
        container2.style.display = "none"; // if not present, left/right pane text will interfere try commenting to check

    };

    solve.onclick = function () {
        // Create graph from data and set to display
        rightPaneText.style.display = "none";
        leftPaneText.style.display = "none";
        container2.style.display = "inline";
        network2.setData(solveData());
    };

    function djikstra(graph, sz, src) {
        let vis = Array(sz).fill(0);
        let dist = [];
        for (let i = 1; i <= sz; i++)
            dist.push([10000, -1]);
        dist[src][0] = 0;

        for (let i = 0; i < sz - 1; i++) {
            let mn = -1;
            for (let j = 0; j < sz; j++) {
                if (vis[j] === 0) {
                    if (mn === -1 || dist[j][0] < dist[mn][0])
                        mn = j;
                }
            }

            vis[mn] = 1;
            for (let j in graph[mn]) {
                let edge = graph[mn][j];
                if (vis[edge[0]] === 0 && dist[edge[0]][0] > dist[mn][0] + edge[1]) {
                    dist[edge[0]][0] = dist[mn][0] + edge[1];
                    dist[edge[0]][1] = mn;
                }
            }
        }

        return dist;
    }

    function createGraph(data) {
        let graph = [];
        for (let i = 1; i <= V; i++) {
            graph.push([]);
        }

        for (let i = 0; i < data['edges'].length; i++) {
            let edge = data['edges'][i];
            if (edge['type'] === 1)
                continue;
            graph[edge['to'] - 1].push([edge['from'] - 1, parseInt(edge['label'])]);
            graph[edge['from'] - 1].push([edge['to'] - 1, parseInt(edge['label'])]);
        }
        return graph;
    }

    function shouldTakePlane(edges, dist1, dist2, mn_dist) {
        let plane = 0;
        let p1 = -1, p2 = -1;
        for (let pos in edges) {
            let edge = edges[pos];
            if (edge['type'] === 1) {
                let to = edge['to'] - 1;
                let from = edge['from'] - 1;
                let wght = parseInt(edge['label']);
                if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
                    plane = wght;
                    p1 = to;
                    p2 = from;
                    mn_dist = dist1[to][0] + wght + dist2[from][0];
                }
                if (dist2[to][0] + wght + dist1[from][0] < mn_dist) {
                    plane = wght;
                    p2 = to;
                    p1 = from;
                    mn_dist = dist2[to][0] + wght + dist1[from][0];
                }
            }
        }
        return {plane, p1, p2};
    }

    function solveData() {

        const data = currData;

        // Creating adjacency list matrix graph from question data
        const graph = createGraph(data);

        // Applying djikstra from src and dst
        let dist1 = djikstra(graph, V, src - 1);
        let dist2 = djikstra(graph, V, dst - 1);

        // Initialise min_dist to min distance via bus from src to dst
        let mn_dist = dist1[dst - 1][0];

        // See if plane should be used
        let {plane, p1, p2} = shouldTakePlane(data['edges'], dist1, dist2, mn_dist);

        let new_edges = [];
        if (plane !== 0) {
            new_edges.push({
                arrows: {to: {enabled: true}},
                from: p1 + 1,
                to: p2 + 1,
                color: 'green',
                label: String(plane)
            });
            // Using spread operator to push elements of result of pushEdges to new_edges
            new_edges.push(...pushEdges(dist1, p1, false));
            // console.log(new_edges);
            new_edges.push(...pushEdges(dist2, p2, true));
            // console.log(new_edges);
        } else {
            new_edges.push(...pushEdges(dist1, dst - 1, false));
        }
        const ans_data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return ans_data;
    }

    function pushEdges(dist, curr, reverse) {
        let tmp_edges = [];
        while (dist[curr][0] !== 0) {
            let fm = dist[curr][1];
            if (reverse)
                tmp_edges.push({
                    arrows: {to: {enabled: true}},
                    from: curr + 1,
                    to: fm + 1,
                    color: 'orange',
                    label: String(dist[curr][0] - dist[fm][0])
                });
            else
                tmp_edges.push({
                    arrows: {to: {enabled: true}},
                    from: fm + 1,
                    to: curr + 1,
                    color: 'orange',
                    label: String(dist[curr][0] - dist[fm][0])
                });
            curr = fm;
        }
        return tmp_edges;
    }

    genNew.click();
};
