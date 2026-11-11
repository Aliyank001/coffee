const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
// Remove the obsolete public generator from earlier builds. Owner tools are never copied.
const legacyQR=path.join(out,'qr.html');
if(fs.existsSync(legacyQR))fs.unlinkSync(legacyQR);
for(const name of ['index.html','billing.html','robots.txt','style.css','script.js','data.js','assets','vendor']) fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Static site built in dist/');
