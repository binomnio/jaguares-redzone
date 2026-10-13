import { appendFileSync } from 'node:fs';
const original=globalThis.fetch;
globalThis.fetch=async function(input,init){
 const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 const tracked=url.pathname.startsWith('/rest/v1/'); const start=performance.now();
 try{return await original(input,init);}finally{if(tracked)appendFileSync(process.env.PERF_QUERY_LOG,JSON.stringify({table:url.pathname.split('/').at(-1),ms:Math.round(performance.now()-start)})+'\n');}
};
