from __future__ import print_function
import eel
import urllib.request  # the lib that handles the url stuff

@eel.expose
def getBookText(url):
    bookText = ""
    for line in urllib.request.urlopen(url):
        bookText += line.decode('utf-8')
    eel.returnResult(bookText)

eel.init("App")
eel.start("index.html")