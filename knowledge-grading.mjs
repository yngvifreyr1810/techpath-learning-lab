export function gradeKnowledge(curriculum,id,answers){
 const match=/^week-(\d+)$/.exec(id);
 const week=match&&curriculum.roadmap.weeks.find(w=>w.number===Number(match[1])&&w.available);
 const lesson=curriculum.lessons.find(l=>l.id===id&&l.kind==='knowledge');
 const questions=week?.checkpoint?.questions||lesson?.questions;
 if(!questions)throw new Error('Bài kiểm tra chưa có hoặc không hợp lệ.');
 if(!Array.isArray(answers)||answers.length!==questions.length||answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=questions[i].options.length))throw new Error('Chọn một đáp án cho mỗi câu trước khi kiểm tra.');
 const cases=questions.map((q,i)=>({prompt:q.prompt,passed:answers[i]===q.answer,actual:q.options[answers[i]],expected:q.options[q.answer],explanation:q.explanation,review:q.review}));
 const score=cases.filter(c=>c.passed).length,threshold=week?4:questions.length;
 return {id,version:lesson?.contentVersion||curriculum.roadmap.version,at:new Date().toISOString(),score,total:questions.length,threshold,passed:score>=threshold,cases};
}
