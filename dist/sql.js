'use strict';
(() => {
 const base=['127.0.0.1','localhost'].includes(location.hostname)?location.origin:'http://127.0.0.1:4173';
 let token=null,controller=null;
 window.TechPathSql={
  async run(code,lessonId){
   if(controller)throw new Error('Một query đang chạy. Chờ hoặc bấm Dừng.');
   controller=new AbortController();
   try{
    if(!token){const r=await fetch(base+'/api/sql/status',{signal:controller.signal});const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'Chưa kết nối được SQL lab.');token=data.token;}
    const response=await fetch(base+'/api/sql/run',{method:'POST',headers:{'Content-Type':'application/json','X-TechPath-Token':token},body:JSON.stringify({clientId:window.TechPathTutor.identity(),lessonId,code}),signal:controller.signal});
    const data=await response.json();if(!response.ok){if(response.status===403)token=null;throw new Error(data.error||'Chưa chạy được query.');}return data;
   }catch(error){if(error.name==='AbortError')throw new Error('Đã dừng chạy SQL.');if(error instanceof TypeError)throw new Error('Chưa kết nối được bộ SQL lab trên máy. Chạy Start-TechPath.cmd; nếu trình duyệt chặn mạng cục bộ, mở bản local 127.0.0.1:4173.');throw error;}
   finally{controller=null;}
  },
  stop(){controller?.abort();}
 };
})();
