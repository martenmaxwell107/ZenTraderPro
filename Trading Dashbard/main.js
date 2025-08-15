
const { app, BrowserWindow, session, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Portable paths
const APP_DIR = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath || __dirname);
const DATA_DIR = path.join(APP_DIR, 'data');
const BACKUPS_DIR = path.join(APP_DIR, 'backups');
for (const d of [DATA_DIR, BACKUPS_DIR]) { try { fs.mkdirSync(d, { recursive: true }); } catch(e) {} }
app.setPath('userData', DATA_DIR);

let mainWindow = null;

async function getCSVFromRenderer(win){
  try{
    const js = `(()=>{ try { return toCSV(sortedTrades()); } catch(e){ return null; } })()`;
    return await win.webContents.executeJavaScript(js, true);
  }catch(e){ return null; }
}

function timestamp(){
  const d = new Date();
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}

async function autoBackup(win){
  try{
    const csv = await getCSVFromRenderer(win);
    if(!csv) return;
    const filePath = path.join(BACKUPS_DIR, `trades_backup_${timestamp()}.csv`);
    fs.writeFileSync(filePath, csv, 'utf8');
  }catch(e){}
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280, height: 900,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation:true, nodeIntegration:false, sandbox:true, devTools:true }
  });
  mainWindow = win;

  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    if (permission === 'media') return callback(true);
    return callback(true);
  });

  win.loadFile('index.html');
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action:'deny' }; });

  win.on('close', async (e) => {
    e.preventDefault();
    try { await autoBackup(win); } catch (err) {}
    win.removeAllListeners('close');
    win.close();
  });
};

ipcMain.handle('save-csv', async (event, payload) => {
  try {
    const { csv, filename } = payload || {};
    if (!csv || !filename) return { ok:false, error: 'Missing CSV or filename' };
    const filePath = path.join(process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath || __dirname), 'backups', filename);
    fs.writeFileSync(filePath, csv, 'utf8');
    return { ok:true, path: filePath };
  } catch (e) {
    return { ok:false, error: String(e) };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', async () => {
  if (mainWindow){ try { await autoBackup(mainWindow); } catch(e){} }
  if (process.platform !== 'darwin') app.quit();
});
