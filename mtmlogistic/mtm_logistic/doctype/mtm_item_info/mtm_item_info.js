// Copyright (c) 2019, MTM Technology Ltd and contributors
// For license information, please see license.txt

var mtm_item_fields = [

	'pack_width',
	'pack_length',
	'pack_volume',
	'pack_height',
	'product_gross_weight',
	'product_net_weight',

	'qty_per_inner',
	'qty_per_outer',
	
	
	'inner_carton_width',
	'inner_carton_height',
	'inner_carton_length',
	'inner_carton_net_weight',
	'inner_carton_gross_weight',
	'inner_carton_volume',

	'outer_carton_length',
	'outer_carton_width',
	'outer_carton_height',
	'outer_carton_net_weight',
	'outer_carton_gross_weight',
	'outer_carton_volume',	
	
];

frappe.ui.form.on('MTM Item Info', {
	refresh: function(frm) {
		if(!frm.doc.skip_pack){
			frm.set_df_property("hs_code", "reqd", 1);
		}
	},
	skip_pack: function(frm) {
		if(frm.doc.skip_pack){
			frm.set_df_property("hs_code", "reqd", 0);
			$.each(mtm_item_fields, function(i, field) {
				console.log(frm.doc[field]);
				if(frm.doc[field]==undefined){
					frm.set_value(field, "0");
				}
			});
		}else{
			frm.set_df_property("hs_code", "reqd", 1);
		}
	}
});
