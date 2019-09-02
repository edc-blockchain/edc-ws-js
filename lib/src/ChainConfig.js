var _this;

var ecc_config = {
	address_prefix: process.env.npm_config__graphene_ecc_default_address_prefix || "EDC"
};

module.exports = _this = {
	core_asset: "EDC",
	address_prefix: "EDC",
	expire_in_secs: 15,
	expire_in_secs_proposal: 24 * 60 * 60,
	networks: {
		edc_blockchain: {
			core_asset: "EDC",
			address_prefix: "EDC",
			chain_id: "979b29912e5546dbf47604692aafc94519f486c56221a5705f0c7f5f294df126"
		}
	},

	/** Set a few properties for known chain IDs. */
	setChainId: function(chain_id) {

		var i, len, network, network_name, ref;
		ref = Object.keys(_this.networks);

		for(i = 0, len = ref.length; i < len; i++) {

			network_name = ref[i];
			network = _this.networks[network_name];

			if(network.chain_id === chain_id) {

				_this.network_name = network_name;

				if(network.address_prefix) {
					_this.address_prefix = network.address_prefix;
					ecc_config.address_prefix = network.address_prefix;
				}

				// console.log("INFO    Configured for", network_name, ":", network.core_asset, "\n");

				return {
					network_name: network_name,
					network: network
				}
			}
		}

		if(!_this.network_name) {
			console.log("Unknown chain id (this may be a testnet)", chain_id);
		}

	},

	reset: function() {
		_this.core_asset = "EDC";
		_this.address_prefix = "EDC";
		ecc_config.address_prefix = "EDC";
		_this.expire_in_secs = 15;
		_this.expire_in_secs_proposal = 24 * 60 * 60;

		console.log("Chain config reset");
	},

	setPrefix: function(prefix = "EDC") {
		_this.address_prefix = prefix;
		ecc_config.address_prefix = prefix;
	}
};
