'use strict';

const Term = require('./index');

class Win32Term extends Term {
  fixSpawnArguments(node, args) {
    // patch windows spawn call
    if (node === undefined) {
      // add node as arg (in hope that's in the global Path/PATH)
      args.unshift('node');
      node = 'powershell.exe';
    }
    return [node, args];
  }

  buildTermLaunchArgs(scriptPath) {
    return [process.env.ComSpec, ['/C', `start ${process.env.ComSpec} /C ${scriptPath}`]];
  }

  buildRunScript(bin, args, projectDir, hasFullBinaryPath = false) {
    const suffix = '.cmd';
    let scriptContent = '';

    if (hasFullBinaryPath) {
      scriptContent = `
  cd /d ${projectDir}
  "${bin}"  "${args.join('" "')}"
  `;
    } else {
      // based on npm generated bin/command.cmd
      scriptContent = `
cd /d ${projectDir}

@IF EXIST "%~dp0\\node.exe" (
  "%~dp0\\node.exe" "${bin}"  "${args.join('" "')}"
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "${bin}"  "${args.join('"  "')}"
)
`;
    }

    return {
      content: scriptContent,
      suffix
    };
  }
}

module.exports = Win32Term;
