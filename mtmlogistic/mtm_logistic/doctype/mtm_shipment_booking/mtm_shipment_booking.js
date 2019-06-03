// Copyright (c) 2019, MTM Technology Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('MTM Shipment Booking', {
	refresh: function(frm) {

	}
});
frappe.ui.form.on("MTM Shipment Booking", "validate", function(frm) {
	if (frm.doc.cargo_ready_date <= get_today()) {
		msgprint(__("You can not select past or today date"));
		validated = false;
	}
	if (frm.doc.cutoff_date <= get_today()) {
                msgprint(__("You can not select past or today date"));
                validated = false;
        }
	if (frm.doc.cargo_ready_date >= frm.doc.cutoff_date) {
                msgprint(__("Cargo Ready Date Day is after Cut Off Day"));
                validated = false;
        }
});
