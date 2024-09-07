"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { MeetingAgenda } from "@/components/meeting-agenda";
import { MeetingNotes } from "@/components/meeting-notes";
import { Chat } from "@/components/chat";
import { RoomSettings } from "@/components/room-settings";
import { useFirebase } from "@/hooks/useFirebase";
import { useUser } from "@/components/UserProvider";
import {
  ArrowLeft,
  Users,
  BarChart,
  ChevronRight,
  ChevronLeft,
  Settings,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export type AgendaItem = {
  id: string;
  topic: string;
  duration: number;
};

export default function Room({
  params,
}: {
  params: { id: string; name: string };
}) {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentAgendaItemIndex, setCurrentAgendaItemIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [actionItem, setActionItem] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomName = searchParams.get("name") || "Unnamed Room";
  const { userId, userName } = useUser();
  const {
    elmoCount,
    participants,
    agenda,
    summary,
    roomData,
    incrementElmo,
    joinRoom,
    leaveRoom,
    updateAgenda,
    resetElmoCount,
    startMeeting,
    endMeeting,
    addDecision,
    addActionItem,
  } = useFirebase(params.id);

  const [settings, setSettings] = useState({
    visualCue: "flash",
    soundEffect: "bell",
    elmoThreshold: 3,
    darkMode: false,
    volume: 50,
    autoEndMeeting: false,
  });

  useEffect(() => {
    const initializeRoom = async () => {
      if (!summary.startTime) {
        await startMeeting();
      }
      await joinRoom(userId, userName);
    };
    initializeRoom();

    const savedSettings = localStorage.getItem("elmoSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    return () => {
      leaveRoom(userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompleteRoom = async () => {
    await endMeeting();
    router.push(
      `/room/${params.id}/${params.name}/complete?name=${encodeURIComponent(roomName)}`,
    );
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isActive && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const handleElmo = () => {
    incrementElmo();
    playSound();
    showVisualCue();
    toast({
      title: "ELMO Activated!",
      description: "Someone thinks it's time to move on.",
    });

    if (elmoCount + 1 >= settings.elmoThreshold) {
      nextAgendaItem();
      toast({
        title: "Moving to Next Topic",
        description:
          "ELMO threshold reached. Advancing to the next agenda item.",
      });
    }
  };

  const playSound = () => {
    const audio = new Audio(`/sounds/${settings.soundEffect}.mp3`);
    audio.volume = settings.volume / 100;
    audio.play();
  };

  const showVisualCue = () => {
    document.body.classList.add(`elmo-${settings.visualCue}`);
    setTimeout(() => {
      document.body.classList.remove(`elmo-${settings.visualCue}`);
    }, 1000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentAgendaItem = agenda[currentAgendaItemIndex] as {
    topic: ReactNode;
    duration: number;
  };
  const agendaItemProgress = currentAgendaItem
    ? (timer / (currentAgendaItem.duration * 60)) * 100
    : 0;

  const nextAgendaItem = () => {
    if (currentAgendaItemIndex < agenda.length - 1) {
      setCurrentAgendaItemIndex(currentAgendaItemIndex + 1);
      setTimer(0);
      setIsActive(true);
      resetElmoCount();
    } else if (settings.autoEndMeeting) {
      handleLeaveRoom();
    }
  };

  const previousAgendaItem = () => {
    if (currentAgendaItemIndex > 0) {
      setCurrentAgendaItemIndex(currentAgendaItemIndex - 1);
      setTimer(0);
      setIsActive(true);
      resetElmoCount();
    }
  };

  const handleResetElmoCount = () => {
    resetElmoCount();
    toast({
      title: "ELMO Count Reset",
      description: "The ELMO count has been reset to zero.",
    });
  };

  const handleLeaveRoom = () => {
    leaveRoom(userId);
    router.push("/");
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem("elmoSettings", JSON.stringify(newSettings));
  };

  const handleAddDecision = async () => {
    if (decision.trim()) {
      await addDecision(decision);
      setDecision("");
      toast({
        title: "Decision Added",
        description: "The decision has been added to the meeting summary.",
      });
    }
  };

  const handleAddActionItem = async () => {
    if (actionItem.trim()) {
      await addActionItem(actionItem);
      setActionItem("");
      toast({
        title: "Action Item Added",
        description: "The action item has been added to the meeting summary.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex justify-between items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Leave Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to leave the room?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You will lose access to the
                  current meeting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeaveRoom}>
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex items-center space-x-2">
            <Link href={`/room/${params.id}/summary`} passHref>
              <Button variant="outline">
                <BarChart className="mr-2 h-4 w-4" /> Summary
              </Button>
            </Link>
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Room Settings</SheetTitle>
                  <SheetDescription>
                    Customize your ELMO experience
                  </SheetDescription>
                </SheetHeader>
                <RoomSettings
                  settings={{
                    ...settings,
                  }}
                  onSettingsChange={handleSettingsChange}
                />
              </SheetContent>
            </Sheet>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" /> Complete Meeting
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete the meeting?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to complete this meeting? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCompleteRoom}>
                    Complete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{params.name}</CardTitle>
            <CardDescription>Room ID: {params.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                <Button
                  className={`w-full h-24 text-2xl ${settings.visualCue === "bounce" ? "animate-bounce" : ""}`}
                  onClick={handleElmo}
                >
                  ELMO
                </Button>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">ELMO Count</p>
                    <div className="text-2xl font-bold">{elmoCount}</div>
                  </div>
                  <div>
                    <p className="text-sm">Topic Duration</p>
                    <div className="text-2xl font-bold">
                      {formatTime(timer)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">Participants</p>
                    <div className="text-2xl font-bold flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {participants.length}
                    </div>
                  </div>
                </div>
                <Progress
                  value={(elmoCount / settings.elmoThreshold) * 100}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    {elmoCount} / {settings.elmoThreshold} ELMOs to move on
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetElmoCount}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset ELMO
                  </Button>
                </div>
                {currentAgendaItem && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        onClick={previousAgendaItem}
                        disabled={currentAgendaItemIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <p className="font-medium">{currentAgendaItem.topic}</p>
                      <Button
                        size="sm"
                        onClick={nextAgendaItem}
                        disabled={currentAgendaItemIndex === agenda.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress value={agendaItemProgress} className="w-full" />
                    <p className="text-sm text-center">
                      {formatTime(timer)} /{" "}
                      {formatTime(currentAgendaItem.duration * 60)}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsActive(!isActive)}
                    className="flex-grow"
                  >
                    {isActive ? "Pause Timer" : "Start Timer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTimer(0)}
                    className="flex-grow"
                  >
                    Reset Timer
                  </Button>
                </div>
              </div>
              <div className="space-y-4 md:col-span-2">
                <Tabs defaultValue="agenda" className="w-full">
                  <TabsList>
                    <TabsTrigger value="agenda">Agenda</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  <div className="h-[500px] overflow-y-auto">
                    <TabsContent value="agenda" className="h-full">
                      <MeetingAgenda
                        roomId={params.id}
                        agenda={agenda}
                        updateAgenda={updateAgenda}
                      />
                    </TabsContent>
                    <TabsContent value="notes" className="h-full">
                      <MeetingNotes roomId={params.id} />
                    </TabsContent>
                    <TabsContent value="chat" className="h-full">
                      <Chat roomId={params.id} userId={userId} />
                    </TabsContent>
                    <TabsContent value="summary" className="h-full">
                      <Card className="h-full overflow-y-auto">
                        <CardHeader>
                          <CardTitle>Meeting Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">Add Decision</h3>
                              <div className="flex space-x-2">
                                <Input
                                  value={decision}
                                  onChange={(e) => setDecision(e.target.value)}
                                  placeholder="Enter a decision"
                                />
                                <Button onClick={handleAddDecision}>Add</Button>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold">Add Action Item</h3>
                              <div className="flex space-x-2">
                                <Input
                                  value={actionItem}
                                  onChange={(e) =>
                                    setActionItem(e.target.value)
                                  }
                                  placeholder="Enter an action item"
                                />
                                <Button onClick={handleAddActionItem}>
                                  Add
                                </Button>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold">Decisions</h3>
                              <ul className="list-disc pl-5">
                                {roomData.summary.decisions.map(
                                  (decision, index) => (
                                    <li key={index}>{decision}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-semibold">Action Items</h3>
                              <ul className="list-disc pl-5">
                                {roomData.summary.actionItems.map(
                                  (item, index) => (
                                    <li key={index}>{item}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
