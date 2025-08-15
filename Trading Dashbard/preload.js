
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronBridge', {
  saveCSV: async (csvText, filename) => {
    try { return await ipcRenderer.invoke('save-csv', { csv: csvText, filename }); }
    catch (e) { return { ok:false, error:String(e) }; }
  }
});
