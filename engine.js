(function(root){
'use strict';
const letters=['a','b','c','d','e','f','g'];
const directed=[['a','b',15],['a','c',2],['a','d',12],['b','e',6],['c','e',8],['c','f',4],['f','d',5],['f','g',10],['e','g',9],['d','g',3],['g','b',4]];
const floydEdges=[['0','2',10],['0','4',30],['0','5',100],['1','2',5],['2','3',50],['3','5',10],['4','3',20],['4','5',60]];
const edgeId=(a,b)=>a+'-'+b;
const clone=x=>Array.isArray(x)?x.map(clone):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,clone(v)])):x;
const fmt=x=>x===Infinity?'∞':String(x);
function route(prev,s,t){let p=[t],u=t;while(u!==s){u=prev[u];if(u===null||u===undefined||p.includes(u))return [];p.unshift(u);}return p;}
function pathEdges(path,undirected=false){return path.slice(1).map((b,i)=>{let a=path[i];if(!undirected)return edgeId(a,b);let e=directed.find(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));return e?edgeId(e[0],e[1]):'';});}
function dijkstra(source='a'){
 const frames=[],state={dist:Object.fromEntries(letters.map(v=>[v,Infinity])),prev:Object.fromEntries(letters.map(v=>[v,null])),settled:[],mst:[]};state.dist[source]=0;
 const add=(x)=>frames.push({...clone(state),...x});
 add({phase:'初始化',title:`从 ${source} 出发，先记录起点`,reason:'起点到自己的距离为 0；其他点还没有已知路径，暂记 ∞。',formula:`dist[${source}] = 0`,line:0,type:'init'});
 while(state.settled.length<letters.length){
  const u=letters.filter(v=>!state.settled.includes(v)).sort((a,b)=>state.dist[a]-state.dist[b]||a.localeCompare(b))[0];
  if(state.dist[u]===Infinity)break;
  const candidates=letters.filter(v=>!state.settled.includes(v)).map(v=>`${v}: ${fmt(state.dist[v])}`).join('，');state.settled.push(u);
  add({phase:'选择顶点',title:`确定 ${u}，最短距离 ${state.dist[u]}`,reason:`未确定点的暂定距离为 ${candidates}。${u} 最小；边权非负，因此现在可以确定它。`,formula:`min dist → ${u}`,current:u,line:1,type:'select'});
  for(const [a,v,w] of directed.filter(e=>e[0]===u)){
   const old=state.dist[v],candidate=state.dist[u]+w,locked=state.settled.includes(v),changed=!locked&&candidate<old;
   if(changed){state.dist[v]=candidate;state.prev[v]=u;}
   add({phase:'检查出边',title:locked?`${v} 已确定，跳过`:changed?`更新 ${v}：${fmt(old)} → ${candidate}`:`保留 ${v} 的距离 ${fmt(old)}`,reason:locked?`${v} 已在确定集合中。本题所有边权非负，无需再次松弛。`:changed?`从 ${source} 到 ${u}，再走 ${u}→${v}，累计距离更小。把 ${v} 的前驱记为 ${u}。`:`经过 ${u} 的距离为 ${candidate}，不小于当前 ${fmt(old)}，所以不用修改。`,formula:`${fmt(state.dist[u])} + ${w} = ${candidate} ${changed?'<':'≥'} ${fmt(old)}`,current:u,focus:[edgeId(a,v)],updated:changed?v:null,line:changed?3:2,type:changed?'update':'keep'});
  }
 }
 add({phase:'完成',title:'所有可达顶点的最短距离已经确定',reason:'点击图中的终点，或使用终点选择器，查看最短路径。距离表保留前驱，路径可逆向恢复。',formula:'从终点沿 prev 倒推，再反转',line:4,type:'done'});
 return frames;
}
function floyd(full=false){
 const n=6,frames=[],matrix=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity)),next=Array.from({length:n},()=>Array(n).fill(null));
 for(const [a,b,w] of floydEdges){matrix[+a][+b]=w;next[+a][+b]=+b;}
 const add=x=>frames.push({matrix:clone(matrix),next:clone(next),settled:[],mst:[],...x});
 const path=(i,j)=>{if(i===j)return [String(i)];if(next[i][j]===null)return [];let p=[String(i)];for(let c=0;i!==j&&c<n;c++){i=next[i][j];p.push(String(i));}return p;};
 add({phase:'初始化',title:'建立全部点对的距离矩阵',reason:'行是起点，列是终点。直接边填权值，没有直接边填 ∞，对角线填 0。',formula:'D[i][i] = 0',type:'init',line:0});
 for(let k=0;k<n;k++){
  let updates=0;
  add({phase:`中间点 k=${k}`,title:`现在允许经过顶点 ${k}`,reason:`当前允许作为内部中间点的集合为 {${Array.from({length:k+1},(_,i)=>i).join(', ')}}。每个点对都比较直接保留与绕经 ${k} 两种方案。`,formula:'D[i][j] = min(D[i][j], D[i][k] + D[k][j])',k,current:String(k),type:'stage',line:1});
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
   let old=matrix[i][j],left=matrix[i][k],right=matrix[k][j],candidate=left+right,changed=candidate<old;
   let candidatePath=left!==Infinity&&right!==Infinity?[...path(i,k),...path(k,j).slice(1)]:[];
   if(changed){matrix[i][j]=candidate;next[i][j]=next[i][k];updates++;}
   if(changed||full)add({phase:`中间点 k=${k}`,title:changed?`${i}→${j} 更新：${fmt(old)} → ${fmt(candidate)}`:`检查 ${i}→${j}：不更新`,reason:changed?`经过 ${k} 可拼接 ${candidatePath.join('→')}，总长度比原记录更小。`:left===Infinity||right===Infinity?`至少一段不可达，无法拼出经过 ${k} 的路径。`:'绕经中间点后的距离没有更短，保留原值。',formula:`min(${fmt(old)}, ${fmt(left)} + ${fmt(right)}) = ${fmt(matrix[i][j])}`,i,j,k,current:String(k),focus:pathEdges(candidatePath),updated:changed?String(j):null,type:changed?'update':'keep',line:changed?3:2});
  }
  add({phase:`k=${k} 阶段完成`,title:`本阶段改善 ${updates} 个距离`,reason:updates?`矩阵已考虑顶点0至${k}作为中间点，继续引入下一个顶点。`:`本轮检查了全部 36 个点对，没有更短路径。没有更新也必须完成这一阶段。`,formula:`允许的中间点：{${Array.from({length:k+1},(_,i)=>i).join(', ')}}`,k,current:String(k),type:'stageEnd',line:1});
 }
 add({phase:'完成',title:'全部点对的最短路径已求出',reason:'点击矩阵中一个距离，查看对应的最短路径。原截图的0→5=70、2→5=∞应更正为60、60。',formula:'0→4→3→5 = 30 + 20 + 10 = 60',type:'done',line:4});return frames;
}
function kruskal(){
 const parent=Object.fromEntries(letters.map(v=>[v,v]));const find=v=>parent[v]===v?v:find(parent[v]);
 const frames=[],mst=[],sorted=directed.map((e,i)=>({e,id:edgeId(e[0],e[1]),i})).sort((a,b)=>a.e[2]-b.e[2]||(a.id==='g-b'?-1:b.id==='g-b'?1:a.i-b.i));
 let total=0,seen=[];
 const components=()=>{let c={};letters.forEach(v=>(c[find(v)]??=[]).push(v));return Object.values(c);};
 const add=x=>frames.push({settled:[],mst:[...mst],seen:[...seen],components:components(),total,sorted:sorted.map(x=>x.e),...x});
 add({phase:'初始化',title:'先将所有边按权值排序',reason:'每个顶点先是一个独立的连通分量。每次只考虑权值最小的下一条边，检查它是否连接不同分量。',formula:'边权顺序：2, 3, 4, 4, 5, 6, 8, 9, 10, 12, 15',line:0,type:'init'});
 for(const {e:[a,b,w],id} of sorted){
  let x=find(a),y=find(b),take=x!==y,already=mst.length===6;seen.push(id);
  if(take){parent[x]=y;mst.push(id);total+=w;}
  add({phase:already?'额外成环验证':'依次检查边',title:take?`选入 ${a}—${b}，权值 ${w}`:`跳过 ${a}—${b}：会形成环`,reason:take?`两个端点属于不同连通分量。加入后连接两棵小树，不会成环。现已选 ${mst.length}/6 条边。`:`两个端点已通过选中的边连通，再加入它就形成环。${already?'最小生成树已完成，本步仅演示为何不再取其他边。':''}`,formula:take?`总权值 ${total-w} + ${w} = ${total}`:`find(${a}) = find(${b})`,focus:[id],current:null,line:take?2:3,type:take?'update':'reject'});
  if(mst.length===6&&!already)add({phase:'生成树完成',title:'6 条边，所有 7 个顶点已连接',reason:'实际算法到这里即可停止。后续几步只是继续检查剩余边，演示成环时为什么必须舍弃。',formula:`2 + 3 + 4 + 4 + 5 + 6 = ${total}`,line:4,type:'complete'});
 }
 add({phase:'完成',title:`最小生成树的总权值是 ${total}`,reason:'选中的边覆盖全部顶点，连通且无环。换用 Prim，选边顺序可能不同，但本题最终边集与总权值相同。',formula:'|T| = |V| − 1 = 6',type:'done',line:4});return frames;
}
function prim(source='a'){
 const frames=[],state={key:Object.fromEntries(letters.map(v=>[v,Infinity])),parent:Object.fromEntries(letters.map(v=>[v,null])),settled:[],mst:[],total:0};state.key[source]=0;
 const add=x=>frames.push({...clone(state),...x});
 add({phase:'初始化',title:`从顶点 ${source} 开始生长一棵树`,reason:'key 记录顶点到当前树的最轻连接边，不是从起点到顶点的累计距离。',formula:`key[${source}]=0；其他 key=∞`,line:0,type:'init'});
 while(state.settled.length<letters.length){
  const u=letters.filter(v=>!state.settled.includes(v)).sort((a,b)=>state.key[a]-state.key[b]||a.localeCompare(b))[0];if(state.key[u]===Infinity)break;
  const origin=state.parent[u],id=origin?pathEdges([origin,u],true)[0]:null;state.settled.push(u);
  if(id){state.mst.push(id);state.total+=state.key[u];}
  add({phase:'扩展当前树',title:id?`通过 ${origin}—${u} 加入 ${u}`:`先把起点 ${u} 放入树`,reason:id?`在当前树与树外的候选连接中，${u} 的 key=${state.key[u]} 最小。新增一条边、一个顶点，总权值 ${state.total}。`:'起点只是生长位置，不计入任何选边权值。',formula:id?`最轻跨集合边：${origin}—${u} (${state.key[u]})`:'U = {'+u+'}',current:u,focus:id?[id]:[],line:1,type:'select'});
  for(const [a,b,w] of directed){
   if(a!==u&&b!==u)continue;let v=a===u?b:a;if(state.settled.includes(v))continue;
   let old=state.key[v],changed=w<old;if(changed){state.key[v]=w;state.parent[v]=u;}
   add({phase:'更新连接边',title:changed?`${v} 的 key：${fmt(old)} → ${w}`:`${v} 保留现有连接`,reason:changed?`${u}—${v} 比之前的连接更轻，把 parent[${v}] 改为 ${u}。这里只比较单条边权，不加上 key[${u}]。`:`边权 ${w} 不小于现有 key=${fmt(old)}，所以不修改。`,formula:`key[${v}] = min(${fmt(old)}, ${w}) = ${fmt(state.key[v])}`,current:u,focus:[edgeId(a,b)],updated:changed?v:null,type:changed?'update':'keep',line:changed?3:2});
  }
 }
 add({phase:'完成',title:`最小生成树总权值 ${state.total}`,reason:'Prim 的边权选择不一定递增。从 a 开始先选 f—d 的5，后选 d—g 的3，因为 d 加入前，d—g 的两端都在树外。',formula:`${state.mst.map(id=>directed.find(e=>edgeId(e[0],e[1])===id)[2]).join(' + ')} = ${state.total}`,type:'done',line:4});return frames;
}
const api={letters,directed,floydEdges,edgeId,clone,fmt,route,pathEdges,dijkstra,floyd,kruskal,prim};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GraphEngine=api;
})(typeof window!=='undefined'?window:globalThis);
