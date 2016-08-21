const fs = require('fs');
const path = require('path');

class Config {
  constructor(userDataPath){
    this._file = path.join(userDataPath, 'hearth.config.json');
    this.fields = {
      bins: {
        node: ''
      }
    };
    console.log(`using config at ${this._file}`);
    this.restore();
  }

  restore(){
    let fileContent;

    try {
      fs.statSync(this._file);
    }catch(e){
      if (e.code === 'ENOENT') {
        // config file doesn't exist, create it by using the default config
        fs.writeFileSync(this._file, JSON.stringify(this.fields));
      } else {
        console.error('error trying to stat the config file', e);
        process.exit(1);
      }
    }

    try{
      fileContent = JSON.parse(fs.readFileSync(this._file, {encoding: 'utf8'}));
    }catch(e){
      console.error('couln\'t parse config:', e);
      process.exit(1);
    }

    this.fields = this.migrate(fileContent);
  }

  migrate(fields){
    // fix configs without bins field
    if (!fields.hasOwnProperty('bins')) {
      console.log('migrating config without bins object');
      fields.bins = this.fields.bins;
    }
    return fields;
  }

  save(){
    fs.writeFileSync(this._file, JSON.stringify(this.fields));
  }
}

module.exports = Config;
