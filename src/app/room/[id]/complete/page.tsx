"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Confetti from "react-confetti";
import { Home, BarChart, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

export default function CompletePage({ params }: { params: { id: string } }) {
  const [isConfettiActive, setIsConfettiActive] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomName = searchParams.get("name") || "Unnamed Room";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    audioRef.current = new Audio("/sounds/achievement.mp3");

    const timer = setTimeout(() => {
      setIsConfettiActive(false);
    }, 5000);

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Play sound on component mount
    if (isSoundEnabled && audioRef.current) {
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing sound:", error));
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const playAchievementSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing sound:", error));
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled && audioRef.current) {
      playAchievementSound();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative">
      {isConfettiActive && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.1}
          />
        </div>
      )}
      <Card className="w-full max-w-lg z-10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Congratulations!
          </CardTitle>
          <CardDescription className="text-center text-lg">
            You've successfully completed the meeting:
          </CardDescription>
          <CardTitle className="text-2xl font-semibold text-center text-primary">
            {roomName}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>Great job to you and your team for a productive session!</p>
          <p>
            Don't forget to review the meeting summary and follow up on any
            action items.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/" passHref>
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <Link href={`/room/${params.id}/summary`} passHref>
            <Button variant="default">
              <BarChart className="mr-2 h-4 w-4" /> View Summary
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={toggleSound}
            aria-label={isSoundEnabled ? "Mute sound" : "Unmute sound"}
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
