# requires package: watchdog
#coding -*- coding: utf-8 -*-

import sys
import time
import logging
from watchdog.observers import Observer
#from watchdog.events import LoggingEventHandler
from watchdog.events import FileSystemEventHandler
from watchdog.events import FileCreatedEvent

if __name__ == "__main__":
  logging.basicConfig(level = logging.INFO,format='%(asctime)s - %(message)s',datefmt='%H:%M:%S %d.%m.%Y')
  path = sys.argv[1] if len(sys.argv) > 1 else '.'
  #event_handler = LoggingEventHandler()
  FileCreated = FileCreatedEvent
  FilSysEventH = FileSystemEventHandler().on_created(FileCreatedEvent(path))
  observer = Observer()
  observer.schedule(FilSysEventH, path, recursive = True)
  observer.start()
  try:
      while True:
          time.sleep(1)
  except KeyboardInterrupt:
      observer.stop()
  observer.join()
