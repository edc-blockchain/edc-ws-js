let ApisInstance = require("./ApisInstance");

class ApisSingleton {
	
	constructor() {
		this.inst = null;
	}
	
	setRpcConnectionStatusCallback(callback) {
		this.statusCb = callback;
		if(this.inst) this.inst.setRpcConnectionStatusCallback(callback);
	}
	
	/**
	 @arg {string} cs is only provided in the first call
	 @return {Apis} singleton .. Check Apis.instance().init_promise to know when the connection is established
	 */
	reset(cs = "ws://localhost:8090", connect, user, password, autoReconnect) {
		if(this.inst) {
			this.inst.close();
			this.inst = null;
		}
		this.inst = new ApisInstance();
		this.inst.setRpcConnectionStatusCallback(this.statusCb);
		
		if(this.inst && connect) {
			this.inst.connect(cs, user, password, autoReconnect);
		}
		
		return this.inst;
	}
	instance(cs = "ws://localhost:8090", connect, user, password, autoReconnect) {
		if(!this.inst) {
			this.inst = new ApisInstance();
			this.inst.setRpcConnectionStatusCallback(this.statusCb);
		}
		
		if(this.inst && connect) {
			this.inst.connect(cs, user, password, autoReconnect);
		}
		
		return this.inst;
	}
	
	close () {
		if(this.inst) {
			this.inst.close();
			this.inst = null;
		}
	}
}

export default ApisSingleton;