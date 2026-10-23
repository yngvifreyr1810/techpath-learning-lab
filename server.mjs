import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {tutorRoute,closeTutor} from './tutor-http.mjs';
import {sqlRoute} from './sql-lab.mjs';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
 try{
  const host=req.headers.host;
  const allowed=new Set([`http://127.0.0.1:${port}`,`http://localhost:${port}`,'https://an-techpath-lab.creamyeft24.chatgpt.site']);
  if(!new Set([`127.0.0.1:${port}`,`localhost:${port}`]).has(host)||(req.headers.origin&&!allowed.has(req.headers.origin))){res.writeHead(403);res.end('Forbidden');return;}
  if(req.headers.origin){res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-TechPath-Token','Access-Control-Allow-Private-Network':'true'});res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/api/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({app:'techpath',protocol:1,pid:process.pid}));return;}
  if(await tutorRoute(req,res,pathname))return;
  if(await sqlRoute(req,res,pathname))return;
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const body=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`TechPath: http://localhost:${port}`));
process.on('SIGINT',()=>{closeTutor();process.exit(0);});
process.on('SIGTERM',()=>{closeTutor();process.exit(0);});
