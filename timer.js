;(function(exports) {

	function Timer() {
		this.endTime = 0;
	}

	Timer.prototype = {

		setEndTime: function(time) {
			this.endTime = new Date().getTime() + time;
		},
		getEndTime: function() {
			return this.endTime;
		}
	}; // thanks CAO

	exports.Timer = Timer;

})(typeof exports === 'undefined' ? this : exports);