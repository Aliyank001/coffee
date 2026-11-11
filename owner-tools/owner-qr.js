'use strict';
(() => {
  const A=window.Aroma,$=s=>document.querySelector(s);
  const defaultURL='';
  const storageKey='aroma.owner.public-menu-url';
  let currentURL='',svg='',ready=false;
  if(!['localhost','127.0.0.1','[::1]',''].includes(location.hostname)){
    document.querySelector('main').textContent='This owner tool is local only. Run npm run owner on your computer.';
    return;
  }
  const urlInput=$('#site-url');
  try{urlInput.value=localStorage.getItem(storageKey)||defaultURL;}catch{urlInput.value=defaultURL;}
  function state(value){ready=value;['#download-qr','#print-qr','#copy-qr'].forEach(s=>$(s).disabled=!value);}
  function dirty(){state(false);$('#qr-status').textContent='Update the preview to apply your changes.';$('#test-qr').hidden=true;}
  function update(){
    try{
      const table=$('#qr-type').value==='table'?$('#qr-table').value:'';
      const destination=A.menuUrl(urlInput.value,table);
      if(destination.length>700)throw new Error('Please use a shorter website URL.');
      const qr=qrcode(0,'M');qr.addData(destination,'Byte');qr.make();
      svg=qr.createSvgTag({cellSize:5,margin:20,scalable:true}).replace('<svg ','<svg role="img" aria-label="Customer menu QR code" ');
      currentURL=destination;$('#studio-qr').innerHTML=svg;
      $('#qr-caption').textContent=table?`TABLE ${Number(table)} · SCAN TO ORDER`:'SCAN TO EXPLORE OUR MENU';
      $('#qr-destination').textContent=destination;$('#test-qr').href=destination;$('#test-qr').hidden=false;document.querySelectorAll('[data-menu-link]').forEach(link=>{link.href=destination;link.hidden=false;});
      const local=['localhost','127.0.0.1','[::1]'].includes(new URL(destination).hostname);
      $('#qr-notice').textContent=local?'This is a localhost address. Customers’ phones cannot reach it. Enter the final public website URL before printing.':'Customers will open the menu, not this owner tool. Use a public URL accessible without sign-in; test a phone scan before printing. ';
      try{localStorage.setItem(storageKey,urlInput.value);}catch{}
      $('#qr-status').textContent='QR ready: customer menu'+(table?` · Table ${Number(table)}`:'')+'.';state(true);
    }catch(error){state(false);$('#test-qr').hidden=true;$('#qr-status').textContent=error.message;}
  }
  $('#qr-table').disabled=true;
  $('#qr-type').addEventListener('change',()=>{const table=$('#qr-type').value==='table';$('#qr-table-label').hidden=!table;$('#qr-table').disabled=!table;dirty();});
  urlInput.addEventListener('input',dirty);$('#qr-table').addEventListener('input',dirty);
  $('#qr-form').addEventListener('submit',event=>{event.preventDefault();update();});
  $('#download-qr').addEventListener('click',()=>{if(!ready)return;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download='cafe-aroma-'+($('#qr-type').value==='table'?'table-'+$('#qr-table').value:'menu')+'.svg';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#print-qr').addEventListener('click',()=>{if(ready)window.print();});
  $('#copy-qr').addEventListener('click',async()=>{if(!ready)return;try{await navigator.clipboard.writeText(currentURL);$('#qr-status').textContent='Customer menu link copied.';}catch{$('#qr-status').textContent='Copy the customer menu link displayed below the QR.';}});
  if(urlInput.value)update();else {state(false);$('#test-qr').hidden=true;$('#qr-status').textContent='Enter your published website URL to create its QR.';$('#qr-notice').textContent='Use your own public website URL. No preview domain is preset.';}
})();
