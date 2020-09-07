// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Scraper from "./Scraper";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "translate-ja-to-en" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("translate-ja-to-en.translate", async () => {
    // The code you place here will be executed every time your command is executed

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      let inputText = "";
      if (editor.selection.isEmpty) {
        inputText = editor.document.getText();
      } else {
        inputText = editor.document.getText(editor.selection);
      }

      if (inputText) {
        inputText = inputText.replace(/\r\n/g, "\n");
        const outputText = await Scraper.start(inputText);
        // vscode.commands.executeCommand("vscode.openWith", "");
        if (editor) {
          let position = new vscode.Position(0, 0);
          if (editor.selection.isEmpty) {
            position = new vscode.Position(editor.document.lineCount + 1, 0);
          } else {
            position = new vscode.Position(editor.selection.end.line + 1, 0);
          }

          editor.edit((editBuilder) => {
            editBuilder.insert(position, "\n");
            editBuilder.insert(position, "-".repeat(42));
            editBuilder.insert(position, "\n");
            editBuilder.insert(position, outputText);
            editBuilder.insert(position, "\n");
            editBuilder.insert(position, "-".repeat(42));
            editBuilder.insert(position, "\n");
          });
        }
      }
    }

    // Display a message box to the user
    vscode.window.showInformationMessage("Translated.");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
