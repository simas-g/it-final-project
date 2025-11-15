{
  "name": "Inventory External Viewer",
  "summary": "Read-only viewer for aggregated inventories imported via API tokens",
  "version": "1.0.0",
  "author": "Simas",
  "category": "Inventory",
  "website": "https://example.com",
  "depends": ["base"],
  "data": [
    "security/ir.model.access.csv",
    "views/inventory_viewer_menu.xml",
    "views/inventory_viewer_views.xml",
    "views/inventory_import_wizard_views.xml"
  ],
  "application": False,
  "installable": True,
  "license": "LGPL-3"
}

