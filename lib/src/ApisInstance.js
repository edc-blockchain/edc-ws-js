// var { List } = require("immutable");
let ChainWebSocket = require("./ChainWebSocket");
let GrapheneApi = require("./GrapheneApi");
let ChainConfig = require("./ChainConfig");

class ApisInstance {
	
	constructor() {
		this._db = null;
		this._net = null;
		this._hist = null;
		this._crypt = null;
		this._secure= null;
	}

	/** @arg {string} connection .. */
	connect(cs, rpc_user = "", rpc_password = "", autoReconnect = true) {
		
		// console.log("INFO\tApiInstances\tconnect\t", cs);
		
		if(typeof window !== "undefined" && window.location && window.location.protocol === "https:" && cs.indexOf("wss://") < 0) {
			throw new Error("Secure domains require wss connection");
		}
		
		this.ws_rpc = new ChainWebSocket(cs, this.statusCb, autoReconnect);
		
		this.init_promise = this.ws_rpc.login(rpc_user, rpc_password).then(() => {
			this.ws_rpc.on_reconnect = () => this.ws_rpc.login(rpc_user, rpc_password);
			return Promise.resolve()
			.then(() => this.db_api().exec("get_chain_id", []).then(_chain_id => {
				this.chain_id = _chain_id;
				ChainConfig.setChainId(_chain_id);
				return this;
			}));
		});
	}
	
	close() {
		if(this.ws_rpc) this.ws_rpc.close();
		this.ws_rpc = null;
	}
	
	db_api() {
		if (!this._db) {
			this._db = new GrapheneApi(this.ws_rpc, "database");
		}
		return this._db;
	}
	
	network_api() {
		if (!this._net) {
			this._net = new GrapheneApi(this.ws_rpc, "network_broadcast");
		}
		return this._net;
	}
	
	history_api() {
		if (!this._hist) {
			this._hist = new GrapheneApi(this.ws_rpc, "history");
		}
		return this._hist;
	}
	
	crypto_api() {
		if (!this._crypt) {
			this._crypt = new GrapheneApi(this.ws_rpc, "crypto");
		}
		return this._crypt;
	}
	
	secure_api() {
		if (!this._secure) {
			this._secure = new GrapheneApi(this.ws_rpc, "secure");
		}
		return this._secure;
	}
	
	setRpcConnectionStatusCallback(callback) {
		this.statusCb = callback;
	}
}

module.exports = ApisInstance;
