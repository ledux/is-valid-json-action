const core = require("@actions/core");
const github = require("@actions/github");
const os = require("os");
const fs = require("fs");
const path = require("path");

function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

try {
  // `pathToFile` input defined in action metadata file
  const pathToFile = core.getInput("path-to-file");
  console.log(`attempting to parse ${pathToFile}`);

  let resolvedPath;
  // resolve tilde expansions, path.replace only replaces the first occurrence of a pattern

  if (pathToFile.startsWith(`~`) || pathToFile.startsWith(`$HOME`)) {
    resolvedPath = path.resolve(pathToFile.replace("~", os.homedir()));
  } else if (pathToFile.startsWith(`/`)) {
    resolvedPath = path.resolve(pathToFile);
  } else {
    resolvedPath = path.resolve(process.env.GITHUB_WORKSPACE, pathToFile);
  }

  core.debug(`Resolved path is ${resolvedPath}`);

  fs.readFile(resolvedPath, "utf8", (err, data) => {
    if (!err) {
      const result = isValidJSON(data);
      result
        ? core.setOutput("is-valid-json", true)
        : core.setFailed(`file at "${pathToFile}" is not valid JSON`);
    } else {
      core.setFailed(`failed to read file at "${pathToFile}"`);
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
