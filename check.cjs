const assert=require('node:assert/strict');
const G=require('./engine.js');
let d=G.dijkstra().at(-1);assert.deepEqual(d.dist,{a:0,b:15,c:2,d:11,e:10,f:6,g:14});assert.deepEqual(d.settled,['a','c','f','e','d','g','b']);assert.deepEqual(G.route(d.prev,'a','g'),['a','c','f','d','g']);
let expected=[[0,Infinity,10,50,30,60],[Infinity,0,5,55,Infinity,65],[Infinity,Infinity,0,50,Infinity,60],[Infinity,Infinity,Infinity,0,Infinity,10],[Infinity,Infinity,Infinity,20,0,30],[Infinity,Infinity,Infinity,Infinity,Infinity,0]];
for(const full of [false,true]){let fs=G.floyd(full);assert.deepEqual(fs.at(-1).matrix,expected);assert.equal(fs.filter(x=>x.type==='update').length,8);assert.equal(fs.filter(x=>x.type==='stage').length,6);}
const undirected=G.directed.flatMap(([a,b,w])=>[[a,b,w],[b,a,w]]);
// 独立穷举简单路径，核验每个源点的全部距离。
for(const s of G.letters){let oracle=Object.fromEntries(G.letters.map(v=>[v,Infinity]));function visit(v,c,seen){oracle[v]=Math.min(oracle[v],c);for(const [a,b,w] of G.directed)if(a===v&&!seen.has(b))visit(b,c+w,new Set([...seen,b]));}visit(s,0,new Set([s]));assert.deepEqual(G.dijkstra(s).at(-1).dist,oracle);}
const k=G.kruskal().at(-1);assert.equal(k.total,24);assert.equal(k.mst.length,6);assert.equal(G.kruskal().filter(f=>f.type==='reject').length,5);
for(const s of G.letters){const p=G.prim(s).at(-1);assert.equal(p.total,24);assert.equal(p.mst.length,6);assert.equal(p.settled.length,7);assert.deepEqual([...p.mst].sort(),[...k.mst].sort());}
// 历史帧必须保留原状态，后续更新不能篡改之前的步骤。
const history=G.dijkstra();assert.equal(history[0].dist.c,Infinity);assert.equal(history.at(-1).dist.c,2);
console.log('PASS: Dijkstra 各源点、Floyd 两种模式、Prim 各起点、Kruskal 成环与历史状态核验。');
