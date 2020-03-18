import { AnalyzeRequest } from "../models/analyzeRequest";
import { HttpClient } from "../utils/httpClient";
import { ResponseTextDocuemntView } from "../views/responseTextDocumentView";
import { AnalyzeResponse } from "../models/analyzeResponse";
import { Range, TextEditor, window, ViewColumn, Uri, workspace } from "vscode";
import { Selector, SelectedRequest, validateRequest } from "../utils/selector";
import { ResponseWebView } from "../views/responseWebView";

export class AnalyzeController {
    private _httpClient: HttpClient;
    private _textView: ResponseTextDocuemntView;
    private _webview: ResponseWebView;

    public constructor() {
        this._httpClient = new HttpClient();
        this._textView = new ResponseTextDocuemntView();
        this._webview = new ResponseWebView();
    }

    private static messageBoxOption = {modal: true};

    public async analyze( range: Range) {
        const editor = window.activeTextEditor;
        const document = window.activeTextEditor?.document;
        if (!editor || !document) {
             return;
        }

        const selectedText = await Selector.getRequestText(editor, range);

        if (!selectedText) {
            window.showErrorMessage("There is no parameters/text in the editor. ", AnalyzeController.messageBoxOption);
            return;
        }

        let selectedRequest = undefined;
        try {
            selectedRequest = JSON.parse(selectedText) as SelectedRequest;
        } catch(ex) {
            console.log(ex);
            window.showErrorMessage("Parse error with text in the editor. " + ex, AnalyzeController.messageBoxOption);
            return;
        }

        if (!selectedRequest) {
            window.showErrorMessage("Parse error with text in the editor. ", AnalyzeController.messageBoxOption);
            return;
        }

        const errors = validateRequest(selectedRequest);
        if (errors && errors.length > 0) {
            window.showErrorMessage(errors.join("\r\n"), AnalyzeController.messageBoxOption);
            return;
        }

        let request = new AnalyzeRequest(
            selectedRequest.host,
            selectedRequest.indexName,
            "",
            selectedRequest.text
        );
        let responses: AnalyzeResponse[] = [];

        for (var analyzer of selectedRequest.analyzerNames) {
            request.analyzeName = analyzer;
            let response = await this._httpClient.send(request);
            responses.push(response);
        }

        const editorColumn = window.activeTextEditor!.viewColumn;
        const viewColumn = ((editorColumn as number) + 1) as ViewColumn;
        
        //this._textView.render(responses, viewColumn, selectedRequest.text);
        this._webview.render(responses, viewColumn, selectedRequest.text);
    }

    public async createAnalyzeEditor(filename?: string) {
        const content = '###\n{\n  "host": "http://localhost:9200"\n  "indexName": ""\n  "analyzerNames": [""]\n  "text": ""\n}\n';
        const language = 'analyze';
        let doc = await workspace.openTextDocument({language, content});
        let editorColumn;
        if (window.activeTextEditor) {
            editorColumn = window.activeTextEditor.viewColumn;
        }
        if (!editorColumn) {
            editorColumn = 1 as ViewColumn;
        }
        window.showTextDocument(doc, editorColumn);
    }

    public dispose() {
        this._webview.dispose();
    }


}