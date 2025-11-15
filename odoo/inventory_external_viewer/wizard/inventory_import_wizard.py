import requests

from odoo import fields, models, _
from odoo.exceptions import UserError


class InventoryViewerImportWizard(models.TransientModel):
  _name = "inventory.viewer.import.wizard"
  _description = "Import External Inventory"

  api_token = fields.Char(required=True)
  base_url = fields.Char(required=True, default=lambda self: self._default_base_url())
  inventory_id = fields.Many2one("inventory.viewer.inventory", string="Inventory")

  def _default_base_url(self):
    param = self.env["ir.config_parameter"].sudo().get_param("inventory.viewer.base_url")
    return param or "http://host.docker.internal:8080"

  def action_import(self):
    self.ensure_one()
    base_url = (self.base_url or "").rstrip("/")
    if not base_url:
      raise UserError(_("Base URL is required"))
    endpoint = f"{base_url}/api/external/inventories/aggregations?token={self.api_token}"
    try:
      response = requests.get(endpoint, timeout=30)
      response.raise_for_status()
      payload = response.json()
    except requests.RequestException as exc:
      raise UserError(_("Failed to fetch data from API: %s") % exc) from exc
    inventory_payload = payload.get("inventory") or {}
    metrics_payload = payload.get("metrics") or {}
    fields_payload = payload.get("fields") or []
    if not inventory_payload:
      raise UserError(_("API response is missing inventory metadata"))
    if not metrics_payload:
      metrics_payload = {
        "calculatedAt": fields.Datetime.now().isoformat(),
        "totalItems": inventory_payload.get("totalItems", 0),
        "fieldCount": inventory_payload.get("fieldsCount", 0),
        "numericFieldCount": 0,
        "booleanFieldCount": 0,
        "textFieldCount": 0,
        "mediaFieldCount": 0,
      }
    inventory_vals = {
      "name": inventory_payload.get("name") or _("External inventory"),
      "token": self.api_token,
      "external_inventory_id": inventory_payload.get("id"),
      "description": inventory_payload.get("description"),
      "total_items": inventory_payload.get("totalItems"),
      "field_count": inventory_payload.get("fieldsCount"),
      "metrics_json": metrics_payload,
      "synced_at": fields.Datetime.now(),
    }
    if self.inventory_id:
      record = self.inventory_id
      record.field_ids.unlink()
      record.write(inventory_vals)
    else:
      record = self.env["inventory.viewer.inventory"].create(inventory_vals)
    field_commands = []
    for field_payload in fields_payload:
      field_commands.append(
        (
          0,
          0,
          {
            "name": field_payload.get("title"),
            "field_type": field_payload.get("fieldType"),
            "stat_json": field_payload.get("stats"),
          },
        )
      )
    record.write({"field_ids": field_commands})
    return {
      "type": "ir.actions.act_window",
      "res_model": "inventory.viewer.inventory",
      "res_id": record.id,
      "view_mode": "form",
    }

