# coding: utf-8
# Author: Somin Kobayashi

from core import BaseHandler
from app.models import Config

class MapHandler(BaseHandler):

    def get(self):
        ref = self.request.referer
        return self.render('map.html', {
            'config': Config.get(),
            'embed': 'embed' in self.request.arguments(),
            'is_individual': ref and ref.find(self.request.host) != -1
        })
