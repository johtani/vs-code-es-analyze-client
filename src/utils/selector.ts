import { EOL } from 'os';
import { TextEditor, Range } from "vscode";

export const LineSplitterRegex: RegExp = /\r?\n/g;

export interface RequestRangeOptions {
    ignoreCommentLine?: boolean;
    ignoreEmptyLine?: boolean;
}

export interface SelectedRequest {
    text: string;
    host: string;
    indexName: string;
    analyzerNames: string[];
}

export function validateRequest(request: SelectedRequest): string[] {
    let errors:string[] = [];
    if(!request.text) {
        errors.push("text is empty. ");
    }
    if(!request.host) {
        errors.push("host is empty. ");
    }
    if(!request.indexName) {
        errors.push("indexName is empty. ");
    }
    if(!request.analyzerNames) {
        errors.push("analyzerNames is empty. ");
    } else {
        for (const analyzerName of request.analyzerNames) {
            if(!analyzerName) {
                errors.push("analyzerNames has empty string. ");
            }
        }
    }
    return errors;
}


export class Selector {

    public static async getRequest(editor: TextEditor, range: Range | null = null): Promise<SelectedRequest | null> {
        if (!editor.document) {
            return null;
        }

        let selectedText: string | null;
        if (editor.selection.isEmpty || range) {
            const activeLine = !range ? editor.selection.active.line : range.start.line;
            selectedText = this.getDelimitedText(editor.document.getText(), activeLine);
        } else {
            selectedText = editor.document.getText(editor.selection);
        }

        if (selectedText === null) {
            return null;
        }

        const json = JSON.parse(selectedText) as SelectedRequest;
        return json;
    }
    
    public static getRequestRanges(lines: string[], options?: RequestRangeOptions): [number, number][] {
        options = {
                ignoreCommentLine: true,
                ignoreEmptyLine: true,
            ...options};
        const requestRanges: [number, number][] = [];
        const delimitedLines = this.getDelimiterRows(lines);
        delimitedLines.push(lines.length);

        let prev = -1;
        for (const current of delimitedLines) {
            let start = prev + 1;
            let end = current - 1;
            while (start <= end) {
                const startLine = lines[start];

                if (options.ignoreEmptyLine && this.isEmptyLine(startLine)) {
                    start++;
                    continue;
                }

                const endLine = lines[end];
                if (options.ignoreEmptyLine && this.isEmptyLine(endLine)) {
                    end--;
                    continue;
                }

                requestRanges.push([start, end]);
                break;
            }
            prev = current;
        }

        return requestRanges;
    }

    public static isEmptyLine(line: string): boolean {
        return line.trim() === '';
    }
    
    private static getDelimitedText(fullText: string, currentLine: number): string | null {
        const lines: string[] = fullText.split(LineSplitterRegex);
        const delimiterLineNumbers: number[] = this.getDelimiterRows(lines);
        if (delimiterLineNumbers.length === 0) {
            return fullText;
        }

        // return null if cursor is in delimiter line
        if (delimiterLineNumbers.includes(currentLine)) {
            return null;
        }

        if (currentLine < delimiterLineNumbers[0]) {
            return lines.slice(0, delimiterLineNumbers[0]).join(EOL);
        }

        if (currentLine > delimiterLineNumbers[delimiterLineNumbers.length - 1]) {
            return lines.slice(delimiterLineNumbers[delimiterLineNumbers.length - 1] + 1).join(EOL);
        }

        for (let index = 0; index < delimiterLineNumbers.length - 1; index++) {
            const start = delimiterLineNumbers[index];
            const end = delimiterLineNumbers[index + 1];
            if (start < currentLine && currentLine < end) {
                return lines.slice(start + 1, end).join(EOL);
            }
        }

        return null;
    }

    private static getDelimiterRows(lines: string[]): number[] {
        const rows: number[] = [];
        for (let index = 0; index < lines.length; index++) {
            if (lines[index].match(/^#{3,}/)) {
                rows.push(index);
            }
        }
        return rows;
    }
}