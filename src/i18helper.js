'use strict';

exports.getCatalog = function(req, ns){
        const catalog = req.i18n.getCatalog();
        let o = {};
	let nsCatalog = catalog[ns];
        for (var key in nsCatalog) {
                if (Object.prototype.hasOwnProperty.call(nsCatalog, key)) {
                                o[key] = nsCatalog[key];
                }
        }

        return o;
}
