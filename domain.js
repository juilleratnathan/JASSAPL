export function validate(t) {
  if (!t || t.version !== 1 || typeof t.name !== 'string' || !t.name.trim() || !Number.isInteger(t.passes) || t.passes < 1 || t.passes > 100 || !Number.isInteger(t.games) || t.games < 1 || t.games > 100 || !Array.isArray(t.teams) || t.teams.length < 2 || t.teams.length % 2 || t.teams.length > 200 || t.teams.some(x => typeof x !== 'string' || !x.trim()) || new Set(t.teams).size !== t.teams.length || !Array.isArray(t.rounds) || t.rounds.length !== t.passes) throw Error('Fichier de tournoi invalide.');
  for (const round of t.rounds) {
    if (!Array.isArray(round) || round.length !== t.teams.length / 2) throw Error('Nombre de tables invalide.');
    const used = [];
    for (const m of round) {
      for (const side of ['a','b']) {
        if (m[side] !== '' && (!Number.isInteger(m[side]) || m[side] < 0 || m[side] >= t.teams.length)) throw Error('Équipe invalide.');
        if (m[side] !== '') used.push(m[side]);
      }
      for (const s of ['sa','sb']) if (m[s] !== '' && (!Number.isInteger(m[s]) || m[s] < 0 || m[s] > t.games * 157)) throw Error('Score invalide.');
    }
    if (new Set(used).size !== used.length) throw Error('Une équipe ne peut jouer qu’à une table par passe.');
  }
  return t;
}
export function matchState(m, games) {
  if (m.a === '' || m.b === '' || m.sa === '' || m.sb === '') return 'pending';
  return m.a !== m.b && m.sa + m.sb === games * 157 ? 'valid' : 'invalid';
}
export function ranking(t) {
  const rows = t.teams.map((name,id) => ({id,name,points:0,played:0}));
  for (const round of t.rounds) for (const m of round) if (matchState(m,t.games) === 'valid') {
    rows[m.a].points += m.sa; rows[m.b].points += m.sb; rows[m.a].played++; rows[m.b].played++;
  }
  return rows.sort((a,b) => b.points-a.points || a.name.localeCompare(b.name,'fr'));
}
export function createTournament(name, passes, games, teams) {
  return validate({version:1,name:name.trim(),passes,games,teams,rounds:Array.from({length:passes},()=>Array.from({length:teams.length/2},()=>({a:'',b:'',sa:'',sb:''})))});
}
