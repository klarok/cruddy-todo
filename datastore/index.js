const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        throw err;
      }
      callback(err, {id, text});
    });
  });
};

exports.readAll = (callback) => {
  // fs.readdir(exports.dataDir, (err, filesData) => {
  //   if (err) {
  //     throw err;
  //   }
  //   let files = filesData.map((file) => ({id: file.slice(0, -4), text: file.slice(0, -4)}));
  //   callback(err, files);
  // });
  let files = new Promise(function(resolve, reject) {
    fs.readdir(exports.dataDir, (err, filenames) => {
      if (err) {
        reject(err);
      } else {
        resolve(filenames);
      }
    });
  }).then(function(value) {
    
    let filesObjs = value.map((file) => {
      return new Promise(function(resolve, reject) {
        fs.readFile(path.join(exports.dataDir, file), (err, text) => {
          if (err) {
            reject(err);
          } else {
            text = text.toString('utf8');
            resolve({id: file.slice(0, -4), text});
          }
        });
      });
    });
    return Promise.all(filesObjs);
  }).then(function(values) {
    console.log(values);
    callback(null, values);
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, fileData) => {
    if (err) {
      callback(err, null);
    } else {
      let text = fileData.toString('utf8');
      callback(err, {id, text});
    }
  });
};

exports.update = (id, text, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      callback(err, null);
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw err;
        }
        callback(err, {id, text});
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(err, null);
    } else {
      callback(err, id);
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
