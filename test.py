import datetime
from dateutil import tz

time = "01/26 17:06"

date = datetime.datetime.strptime(time, '%m/%d %H:%M')
print(date)

if date.month != datetime.datetime.now():
    if date.month == 1:
        print("hello")

time2 = "2020-09-27 18:00:00+09:00"
date2 = datetime.datetime.fromisoformat(time2)
print(date2.astimezone(tz.gettz("America/New_York")))
