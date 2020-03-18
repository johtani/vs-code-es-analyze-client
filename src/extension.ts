import { ExtensionContext, window, languages, commands, workspace, TextDocument, Range } from 'vscode';
import { AnalyzeController } from './controllers/analyzeController';
import { CodelensProvider } from './providers/codeLensProvider';

export function activate(context: ExtensionContext) {

	console.log('Activate analyze api ');
    let codelensProvider = new CodelensProvider();

    const documentSelector = [
        { language: 'analyze', scheme: 'file' },
        { language: 'analyze', scheme: 'untitled' },
    ];
	languages.registerCodeLensProvider(documentSelector, codelensProvider);
	

	const analyzeController = new AnalyzeController();

	// send request to Es 
	context.subscriptions.push(
		commands.registerCommand('send.elasticsearch.analyze', 
			async (document: TextDocument, range: Range) => {
				analyzeController.analyze(range);
		})
	);
	// create analyze file
	context.subscriptions.push(
		commands.registerCommand('create.elasticsearch.analyze', 
			async () => {
				analyzeController.createAnalyzeEditor();
		})
	);

}

// this method is called when your extension is deactivated
export function deactivate() {}
