import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Bell, Volume2, VolumeX, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomSettingsProps {
  settings: {
    visualCue: string;
    soundEffect: string;
    elmoThreshold: number;
    darkMode: boolean;
    volume: number;
    autoEndMeeting: boolean;
  };
  onSettingsChange: (newSettings: RoomSettingsProps["settings"]) => void;
}

export function RoomSettings({
  settings,
  onSettingsChange,
}: RoomSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key: string, value: string | number | boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Room Settings</CardTitle>
        <CardDescription>
          Customize your ELMO meeting experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Visual Cue</Label>
              <RadioGroup
                value={localSettings.visualCue}
                onValueChange={(value) => handleChange("visualCue", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flash" id="flash" />
                  <Label htmlFor="flash">Flash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bounce" id="bounce" />
                  <Label htmlFor="bounce">Bounce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shake" id="shake" />
                  <Label htmlFor="shake">Shake</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Sound Effect</Label>
              <RadioGroup
                value={localSettings.soundEffect}
                onValueChange={(value) => handleChange("soundEffect", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bell" id="bell" />
                  <Label htmlFor="bell">Bell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buzzer" id="buzzer" />
                  <Label htmlFor="buzzer">Buzzer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="chime" id="chime" />
                  <Label htmlFor="chime">Chime</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="elmoThreshold">ELMO Threshold</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="elmoThreshold"
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.elmoThreshold}
                  onChange={(e) =>
                    handleChange("elmoThreshold", parseInt(e.target.value))
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  ELMOs required to move on
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Volume</Label>
              <div className="flex items-center space-x-2">
                <VolumeX className="h-4 w-4" />
                <Slider
                  value={[localSettings.volume]}
                  onValueChange={(value) => handleChange("volume", value[0])}
                  max={100}
                  step={1}
                />
                <Volume2 className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="darkMode"
                checked={localSettings.darkMode}
                onCheckedChange={(checked) => handleChange("darkMode", checked)}
              />
              <Label htmlFor="darkMode">Dark Mode</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoEndMeeting"
                checked={localSettings.autoEndMeeting}
                onCheckedChange={(checked) =>
                  handleChange("autoEndMeeting", checked)
                }
              />
              <Label htmlFor="autoEndMeeting">
                Auto-end meeting when agenda is complete
              </Label>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          <Bell className="inline-block mr-2 h-4 w-4" />
          Settings are synced across devices
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
