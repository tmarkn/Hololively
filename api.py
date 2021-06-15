import datetime
import json
import re
import requests
from dateutil import tz

from bs4 import BeautifulSoup as bs

from json_serial import json_serial

from_zone = tz.gettz('Asia/Tokyo')

with open('static/json/memberPhotos.json', 'r', encoding='utf-8') as f:
    members = json.load(f)

class Stream:
    def __init__(self, link, host, time, thumbnail, collaborators = [], live = False):
        self.link = link
        self.host = host
        self.time = time
        self.thumbnail = thumbnail
        self.collaborators = collaborators
        self.live = live

def API(query):
    url = 'https://schedule.hololive.tv/lives/' + query

    text = requests.get(url, headers={'Cache-Control': 'no-cache'}).text
    soup = bs(text, "html.parser")

    data = soup.find('div', attrs={'id': 'all'})
    containers = data.findAll('div', recursive=False, attrs={'class': 'container'})
    
    data = []
    currentDay = None
    for cont in containers:
        # find day header
        dayHeader = cont.find('div', attrs={'class': 'holodule navbar-text'})
        
        if dayHeader:
            # set date
            date = datetime.datetime.strptime(dayHeader.text.split()[0], '%m/%d')
            # set year
            if date.month == 12 and datetime.datetime.now().month == 1:
                date = date.replace(year=datetime.datetime.now().year-1)
            elif date.month == 1 and datetime.datetime.now().month == 12:
                date = date.replace(year=datetime.datetime.now().year+1)
            else:
                date = date.replace(year=datetime.datetime.now().year)

            currentDay = date

        # find inner containers
        streams = cont.findAll('a', attrs={'class': 'thumbnail'})
        for stream in streams:
            # stream link
            link = stream['href']

            # host
            try:
                host = stream.find('div', attrs={'class': 'name'}).text.strip()
            except AttributeError:
                continue

            # time
            try:
                rawTime = stream.find('div', attrs={'class': 'datetime'}).text.strip().split(':')
            except Exception:
                continue
            
            time = currentDay.replace(hour=int(rawTime[0]), minute=int(rawTime[1]), tzinfo=from_zone)

            # thumbnail
            thumbnail = stream.findAll('img')[1]['src']

            # collaborators
            collabContainer = stream.findAll('div', attrs={'class': 'no-gutters'})
            collabImages = collabContainer[1].findAll('img')
            collaborators = []

            for image in collabImages:
                if image['src'] in members:
                    collaborators.append(members[image['src']])
                else:
                    print('\tnot found: ' + image['src'])
                    with open("unknown_members.txt", 'a') as f:
                        f.write(image['src'])
                        f.write('\n')
            
            # live
            live = bool(re.search(r"border: 3px red", stream.attrs.get('style')))

            # Stream
            data.append(Stream(link, host, time, thumbnail, collaborators, live))

    return json.dumps([x.__dict__ for x in data], default=json_serial, ensure_ascii=False)

if __name__ == '__main__':
    print(API(''))