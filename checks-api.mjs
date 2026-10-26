import assert from 'node:assert/strict';
import {curriculum} from './curriculum.mjs';
import {runApi,judgeApi} from './api-lab.mjs';
const lessons=curriculum.lessons.filter(l=>l.module==='api');assert.equal(lessons.length,12);
for(const l of lessons){
 assert.equal(l.hints.length,3);assert.equal(l.groupStep,lessons.indexOf(l)%3+1);
 const result=runApi(l.apiRequest);assert.equal(result.ok,true);assert.equal(result.response.status,l.expectedStatus,l.id);assert.equal(judgeApi(l.apiRequest,result,l.id).verdict,'pass',l.id);assert.equal(result.judge,undefined);
 const wrong={...l.apiRequest,path:'/hello'};if(l.id!=='api-get-hello')assert.equal(judgeApi(wrong,runApi(wrong),l.id).verdict,'retry');
 assert.equal(judgeApi(l.apiRequest,{...result,response:{...result.response,status:500}},l.id).verdict,'retry');
}
const request=(path,body='',contentType='',method='GET')=>({method,path,body,contentType});
for(const target of ['https://example.com','//example.com','/\\example.com','/hello#fragment'])assert.equal(runApi(request(target)).ok,false);
assert.equal(runApi(request('/notes','{"title":','application/json','POST')).response.body.error,'INVALID_JSON');
assert.equal(runApi(request('/notes','{}','application/json','POST')).response.body.error,'MISSING_TITLE');
assert.equal(runApi(request('/notes','{"title":"abc"}','','POST')).response.status,415);
assert.equal(runApi(request('/hello','{}')).response.body.error,'UNEXPECTED_BODY');
assert.equal(runApi(request('/hello','','','DELETE')).response.status,405);
const missing=lessons.find(l=>l.id==='api-status-not-found');assert.equal(judgeApi(missing.apiRequest,runApi(missing.apiRequest),missing.id).verdict,'pass');
const note=lessons.find(l=>l.id==='api-post-note'),spaced={...note.apiRequest,body:'{ "title" : "Mua vở" }'};
assert.equal(judgeApi(spaced,runApi(spaced),note.id).verdict,'pass');assert.equal(runApi(note.apiRequest).response.body.id,1);assert.equal(runApi(note.apiRequest).response.body.id,1);
assert.throws(()=>judgeApi(note.apiRequest,runApi(note.apiRequest),'python-basic-print'));
console.log('PASS: 12 API exercises, deterministic isolated responses, semantic JSON judge, 404 lesson, invalid JSON, 405/415, invalid paths and no external requests.');
