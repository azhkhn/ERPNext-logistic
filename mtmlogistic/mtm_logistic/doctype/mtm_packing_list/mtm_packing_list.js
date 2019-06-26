// Copyright (c) 2019, MTM Technology Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('MTM Packing List', {
	refresh: function (frm) {
		set_reqd_shipment_way(frm);
	},
	setup: function(frm) {
		frm.set_query('courier_name', function () {
			return {
				filters: {
					'is_transporter': 1
				}
			}
		});

		frm.set_query('delivery_note', function (doc) {
			return {
				query: 'mtmlogistic.mtm_logistic.doctype.mtm_packing_list.mtm_packing_list.delivery_note_query',
				filters: {
					pl_name: doc.name
				}
			}
		});
		
		frm.set_query("shipping_address_name", function(doc) {
			return {
				query: 'frappe.contacts.doctype.address.address.address_query',
				filters: {
					link_doctype: "Customer",
					link_name: doc.customer
				}
			};
		});
		
		frm.set_query("contact_person", function(doc) {
			return {
				query: 'frappe.contacts.doctype.contact.contact.contact_query',
				filters: {
					link_doctype: "Customer",
					link_name: doc.customer
				}
			};
		});
		// frm.trigger("delivery_note");
	},
	validate: function(frm) {
		if(frm.doc.date < frappe.datetime.get_today()) {
			msgprint(__("Document Date cannot be before Today"));
			frm.set_value("date", "");
            validated = false;
		}
	},
	eta: function(frm) {
		if (frm.doc.eta && frm.doc.etd && (frm.doc.eta < frm.doc.etd)) {
			msgprint(__("ETA cannot be before ETD"));
			frm.set_value("eta", "");
		}
	},
	etd: function(frm) {
		if (frm.doc.eta && frm.doc.etd && (frm.doc.eta < frm.doc.etd)) {
			msgprint(__("ETD cannot be after ETA"));
			frm.set_value("etd", "");
		}
	},
	delivery_note: function(frm, cdt, cdn) {
		if(frm.doc.delivery_note){
			frappe.model.with_doc("Delivery Note", frm.doc.delivery_note, function() {
				let delivery_note = frappe.model.get_doc("Delivery Note", frm.doc.delivery_note);
				frm.set_value("customer", delivery_note.customer);
				frm.set_value("customer_name", delivery_note.customer_name);
				frm.set_value("contact_person", delivery_note.contact_person);
				frm.set_value("shipping_address_name", delivery_note.shipping_address_name);

				frappe.call({
					method: "mtmlogistic.mtm_logistic.doctype.mtm_packing_list.mtm_packing_list.get_delivery_note_items",
					args: {
						delivery_note_name: frm.doc.delivery_note
					},
					callback: function(r) {
						if (!r.message) {
							frappe.throw(__("Delivery Note does not contain any item"));
						} else {
							frappe.model.clear_table(frm.doc, "items");
							let idx = 0;
							$.each(r.message, function(i, dnitem) {
								let d = frappe.model.add_child(cur_frm.doc, "MTM Packing List Item", "items");

								for(let k in dnitem) {
									let v = dnitem[k];
									if (["doctype", "name", "docstatus"].indexOf(k)===-1) {
										frappe.model.set_value(d.doctype, d.name, k, v);
									}
								}
								idx ++;
								frappe.model.set_value(d.doctype, d.name, "idx", idx);

							});
						}
						refresh_field("items");
					}
				});

			});
		}
	},
	customer: function(frm) {
		frm.set_value("contact_person", "");
		frm.set_value("shipping_address_name", "");
	},
	shipping_address_name: function(frm) {
		erpnext.utils.get_address_display(frm, 'shipping_address_name', 'shipping_address', true);
	},
	contact_person: function(frm) {
		frm.set_value("contact_mobile", "");
		frm.set_value("contact_display", "");
		erpnext.utils.get_contact_details(frm);
	},
	shipment_way: function(frm) {
		set_reqd_shipment_way(frm);
	},
	port_of_embark: function(frm) {
		if (frm.doc.port_of_arrival && (frm.doc.port_of_embark == frm.doc.port_of_arrival)) {
			msgprint(__("Port of Embarc cannot be same Port of Arrival"));
			frm.set_value("port_of_embark", "");
		}
	},
	port_of_arrival: function(frm) {
		if (frm.doc.port_of_embark && (frm.doc.port_of_embark == frm.doc.port_of_arrival)) {
			msgprint(__("Port of Arrival cannot be same Port of Embarc"));
			frm.set_value("port_of_arrival", "");
		}
	},
});

var set_reqd_shipment_way = function(frm){
	if(frm.doc.shipment_way == "By Sea"){
		frm.set_df_property("shipment_terms", "reqd", 1);
		frm.set_df_property("container_type", "reqd", 1);
	}else{
		frm.set_df_property("shipment_terms", "reqd", 0);
		frm.set_df_property("container_type", "reqd", 0);
	}

	if (frm.doc.shipment_way == "By Courier"){
		frm.set_df_property("courier_name", "reqd", 1);
	}else{ 
		frm.set_df_property("courier_name", "reqd", 0);
	}

	if (frm.doc.shipment_way == "By Air" || frm.doc.shipment_way == "By Sea"){
		frm.set_df_property("port_of_embark", "reqd", 1);
		frm.set_df_property("port_of_arrival", "reqd", 1);
	}else{
		frm.set_df_property("port_of_embark", "reqd", 0);
		frm.set_df_property("port_of_arrival", "reqd", 0);
	}
}
