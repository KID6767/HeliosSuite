/* HeliosPulse Google Apps Script (safe)
   Tworzy arkusze: presence, last_seen, stats, daily_reports, bbcode_reports
   GET:
     ?token=...&action=presence&nick=...
     ?token=...&action=last_seen&nick=...
     ?token=...&action=stats&nick=...&points=...&towns=...
     ?token=...&action=daily_report_bbcode&date=YYYY-MM-DD
*/
const HP = {
  TOKEN: "HeliosPulseToken",
  ALLIANCE_NAME: "Legionisci Heliosa",
  PAGES_URL: "https://kid6767.github.io/HeliosSuite/"
};
function sheet(name, header){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let s=ss.getSheetByName(name); if(!s) s=ss.insertSheet(name);
  if (header && s.getLastRow()===0) s.appendRow(header);
  return s;
}
function out(t){ return ContentService.createTextOutput(String(t)); }
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function now(){ return new Date(); }
function todayStr(){ return Utilities.formatDate(now(), Session.getScriptTimeZone(), "yyyy-MM-dd"); }

function doGet(e){
  if (!e || !e.parameter) return out("no params");
  const p=e.parameter; if (p.token !== HP.TOKEN) return out("invalid token");
  const a=(p.action||"").toLowerCase();
  if (a==="presence") return handlePresence(p);
  if (a==="last_seen") return handleLastSeen(p);
  if (a==="stats") return handleStats(p);
  if (a==="daily_report_bbcode") return out(buildDailyReportBBCode(p.date||todayStr()));
  return out("ok");
}

function handlePresence(p){
  const s=sheet("presence",["ts","nick"]);
  const n=p.nick||"Unknown"; s.appendRow([now(), n]); updateLastSeen(n); return out("presence ok");
}
function handleLastSeen(p){ updateLastSeen(p.nick||"Unknown"); return out("last_seen ok"); }
function handleStats(p){
  sheet("stats",["ts","nick","points","towns","extra"])
    .appendRow([now(), p.nick||"Unknown", p.points||"", p.towns||"", p.extra||""]);
  return out("stats ok");
}
function updateLastSeen(nick){
  const s=sheet("last_seen",["nick","last_ts"]);
  const v=s.getDataRange().getValues();
  for (let i=1;i<v.length;i++){ if (v[i][0]===nick){ s.getRange(i+1,2).setValue(now()); return; } }
  s.appendRow([nick, now()]);
}
function computeAllianceTotals(){
  const v=sheet("stats").getDataRange().getValues().slice(1);
  const last={};
  v.forEach(r=>{ const n=r[1]; if(!n) return; const t=new Date(r[0]).getTime(); if(!last[n]||t>new Date(last[n][0]).getTime()) last[n]=r; });
  const res={points:0,towns:0,players:0,alliance:HP.ALLIANCE_NAME};
  Object.keys(last).forEach(n=>{ const r=last[n]; res.players++; res.points+=parseInt(r[2]||0,10); res.towns+=parseInt(r[3]||0,10); });
  return res;
}
function buildDailyReportBBCode(dateStr){
  const present = presentTodayList(dateStr);
  const off48 = offline48h();
  const a = computeAllianceTotals();
  const lines=[];
  lines.push("[size=16][b][color=#FFD700]Raport dzienny - "+dateStr+"[/color][/b][/size]");
  lines.push("[b]Aktywni:[/b] "+present.length+" ("+(present.join(", ")||"â€”")+")");
  lines.push("[b]Nieaktywni 48h+:[/b] "+off48.length+" ("+(off48.join(", ")||"â€”")+")");
  lines.push("[b]Sojusz:[/b] "+a.points+" pkt / "+a.towns+" miast / "+a.players+" graczy");
  lines.push("Link: [url="+HP.PAGES_URL+"]HeliosSuite[/url]");
  sheet("bbcode_reports",["date","bbcode","ts"]).appendRow([dateStr, lines.join("\n"), now()]);
  return lines.join("\n");
}
function presentTodayList(d){
  const v=sheet("presence").getDataRange().getValues().slice(1);
  const st=new Date(d+"T00:00:00"), en=new Date(d+"T23:59:59");
  return v.filter(r=>{ const t=new Date(r[0]); return t>=st && t<=en; }).map(r=>r[1]);
}
function offline48h(){
  const v=sheet("last_seen").getDataRange().getValues().slice(1);
  const nowMs=now().getTime(), out=[];
  v.forEach(r=>{ const n=r[0]; const t=new Date(r[1]).getTime(); if (!n||isNaN(t)) return; if ((nowMs-t)/36e5>48) out.push(n); });
  return out;
}
