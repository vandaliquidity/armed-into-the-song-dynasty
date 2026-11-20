const {spawnSync}=require('node:child_process');
for(const file of ['campaign.cjs','campaign-art.cjs','chronicle.cjs','tactics.cjs','battlefields.cjs','edict-resources.cjs','medical.cjs','journey.cjs','chapter-two.cjs','supply-companions.cjs','refit.cjs','missions.cjs','frontier-war.cjs','production.cjs','mission-completion.cjs','spoils.cjs','history.cjs','jin-command.cjs','dynasty.cjs','council.cjs','politics.cjs','management.cjs','motion.cjs']){
 const r=spawnSync(process.execPath,[require('node:path').join(__dirname,file)],{stdio:'inherit',windowsHide:true});
 if(r.status!==0)process.exit(r.status||1);
}
const banners=spawnSync(process.execPath,[require('node:path').join(__dirname,'banner-orders.cjs')],{stdio:'inherit',windowsHide:true});
if(banners.status!==0)process.exit(banners.status||1);
