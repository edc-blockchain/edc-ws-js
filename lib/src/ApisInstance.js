// var { List } = require("immutable");
let ChainWebSocket = require("./ChainWebSocket");
let GrapheneApi = require("./GrapheneApi");
let ChainConfig = require("./ChainConfig");

class ApisInstance {
	
	/** @arg {string} connection .. */
	connect(cs, rpc_user = "", rpc_password = "", autoReconnect = true) {
		
		// console.log("INFO\tApiInstances\tconnect\t", cs);
		
		if(typeof window !== "undefined" && window.location && window.location.protocol === "https:" && cs.indexOf("wss://") < 0) {
			throw new Error("Secure domains require wss connection");
		}
		
		this.ws_rpc = new ChainWebSocket(cs, this.statusCb, autoReconnect);
		
		this.init_promise = this.ws_rpc.login(rpc_user, rpc_password).then(() => {
			this._db = new GrapheneApi(this.ws_rpc, "database");
			this._net = new GrapheneApi(this.ws_rpc, "network_broadcast");
			this._hist = new GrapheneApi(this.ws_rpc, "history");
			this._crypt = new GrapheneApi(this.ws_rpc, "crypto");
			this._secure= new GrapheneApi(this.ws_rpc, "secure");
			this.ws_rpc.on_reconnect = () => {
				this.ws_rpc.login(rpc_user, rpc_password).then(() => {
					return Promise.all([
						this._db.init().then((db_api) => {
							if(this.statusCb)
								this.statusCb("reconnect");
							return db_api;
						}),
						this._net.init(),
						this._hist.init(),
						this._crypt.init(),
						this._secure.init()
					].map(p => p.catch(_ => null)))
				});
			};
			return Promise.all([
				this._db.init().then((db_api) => {
					//https://github.com/cryptonomex/graphene/wiki/chain-locked-tx
					db_api.exec("get_chain_id", []).then(_chain_id => {
						this.chain_id = _chain_id;
						ChainConfig.setChainId(_chain_id);
					});
					return db_api;
				}),
				this._net.init(),
				this._hist.init(),
				this._crypt.init(),
				this._secure.init()
			].map(p => p.catch(_ => null)))
		});
	}
	
	close() {
		if(this.ws_rpc) this.ws_rpc.terminate();
		this.ws_rpc = null;
	}
	
	db_api() {
		return this._db;
	}
	
	network_api() {
		return this._net;
	}
	
	history_api() {
		return this._hist;
	}
	
	crypto_api() {
		return this._crypt;
	}
	
	secure_api() {
		return this._secure;
	}
	
	setRpcConnectionStatusCallback(callback) {
		this.statusCb = callback;
	}
}

module.exports = ApisInstance;
