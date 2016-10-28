# coding: utf-8
# Author: Somin Kobayashi

from core import BasicModel
from google.appengine.ext import ndb

class POI(BasicModel):
    title = ndb.StringProperty()
    title_kana = ndb.StringProperty(default='')
    address = ndb.StringProperty()
    phone = ndb.StringProperty(default='')
    description = ndb.StringProperty(default='')
    latlng = ndb.GeoPtProperty()
    stocked = ndb.BooleanProperty(repeated=True)
    is_hidden = ndb.BooleanProperty(default=False)

    @classmethod
    def fetch(cls, all=False):
        query = cls.query()
        if not all:
            query.filter(cls.is_hidden != True)
        return query.order(cls.title_kana).fetch()

class Config(BasicModel):
    page_title = ndb.StringProperty()
    marker_colors = ndb.StringProperty(repeated=True)
    stocked_label = ndb.IntegerProperty(default=0, choices=[0, 1])
    is_maintained = ndb.BooleanProperty(default=False)

    @classmethod
    def get(cls):
        config = cls.query().get()
        if not config:
            config = cls()
            config.put()
        return config
