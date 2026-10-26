'use strict';
(() => {
 const key='techpath.sidebar.v1',button=document.querySelector('#sidebar-toggle'),sidebar=document.querySelector('#techpath-sidebar'),backdrop=document.querySelector('#sidebar-backdrop');
 if(!button||!sidebar||!backdrop)return;
 let narrow=matchMedia('(max-width:700px)').matches,collapsed=narrow,desktopCollapsed=false;
 try{const saved=localStorage.getItem(key);if(saved==='open'||saved==='closed'){collapsed=saved==='closed';desktopCollapsed=collapsed;}}catch{}
 function paint(){
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  document.body.classList.toggle('sidebar-expanded',!collapsed);
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'Mở thanh điều hướng':'Đóng thanh điều hướng');
  button.title=collapsed?'Mở thanh điều hướng':'Đóng thanh điều hướng';
  sidebar.inert=collapsed;
  backdrop.hidden=collapsed||!matchMedia('(max-width:700px)').matches;
 }
 function set(value){collapsed=value;if(!narrow)desktopCollapsed=value;try{localStorage.setItem(key,collapsed?'closed':'open');}catch{}paint();}
 button.addEventListener('click',event=>{set(!collapsed);if(!collapsed&&event.detail===0)(sidebar.querySelector('nav a[aria-current="page"]')||sidebar.querySelector('a'))?.focus();});
 backdrop.addEventListener('click',()=>{set(true);button.focus();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!collapsed&&(!backdrop.hidden||sidebar.contains(event.target)||event.target===button)&&!document.querySelector('dialog[open]')&&!document.querySelector('#code-completions:not([hidden])')){set(true);button.focus();}});
 window.addEventListener('resize',()=>{const now=matchMedia('(max-width:700px)').matches;if(now!==narrow){if(now){desktopCollapsed=collapsed;collapsed=true;}else collapsed=desktopCollapsed;narrow=now;}paint();});
 paint();
})();
