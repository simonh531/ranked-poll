"use client";

import { OrderedMap } from "immutable";
import { useRef, useState } from "react";

import OptionInput from "./OptionInput";

export default function OptionInputs({ initialOptions }: { initialOptions?: string[] }) {
  const [options, setOptions] = useState(() => {
    if (initialOptions && initialOptions.length > 0) {
      const entries: [number, string][] = initialOptions.map((opt, idx) => [idx + 1, opt]);
      entries.push([initialOptions.length + 1, ""]);
      return OrderedMap(entries);
    }
    return OrderedMap([
      [1, ""],
      [2, ""],
    ]);
  });
  const keyCounter = useRef(initialOptions && initialOptions.length > 0 ? initialOptions.length + 1 : 2);
  const validCount = options.count((option) => option.trim() !== "");
  return options.toArray().map(([key, value], index) => (
    <OptionInput
      key={key}
      onChange={(event) =>
        setOptions((prevMap) => {
          const newMap = prevMap.set(key, event.target.value);
          // at least one field is blank
          if (newMap.some((option) => option.trim() === "")) {
            return newMap;
          }
          keyCounter.current += 1;
          return newMap.set(keyCounter.current, "");
        })
      }
      onDelete={
        options.size > 3 ? () => setOptions(options.delete(key)) : undefined
      }
      onMoveDown={
        index !== options.size - 1
          ? () =>
              setOptions((prevMap) =>
                switchMapEntries(prevMap, index, index + 1),
              )
          : undefined
      }
      onMoveUp={
        index !== 0
          ? () =>
              setOptions((prevMap) =>
                switchMapEntries(prevMap, index, index - 1),
              )
          : undefined
      }
      required={validCount < 2}
      value={value}
    />
  ));
}

function switchMapEntries(
  map: OrderedMap<number, string>,
  index1: number,
  index2: number,
) {
  const mapArray = map.toArray();
  const [key1, value1] = mapArray[index1];
  const [key2, value2] = mapArray[index2];
  return map.mapEntries(([key, value]) => {
    if (key === key1) {
      return [key2, value2];
    } else if (key === key2) {
      return [key1, value1];
    } else {
      return [key, value];
    }
  });
}
