import test from 'node:test';
import assert from 'node:assert/strict';
import {createTournament,validate,matchState,ranking} from '../domain.js';
const create=()=>createTournament('Tournoi',2,12,['Les As','Les Rois','Les Dames','Les Valets']);
test('12 parties exigent 1884 points ; les erreurs ne comptent pas',()=>{
 const t=create();t.rounds[0][0]={a:0,b:1,sa:1000,sb:883};
 assert.equal(matchState(t.rounds[0][0],12),'invalid');assert.equal(ranking(t)[0].points,0);
 t.rounds[0][0].sb=884;assert.equal(matchState(t.rounds[0][0],12),'valid');assert.equal(ranking(t)[0].points,1000);
});
test('cumul des passes, corrections et scores nuls',()=>{
 const t=create();t.rounds[0][0]={a:0,b:1,sa:1000,sb:884};t.rounds[1][0]={a:0,b:2,sa:0,sb:1884};
 assert.equal(ranking(t).find(x=>x.id===0).points,1000);assert.equal(ranking(t).find(x=>x.id===0).played,2);
 t.rounds[0][0].sa=999;assert.equal(ranking(t).find(x=>x.id===0).points,0);
});
test('total configurable et équipes non attribuées',()=>{
 assert.equal(matchState({a:0,b:1,sa:100,sb:214},2),'valid');assert.equal(matchState({a:'',b:1,sa:100,sb:214},2),'pending');
});
test('import et export conservent les rencontres et scores',()=>{
 const t=create();t.rounds[0][0]={a:0,b:1,sa:1000,sb:884};assert.deepEqual(validate(JSON.parse(JSON.stringify(t))),t);
});
test('rejette les doublons par passe, fichiers incomplets et scores hors limites',()=>{
 const t=create();t.rounds[0][0].a=0;t.rounds[0][1].b=0;assert.throws(()=>validate(t));
 assert.throws(()=>validate({}));assert.throws(()=>createTournament('x',0,12,['A','B']));
 const s=create();s.rounds[0][0].sa=-1;assert.throws(()=>validate(s));
});
