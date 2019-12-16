const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    this.path = path.join(userDataPath, opts.configName + '.json');    
    this.data = parseDataFile(this.path);
  }
  
  get(key) {
    // FIXME: Avoid extra serialization as a manner of deepcopying
    return JSON.parse(JSON.stringify(this.data[key]));
  }
  
  set(key, val) {
    // FIXME: Avoid multiple serialization - the extra double
    // stringify exists to perform a deep copy without extra
    // imports.
    this.data[key] = JSON.parse(JSON.stringify(val));
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  delete(key) {
    delete this.data[key]
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  keys() {
    return Object.keys(this.data)
  }
}

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, start with no saved files.
    return Object();
  }
}

// expose the class
module.exports = Store;