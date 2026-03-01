"use client";

import { ChevronDown, ChevronUp, Square, Trash2 } from "lucide-react";
import { ChangeEventHandler } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function OptionInput({
  onChange,
  onDelete,
  onMoveDown,
  onMoveUp,
  value,
}: {
  onChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
  onDelete?: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  value: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <Square className="text-gray-700" />
      <InputGroup>
        <InputGroupInput
          name="choice"
          onChange={onChange}
          placeholder="Option"
          value={value}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled={!onMoveUp} onClick={onMoveUp}>
            <ChevronUp />
          </InputGroupButton>
          <InputGroupButton disabled={!onMoveDown} onClick={onMoveDown}>
            <ChevronDown />
          </InputGroupButton>
          <InputGroupButton
            disabled={!onDelete || !value.trim()}
            onClick={onDelete}
            variant="destructive"
          >
            <Trash2 />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
