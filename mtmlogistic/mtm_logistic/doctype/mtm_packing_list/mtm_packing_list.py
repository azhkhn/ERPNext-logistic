# -*- coding: utf-8 -*-
# Copyright (c) 2019, MTM Technology Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import math
from frappe import _
from frappe.model.document import Document
from frappe.utils import today
from frappe.model.mapper import get_mapped_doc
from erpnext.stock.doctype.item.item import get_item_defaults

class MTMPackingList(Document):

	def validate(self):
		if not(self.shipment_way == "By Sea" or self.shipment_way == "By Air"):
			self.port_of_embarc = ""
			self.port_of_arrival = ""
		
		# Check exist Delivery Note
		exist_name = frappe.db.get_value("MTM Packing List", {"delivery_note": self.delivery_note, "docstatus":("!=", 2)})
		if exist_name and exist_name!=self.name:
			exist_link = '<a href="#Form/{0}/{1}">{1}</a>'.format(self.doctype, exist_name)
			frappe.throw(_("Delivery Note {0} is linked with Packing List {1}").format(self.delivery_note, exist_link))
	
	def before_submit(self):
		if self.shipment_way == "By Sea" and self.container_type != "LCL":
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

@frappe.whitelist()
def get_delivery_note_items(delivery_note_name):
	items = []
	
	dn_fields = ["item_code", "item_name", "against_sales_order", "stock_qty", "stock_uom"]
	delivery_note_items = frappe.db.get_list('Delivery Note Item', filters={"parent" : delivery_note_name} , fields= dn_fields, order_by='idx asc')

	for dn_item in delivery_note_items:
		check_mtm_item = frappe.get_doc('MTM Item Info', dn_item.item_code)
		mtm_item = frappe.db.get_value('MTM Item Info', {"name" : dn_item.item_code} ,"*")

		item = frappe._dict(mtm_item)
		item.update(dn_item)

		po_no = ""
		so = frappe.get_doc('Sales Order', dn_item.against_sales_order)
		if so:
			po_no = so.po_no
		
		item.po_no = po_no

		stock_qty = int(item.stock_qty)
		qty_outer = 0
		qty_carton_outer = 0
		qty_inner = 0
		qty_carton_inner = 0

		if item.qty_per_outer > 0:
			qty_carton_outer = int(stock_qty / item.qty_per_outer)
			qty_outer =  qty_carton_outer * item.qty_per_outer
		
		qty_inner = int(stock_qty - qty_outer)
		if item.qty_per_inner > 0 and qty_inner > 0:
			qty_carton_inner = math.floor(qty_inner / item.qty_per_inner)

		item_inner = frappe._dict(item)

		if qty_carton_outer > 0:
			
			item.carton_type = "Outer Carton"
			item.carton = qty_carton_outer
			item.stock_qty = qty_outer
			item.net_weight = qty_carton_outer * mtm_item.outer_carton_net_weight
			item.gross_weight = qty_carton_outer * mtm_item.outer_carton_gross_weight
			item.cbm = 0
			item.length = (qty_carton_outer * mtm_item.outer_carton_length)/1000
			item.width = (qty_carton_outer * mtm_item.outer_carton_width)/1000
			item.height = (qty_carton_outer * mtm_item.outer_carton_height)/1000

			items.append(item)
		
		if qty_carton_inner > 0:
	
			item_inner.carton_type = "Inner Carton"
			item_inner.carton = qty_carton_inner
			item_inner.stock_qty = qty_inner
			item_inner.net_weight = qty_carton_inner * mtm_item.inner_carton_net_weight
			item_inner.gross_weight = qty_carton_inner * mtm_item.inner_carton_gross_weight
			item_inner.cbm = 0
			item_inner.length = (qty_carton_inner * mtm_item.inner_carton_length)/1000
			item_inner.width = (qty_carton_inner * mtm_item.inner_carton_width)/1000
			item_inner.height = (qty_carton_inner * mtm_item.inner_carton_height)/1000

			items.append(item_inner)

	
	return items