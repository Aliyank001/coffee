/* Café Aroma domain model. All amounts are integer PKR. No payment gateway is used. */
(function (root) {
  'use strict';
  const products = [
    { id:'caramel',name:'Caramel Cloud Latte',category:'hot',price:650,image:'latte',tag:'THE HOUSE FAVOURITE',description:'Silky espresso, steamed milk, a golden caramel finish.' },
    { id:'cappuccino',name:'Classic Cappuccino',category:'hot',price:550,image:'cappuccino',tag:'A DAILY RITUAL',description:'A rich double shot under a cloud of velvety milk.' },
    { id:'vanilla',name:'Iced Vanilla Latte',category:'cold',price:680,image:'drink-flight',sprite:0,tag:'COOL & COMFORTING',description:'Espresso, real vanilla and cold milk over ice.' },
    { id:'croissant',name:'Butter Croissant',category:'bakery',price:420,image:'croissant',tag:'FRESH FROM THE OVEN',description:'Golden layers, a buttery centre. Your coffee’s plus one.' },
    { id:'espresso',name:'Double Espresso',category:'hot',price:380,image:'espresso',tag:'SMALL BUT MIGHTY',description:'Deep cocoa notes. A bright finish. Pure coffee.' },
    { id:'coldbrew',name:'Slow-Steeped Cold Brew',category:'cold',price:590,image:'coldbrew',tag:'TAKE IT SLOW',description:'Steeped for 16 hours for a smooth, mellow sip.' },
    { id:'brownie',name:'Dark Chocolate Brownie',category:'dessert',price:480,image:'brownie',tag:'A LITTLE INDULGENCE',description:'Fudgy dark chocolate with a delicate crackled top.' },
    { id:'darkmocha',name:'Iced Dark Cocoa',category:'cold',price:740,image:'drink-flight',sprite:1,tag:'DEEP. DARK. DELICIOUS.',description:'Dark cocoa, espresso and cold milk. Finished with chocolate cream.' },
    { id:'matcha',name:'Ceremonial Iced Matcha',category:'cold',price:790,image:'drink-flight',sprite:2,tag:'A GREENER KIND OF RITUAL',description:'Stone-ground matcha layered over milk and crystal-clear ice.' },
    { id:'citrus',name:'Sparkling Citrus Tea',category:'cold',price:620,image:'drink-flight',sprite:3,tag:'A LITTLE SUNSHINE',description:'Amber tea, fresh orange and a bright sparkle, served over ice.' },
    { id:'cake',name:'The Celebration Slice',category:'dessert',price:720,image:'cake',tag:'SAVE ROOM',description:'Soft layers, light frosting and a moment worth sharing.' }
  ];
  const labels={hot:'HOT COFFEE',cold:'ON ICE',bakery:'FRESH BAKES',dessert:'SOMETHING SWEET'};
  const money = value => 'Rs. ' + Number(value).toLocaleString('en-PK');
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function cleanCart(value) {
    if (!Array.isArray(value)) return [];
    const merged = new Map();
    for (const item of value) if (item && products.some(p=>p.id===item.id) && Number.isInteger(item.qty) && item.qty>0) merged.set(item.id,Math.min(20,(merged.get(item.id)||0)+item.qty));
    return [...merged].map(([id,qty])=>({id,qty}));
  }
  function totals(cart) {
    const subtotal=cleanCart(cart).reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0);
    const tax=Math.round(subtotal*.05);
    return {subtotal,tax,total:subtotal+tax};
  }
  function localDate(now=new Date()) {return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');}
  function reservationError(date,time,now=new Date()) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)) return 'Choose a valid date and time.';
    const day=new Date(date+'T'+time+':00');
    if(Number.isNaN(day.getTime())||localDate(day)!==date) return 'Choose a valid date.';
    if(day<=now) return 'Choose a time in the future.';
    if((day-now)>90*86400000) return 'Please choose a date within the next 90 days.';
    if(day.getMinutes()%30) return 'Please choose a half-hour time slot.';
    return '';
  }
  function validOrder(order) {
    return !!order && typeof order.id==='string' && /^AR-[A-Z0-9-]+$/.test(order.id) && !Number.isNaN(Date.parse(order.createdAt)) && Array.isArray(order.items) && order.items.length>0 && order.items.every(i=>i&&typeof i.name==='string'&&Number.isInteger(i.price)&&i.price>0&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=20) && ['dine-in','takeaway'].includes(order.service) && ['counter','cash'].includes(order.payment) && Number.isInteger(order.subtotal) && order.subtotal===order.items.reduce((s,i)=>s+i.price*i.qty,0) && order.tax===Math.round(order.subtotal*.05) && order.total===order.subtotal+order.tax;
  }
  function menuUrl(base,table) {
    const url=new URL(base);
    if(!['http:','https:'].includes(url.protocol)) throw new Error('Use an https:// website address.');
    if(url.username||url.password) throw new Error('Use a website address without credentials.');
    url.search='';url.hash='menu';
    if(table!==''&&table!=null) {
      const n=Number(table);
      if(!Number.isInteger(n)||n<1||n>99) throw new Error('Choose a table from 1 to 99.');
      url.searchParams.set('table',n);
    }
    return url.href;
  }
  const api={products,labels,money,escape,cleanCart,totals,localDate,reservationError,validOrder,menuUrl};
  root.Aroma=api;
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
