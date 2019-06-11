// Copyright (c) 2019, MTM Technology Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('MTM Packing List', {
	refresh: function(frm) {
frm.set_query('courier_name', function() {
                        return {
                                filters: {
                                        'is_transporter': 1
                                }
                        }
                });
	}
});
