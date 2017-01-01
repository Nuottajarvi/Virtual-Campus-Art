#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
import re

logging.basicConfig(level=logging.ERROR)

class MyEventHandler(FileSystemEventHandler):
    def __init__(self, observer):
        self.observer = observer

    def on_created(self, event):
        tpe = str(event)
        filename = re.search('src_path=\'(.+?)\'', tpe).group(1)
        print ("filename: ", filename)

#        with open('report.xls', 'rb') as f:
#            r = requests.post('http://httpbin.org/post', files={'report.xls': f})
        if not event.is_directory:
            print ("file created")

def main(argv=None):

    path = '.'

    observer = Observer()
    event_handler = MyEventHandler(observer)

    observer.schedule(event_handler, path, recursive=False)
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
