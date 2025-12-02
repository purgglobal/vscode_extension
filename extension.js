
const { cssPreformatter } = require ('./css-formatter/preformatter');
const { cssMainFormatter } = require ('./css-formatter/main-formatter');
const { jsPreformatter } = require ('./js-formatter/preformatter');
const { jsMainFormatter } = require ('./js-formatter/main-formatter');
const { jsonPreformatter } = require ('./json-formatter/preformatter');
const { jsonMainFormatter } = require ('./json-formatter/main-formatter');
const { htmlPreformatter } = require ('./html-formatter/preformatter');
const { htmlMainFormatter } = require ('./html-formatter/main-formatter');

const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext}
 */



let purg = function (inputCode, fileType="html") {
	fileType = fileType.toLowerCase ();
	let purgdCode = "";
	
	switch (fileType) {
		case "css":
			purgdCode = cssMainFormatter (cssPreformatter (inputCode));
			break;
		case "javascript":
			purgdCode = jsMainFormatter (jsPreformatter (inputCode));
			break;
		case "json":
			purgdCode = jsonMainFormatter (jsonPreformatter (inputCode));
			break;
		case "jsonc":
			purgdCode = jsonMainFormatter (jsonPreformatter (inputCode));
			break;
		case "html":
			purgdCode = htmlMainFormatter (htmlPreformatter (inputCode));
			break;
		case "default":
			purgdCode = inputCode;
	}
	
	return purgdCode;
}

function activate(context) {
	const disposable = vscode.commands.registerCommand('purg.purg', async function () {
		console.log('Welcome to Purg: the Dexterous code refurbisher and organizer.');

		let file = vscode.window.activeTextEditor.document;
		let fileContent = file.getText ();
		let fileType = file.languageId;
		let fileUri = file.uri; // Needed in the edit function

		const newContent = purg (fileContent, fileType);

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            file.positionAt(0),
            file.positionAt(fileContent.length),
        );
        edit.replace(fileUri, fullRange, newContent);

        await vscode.workspace.applyEdit(edit);

		vscode.window.showInformationMessage('Welcome to Purg!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
