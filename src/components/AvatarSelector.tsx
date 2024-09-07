import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const avatarStyles = [
  "adventurer",
  "avataaars",
  "big-ears",
  "bottts",
  "croodles",
  "fun-emoji",
  "identicon",
  "initials",
  "lorelei",
  "micah",
  "miniavs",
  "notionists",
  "open-peeps",
  "personas",
  "pixel-art",
  "rings",
  "shapes",
];

interface AvatarSelectorProps {
  userId: string;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export function AvatarSelector({
  userId,
  selectedStyle,
  onStyleChange,
}: AvatarSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={`https://api.dicebear.com/9.x/${selectedStyle}/svg?seed=${userId}`}
        />
        <AvatarFallback>{userId.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Select value={selectedStyle} onValueChange={onStyleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select avatar style" />
        </SelectTrigger>
        <SelectContent>
          {avatarStyles.map((style) => (
            <SelectItem key={style} value={style}>
              {style}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
