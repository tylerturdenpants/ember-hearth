const assert = require('assert');
const NodeInstaller = require('../../../ember-electron/cli/lib/installer/node');
const tmp = require('temp');
const path = require('path');
const fs = require('fs');
const SimpleHttpServer = require('../../helpers/simple-http-server');
const Promise = require('bluebird');

tmp.track();

describe('node', function () {
  describe('nodeFilename', function () {
    it('builds the correct filenames for various platforms', function () {
      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};

      assert.equal(
        installer.nodeFilename(node, {platform: 'darwin', arch: 'x64'}),
        'node-v6.9.1-darwin-x64.tar.gz');

      assert.equal(
        installer.nodeFilename(node, {platform: 'win32', arch: 'x64'}),
        'node-v6.9.1-win-x64.tar.gz');
      assert.equal(
        installer.nodeFilename(node, {platform: 'win32', arch: 'ia32'}),
        'node-v6.9.1-win-x86.tar.gz');

      assert.equal(
        installer.nodeFilename(node, {platform: 'linux', arch: 'x64'}),
        'node-v6.9.1-linux-x64.tar.gz');
      assert.equal(
        installer.nodeFilename(node, {platform: 'linux', arch: 'ia32'}),
        'node-v6.9.1-linux-x86.tar.gz');
    });

    it('throws for unsupported platforms', function () {
      const disallowedPlatforms = [
        'freebsd',
        'sunos'
      ];

      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};

      disallowedPlatforms.forEach(platform =>
        assert.throws(() => installer.nodeFilename(node, {platform, arch: 'x64'})));
    });

    it('throws for unsupported architectures', function () {
      const disallowedArch = [
        'arm',
      ];

      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};

      disallowedArch.forEach(arch => {
        assert.throws(() => installer.nodeFilename(node, {platform: 'linux', arch}));
      });
    });
  });

  describe('verifyArchive', function () {
    it('resolves if hash is correct', function () {
      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};
      const archivePath = path.join(__dirname, '..', '..', 'fixtures', 'what-it-wants.tar.gz');
      const shasum = 'ff0bb2fbb8d884b74cbfd55d00b41b7579788280308c19894804f138ec03d6a0';

      return installer.verifyArchive(node, archivePath, shasum);
    });
    it('rejects if hash isn\'t correct', function () {
      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};
      const archivePath = path.join(__dirname, '..', '..', 'fixtures', 'what-it-wants.tar.gz');
      const shasum = '0000000000000000000000000000000000000000000000000000000000000000';

      return installer.verifyArchive(node, archivePath, shasum).then(
        () => assert.ok(false),
        reason => assert.equal(reason, 'Calculated hash doesn\'t equal given hash')
      );
    });
  });

  describe('extractArchive', function () {
    it('extracts an archive correctly', function () {
      const installer = new NodeInstaller('tmp');
      const node = {version: 'v6.9.1'};
      const archivePath = path.join(__dirname, '..', '..', 'fixtures', 'what-it-wants.tar.gz');
      const destination = path.join(tmp.mkdirSync('hearth-test-extract-archive'), 'what-it-wants');

      return installer.extractArchive(node, archivePath, destination)
        .then(() => assert.equal(fs.readFileSync(destination, {encoding: 'utf8'}), '$3.50'));
    });
  });

  describe('download', function () {
    it('downloads a resource to a file', function () {
      const installer = new NodeInstaller('tmp');
      const destinationDirectory = tmp.mkdirSync('hearth-test-download');
      const destination = path.join(destinationDirectory, 'file_destination');
      const filePath = path.join(__dirname, '..', '..', 'fixtures', 'what-it-wants.tar.gz');
      const server = new SimpleHttpServer(function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(filePath).pipe(res);
      });

      return server.start()
        .then(() => {
          return installer.download(`http://localhost:${server.port()}/`, destination)
        })
        .then(() => assert.ok(fs.statSync(destination).isFile()))
        .finally(() => server.stop());
    })
  });

  describe('localNodeIsRecentNode', function () {
    it('resolves if local is recent lts', function () {
      const TestNodeInstaller = class extends NodeInstaller {
        findRecentLTSNode() {
          return Promise.resolve({version: 'v6.9.1'});
        }
      };

      const installer = new TestNodeInstaller('tmp');
      return installer.localNodeIsRecentNode({version: 'v6.9.1'});
    });

    it('rejects if local is older than lts', function () {
      const TestNodeInstaller = class extends NodeInstaller {
        findRecentLTSNode() {
          return Promise.resolve({version: 'v6.9.1'});
        }
      };

      const installer = new TestNodeInstaller('tmp');
      return installer.localNodeIsRecentNode({version: 'v6.9.0'}).then(
        () => assert.ok(false),
        () => assert.ok(true)
      );
    });
  });

  describe('shasumForNode', function () {
    it('returns the correct shasum', function () {
      const server = new SimpleHttpServer((req, res) => {
        res.writeHead(200, {});
        res.end(RESPONSE);
      });
      const node = {version: 'v6.9.1'};
      const installer = new NodeInstaller('tmp');
      const RESPONSE = `
0000000000000000000000000000000000000000000000000000000000000000  node-v6.9.1-linux-x86.tar.gz
0000000000000000000000000000000000000000000000000000000000000001  node-v6.9.1-linux-x64.tar.gz
0000000000000000000000000000000000000000000000000000000000000002  node-v6.9.1-win-x64.tar.gz
0000000000000000000000000000000000000000000000000000000000000003  node-v6.9.1-darwin-x64.tar.gz
      `;

      installer.nodeFilename = (node) => `node-${node.version}-darwin-x64.tar.gz`;

      return server.start()
        .then(() => {
          installer.RELEASES = `http://localhost:${server.port()}/v6.9.1/SHASUM256.txt`;
          return installer.shasumForNode(node);
        })
        .then((response) => assert.equal(response, '0000000000000000000000000000000000000000000000000000000000000003'))
        .finally(() => server.stop());
    });
  });
});
