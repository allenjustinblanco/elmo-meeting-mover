"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface AgendaItem {
  id: string;
  topic: string;
  duration: number;
}

interface MeetingAgendaProps {
  roomId: string;
  agenda: AgendaItem[];
  updateAgenda: (newAgenda: AgendaItem[]) => void;
}

export function MeetingAgenda({
  agenda,
  updateAgenda,
}: MeetingAgendaProps) {
  const [newTopic, setNewTopic] = useState("");
  const [newDuration, setNewDuration] = useState("");

  const handleAddItem = () => {
    if (newTopic && newDuration) {
      const newItem: AgendaItem = {
        id: Date.now().toString(),
        topic: newTopic,
        duration: parseInt(newDuration),
      };
      updateAgenda([...agenda, newItem]);
      setNewTopic("");
      setNewDuration("");
    }
  };

  const handleRemoveItem = (id: string) => {
    updateAgenda(agenda.filter((item) => item.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(agenda);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateAgenda(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-grow">
          <Label htmlFor="newTopic" className="sr-only">
            New Topic
          </Label>
          <Input
            id="newTopic"
            placeholder="New topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Label htmlFor="newDuration" className="sr-only">
            Duration (minutes)
          </Label>
          <Input
            id="newDuration"
            type="number"
            placeholder="Minutes"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add item</span>
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="agenda">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {agenda.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center space-x-2 bg-secondary p-2 rounded"
                    >
                      <span {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <span className="flex-grow">{item.topic}</span>
                      <span className="text-muted-foreground">
                        {item.duration} min
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
