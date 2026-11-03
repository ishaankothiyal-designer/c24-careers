// Review-host adapter only. Vercel production continues to use api/*.
const LIVE_ORIGIN = 'https://c24-careers-chi.vercel.app';
const json = (error,status) => Response.json({error},{status,headers:{'Cache-Control':'no-store'}});

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/')) {
      // Never forward cookies, authorization headers, or application payloads.
      if(!['GET','HEAD'].includes(request.method)) return json('This is a review preview. Submit applications on the live careers website.',403);
      if(!/^\/api\/jobs(?:\/[A-Za-z0-9_-]{1,80})?\/?$/.test(url.pathname)) return json('Preview endpoint not found.',404);
      const controller=typeof AbortController==='function'?new AbortController():null;
      const timer=controller?setTimeout(()=>controller.abort(),15000):null;
      try {
        const response=await fetch(new URL(url.pathname,LIVE_ORIGIN).href,{
          method:request.method,headers:{Accept:'application/json'},redirect:'error',...(controller?{signal:controller.signal}:{}),
        });
        if(!response.headers.get('content-type')?.includes('application/json')) {
          console.error('preview_jobs_non_json',JSON.stringify({path:url.pathname,status:response.status}));
          return json('Live job details are temporarily unavailable in the review preview.',502);
        }
        return new Response(response.body,{status:response.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      } catch(error) {
        console.error('preview_jobs_fetch_failed',JSON.stringify({path:url.pathname,name:error.name,message:String(error.message).slice(0,180)}));
        return json('Live job details are temporarily unavailable in the review preview.',502);
      } finally { if(timer)clearTimeout(timer); }
    }
    const response=await env.ASSETS.fetch(request);
    if(response.status!==404 || !request.headers.get('accept')?.includes('text/html') || !['GET','HEAD'].includes(request.method))return response;
    url.pathname='/index.html';url.search='';
    return env.ASSETS.fetch(new Request(url,request));
  },
};
