import {validate,createTournament,matchState,ranking} from './domain.js';
const $ = s => document.querySelector(s);
const key='jass-jura-tournament-v1';
let tournament=null, round=0, saved=false;
function notice(message=''){ $('#notice').textContent=message; }
function persist(){
  try {localStorage.setItem(key,JSON.stringify(tournament)); saved=true;} catch {saved=false;}
  $('#save-state').textContent=saved?'✓ Sauvegardé automatiquement dans ce navigateur · Pensez à enregistrer un fichier sur votre bureau.':'⚠ Sauvegarde automatique indisponible. Enregistrez un fichier pour conserver vos résultats.';
}
function option(value,label,selected=false){const o=document.createElement('option');o.value=value;o.textContent=label;o.selected=selected;return o;}
function render(){
  $('#welcome').hidden=!!tournament; $('#tournament').hidden=!tournament;
  if(!tournament)return;
  $('#tournament-name').textContent=tournament.name;
  $('#summary').textContent=`${tournament.teams.length} équipes · ${tournament.passes} passes · ${tournament.games} parties par passe · ${tournament.games*157} points par table`;
  $('#round').replaceChildren(...tournament.rounds.map((_,i)=>option(i,`${i+1}`,i===round)));
  $('#round-help').textContent=`Reportez le tirage des tables, puis les deux totaux. La somme doit être de ${tournament.games*157} points. Les deux scores sont saisis indépendamment pour repérer les erreurs.`;
  $('#matches').replaceChildren();
  tournament.rounds[round].forEach((m,i)=>{
    const card=document.createElement('article');card.className='match';
    const heading=document.createElement('h3');heading.textContent=`Table ${i+1}`;card.append(heading);
    const grid=document.createElement('div');grid.className='match-grid';
    for(const side of ['a','b']){
      const label=document.createElement('label');label.textContent=`Équipe ${side.toUpperCase()}`;
      const select=document.createElement('select');select.setAttribute('aria-label',`Table ${i+1}, équipe ${side.toUpperCase()}`);
      select.append(option('','Choisir une équipe',m[side]===''));
      tournament.teams.forEach((name,id)=>{const o=option(id,name,m[side]===id);o.disabled=tournament.rounds[round].some((row,j)=>['a','b'].some(s=>!(j===i&&s===side)&&row[s]===id));select.append(o);});
      select.addEventListener('change',()=>{m[side]=select.value===''?'':Number(select.value);persist();render();});label.append(select);grid.append(label);
      const scoreLabel=document.createElement('label');scoreLabel.textContent='Points';
      const input=document.createElement('input');input.type='number';input.min=0;input.max=tournament.games*157;input.step=1;input.inputMode='numeric';input.placeholder='—';input.value=m['s'+side];input.setAttribute('aria-label',`Table ${i+1}, points équipe ${side.toUpperCase()}`);
      input.addEventListener('input',()=>{
        const value=input.value===''?'':Number(input.value);
        if(value!==''&&(!Number.isInteger(value)||value<0||value>tournament.games*157)) {input.setCustomValidity(`Entrez un entier entre 0 et ${tournament.games*157}.`);input.reportValidity();m['s'+side]='';}else{input.setCustomValidity('');m['s'+side]=value;}
        persist();refresh();
      }); scoreLabel.append(input);grid.append(scoreLabel);
    }
    card.append(grid);const status=document.createElement('p');status.className='match-status';status.setAttribute('aria-live','polite');card.append(status);$('#matches').append(card);
  });refresh();
}
function refresh(){
  let complete=0;
  tournament.rounds[round].forEach((m,i)=>{
    const state=matchState(m,tournament.games),card=$('#matches').children[i];card.className=`match ${state}`;
    let text='En attente des équipes et des deux scores.';
    if(state==='valid'){text=`✓ Vérifié · ${m.sa} + ${m.sb} = ${tournament.games*157} points`;complete++;}
    else if(m.sa!==''&&m.sb!==''){
      const delta=m.sa+m.sb-tournament.games*157;
      text=delta?`À corriger · ${m.sa+m.sb} points au lieu de ${tournament.games*157} (${delta>0?'+':''}${delta}).`:'Scores corrects · choisissez les deux équipes.';
    }
    card.querySelector('.match-status').textContent=text;
  });
  $('#progress').textContent=`${complete} / ${tournament.teams.length/2} tables vérifiées`;
  $('#next').hidden=round===tournament.passes-1;$('#next').disabled=complete!==tournament.teams.length/2;
  const rows=ranking(tournament);let previous=null,position=0;$('#ranking').replaceChildren();
  rows.forEach((r,i)=>{if(r.points!==previous)position=i+1;previous=r.points;const tr=document.createElement('tr');for(const v of [position,r.name,r.played,r.points.toLocaleString('fr-CH')]){const td=document.createElement('td');td.textContent=v;tr.append(td);}$('#ranking').append(tr);});
  const completed=tournament.rounds.filter(r=>r.every(m=>matchState(m,tournament.games)==='valid')).length;
  $('#overall').textContent=completed===tournament.passes?'✓ Tournoi terminé : toutes les passes sont vérifiées.':`${completed} / ${tournament.passes} passes entièrement vérifiées.`;
}
$('#create').addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.target);
  try{const teams=data.get('teams').split('\n').map(s=>s.trim()).filter(Boolean);
    if(teams.length<2||teams.length%2)throw Error('Ajoutez au moins deux équipes, en nombre pair.');
    if(new Set(teams.map(s=>s.toLocaleLowerCase('fr'))).size!==teams.length)throw Error('Chaque équipe doit avoir un nom différent.');
    tournament=createTournament(data.get('name'),Number(data.get('passes')),Number(data.get('games')),teams);round=0;notice();render();persist();window.scrollTo(0,0);
  }catch(error){notice(error.message);}
});
$('#create textarea').addEventListener('input',e=>{const count=e.target.value.split('\n').filter(s=>s.trim()).length;$('#team-count').textContent=`${count} équipes · ${count%2?'Ajoutez une équipe pour obtenir un nombre pair.':`${count/2} tables par passe`}`;});
$('#round').addEventListener('change',e=>{round=Number(e.target.value);render();});
$('#next').addEventListener('click',()=>{round++;render();window.scrollTo(0,0);});
$('#export').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(tournament,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`${tournament.name.replace(/[^\p{L}\p{N}_-]+/gu,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notice('Fichier de sauvegarde préparé. Retrouvez-le dans vos téléchargements, ou choisissez le Bureau si votre navigateur propose un emplacement.');
});
for(const button of document.querySelectorAll('.import-button'))button.addEventListener('click',()=>$('#file').click());
$('#file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>5_000_000)throw Error('Ce fichier est trop volumineux (maximum 5 Mo).');
    const imported=validate(JSON.parse(await file.text()));
    if(tournament&&!confirm('Ouvrir ce fichier remplacera le tournoi actuel dans le navigateur. Avez-vous enregistré le tournoi actuel si vous souhaitez le conserver ?'))return;
    tournament=imported;round=0;render();persist();notice('Tournoi ouvert. Vous pouvez reprendre la saisie.');
  }catch(error){notice(`Impossible d’ouvrir le tournoi : ${error.message}`);}finally{e.target.value='';}
});
$('#new').addEventListener('click',()=>{
  if(!confirm('Créer un nouveau tournoi ? Enregistrez d’abord un fichier si vous souhaitez conserver le tournoi actuel.'))return;
  try{localStorage.removeItem(key);}catch{notice('Impossible d’effacer la sauvegarde du navigateur.');return;}
  tournament=null;round=0;render();notice();
});
try{const raw=localStorage.getItem(key);if(raw){tournament=validate(JSON.parse(raw));render();persist();}}catch{notice('La sauvegarde du navigateur est inaccessible ou invalide. Vous pouvez ouvrir un fichier de tournoi ou en créer un nouveau.');}
