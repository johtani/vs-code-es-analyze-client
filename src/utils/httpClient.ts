import * as request from 'request';
import { AnalyzeRequest } from "../models/analyzeRequest";
import { AnalyzeResponse } from "../models/analyzeResponse";

export class HttpClient {
    public async send(analyzeRequest: AnalyzeRequest): Promise<AnalyzeResponse>{
        let options: any = {
            method: "POST",
            url: analyzeRequest.url,
            body: this.normalizeBody(JSON.stringify(analyzeRequest.body)),
            headers: analyzeRequest.headers
        };
        
        return new Promise<AnalyzeResponse>((resolve, reject)=> {
            request(options, (error: any, response: any, body: any) => {
                if(error) {
                    console.log("error!!");
                    let analyzeResponse = {
                        statusCode: error.statusCode,
                        message: error.message
                    };
                    reject(analyzeResponse);
                } else {
                    let analyzeResponse: AnalyzeResponse = {
                        statusCode: response.statusCode,
                        message: response.statusMessage,
                        analyzerName: analyzeRequest.analyzeName,
                    };
                    let body = response.body;
                    if(body) {
                        try{
                            let bodyJson = JSON.parse(response.body);
                            if (bodyJson.tokens) {
                                analyzeResponse.tokens = bodyJson.tokens;
                            } else {
                                analyzeResponse.errorDetail = bodyJson.error.reason;
                            }
                        }catch(ex){
                            //FIXME logging
                            console.log(ex.message);
                            console.log(ex.statusMessage);
                        }
                    }
                    if(response.statusCode === 200) {
                        analyzeResponse.completed = true;
                    } else {
                        analyzeResponse.completed = false;
                    }
                    resolve(analyzeResponse);
                }                
            });
        });
    }

    private normalizeBody(body:string):string {

        if(body && body.length > 0) {
            body = body.replace(/[\r\n]+/g, '');
        }

        return body;
    }
}