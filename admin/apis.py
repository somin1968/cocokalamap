# coding: utf-8
# Author: Somin Kobayashi

import json, urllib
from core import BaseHandler
from google.appengine.ext import ndb
from google.appengine.api import urlfetch
from app.models import POI, Config

class ConfigHandler(BaseHandler):

    def get(self):
        config = Config.get()
        return self.render_json({
            'title': config.page_title,
            'label': config.stocked_label,
            'isMaintained': 'on' if config.is_maintained else 'off'
        })

    def post(self):
        request_params = json.loads(self.request.body)
        config = Config.get()
        config.populate(**request_params)
        config.put()
        return 200

class POIHandler(BaseHandler):

    def get(self):
        return self.render_json([self._parse_poi(poi) for poi in POI.fetch(all=True)])

    def post(self, key=None):
        if not key:
            poi = POI()
        else:
            poi = ndb.Key(urlsafe=key).get()
            if not poi:
                return 404
        request_params = json.loads(self.request.body)
        if request_params.get('latitude') and request_params.get('longitude'):
            request_params['latlng'] = ndb.GeoPt(request_params['latitude'], request_params['longitude'])
            del request_params['latitude']
            del request_params['longitude']
        poi.populate(**request_params)
        poi.put()
        return self.render_json(self._parse_poi(poi))

    def delete(self, key=None):
        if not key:
            return 500
        poi = ndb.Key(urlsafe=key).get()
        if not poi:
            return 404
        poi.key.delete()
        return 200

    def _parse_poi(self, poi):
        return {
            'key': poi.key.urlsafe(),
            'title': poi.title,
            'titleKana': poi.title_kana,
            'address': poi.address,
            'phone': poi.phone,
            'description': poi.description,
            'latitude': poi.latlng.lat,
            'longitude': poi.latlng.lon,
            'stocked': poi.stocked,
            'isHidden': poi.is_hidden
        }

class POIToggleAllHandler(BaseHandler):

    def post(self):
        request_params = json.loads(self.request.body)
        index = request_params.get('index')
        status = request_params.get('status')
        if index not in (0, 1) or not isinstance(status, bool):
            return 500
        pois = POI.fetch(all=True)
        for poi in pois:
            poi.stocked[index] = status
        ndb.put_multi(pois)
        return 200

class ConvertToLatLngHandler(BaseHandler):

    def get(self):
        address = self.request.get('address')
        if not address:
            return 500
        fetched = urlfetch.fetch('https://maps.googleapis.com/maps/api/geocode/json?address={0}&sensor=false&region=JP&language=ja&key=AIzaSyA17W3s7i1mvELoe5TcvJFVc798wNMDM7Q'.format(urllib.quote(address.encode('utf-8'))))
        return self.render_json(json.loads(fetched.content))

class DesignHandler(BaseHandler):

    def get(self):
        config = Config.get()
        return self.render_json({
            'markerColors': config.marker_colors
        })

    def post(self):
        request_params = json.loads(self.request.body)
        config = Config.get()
        config.populate(**request_params)
        config.put()
        return 200
