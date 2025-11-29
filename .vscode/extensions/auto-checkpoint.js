const vscode = require('vscode');
const { execSync } = require('child_process');

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    'extension.autoCheckpoint',
    () => {
      try {
        execSync(
          'echo "Auto-checkpoint triggered at $(date)" >> .checkpoint.log',
          { stdio: 'inherit' }
        );
        vscode.window.showInformationMessage('Auto-checkpoint completed!');
      } catch (error) {
        vscode.window.showErrorMessage(`Checkpoint failed: ${error.message}`);
      }
    }
  );

  // Auto-checkpoint on file save
  let lastCheckpoint = Date.now();
  vscode.workspace.onDidSaveTextDocument(() => {
    const now = Date.now();
    if (now - lastCheckpoint > 5 * 60 * 1000) {
      // 5 minutes
      execSync(
        'echo "Auto-checkpoint triggered at $(date)" >> .checkpoint.log',
        { stdio: 'ignore' }
      );
      lastCheckpoint = now;
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
