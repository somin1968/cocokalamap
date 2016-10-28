# coding: utf-8
# Author: Somin Kobayashi

import webapp2, os, jinja2, json
from google.appengine.ext import ndb

class BaseHandler(webapp2.RequestHandler):
    def __init__(self, *args, **kwargs):
        super(BaseHandler, self).__init__(*args, **kwargs)
        jinja2_env_kwargs = {
            'loader': jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), './templates/')),
            'auto_reload': False,
            'cache_size': 50,
        }
        self.jinja2_environment = jinja2.Environment(**jinja2_env_kwargs)
        self.template_name = None
        self.context = {}

    def dispatch(self):
        result = super(BaseHandler, self).dispatch()
        if isinstance(result, int):
            return self.abort(result)
        elif isinstance(result, str):
            return self.response.out.write(result)
        return self.response

    def render(self, template_name, context):
        template = self.jinja2_environment.get_template(template_name)
        return self.response.out.write(template.render(context))

    def render_json(self, data):
        self.response.headers['Content-Type'] = 'application/javascript charset=utf-8'
        return self.response.out.write(json.dumps(data).decode('utf8'))

class BasicModel(ndb.Model):
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    created_by = ndb.UserProperty(auto_current_user_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)
    modified_by = ndb.UserProperty(auto_current_user=True)
