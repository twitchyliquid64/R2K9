from tornado import Server
import TemplateAPI
import hashlib, json
import os


def dummy():
    print "Started"


def indexPage(response):
    response.write(TemplateAPI.render('main.html', response, {}))


server = Server('localhost',int(os.environ["port"]))
server.register("/", indexPage)
server.run()
