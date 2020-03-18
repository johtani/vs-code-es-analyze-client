import { TokenInfo } from "./tokenInfo";

export interface AnalyzeResponse {
    statusCode?:number;
    analyzerName?:string;
    message?:string;
    tokens?:Array<TokenInfo>;
    completed?:boolean;
    errorDetail?:string;
}