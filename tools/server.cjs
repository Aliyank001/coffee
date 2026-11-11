'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),owner=process.argv.includes('--owner'),port=owner?4175:4173;
const ownerFiles={'/':'owner-tools/qr.html','/qr.html':'owner-tools/qr.html','/owner-qr.js':'owner-tools/owner-qr.js','/style.css':'style.css','/data.js':'data.js','/vendor/qrcode.js':'vendor/qrcode.js','/assets/favicon.svg':'assets/favicon.svg'};
const publicFiles={'/':'index.html','/index.html':'index.html','/billing':'billing.html','/billing.html':'billing.html','/style.css':'style.css','/script.js':'script.js','/data.js':'data.js','/robots.txt':'robots.txt'};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)){res.writeHead(403);return res.end('Local server only.');}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let url;try{url=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);return res.end();}
 let file=(owner?ownerFiles:publicFiles)[url];
 if(!file&&!owner&&/^\/(assets|vendor)\/[a-zA-Z0-9_.-]+$/.test(url))file=url.slice(1);
 const target=file?path.resolve(root,file):null;
 if(!target||!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end('Not found');}
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(owner)res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');
 if(req.method==='HEAD')return res.end();
 fs.createReadStream(target).on('error',()=>{res.statusCode=500;res.end('Could not open file.');}).pipe(res);
});
server.on('error',error=>{console.error('Server could not start:',error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log((owner?'Owner QR tool':'Cafe website')+': http://127.0.0.1:'+port));
