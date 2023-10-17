"use client";
import { Card, List, Avatar, Select, TimePicker, Space, Button } from "antd";
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
  const [time, setTime] = useState(dayjs());
  const [day, setDay] = useState(DAYS_OF_THE_WEEK[time.day()]);
  const [data, setData] = useState(calculateClassroomStatus(day, time));

  const updateData = () => {
    setData(calculateClassroomStatus(day, time));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-24">
      <Card
        title="Find open classrooms"
        bordered={false}
        className="w-full flex-grow"
        extra={
          <Space direction="horizontal" size={"middle"}>
            <Select
              className="w-32"
              defaultValue={day}
              options={DAYS_OF_THE_WEEK.map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={(value) => {setDay(value)}}
            />
            <TimePicker
              use12Hours
              defaultValue={time}
              format={HOUR_FORMAT}
              onChange={(time, timeString) => {
                setTime(time)
              }}
            />
            <Button onClick={updateData}>
              Update
            </Button>
          </Space>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                // avatar={
                //   <Avatar
                //     src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                //   />
                // }
                title={<a href="https://ant.design">{item.classroom}</a>}
                description={item.message}
              />
            </List.Item>
          )}
        />
      </Card>
    </main>
  );
}

function calculateClassroomStatus( testDay: string, currentTime: dayjs.Dayjs) {
  const classrooms = schedules.schedules;
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
      const [startTime, endTime] = time.time.split("-").map((time:string) => time.toUpperCase());

      if (day === testDay) {
        const startDayjs = dayjs(currentTime.format('YYYY-MM-DD') + " " + startTime, 'YYYY-MM-DD hh:mmA');
        const endDayjs = dayjs(currentTime.format('YYYY-MM-DD') + " " + endTime,'YYYY-MM-DD hh:mmA');

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
      const message = `The classroom will be open for the next ${remainingTime} minutes until the next class starts at ${nextClassStart.format(HOUR_FORMAT)}.`;
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
    if (a.message === "The classroom will be open for the rest of the day." && b.message !== "The classroom will be open for the rest of the day.") return -1;
    if (b.message === "The classroom will be open for the rest of the day." && a.message !== "The classroom will be open for the rest of the day.") return 1;

    const aTime = parseInt(a.message.split(" ")[8])
    const bTime = parseInt(b.message.split(" ")[8])
    return aTime - bTime;
  });
}
