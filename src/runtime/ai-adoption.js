// User-reported adoption estimates, supplied 20 October 2026.
// Intermediate check-ins are illustrative estimates explicitly supplied by the user.
// Quarter markers use their period start for placement, not an exact observation date.
export const AI_PEOPLE_SERIES = [
  { date:'2025-06-18', label:'18 June 2025', value:20, display:'~20' },
  { date:'2025-12-31', label:'End of 2025', value:50, display:'~50' },
  { date:'2026-07-01', label:'Q3 2026', value:120, display:'~120' },
  { date:'2026-10-20', label:'20 October 2026', value:200, display:'200+' },
];

export function initializeAiAdoption() {
  const host=document.querySelector('[data-ai-adoption]');
  if(!host)return;
  const plot=host.querySelector('[data-ai-adoption-plot]');
  const make=(tag,attributes={},text)=>{
    const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
    for(const [name,value]of Object.entries(attributes))node.setAttribute(name,String(value));
    if(text!==undefined)node.textContent=text;
    return node;
  };
  const draw=()=>{
    const width=Math.max(260,plot.clientWidth),mobile=width<600;
    const height=mobile?300:360,left=34,right=12,top=42,bottom=height-46;
    const start=Date.parse(AI_PEOPLE_SERIES[0].date),end=Date.parse(AI_PEOPLE_SERIES.at(-1).date);
    const x=date=>left+(Date.parse(date)-start)/(end-start)*(width-left-right);
    const y=value=>bottom-value/250*(bottom-top);
    const svg=make('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':'People using agentic workflows. User-supplied estimates: around 20 on 18 June 2025; around 50 at the end of 2025; around 120 in Q3 2026; more than 200 as of 20 October 2026. The Q3 check-in is illustrative and positioned at the start of the quarter. Vertical axis starts at zero.'});
    const defs=make('defs'),gradient=make('linearGradient',{id:'ai-build-area',x1:0,y1:0,x2:0,y2:1});
    gradient.append(make('stop',{class:'line__grad-a',offset:'0%'}),make('stop',{class:'line__grad-b',offset:'100%'}));defs.append(gradient);svg.append(defs);
    svg.append(make('text',{class:'line__unit',x:0,y:16},'People using agentic workflows'));
    for(const value of [0,50,100,150,200,250]){
      svg.append(make('line',{class:'line__grid',x1:left,x2:width-right,y1:y(value),y2:y(value)}),make('text',{class:'line__ytick',x:left-10,y:y(value)+4,'text-anchor':'end'},value));
    }
    const points=AI_PEOPLE_SERIES.map(point=>({x:x(point.date),y:y(point.value),...point}));
    const path=points.map((point,index)=>`${index?'L':'M'} ${point.x} ${point.y}`).join(' ');
    svg.append(make('path',{d:`${path} L ${points.at(-1).x} ${bottom} L ${points[0].x} ${bottom} Z`,fill:'url(#ai-build-area)'}),make('path',{class:'line__path',d:path,fill:'none','stroke-width':2.5,'stroke-linecap':'round'}));
    points.forEach((point,index)=>{
      const endpoint=index===0||index===points.length-1;
      const anchor=index===0?'start':index===points.length-1||point.x>width-90?'end':'middle';
      const dot=make('circle',{class:'line__dot',cx:point.x,cy:point.y,r:5});
      dot.append(make('title',{},`${point.label}: ${point.display} people`));
      svg.append(dot,make('text',{class:'line__vlabel',x:point.x,y:point.y-14,'text-anchor':anchor},point.display),make('text',{class:'line__xtick',x:point.x,y:endpoint?height-15:point.y+22,'text-anchor':anchor},point.label));
    });
    plot.replaceChildren(svg);
  };
  new ResizeObserver(draw).observe(plot);draw();
}
