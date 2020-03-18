export class AnalyzeRequest {
    public constructor (
        public host: string,
        public indexName: string,
        public analyzeName: string,
        public text: string
    ) {

    }

    public get url() {
        let url = this.host;
        if (!this.host.endsWith("/")) {
            url += '/';
        }
        if (this.indexName) {
            url += this.indexName + '/';
        }
        return url + '_analyze';
    }

    public get headers() {
        return {
            'Content-Type': 'application/json'
        };
    }

    // FIXME support custom analyzer settings
    public get body() {
        return {
            "analyzer": this.analyzeName,
            "text": this.text
        };
    }
}