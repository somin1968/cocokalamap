# coding: utf-8
# Author: Somin Kobayashi

import webapp2
from app import views, apis

app = webapp2.WSGIApplication([
    ('/', views.MapHandler),
    ('/api/poi', apis.POIHandler),
], debug=True)
