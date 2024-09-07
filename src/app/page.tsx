"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/components/UserProvider";
import { Loader2, List } from "lucide-react";
import { useFirebase } from "@/hooks/useFirebase";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const router = useRouter();
  const { userId, userName, setUserName } = useUser();
  const { createRoom } = useFirebase();
  const [isViewingRooms, setIsViewingRooms] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !userId) {
      // Show error message
      return;
    }

    setIsCreatingRoom(true);

    try {
      const roomId = await createRoom(roomName, userId);
      router.push(
        `/room/${roomId}/${roomName}?name=${encodeURIComponent(roomName)}`,
      );
    } catch (error) {
      console.error("Error creating room:", error);
      // Show error toast
    } finally {
      setTimeout(() => setIsCreatingRoom(false), 2000);
    }
  };

  const handleViewAllRooms = () => {
    setIsViewingRooms(true);
    router.push("/rooms");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to ELMO</CardTitle>
          <CardDescription>
            Create a new room or view existing ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="userName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Your Name
              </label>
              <Input
                type="text"
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="roomName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Room Name
              </label>
              <Input
                type="text"
                id="roomName"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={isCreatingRoom || isViewingRooms}
          >
            {isCreatingRoom ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Room...
              </>
            ) : (
              "Create Room"
            )}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleViewAllRooms}
            disabled={isCreatingRoom || isViewingRooms}
          >
            <List className="mr-2 h-4 w-4" />

            {isViewingRooms ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Loading Rooms...
              </>
            ) : (
              "View All Rooms"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
