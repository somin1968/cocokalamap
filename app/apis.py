# coding: utf-8
# Author: Somin Kobayashi

from core import BaseHandler
from app.models import POI, Config

class POIHandler(BaseHandler):

    def get(self):
        config = Config.get()
        return self.render_json([{
            'title': poi.title,
            'address': poi.address,
            'latitude': poi.latlng.lat,
            'longitude': poi.latlng.lon,
            'stocked': poi.stocked[config.stocked_label] if len(poi.stocked) > 1 else poi.stocked[0]
        } for poi in POI.fetch()])
