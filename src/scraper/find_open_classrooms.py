import json
from datetime import datetime

# Define the filename for the JSON file
file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/processed_data.json"

# Open the JSON file in read mode
with open(file_path, "r") as json_file:
    # Load the JSON data into a Python data structure (in this case, a dictionary)
    data = json.load(json_file)

schedules = data["schedules"]

test_day = "Monday"
test_current_time = "12:45PM"
test_current_time = datetime.strptime(test_current_time, "%I:%M%p")

open_classroom = {}
for key in schedules:
    times = schedules[key]

    next_class_start = None
    next_class_end = None
    empty = True;

    for schedule in times:
        # Get the day and time
        day = schedule["day"]
        time_range = schedule["time"]

        # Split the time range into start and end times
        start_time, end_time = map(lambda x: datetime.strptime(x.strip(), "%I:%M%p"), time_range.split("-"))

        # Check if the current day matches and if the current time falls within the class time
        if test_day == day and start_time <= test_current_time <= end_time:
            empty = False
            break

        # Check if the current day matches
        if test_day == day:
            if test_current_time <= start_time:
                if not next_class_start and not next_class_end:
                    next_class_start = start_time
                    next_class_end = end_time
                elif start_time <= next_class_start:
                    next_class_start = start_time
                    next_class_end = end_time

    # If next_class_start and next_class_end are set, there is a class coming up
    if empty:
        if next_class_start and next_class_end:
            remaining_time = next_class_start - test_current_time
            message = f"The classroom will be open for the next {remaining_time.total_seconds() / 60} minutes until the next class starts at {next_class_start.strftime('%I:%M%p')}."
        else:
            message = f"The classroom is open for the rest of the day."

        open_classroom[key] = message

# Define the filename for the JSON file
json_file_path = "/Users/fernport/Documents/github/open-classrooms-utd/src/scraper/data/results.json"

results = [];
for key in open_classroom:
    results.append({
        "room": key,
        "message": open_classroom[key]
    })

# Write the data to the JSON file
with open(json_file_path, "w") as json_file:
    json.dump(results, json_file)
