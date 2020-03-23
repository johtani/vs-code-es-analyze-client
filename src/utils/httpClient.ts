import fetch from 'node-fetch';
import { AnalyzeRequest } from "../models/analyzeRequest";
import { AnalyzeResponse } from "../models/analyzeResponse";

export class HttpClient {
    public async send(analyzeRequest: AnalyzeRequest): Promise<AnalyzeResponse>{
        let options: any = {
            method: "POST",
            body: JSON.stringify(analyzeRequest.body),
            headers: analyzeRequest.headers
        };
        
        return new Promise<AnalyzeResponse>((resolve, reject)=> {
            let analyzeResponse: AnalyzeResponse = {
                analyzerName: analyzeRequest.analyzeName,
            };
            fetch(analyzeRequest.url, options)
            .then(res => {
                analyzeResponse.statusCode = res.status;
                analyzeResponse.message = res.statusText;
                return res.json();
            }).then(json => {
                const body = json;
                if(body) {
                    try{
                        if (body.tokens) {
                            analyzeResponse.tokens = body.tokens;
                        } else {
                            analyzeResponse.errorDetail = body.error.reason;
                        }
                    }catch(ex){
                        console.log(ex.message);
                        console.log(ex.statusMessage);
                        analyzeResponse.errorDetail = ex.message;
                    }
                }
                if(analyzeResponse.statusCode === 200) {
                    analyzeResponse.completed = true;
                } else {
                    analyzeResponse.completed = false;
                }
                resolve(analyzeResponse);
            })
            .catch(
                error => {
                    console.log("error!!");
                    let analyzeResponse = {
                        statusCode: error.statusCode,
                        completed: false,
                        errorDetail: error.message
                    };
                    reject(analyzeResponse);
                }
            );
        });
    }

    private normalizeBody(body:string):string {

        if(body && body.length > 0) {
            body = body.replace(/[\r\n]+/g, '');
        }

        return body;
    }
}