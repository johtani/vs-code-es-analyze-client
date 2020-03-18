import { languages, Position, Range, TextDocument, ViewColumn, window, workspace } from 'vscode';
import { AnalyzeResponse } from "../models/analyzeResponse";

export class ResponseTextDocuemntView {

    public constructor() {
    }

    public async render(responses: AnalyzeResponse[], viewColumn: ViewColumn) {
        const content = this.getTextDocumentResponse(responses);
        const language = "plaintext";

        let document = await workspace.openTextDocument({language, content});
        window.showTextDocument(document, viewColumn);
    }

    private getTextDocumentResponse(responses: AnalyzeResponse[]) {
        let content = '';

        responses.map(
            response => {
                content += response.analyzerName;
                content += "\t";
                if (response.completed) {
                    content += response.tokens?.map(token => {
                        return token.token;
                    }).join(", ");
                } else {
                    content += response.message;
                }
                content += "\n";
            }
        );
        return content;
    }
}