import json
import re
import datetime

# Define the filename for the JSON file
file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/raw_data.json"

raw_data = None
formatted_data = {};

def split_days(text):
    special_day = None;

    date_pattern = r'\d{4}-\d{2}-\d{2}'  # This pattern matches the date in the "YYYY-MM-DD" format
    matches = re.findall(date_pattern, text)
    
    if len(matches) > 0:
        text = text.replace(matches[0], "")
        special_day = matches[0]

    text = text.strip().replace(" ", "")
    if text.find("&") != -1:
        return {
            "split_days": text.split('&'),
            "special_day": special_day
        }
    elif text.find(",") != -1:
        return {
            "split_days": text.split(','),
            "special_day": special_day
        }
    else:
        return {
            "split_days": [text],
            "special_day": special_day
        }


def main():
    # Define the filename for the JSON file
    file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/raw_data.json"

    # Open the JSON file in read mode
    with open(file_path, "r") as json_file:
        # Load the JSON data into a Python data structure (in this case, a dictionary)
        raw_data = json.load(json_file)

    # Loop through the schedules and populate unique courses
    for raw_schedule in raw_data["schedules"]:
        formatted_data[raw_schedule[2]] = [];
    

    # Loop through the schedules and populate unique times
    for raw_schedule in raw_data["schedules"]:
        days = split_days(raw_schedule[0]);

        for day in days["split_days"]:

            # Check for duplicate times
            duplicate = False
            for schedule in formatted_data[raw_schedule[2]]:
                if schedule["time"] == raw_schedule[1] and schedule["day"] == day and schedule["special_day"] == days["special_day"]:
                    duplicate = True
                    break

            if not duplicate:
                formatted_data[raw_schedule[2]].append({
                    "day": day,
                    "time": raw_schedule[1],
                    "special_day": days["special_day"],
                })

    for key in formatted_data:
        formatted_data[key] = sorted(formatted_data[key], key=lambda k: k['time'])

    # Define the filename for the JSON file
    json_file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/processed_data.json"

    data = {
        "schedules": formatted_data,
        "createdTime": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Write the data to the JSON file
    with open(json_file_path, "w") as json_file:
        json.dump(data, json_file)


if __name__ == "__main__":
    main()
