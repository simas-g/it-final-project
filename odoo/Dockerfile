FROM odoo:17

USER root

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

COPY inventory_external_viewer /mnt/extra-addons/inventory_external_viewer

USER odoo

CMD odoo --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons --db_host=${DB_HOST} --db_port=${DB_PORT} --db_user=${DB_USER} --db_password=${DB_PASSWORD} --db_maxconn=64


