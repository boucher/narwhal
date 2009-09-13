
exports.testSandbox = require("./iojs/program");
exports.testString = require("./string-tests");
exports.testURI = require("./uri-tests");
exports.testQS = require("./query-string-tests");
exports.testCodecs = require("./hashes");
exports.testOS = require("./os/all-tests");
exports.testFile = require("./file/all-tests");
exports.testUtil = require("./util/all-tests");
exports.testArgs = require("./args");

exports.testGlobal = require("./global");

exports.testServerJS = require("./serverjs/all-tests");

if (require.main === module.id)
    require("os").exit(require("test/runner").run(exports));

