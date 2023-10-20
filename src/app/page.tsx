"use client";
import {
  Card,
  List,
  Avatar,
  Select,
  TimePicker,
  Space,
  Button,
  Typography,
  Input,
  Alert,
} from "antd";
import dayjs from "dayjs";
import schedules from "../scraper/data/processed_data.json";
import { useState } from "react";

const DAYS_OF_THE_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOUR_FORMAT = "h:mm A";
const cstOffset = -360;

export default function Home() {
  const [time, setTime] = useState<dayjs.Dayjs | null>(dayjs());
  const [search, setSearch] = useState<string>("");
  const [day, setDay] = useState(DAYS_OF_THE_WEEK[time?.day() ?? 0]);
  const [data, setData] = useState(
    calculateClassroomStatus(day, time ?? dayjs())
  );

  function updateData() {
    setData(calculateClassroomStatus(day, time ?? dayjs()));
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-24 md:py-8">
      <Typography.Title className="text-center">
        Open Classrooms UTD
      </Typography.Title>
      <div className="w-full flex flex-col gap-4 justify-center items-center">
        <Alert
          className="w-full md:w-2/3"
          message="This is not an official source. The information is based on class schedules and does not include reservations. Please use your own discretion. 😀"
          type="warning"
          showIcon
        />
        <Card
          title="Find open classrooms"
          className="w-full md:w-2/3"
          extra={
            <div className="flex flex-row gap-4 flex-wrap py-4 md:p-0 md:flex-nowrap">
              <Input
                className="w-full md:w-min"
                placeholder="Search for classroom"
                onChange={(e) => setSearch(e.target.value)}
              />
              <Space direction="horizontal" size={"middle"}>
                <Select
                  className="w-32"
                  defaultValue={day}
                  options={DAYS_OF_THE_WEEK.map((item) => ({
                    label: item,
                    value: item,
                  }))}
                  onChange={(value) => {
                    setDay(value);
                  }}
                />
                <TimePicker
                  className="w-32"
                  use12Hours
                  defaultValue={time ?? dayjs()}
                  format={HOUR_FORMAT}
                  onChange={(
                    time: dayjs.Dayjs | null,
                    timeString: string | null
                  ) => {
                    setTime(time);
                  }}
                />
              </Space>
              <Button className="w-full md:w-min" onClick={updateData}>Update</Button>
            </div>
          }
        >
          <div className="h-[72svh] overflow-y-auto">
            <List
              itemLayout="horizontal"
              dataSource={
                search == ""
                  ? data
                  : data.filter((item) =>
                      item.classroom
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
              }
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    // avatar={
                    //   <Avatar
                    //     src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                    //   />
                    // }
                    title={<a href="#">{item.classroom}</a>}
                    description={item.message}
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}

function calculateClassroomStatus(testDay: string, currentTime: dayjs.Dayjs) {
  const classrooms: any = schedules.schedules;
  currentTime = currentTime;

  const openClassrooms: {
    [key: string]: string;
  } = {};
  for (const key in classrooms) {
    const times = classrooms[key];
    let open = true;
    let nextClassStart = null;

    for (const time of times) {
      const day = time.day;
      const [startTime, endTime] = time.time
        .split("-")
        .map((time: string) => time.toUpperCase());

      if (day === testDay) {
        const startDayjs = dayjs(
          currentTime.format("YYYY-MM-DD") + " " + startTime,
          "YYYY-MM-DD hh:mmA"
        );
        const endDayjs = dayjs(
          currentTime.format("YYYY-MM-DD") + " " + endTime,
          "YYYY-MM-DD hh:mmA"
        );

        if (
          startDayjs.isBefore(currentTime) &&
          currentTime.isBefore(endDayjs)
        ) {
          open = false;
          break;
        }

        if (currentTime.isBefore(startDayjs)) {
          if (nextClassStart === null || startDayjs.isBefore(nextClassStart)) {
            nextClassStart = startDayjs;
          }
        }
      }
    }

    if (open && nextClassStart !== null) {
      const remainingTime = nextClassStart.diff(currentTime, "minutes");
      const message = `The classroom will be open for the next ${remainingTime} minutes until the next class starts at ${nextClassStart.format(
        HOUR_FORMAT
      )}.`;
      openClassrooms[key] = message;
    } else if (open) {
      openClassrooms[
        key
      ] = `The classroom will be open for the rest of the day.`;
    }
  }

  const results = [];
  for (const key in openClassrooms) {
    if (key === "") continue;

    results.push({
      classroom: key,
      message: openClassrooms[key],
    });
  }

  return results.sort((a, b) => {
    if (
      a.message === "The classroom will be open for the rest of the day." &&
      b.message !== "The classroom will be open for the rest of the day."
    )
      return -1;
    if (
      b.message === "The classroom will be open for the rest of the day." &&
      a.message !== "The classroom will be open for the rest of the day."
    )
      return 1;

    const aTime = parseInt(a.message.split(" ")[8]);
    const bTime = parseInt(b.message.split(" ")[8]);
    return aTime - bTime;
  });
}
