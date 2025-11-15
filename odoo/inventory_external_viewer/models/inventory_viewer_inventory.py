from odoo import api, fields, models, _


class InventoryViewerInventory(models.Model):
  _name = "inventory.viewer.inventory"
  _description = "External Inventory Snapshot"
  _order = "synced_at desc, name"

  name = fields.Char(required=True)
  token = fields.Char(string="API Token")
  external_inventory_id = fields.Char(string="Inventory ID")
  description = fields.Text()
  total_items = fields.Integer()
  field_count = fields.Integer()
  metrics_json = fields.Json(string="Metrics")
  metrics_summary = fields.Text(compute="_compute_metrics_summary", string="Metrics Summary", store=False)
  synced_at = fields.Datetime()
  field_ids = fields.One2many("inventory.viewer.field", "inventory_id", string="Fields", copy=False)

  @api.depends("metrics_json")
  def _compute_metrics_summary(self):
    for record in self:
      metrics = record.metrics_json or {}
      if not metrics:
        record.metrics_summary = _("No metrics available")
        continue
      lines = []
      if metrics.get("totalItems") is not None:
        lines.append(_("Total Items: %(count)d") % {"count": metrics.get("totalItems", 0)})
      if metrics.get("fieldCount") is not None:
        lines.append(_("Field Count: %(count)d") % {"count": metrics.get("fieldCount", 0)})
      if metrics.get("numericFieldCount") is not None:
        lines.append(_("Numeric Fields: %(count)d") % {"count": metrics.get("numericFieldCount", 0)})
      if metrics.get("textFieldCount") is not None:
        lines.append(_("Text Fields: %(count)d") % {"count": metrics.get("textFieldCount", 0)})
      if metrics.get("booleanFieldCount") is not None:
        lines.append(_("Boolean Fields: %(count)d") % {"count": metrics.get("booleanFieldCount", 0)})
      if metrics.get("calculatedAt"):
        lines.append(_("Calculated At: %(date)s") % {"date": metrics.get("calculatedAt").split("T")[0]})
      record.metrics_summary = "\n".join(lines) if lines else _("No metrics available")

  def action_open_import_wizard(self):
    self.ensure_one()
    return {
      "name": _("Import inventory"),
      "type": "ir.actions.act_window",
      "res_model": "inventory.viewer.import.wizard",
      "view_mode": "form",
      "target": "new",
      "context": {
        "default_inventory_id": self.id,
        "default_api_token": self.token or False,
      },
    }


class InventoryViewerField(models.Model):
  _name = "inventory.viewer.field"
  _description = "External Inventory Field"
  _order = "name"

  inventory_id = fields.Many2one("inventory.viewer.inventory", required=True, ondelete="cascade")
  name = fields.Char(required=True, string="Field")
  field_type = fields.Char(string="Type")
  stat_json = fields.Json(string="Statistics", copy=False)
  stat_summary = fields.Text(compute="_compute_stat_summary", string="Summary", store=False)

  @api.depends("stat_json")
  def _compute_stat_summary(self):
    for record in self:
      stats = record.stat_json or {}
      summary = ""
      stats_type = stats.get("type")
      if stats_type == "numeric":
        min_val = stats.get("min")
        max_val = stats.get("max")
        avg_val = stats.get("average")
        count = stats.get("count", 0)
        if min_val is not None and max_val is not None and avg_val is not None:
          summary = _("Min: %(min)s | Max: %(max)s | Avg: %(avg)s | Count: %(count)s") % {
            "min": min_val,
            "max": max_val,
            "avg": avg_val,
            "count": count,
          }
        else:
          summary = _("No numeric values (%(count)s total)") % {"count": count}
      elif stats_type == "text":
        most_frequent = stats.get("mostFrequent") or []
        unique_count = stats.get("uniqueValues", 0)
        total_count = stats.get("count", 0)
        if most_frequent:
          top_values = ", ".join(
            f"{entry.get('value')} ({entry.get('count')})" for entry in most_frequent[:5]
          )
          summary = _("Top values: %(values)s | %(unique)d unique, %(total)d total") % {
            "values": top_values,
            "unique": unique_count,
            "total": total_count,
          }
        else:
          summary = _("No values captured yet (%(total)d total)") % {"total": total_count}
      elif stats_type == "boolean":
        summary = _("True %(true)d / False %(false)d") % {
          "true": stats.get("trueCount", 0),
          "false": stats.get("falseCount", 0),
        }
      elif stats_type == "media":
        summary = _("%(count)d assets") % {"count": stats.get("count", 0)}
      else:
        summary = _("No statistics available")
      record.stat_summary = summary

