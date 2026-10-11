'use strict';
const G=window.GraphEngine,$=id=>document.getElementById(id);
const descriptions={
 dijkstra:{title:'Dijkstra · 找到从起点出发的最短路',note:'讲义例题 A / 有向图 / 所有边权非负',badge:'单源 · 非负边权',data:'距离与前驱',hint:'每一步结束后的状态',pitfallTitle:'选的是累计距离最小的点，不是权值最小的边',pitfall:'到 g 的距离会先变成16，再经 d 改善为14。不要看到一条候选路径，就认为答案已经确定。表中“已确定”才代表本次算法已经完成该点。',code:['起点距离 = 0，其余 = ∞','选 dist 最小的未确定点 u','检查 u 的每条出边 u→v','更短时更新 dist[v] 与 prev[v]','确定全部可达点，恢复路径']},
 floyd:{title:'Floyd · 试着绕经一个中间点',note:'讲义例题 B / 有向图 / 中间点顺序 0→1→2→3→4→5',badge:'全部点对 · 矩阵递推',data:'全部点对距离矩阵',hint:'点击单元格查看路径',pitfallTitle:'70 是中间阶段的结果，还不是最终答案',pitfall:'0→5 在 k=3 时得到70，允许经过4后降为60。原截图的0→5=70、2→5=∞已校正为60、60；对角线统一采用标准的0。',code:['直接边填权值，对角线填 0','依次允许中间点 k（最外层）','遍历每个起点 i 与终点 j','比较 D[i][k]+D[k][j]，更短则更新','处理完全部 k，得到最终矩阵']},
 kruskal:{title:'Kruskal · 用最轻的边连接不同分量',note:'讲义补充例题 C / 截图1去掉方向后的无向图',badge:'无向 · 按边排序',data:'候选边与连通分量',hint:'绿色已选 / 灰色舍弃',pitfallTitle:'最小的 n−1 条边，不一定就能构成最小生成树',pitfall:'每次都要检查两个端点是否已连通。本例恰好前6条边都能选，之后已得到生成树；我们继续演示其余边为何会成环，实际算法可以提前停止。',code:['将全图的边按权值升序排序','依次取出下一条候选边','端点属于不同分量：选边、合并','端点已经连通：舍弃成环边','选够 n−1 条边即可结束']},
 prim:{title:'Prim · 让一棵树慢慢向外生长',note:'讲义补充例题 C / 同一无向图 / 起点可切换',badge:'无向 · 扩展当前树',data:'最轻连接边与父节点',hint:'key 是一条边的权值',pitfallTitle:'Prim 的 key 不是 Dijkstra 的 dist',pitfall:'Prim 只比较把新顶点接入树的一条边。更新时不用加 key[u]。先选权值5、后选权值3也合理：d 加入前，d—g 的两端都还在树外。',code:['起点 key=0，其余 key=∞','选最小 key 的树外点 u，加入树','检查新顶点连接的树外邻点','边更轻时：key[v]=w，parent[v]=u','所有顶点入树，求边权总和']}
};
let algo='dijkstra',frames=[],position=0,timer=null,queryStart='0',queryEnd='5';
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function pause(){if(timer){clearInterval(timer);timer=null;}$('play').textContent='▶ 自动播放';}
function chooseAlgorithm(name){pause();algo=name;document.querySelectorAll('[data-algo]').forEach(b=>{let on=b.dataset.algo===name;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
 const d=descriptions[name];$('algoTitle').textContent=d.title;$('graphNote').textContent=d.note;$('graphBadge').textContent=d.badge;$('dataTitle').textContent=d.data;$('dataHint').textContent=d.hint;$('pitfallTitle').textContent=d.pitfallTitle;$('pitfall').textContent=d.pitfall;
 const vertices=name==='floyd'?['0','1','2','3','4','5']:G.letters;
 $('source').innerHTML=vertices.map(v=>`<option value="${v}">${v}</option>`).join('');$('target').innerHTML=vertices.map(v=>`<option value="${v}">${v}</option>`).join('');
 $('source').value=name==='floyd'?queryStart:'a';$('target').value=name==='floyd'?queryEnd:'g';
 $('sourceWrap').classList.toggle('hidden',name==='kruskal');$('targetWrap').classList.toggle('hidden',['kruskal','prim'].includes(name));$('fullWrap').classList.toggle('hidden',name!=='floyd');
 $('sourceWrap').firstChild.textContent=name==='floyd'?'路径起点 ':'起点 ';$('source').setAttribute('aria-label',name==='floyd'?'路径起点':'起点');
 rebuild();}
function rebuild(){pause();frames=algo==='floyd'?G.floyd($('fullFloyd').checked):algo==='kruskal'?G.kruskal():algo==='prim'?G.prim($('source').value):G.dijkstra($('source').value);position=0;$('scrubber').max=frames.length-1;render();}
function go(index){position=Math.max(0,Math.min(index,frames.length-1));if(position===frames.length-1)pause();render();}
function play(){if(timer){pause();return;}if(position===frames.length-1)position=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>go(position+1),Number($('speed').value));}
function currentPath(state){
 if(algo==='dijkstra')return G.route(state.prev,$('source').value,$('target').value);
 if(algo==='floyd'){
  let i=+$('source').value,j=+$('target').value;if(i===j)return [String(i)];if(state.next[i][j]===null)return [];
  const p=[String(i)];for(let n=0;i!==j&&n<7;n++){i=state.next[i][j];p.push(String(i));}return i===j?p:[];
 }return [];
}
function drawGraph(state){
 const directed=algo==='dijkstra'||algo==='floyd',isFloyd=algo==='floyd';
 const vertices=isFloyd?['0','1','2','3','4','5']:G.letters,edges=isFloyd?G.floydEdges:G.directed;
 const pos=isFloyd?{'0':[80,150],'1':[80,345],'2':[300,345],'3':[535,345],'4':[535,150],'5':[305,65]}:{a:[70,225],b:[205,90],c:[290,225],d:[200,360],e:[455,135],f:[455,330],g:[625,235]};
 const labels=isFloyd?{'0-2':[180,250],'0-4':[300,127],'0-5':[182,84],'1-2':[188,370],'2-3':[417,319],'3-5':[409,205],'4-3':[568,253],'4-5':[428,79]}:{'a-b':[121,143],'a-c':[181,200],'a-d':[123,309],'b-e':[330,91],'c-e':[354,165],'c-f':[358,285],'f-d':[319,360],'f-g':[548,310],'e-g':[556,163],'d-g':[459,417],'g-b':[446,37]};
 const route=currentPath(state),pathSet=new Set(G.pathEdges(route)),mstSet=new Set(state.mst??[]),focus=new Set(state.focus??[]);
 let svg='<svg viewBox="0 0 700 460" role="img" aria-label="算法当前步骤的图形"><defs>';
 for(const [name,color] of [['normal','#b5c0b8'],['accepted','#1a6c58'],['focus','#d99730'],['reject','#c66a61']])svg+=`<marker id="arr-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`;
 svg+='</defs>';
 const edgeParts=[];
 for(const [a,b,w] of edges){
  const id=G.edgeId(a,b),active=focus.has(id),accepted=mstSet.has(id)||pathSet.has(id),reject=active&&state.type==='reject';let color=reject?'#c66a61':active?'#d99730':accepted?'#1a6c58':'#b5c0b8',kind=reject?'reject':active?'focus':accepted?'accepted':'normal';
  const [x1,y1]=pos[a],[x2,y2]=pos[b],dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),radius=25;
  let path=`M ${x1+dx/len*radius} ${y1+dy/len*radius} L ${x2-dx/len*(radius+3)} ${y2-dy/len*(radius+3)}`;
  if(!isFloyd&&id==='g-b')path='M 625 210 C 631 5, 340 -2, 208 62';
  if(!isFloyd&&id==='d-g')path='M 222 374 C 420 464, 635 432, 627 264';
  const [lx,ly]=labels[id];
  edgeParts.push({rank:active?2:accepted?1:0,html:`<path d="${path}" fill="none" stroke="${color}" stroke-width="${active||accepted?3.5:1.6}" ${reject?'stroke-dasharray="5 4"':''} ${directed?`marker-end="url(#arr-${kind})"`:''}/><rect x="${lx-16}" y="${ly-13}" width="32" height="26" rx="5" fill="white"/><text x="${lx}" y="${ly+5}" text-anchor="middle" fill="${active||accepted?color:'#7f8f83'}" font-size="16" font-weight="${active||accepted?'600':'400'}">${w}</text>`});
 }
 svg+=edgeParts.sort((a,b)=>a.rank-b.rank).map(e=>e.html).join('');
 for(const v of vertices){
  const [x,y]=pos[v],current=state.current===v,fixed=(state.settled??[]).includes(v),updated=state.updated===v;
  let fill=current?'#fff1d5':fixed?'#1a6c58':updated?'#e4f1e9':'#f8faf6',stroke=current?'#d99730':fixed||updated?'#1a6c58':'#b8c6ba',ink=fixed&&!current?'#fff':current?'#b07824':'#355345';
  let value=algo==='dijkstra'?state.dist[v]:algo==='prim'?state.key[v]:null;
  svg+=`<g class="graph-node" data-node="${v}" ${['dijkstra','floyd'].includes(algo)?`role="button" tabindex="0" aria-label="查看终点${v}的路径"`:''}><circle cx="${x}" cy="${y}" r="24" fill="${fill}" stroke="${stroke}" stroke-width="${current?3:1.8}"/><text x="${x}" y="${y+7}" text-anchor="middle" font-size="21" fill="${ink}" font-weight="500">${v}</text>${value!==null?`<text x="${x}" y="${y+47}" text-anchor="middle" font-size="11" fill="${fixed?'#1a6c58':'#7f8f83'}">${algo==='prim'?'key':'dist'} ${G.fmt(value)}</text>`:''}</g>`;
 }
 svg+='</svg>';$('graph').innerHTML=svg;
 $('graph').querySelectorAll('[data-node]').forEach(n=>{if(!['dijkstra','floyd'].includes(algo))return;const activate=()=>{$('target').value=n.dataset.node;if(algo==='floyd')queryEnd=n.dataset.node;render();};n.addEventListener('click',activate);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
 let info='';
 if(algo==='dijkstra'||algo==='floyd'){
  let distance=algo==='dijkstra'?state.dist[$('target').value]:state.matrix[+$('source').value][+$('target').value];
  let definite=state.type==='done'||(algo==='dijkstra'&&state.settled.includes($('target').value));
  info=route.length?`${definite?'最短路径':'当前已知路径'}：${route.join(' → ')} · ${definite?'距离':'暂定距离'} ${G.fmt(distance)}`:`${$('source').value} → ${$('target').value}：${state.type==='done'?'不可达':'尚无已知路径'}`;
 }else info=`当前选中 ${state.mst.length}/6 条边 · 总权值 ${state.total}`;
 $('pathInfo').textContent=info;
}
function renderTable(state){
 let html='';
 if(algo==='floyd'){
  html='<table><thead><tr><th>起点 / 终点</th>'+Array.from({length:6},(_,i)=>`<th>${i}</th>`).join('')+'</tr></thead><tbody>';
  state.matrix.forEach((r,i)=>{html+=`<tr><th>${i}</th>`+r.map((v,j)=>{let updated=state.type==='update'&&i===state.i&&j===state.j,operand=(i===state.i&&j===state.k)||(i===state.k&&j===state.j);return `<td class="matrix-cell ${updated?'updated':operand?'operand':''}" data-i="${i}" data-j="${j}" tabindex="0" role="button" aria-label="查看${i}到${j}的路径，距离${G.fmt(v)}">${G.fmt(v)}</td>`;}).join('')+'</tr>';});html+='</tbody></table>';
  $('dataFoot').textContent='绿色：本次改善的距离；淡蓝：参与比较的两个矩阵元素。行表示起点，列表示终点。';
 }else if(algo==='kruskal'){
  html='<table><thead><tr><th>边</th><th>权值</th><th>处理结果</th></tr></thead><tbody>';
  state.sorted.forEach(([a,b,w])=>{let id=G.edgeId(a,b),selected=state.mst.includes(id),seen=state.seen.includes(id),active=(state.focus??[]).includes(id);html+=`<tr class="${active?'row-current':''}"><td>${a}—${b}</td><td>${w}</td><td class="${selected?'fixed':''}">${selected?'✓ 已选入':seen?'舍弃：成环':'待检查'}</td></tr>`;});html+='</tbody></table>';
  $('dataFoot').textContent='当前连通分量：'+state.components.map(c=>'{'+c.join(',')+'}').join('  ');
 }else{
  let prim=algo==='prim';html=`<table><thead><tr><th>顶点</th><th>${prim?'key（单边权）':'dist（累计距离）'}</th><th>${prim?'parent':'prev'}</th><th>状态</th></tr></thead><tbody>`;
  G.letters.forEach(v=>{let fixed=state.settled.includes(v),active=state.current===v,updated=state.updated===v;html+=`<tr class="${active?'row-current':''}"><td>${v}</td><td class="${updated?'updated':fixed?'fixed':''}">${G.fmt(prim?state.key[v]:state.dist[v])}</td><td>${(prim?state.parent[v]:state.prev[v])??'—'}</td><td class="${fixed?'fixed':''}">${fixed?prim?'已入树':'已确定':'暂定'}</td></tr>`;});html+='</tbody></table>';
  $('dataFoot').textContent=prim?'key[v] 只是一条连接边的权值。起点的0不计入选边总权值。':'dist 从源点累计求和；prev 用于从终点倒推路径。显示本步骤结束后的状态。';
 }
 $('dataTable').innerHTML=html;
 $('dataTable').querySelectorAll('[data-i]').forEach(c=>{const activate=()=>{queryStart=c.dataset.i;queryEnd=c.dataset.j;$('source').value=queryStart;$('target').value=queryEnd;render();};c.addEventListener('click',activate);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
}
function render(){
 const state=frames[position],d=descriptions[algo];$('phase').textContent=state.phase;$('stepTitle').textContent=state.title;$('reason').textContent=state.reason;$('formula').textContent=state.formula;
 $('pseudocode').innerHTML=d.code.map((t,i)=>`<li class="${i===state.line?'highlight':''}">${escapeText(t)}</li>`).join('');
 $('setInfo').textContent=algo==='kruskal'?`连通分量数：${state.components.length} · 已选边：${state.mst.length}`:algo==='floyd'?`中间点 k：${state.k??'—'} · ${$('fullFloyd').checked?'完整比较模式':'关键变化模式'}`:`${algo==='prim'?'已入树 U':'已确定 S'} = {${state.settled.join(', ')}}`;
 $('stepCount').textContent=`${position+1} / ${frames.length}`;$('scrubber').value=position;$('prev').disabled=position===0;$('next').disabled=position===frames.length-1;$('reset').disabled=position===0;
 drawGraph(state);renderTable(state);
 $('timeline').innerHTML=frames.slice(0,position+1).map((f,i)=>`<button class="${i===position?'current':''}" data-step="${i}"><span class="step-num">${String(i+1).padStart(2,'0')}</span><span>${escapeText(f.title)}</span></button>`).join('');
 $('timeline').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{pause();go(+b.dataset.step);}));$('timeline').scrollTop=$('timeline').scrollHeight;
}
document.querySelectorAll('[data-algo]').forEach(b=>b.addEventListener('click',()=>chooseAlgorithm(b.dataset.algo)));
$('prev').addEventListener('click',()=>{pause();go(position-1);});$('next').addEventListener('click',()=>{pause();go(position+1);});$('reset').addEventListener('click',()=>{pause();go(0);});$('finish').addEventListener('click',()=>{pause();go(frames.length-1);});$('play').addEventListener('click',play);
$('scrubber').addEventListener('input',e=>{pause();go(+e.target.value);});$('speed').addEventListener('change',()=>{if(timer){pause();play();}});
$('source').addEventListener('change',()=>{if(algo==='floyd'){queryStart=$('source').value;render();}else rebuild();});$('target').addEventListener('change',()=>{if(algo==='floyd')queryEnd=$('target').value;render();});$('fullFloyd').addEventListener('change',rebuild);
$('theoryBtn').addEventListener('click',()=>$('theory').showModal());$('closeTheory').addEventListener('click',()=>$('theory').close());$('theory').addEventListener('click',e=>{if(e.target===$('theory')){let r=$('theory').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('theory').close();}});
document.addEventListener('keydown',e=>{if($('theory').open||['SELECT','INPUT','BUTTON','SUMMARY','A'].includes(e.target.tagName)||e.target.isContentEditable)return;if(e.key==='ArrowRight'){e.preventDefault();pause();go(position+1);}if(e.key==='ArrowLeft'){e.preventDefault();pause();go(position-1);}if(e.code==='Space'){e.preventDefault();play();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
chooseAlgorithm('dijkstra');
