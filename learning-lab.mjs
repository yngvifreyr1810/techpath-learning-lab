import {randomBytes} from 'node:crypto';
import {curriculum} from './curriculum.mjs';
const token=randomBytes(32).toString('hex');
import {gradeKnowledge as grade} from './knowledge-grading.mjs';
export const gradeKnowledge=(id,answers)=>grade(curriculum,id,answers);
export async function learningRoute(req,res,pathname){
 if(!pathname.startsWith('/api/learning/'))return false;
 const json=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 if(pathname==='/api/learning/status'&&req.method==='GET'){json(200,{ok:true,token,version:curriculum.roadmap.version});return true;}
 if(pathname!=='/api/learning/check'||req.method!=='POST'){json(404,{error:'Không có thao tác học này.'});return true;}
 if(req.headers['x-techpath-token']!==token){json(403,{error:'Kết nối hết hạn. Thử kiểm tra lại.'});return true;}
 if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần dữ liệu JSON.'});return true;}
 try{
  let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>16384){json(413,{error:'Dữ liệu quá dài.'});return true;}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  json(200,gradeKnowledge(data.id,data.answers));
 }catch(error){json(400,{error:error.message});}
 return true;
}
