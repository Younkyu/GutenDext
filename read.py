from __future__ import print_function
import eel
import urllib.request  # the lib that handles the url stuff

@eel.expose
def getBookText(url):
    bookText = ""
    try :
        for line in urllib.request.urlopen(url):
            bookText += line.decode('utf-8')
        eel.returnResult(bookText)
    except:
        try:
            print("Retry retrieval with alternate .txt file from " + url)
            url = url[0:(len(url) - 6)] + ".txt"
            print(url)
            for line in urllib.request.urlopen(url):
                bookText += line.decode('utf-8')
            eel.returnResult(bookText)
        except:
            print("No text file found for this book")
            eel.returnResult("ERROR 404: Not Found")

eel.init("App")
eel.start("index.html")