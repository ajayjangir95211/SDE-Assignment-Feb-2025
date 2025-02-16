import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const MONTHS = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const parseLogLine = (line) => {
  const match = line.match(/^([\d\.]+) .*? \[(.*?)\] ".*?".*$/);
  if (!match) return null;

  const [, ip, dateStr] = match;
  const [dd, mm, yyyy] = dateStr.split(":")[0].split("/");
  const dateKey = `${yyyy}-${MONTHS[mm]}-${dd}`;
  const hour = dateStr.split(":")[1];

  return { ip, dateKey, hour };
};

const filterByPercentage = (entries, percentage) => {
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  let accumulated = 0;
  const result = [];

  for (const [key, count] of entries.sort((a, b) => b[1] - a[1])) {
    accumulated += count;
    result.push([key, count]);
    if (accumulated >= total * percentage) break;
  }

  return result;
};

function App() {
  const [index, setIndex] = useState(0);

  const {
    isPending,
    error,
    data = "",
  } = useQuery({
    queryKey: ["fetchLogs"],
    queryFn: () =>
      fetch("/SDE-Assignment-Feb-2025/log.txt").then((res) => res.text()),
  });

  if (isPending)
    return <p className="p-4 text-gray-600 dark:text-gray-300">Loading...</p>;
  if (error)
    return (
      <p className="p-4 text-red-600 dark:text-red-400">
        Error: {error.message}
      </p>
    );

  // Process log data
  const datesMap = new Map();
  data.split("\n").forEach((line) => {
    const parsed = parseLogLine(line);
    if (!parsed) return;

    const { ip, dateKey, hour } = parsed;

    if (!datesMap.has(dateKey)) {
      datesMap.set(dateKey, {
        ipMap: new Map(),
        hourMap: new Map(),
      });
    }

    const { ipMap, hourMap } = datesMap.get(dateKey);
    ipMap.set(ip, (ipMap.get(ip) || 0) + 1);
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  // Sort dates
  const sortedDates = [...datesMap.keys()].sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const currentDate = sortedDates[index];
  const { ipMap, hourMap } = datesMap.get(currentDate);

  // Prepare data for display
  const allIPs = [...ipMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const allHours = [...hourMap.entries()].sort((a, b) => a[0] - b[0]);
  const topIPs = filterByPercentage([...ipMap.entries()], 0.85);
  const topHours = filterByPercentage([...hourMap.entries()], 0.7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          Log Parser
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed
                         dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-600 flex items-center gap-1"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <span className="hidden md:inline">Previous</span>
              &larr;
            </button>

            <select
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="px-3 py-1.5 w-full md:w-48 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md
                         text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              {sortedDates.map((date, idx) => (
                <option key={date} value={idx}>
                  {date}
                </option>
              ))}
            </select>

            <button
              className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed
                         dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-gray-600 flex items-center gap-1"
              disabled={index + 1 === sortedDates.length}
              onClick={() => setIndex((i) => i + 1)}
            >
              <span className="hidden md:inline">Next</span>
              &rarr;
            </button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {index + 1} of {sortedDates.length} day(s)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* IP Address Histogram */}
          <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              IP Addresses (Sorted)
            </h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      IP Address
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allIPs.map(([ip, count]) => (
                    <tr
                      key={ip}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {ip}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly Traffic Histogram */}
          <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              Hourly Traffic
            </h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Hour
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Visitors
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allHours.map(([hour, count]) => (
                    <tr
                      key={hour}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {hour.padStart(2, "0")}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top IPs (85% Traffic) */}
          <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              Top IPs (85% Traffic)
            </h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      IP Address
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topIPs.map(([ip, count]) => (
                    <tr
                      key={ip}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {ip}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Hours (70% Traffic) */}
          <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">
              Top Hours (70% Traffic)
            </h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Hour
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topHours.map(([hour, count]) => (
                    <tr
                      key={hour}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {hour.padStart(2, "0")}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
