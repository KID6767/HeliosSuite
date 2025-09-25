// HeliosPulse â€” Apps Script backend (safe)
const HP = { TOKEN: "HeliosPulseToken", ALLIANCE_NAME: "LegioniĹ›ci Heliosa", PAGES_URL: "" };

function sheet(name, header){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName(name) || ss.insertSheet(name);
  if(header && s.getLastRow()===0) s.appendRow(header);
  return s;
}
function out(t){ return ContentService.createTextOutput(String(t)); }
function now(){ return new Date(); }

function doGet(e){
  if(!e || !e.parameter) return out("no params");
  const p = e.parameter;
  if(p.token !== HP.TOKEN) return out("invalid token");
  const a = (p.action||"").toLowerCase();
  if(a==="presence") return handlePresence(p);
  if(a==="daily_report_bbcode") return out(buildDailyReportBBCode(p.date || Utilities.formatDate(now(), Session.getScriptTimeZone(), "yyyy-MM-dd")));
  return out("unknown action");
}

function handlePresence(p){ const s = sheet("presence",["ts","nick"]); s.appendRow([now(), p.nick||"Unknown"]); return out("presence ok"); }

function buildDailyReportBBCode(dateStr){
  const s = sheet("presence");
  const vals = s.getDataRange().getValues().slice(1);
  const present = vals.filter(r => Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "yyyy-MM-dd") === dateStr).map(r=>r[1]);
  const lines = [];
  lines.push("[b]Raport dzienny: " + dateStr + "[/b]");
  lines.push("Obecni: " + (present.length) + " (" + (present.join(", ") || "â€”") + ")");
  lines.push("Sojusz: " + HP.ALLIANCE_NAME);
  return lines.join("\n");
}
