const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar');
const Promise = require('bluebird');

/**
 * Tar extract a gzipped tar file
 * Heavily based on tarball-extract
 * @param {string} sourceFile
 * @param {string} destination
 * @param {object} tarOptions Options passed to the tar module
 */
module.exports = function (sourceFile, destination, tarOptions = {}) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(sourceFile)
      .pipe(zlib.createGunzip())
      .pipe(tar.Extract(Object.assign({}, {path: destination}, tarOptions)))
      .on('error', (err) => reject(err))
      .on('end', () => resolve());
  });
};
