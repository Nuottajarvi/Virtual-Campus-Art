# http://brunorocha.org/python/watching-a-directory-for-file-changes-with-python.html
import sys
import time
import logging
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler

if __name__ == "__main__":
  logging.basicConfig(level = logging.INFO,format='%(asctime)s - %(message)s',datefmt='%H:%M:%S %d.%m.%Y')
  path = sys.argv[1] if len(sys.argv) > 1 else '.'
  event_handler = LoggingEventHandler()
  observer = Observer()
  observer.schedule(event_handler, path, recursive = True)
  observer.start()
  try:
      while True:
          time.sleep(1)
  except KeyboardInterrupt:
      observer.stop()
  observer.join()
