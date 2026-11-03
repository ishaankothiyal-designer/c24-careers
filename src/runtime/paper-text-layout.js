// Fit ink to the existing paper texture. The sheet and readable DOM typography
// stay unchanged; all paragraphs and the signature are retained in the layout.
export function fitPaperText(blocks, box, measure) {
  const maxWidth=Math.max(1,box.width-box.paddingInline*2);
  const bottom=box.height-box.paddingBottom;
  const layout=scale=>{
    const lines=[];let y=box.paddingTop,totalWidth=0;
    for(const block of blocks){
      const fontSize=block.fontSize*scale;
      const font=`${block.fontWeight} ${fontSize}px ${block.fontFamily}`;
      const spacing=`${(parseFloat(block.spacing)||0)*scale}px`;
      const metrics={font,fontSize,spacing};
      const lineHeight=block.lineHeight*scale;
      y+=block.marginTop*scale;
      let line='';
      const append=()=>{
        if(!line)return;
        const width=measure(line,metrics);
        lines.push({line,y,width,lineHeight,font,color:block.color,spacing,signature:block.signature,body:block.body});
        if(block.body)totalWidth+=width;
        y+=lineHeight;line='';
      };
      for(const word of block.text.trim().split(/\s+/).filter(Boolean)){
        const candidate=line?line+' '+word:word;
        if(line && measure(candidate,metrics)>maxWidth)append();
        line=line?line+' '+word:word;
      }
      append();y+=block.marginBottom*scale;
    }
    return {lines,totalWidth,inkBottom:y,scale,fits:y<=bottom};
  };
  const natural=layout(1);
  if(natural.fits)return natural;
  let low=.1,high=1,best=layout(low);
  for(let i=0;i<12;i++){
    const middle=(low+high)/2,result=layout(middle);
    if(result.fits){low=middle;best=result;}else high=middle;
  }
  return best;
}
