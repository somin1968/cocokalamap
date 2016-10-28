# coding: utf-8
# Author: Somin Kobayashi

from core import BaseHandler

class AdminConsoleHandler(BaseHandler):

    def get(self):
        return self.render('console.html', {})
