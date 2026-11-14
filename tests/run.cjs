const {spawnSync}=require('node:child_process');
for(const file of ['campaign.cjs','battlefields.cjs','edict-resources.cjs','medical.cjs','journey.cjs','supply-companions.cjs','refit.cjs','missions.cjs','frontier-war.cjs']){
 const r=spawnSync(process.execPath,[require('node:path').join(__dirname,file)],{stdio:'inherit',windowsHide:true});
 if(r.status!==0)process.exit(r.status||1);
}
