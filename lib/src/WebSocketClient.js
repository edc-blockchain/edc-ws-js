const WebSocket = require('isomorphic-ws');

function WebSocketClient(autoReconnect = true){
    this.number = 0;	// Message number
    this.autoReconnect = autoReconnect;
	this.autoReconnectInterval = 5 * 1000;	// ms
}

WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
	this.instance.onopen = () => {
		this.onopen();
	};
	this.instance.onmessage = (data,flags) => {
		this.number++;
		this.onmessage(data,flags,this.number);
    };
	this.instance.onclose = (e) => {
		switch (e.code){
		case 1000:	// CLOSE_NORMAL
			console.log("WebSocket: closed");
			break;
		default:	// Abnormal closure
			this.reconnect(e);
			break;
		}
		this.onclose(e);
    };
	this.instance.onerror = (e) => {
		switch (e.code){
		case 'ECONNREFUSED':
			this.reconnect(e);
			break;
		default:
			this.onerror(e);
			break;
		}
	};
}

WebSocketClient.prototype.send = function(data, option) {
	if (this.instance.readyState === 1) {
		try {
			this.instance.send(data, option);
		} catch(e) {
			this.instance.emit('error',e);
		}
	} else {
		if (this.autoReconnect) {
			console.log("WebSocketClient: waiting for web socket...");
			var that = this;
			setTimeout(function(){
				that.send(data, option);
			}, 100);
		} else {
			throw Error('WebSocket is not open');
		}
	}
}

WebSocketClient.prototype.reconnect = function(e) {
    if (!this.autoReconnect) {
        console.log("WebSocket: closed");
        return
    }
	console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,e);
	this.instance.onopen = null;
	this.instance.onmessage = null;
	this.instance.onclose = null;
	this.instance.onerror = null;
	var that = this;
	setTimeout(function(){
		console.log("WebSocketClient: reconnecting...");
		that.open(that.url);
	}, this.autoReconnectInterval);
}

WebSocketClient.prototype.onopen = function(e){	console.log("WebSocketClient: open",arguments);	}
WebSocketClient.prototype.onmessage = function(data,flags,number){	console.log("WebSocketClient: message",arguments);	}
WebSocketClient.prototype.onerror = function(e){	console.log("WebSocketClient: error",arguments);	}
WebSocketClient.prototype.onclose = function(e){	console.log("WebSocketClient: closed",arguments);	}

module.exports = WebSocketClient;