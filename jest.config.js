const SuiteCloudJestConfiguration = require("@oracle/suitecloud-unit-testing");
const cliConfig = require("./suitecloud.config");

module.exports = SuiteCloudJestConfiguration.build({
	projectFolder: cliConfig.defaultProjectFolder,
	projectType: SuiteCloudJestConfiguration.ProjectType.ACP,
});