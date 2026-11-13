const {spawnSync}=require('node:child_process');
for(const file of ['campaign.cjs','battlefields.cjs']){
 const r=spawnSync(process.execPath,[require('node:path').join(__dirname,file)],{stdio:'inherit',windowsHide:true});
 if(r.status!==0)process.exit(r.status||1);
}
