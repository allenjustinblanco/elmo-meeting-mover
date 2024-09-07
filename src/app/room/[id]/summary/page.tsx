"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/hooks/useFirebase";
import {
  BarChart,
  Clock,
  Users,
  Download,
  Archive,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RoomSummary({ params }: { params: { id: string } }) {
  const [newDecision, setNewDecision] = useState("");
  const [newActionItem, setNewActionItem] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { roomData, updateRoomData, archiveRoom } = useFirebase(params.id);

  const handleArchive = async () => {
    try {
      await archiveRoom(params.id);
      toast({
        title: "Room Archived",
        description: "The room has been successfully archived.",
      });
      router.push("/rooms");
    } catch (error) {
      console.error("Error archiving room:", error);
      toast({
        title: "Error",
        description: "Failed to archive room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(roomData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `room_${params.id}_summary.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleAddDecision = () => {
    if (newDecision.trim()) {
      updateRoomData({
        decisions: [...(roomData.decisions || []), newDecision],
      });
      setNewDecision("");
      toast({
        title: "Decision Added",
        description: "The decision has been added to the meeting summary.",
      });
    }
  };

  const handleAddActionItem = () => {
    if (newActionItem.trim()) {
      updateRoomData({
        actionItems: [...(roomData.actionItems || []), newActionItem],
      });
      setNewActionItem("");
      toast({
        title: "Action Item Added",
        description: "The action item has been added to the meeting summary.",
      });
    }
  };

  if (!roomData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading room summary...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Meeting Summary</CardTitle>
          <CardDescription>{roomData.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                Duration:{" "}
                {roomData.timer ? Math.floor(roomData.timer / 60) : "N/A"}{" "}
                minutes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Participants: {roomData.participants?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-muted-foreground" />
              <span>ELMO Count: {roomData.elmoCount || 0}</span>
            </div>
          </div>

          <Tabs defaultValue="agenda">
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
              <TabsTrigger value="actionItems">Action Items</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="agenda">
              <h3 className="text-lg font-semibold mb-2">Agenda</h3>
              <ul className="list-disc pl-5 space-y-1">
                {roomData.agenda && roomData.agenda.length > 0 ? (
                  roomData.agenda.map(
                    (
                      item: { topic: string; id: string; duration: number },
                      index: number,
                    ) => (
                      <li key={item.id || index}>
                        {item.topic} ({item.duration} minutes)
                      </li>
                    ),
                  )
                ) : (
                  <li>No agenda items</li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="decisions">
              <h3 className="text-lg font-semibold mb-2">Key Decisions</h3>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  placeholder="Enter a new decision"
                />
                <Button onClick={handleAddDecision}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {roomData.decisions && roomData.decisions.length > 0 ? (
                  roomData.decisions.map((decision: string, index: number) => (
                    <li key={index}>{decision}</li>
                  ))
                ) : (
                  <li>No key decisions recorded</li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="actionItems">
              <h3 className="text-lg font-semibold mb-2">Action Items</h3>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="Enter a new action item"
                />
                <Button onClick={handleAddActionItem}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {roomData.actionItems && roomData.actionItems.length > 0 ? (
                  roomData.actionItems.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No action items recorded</li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="notes">
              <h3 className="text-lg font-semibold mb-2">Meeting Notes</h3>
              <div className="whitespace-pre-wrap">
                {roomData.notes || "No notes recorded for this meeting."}
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <h3 className="text-lg font-semibold mb-2">Chat Log</h3>
              <div className="space-y-2">
                {roomData.chatLog && roomData.chatLog.length > 0 ? (
                  roomData.chatLog.map((message: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="font-semibold">{message.sender}:</span>
                      <span>{message.text}</span>
                    </div>
                  ))
                ) : (
                  <p>No chat messages recorded.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Archive className="mr-2 h-4 w-4" />
                Archive Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to archive this room?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Archiving will remove the room
                  from active lists but preserve its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive}>
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
