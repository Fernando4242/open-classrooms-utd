import os
import chardet
from bs4 import BeautifulSoup
import json
import datetime

# Get the list of files in the current directory
files = os.listdir("/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data")
raw_schedules = []

# Loop through the files and load them into Beautiful Soup
for file in files:
        file_path = os.path.join("/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data", file)
        encoding = None

        if (file == ".DS_Store" or file.find(".html") == -1):
            continue

        with open(file_path, "rb") as f:
            rawdata = f.read()
            result = chardet.detect(rawdata)
            encoding = result['encoding']
            
        with open(file_path, "r", encoding=encoding) as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            section_list = soup.find(name="div", attrs={"class": "section-list"})

            rows = section_list.find_all(name="tr")

            for row in rows:
                schedules = row.find_all(name="div", attrs={"class": "clstbl__resultrow__schedule"})
                rooms = row.find_all(name="div", attrs={"class": "clstbl__resultrow__location"})

                if(len(schedules) == 0 or len(rooms) == 0):
                    continue

                # loop through index of schedules and rooms
                for i in range(len(schedules)):
                    schedule = schedules[i]
                    room = rooms[i]

                    schedule_parts = [line for line in schedule.text.split('\n') if line.strip()]
                    schedule_parts.append(room.text)

                    raw_schedules.append(schedule_parts)

# Define the filename for the JSON file
json_file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/raw_data.json"

data = {
    "schedules": raw_schedules,
    "createdTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

# Write the data to the JSON file
with open(json_file_path, "w") as json_file:
    json.dump(data, json_file)

