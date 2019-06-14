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

