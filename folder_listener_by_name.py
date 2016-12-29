#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import sys
import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

logging.basicConfig(level=logging.ERROR)

class MyEventHandler(FileSystemEventHandler):
    def __init__(self, observer): #rm 3rd argument filename
        self.observer = observer
        #self.filename = filename

    def on_created(self, event):
        print ("e=", event)
        if not event.is_directory:
            print ("file created")

def main(argv=None):

    path = '.'
    #filename = argv[1]

    observer = Observer()
    event_handler = MyEventHandler(observer)

    observer.schedule(event_handler, path, recursive=True)
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
