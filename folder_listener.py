# !/usr/bin/env python
# -*- coding: utf-8 -*-
# needed modules: requests, watchdog

import logging
import sys
import time
import re
import requests
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class MyEventHandler(FileSystemEventHandler):
    def __init__(self, observer):
        self.observer = observer
    #Triggers when a new file is made. Ignores directories.
    def on_created(self, event):
        try:
            eventStr = str(event)
            #Extracts the filename from the "file created"-event.
            filename = re.search('src_path=\'(.+?)\'', eventStr).group(1)
            print ("filename: ", filename)
            #Opens the new file and makes a post request to given url.
            with open(filename, 'rb') as f:
                r = requests.post('http://foo.bar/foobar', files={filename: f})
        except AttributeError:
            pass
        if not event.is_directory:
            print ("file created")

def main(argv=None):
    #Define path to the folder to be watched.
    path = '.'
    observer = Observer()
    event_handler = MyEventHandler(observer)

    #Apply Myeventhander on given folder either recursively or not.
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
