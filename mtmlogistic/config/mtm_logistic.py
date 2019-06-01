from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Transactions"),
			"icon": "fa fa-table",
			"items": [
				{
					"type": "doctype",
					"name": "MTM Packing List",
					"label": _("MTM Packing List")
				},
				{
					"type": "doctype",
					"name": "MTM Shipment Booking",
					"label": _("MTM Shipment Booking")
				},
				{
					"type": "doctype",
					"name": "MTM Item Info",
					"label": _("Item Management")
				}
			]

		},
		{
			"label": _("Logistic Setup"),
			"icon": "fa fa-table",
			"items": [
				{
					"type": "doctype",
					"name": "MTM HS codes",
					"label": _("MTM HS codes")
				},
				{
					"type": "doctype",
					"name": "MTM Incoterms",
					"label": _("MTM Incoterms")
				},
				{
					"type": "doctype",
					"name": "MTM Ports",
					"label": _("MTM Ports")
				},
				{
					"type": "doctype",
					"name": "MTM Shipment Way",
					"label": _("MTM Shipment Way")
				}
			]

		}
    ]        