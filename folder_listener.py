# !/usr/bin/env python
# -*- coding: utf-8 -*-
# needed modules: requests, watchdog

import logging
import sys
import time
import re
import requests
import os
import json
import subprocess
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

CONVERTER_SCRIPT = 'convert_to_threejs.py -t'
API_URL = 'http://pnuottaj-b.sendanor.fi/api/models'


class MyEventHandler(FileSystemEventHandler):
    #Triggers when a new file is made. Ignores directories.
    def on_created(self, event):
        try:
            print ("Dirname: ", event.src_path)
            filename = event.src_path[2:]
            #Converts found file to three.js jsonself.
            #filepath = "%s/%s" % (filename, filename)
            filepath = os.path.join(os.path.dirname(__file__), "%s/%s" % (filename, filename))
            print filepath
            print "Converting..."
            subprocess.Popen('C:/Python27/python %s "%s.fbx" "%s_.json"' % (CONVERTER_SCRIPT, filepath, filepath), shell=True).wait()
            print "Conversion done!"
            #if filename.endswith(".json"):
                #filename = filename[:-4] + ".json"
            #Opens the new file and makes a post request to given url.
            timeout = time.time() + 10
            while time.time() < timeout:
                if (os.path.exists('%s_.json' % (filepath))):
                    with open(filepath + '_.json', 'rb') as f:
                        body = {}
                        body['title'] = filename
                        body['data'] = json.load(f)
                        r = requests.post(API_URL, json=body)
                    break
        except AttributeError:
            pass
        if not event.is_directory:
            print ("file created")

def main(argv=None):
    #Define path to the folder to be watched.
    path = '.'
    observer = Observer()
    observer.schedule(MyEventHandler(), path, recursive=False)
    observer.start()
    try:
        while True:
          time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
