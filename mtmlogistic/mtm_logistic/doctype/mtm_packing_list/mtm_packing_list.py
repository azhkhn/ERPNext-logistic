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

	def before_submit(self):
		if self.shipment_way == "By Sea":
			if not self.container_number:
				frappe.throw(_("Container Number is Required"), title="Mandatory Field")
			if not self.seal_number:
				frappe.throw(_("Seal Number is Required"), title="Mandatory Field")
		
		if self.shipment_way == "By Courier":
			if not self.container_number:
				frappe.throw(_("Container Number is Required"), title="Mandatory Field")
		
		if self.shipment_way == "By Air":
			if not self.awb_number:
				frappe.throw(_("AWB Number is Required"), title="Mandatory Field")

