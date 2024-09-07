"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/hooks/useFirebase";
import { Loader2, Archive, Trash2, Home, Users, Clock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function Rooms() {
  const [activeRooms, setActiveRooms] = useState([]);
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { getRooms, archiveRoom, deleteRoom } = useFirebase();

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const { active, archived } = await getRooms();
      console.log(active, archived);
      setActiveRooms(active as []);
      setArchivedRooms(archived as []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [getRooms, toast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleArchiveRoom = async (roomId: string) => {
    try {
      await archiveRoom(roomId);
      toast({
        title: "Room Archived",
        description: "The room has been successfully archived.",
      });
      fetchRooms();
    } catch (error) {
      console.error("Error archiving room:", error);
      toast({
        title: "Error",
        description: "Failed to archive room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      toast({
        title: "Room Deleted",
        description: "The room has been permanently deleted.",
      });
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading rooms...</p>
      </div>
    );
  }

  const RoomList = ({
    rooms,
    isArchived,
  }: {
    rooms: Array<{
      id: string;
      name: string;
      participants?: Array<string>;
      createdAt: { toDate: () => Date };
    }>;
    isArchived: boolean;
  }) => (
    <ul className="space-y-4">
      {rooms.map((room) => (
        <li key={room.id} className="bg-card rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{room.name}</h3>
              <Badge variant={isArchived ? "secondary" : "default"}>
                {isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4 mr-1" />
              <span className="mr-4">
                {room.participants?.length || 0} participants
              </span>
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Created {new Date(room.createdAt.toDate()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              {isArchived ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/room/${room.id}/summary`)}
                >
                  View Summary
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/room/${room.id}/${room.name}`)}
                >
                  Join
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    {isArchived ? (
                      <Trash2 className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isArchived ? "Delete Room" : "Archive Room"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isArchived
                        ? "Are you sure you want to delete this room? This action cannot be undone."
                        : "Are you sure you want to archive this room? You can still access it later."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        isArchived
                          ? handleDeleteRoom(room.id)
                          : handleArchiveRoom(room.id)
                      }
                    >
                      {isArchived ? "Delete" : "Archive"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Rooms</CardTitle>
          <CardDescription>
            Manage your active and archived rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">Active Rooms</TabsTrigger>
              <TabsTrigger value="archived">Archived Rooms</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {activeRooms.length > 0 ? (
                <RoomList rooms={activeRooms} isArchived={false} />
              ) : (
                <p className="text-center text-muted-foreground">
                  No active rooms found.
                </p>
              )}
            </TabsContent>
            <TabsContent value="archived">
              {archivedRooms.length > 0 ? (
                <RoomList rooms={archivedRooms} isArchived={true} />
              ) : (
                <p className="text-center text-muted-foreground">
                  No archived rooms found.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-center">
        <Link href="/" passHref>
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
