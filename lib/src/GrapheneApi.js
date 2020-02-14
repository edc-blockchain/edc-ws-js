class GrapheneApi {

    constructor(ws_rpc, api_name) {
        this.ws_rpc = ws_rpc;
        this.api_name = api_name;
    }

    init() {
        var self = this;
        return this.ws_rpc.call([1, this.api_name, []]).then( response => {
            //console.log("[GrapheneApi.js:11] ----- GrapheneApi.init ----->", this.api_name, response);
            self.api_id = response;
            return self;
        });
    }

    exec(method, params) {
        let init = this.api_id ? Promise.resolve() : this.init();
        return init.then(() => this.ws_rpc.call([this.api_id, method, params]));
    }
}

module.exports = GrapheneApi;
