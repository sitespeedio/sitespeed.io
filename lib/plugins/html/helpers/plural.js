'use strict';

module.exports = function ( value, text ) {
	if ( value > 1 ) {
		return text + 's';
	}
	return text;
};
