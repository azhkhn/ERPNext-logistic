# -*- coding: utf-8 -*-
# Copyright (c) 2019, MTM Technology Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import today

class MTMPackingList(Document):

	def validate(self):
		if self.shipment_way != "By Sea":
			self.port_of_embarc = ""
			self.port_of_arrival = ""
		
		# Check exist Delivery Note
		exist_name = frappe.db.get_value("MTM Packing List", {"delivery_note": self.delivery_note, "docstatus":("!=", 2)})
		if exist_name and exist_name!=self.name:
			exist_link = '<a href="#Form/{0}/{1}">{1}</a>'.format(self.doctype, exist_name)
			frappe.throw(_("Delivery Note {0} is linked with Packing List {1}").format(self.delivery_note, exist_link))
	
	def before_submit(self):
		if self.shipment_way == "By Sea":
			if not self.container_number:
				frappe.throw(_("Container Number is Required"), title="Mandatory Field")
			if not self.seal_number:
				frappe.throw(_("Seal Number is Required"), title="Mandatory Field")
		
		if self.shipment_way == "By Courier":
			if not self.tracking_number:
				frappe.throw(_("Tracking Number is Required"), title="Mandatory Field")
		
		if self.shipment_way == "By Air":
			if not self.awb_number:
				frappe.throw(_("AWB Number is Required"), title="Mandatory Field")


@frappe.whitelist()
def delivery_note_query(doctype, txt, searchfield, start, page_len, filters):

	pl_condition = ""
	
	if filters.get('pl_name'):
		pl_name = filters.get('pl_name')
		pl_condition += " and  pl.name != '{0}'".format(pl_name)

	return frappe.db.sql("""
		SELECT
			dn.name, dn.customer
		FROM
			`tabDelivery Note` as dn
		WHERE
			dn.docstatus = 1 AND
			(dn.name like %(txt)s or dn.customer like %(txt)s) AND
			dn.name NOT IN (
				 	select
					   pl.delivery_note from `tabMTM Packing List` as pl
				   	where
					   pl.docstatus != 2 {pl_condition}
			)			
		ORDER BY
			if(locate(%(_txt)s, dn.name), locate(%(_txt)s, dn.name), 99999),
			dn.name
		LIMIT
			%(start)s, %(page_len)s""".format(
			pl_condition = pl_condition),
		{
			'txt': "%%%s%%" % txt,
			'_txt': txt.replace("%", ""),
			'start': start,
			'page_len': page_len,
		}
	)
