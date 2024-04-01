const fs = require('fs');
const path = require('path');

// Function to save canvas state to a JSON file
function saveCanvasState(canvasState) {
  const json = JSON.stringify(canvasState);
  fs.writeFile('canvasState.json', json, 'utf8', (err) => {
    if (err) {
      console.error('Error saving canvas state:', err);
    } else {
      console.log('Canvas state saved successfully');
    }
  });
}

// Function to back up the canvas state JSON file
function backupCanvasState(canvasState) {
  const backupFolder = path.join(__dirname, 'backup');
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder);
  }

  const backupFilename = `backup_${Date.now()}.json`;
  const backupFilePath = path.join(backupFolder, backupFilename);

  fs.copyFile('canvasState.json', backupFilePath, (err) => {
    if (err) {
      console.error('Error backing up canvas state:', err);
    } else {
      console.log('Canvas state backed up successfully');
    }
  });
}

// Function to load canvas state from the JSON file
function loadCanvasState() {
    try {
      const data = fs.readFileSync('canvasState.json', 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Canvas state file not found. Creating a new one.');
        // Return a default canvas state or an empty state
        return {
          images: []
        };
      } else {
        console.error('Error reading canvas state file:', err);
        return null;
      }
    }
  }
  

module.exports = {
  saveCanvasState,
  backupCanvasState,
  loadCanvasState
};
