# coding: utf-8
# Author: Somin Kobayashi

import webapp2
from admin import views, apis

app = webapp2.WSGIApplication([
    (r'/admin/?', views.AdminConsoleHandler),
    ('/admin/api/config', apis.ConfigHandler),
    ('/admin/api/poi', apis.POIHandler),
    (r'/admin/api/poi/([a-zA-Z0-9-_]+)', apis.POIHandler),
    ('/admin/api/poi_toggle_all', apis.POIToggleAllHandler),
    ('/admin/api/convert_to_latlng', apis.ConvertToLatLngHandler),
    ('/admin/api/design', apis.DesignHandler),
], debug=True)
