import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Wellness = () => {
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [dailyTip, setDailyTip] = useState("");
  const [currentMood, setCurrentMood] = useState(null);
  const [selectedTab, setSelectedTab] = useState("breathing");

  const wellnessTips = [
    "Take a moment to stretch and release tension",
    "Practice gratitude by noting three things you're thankful for",
    "Take a short walk to clear your mind",
    "Stay hydrated throughout the day",
    "Take regular breaks from screen time",
    "Practice mindful eating during meals",
    "Connect with a friend or loved one",
    "Get some sunlight and fresh air",
    "Listen to calming music",
    "Do one small act of kindness today",
  ];

  const breathingExercises = [
    {
      id: "box",
      name: "Box Breathing",
      description: "Inhale for 4, hold for 4, exhale for 4, hold for 4",
      duration: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    },
    {
      id: "478",
      name: "4-7-8 Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      duration: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    },
    {
      id: "calm",
      name: "Calming Breath",
      description: "Inhale for 6, exhale for 8",
      duration: { inhale: 6, hold1: 0, exhale: 8, hold2: 0 },
    },
  ];

  const relaxationVideos = [
    {
      id: 1,
      title: "10-Minute Meditation for Beginners",
      thumbnail: "https://img.youtube.com/vi/U9YKY7fdwyg/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=U9YKY7fdwyg",
      duration: "10:00",
    },
    {
      id: 2,
      title: "Calm Piano Music for Stress Relief",
      thumbnail: "https://img.youtube.com/vi/lCOF9LN_Zxs/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=lCOF9LN_Zxs",
      duration: "15:00",
    },
    {
      id: 3,
      title: "Nature Sounds for Relaxation",
      thumbnail: "https://img.youtube.com/vi/eKFTSSKCzWA/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=eKFTSSKCzWA",
      duration: "8:00",
    },
  ];

  useEffect(() => {
    // Set random daily tip
    const randomTip =
      wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    setDailyTip(randomTip);
  }, []);

  useEffect(() => {
    let timer;
    if (isBreathingActive && selectedExercise) {
      const exercise = breathingExercises.find(
        (ex) => ex.id === selectedExercise
      );
      if (!exercise) return;

      const cycle = {
        inhale: () => {
          setBreathingPhase("inhale");
          timer = setTimeout(
            () => setBreathingPhase("hold1"),
            exercise.duration.inhale * 1000
          );
        },
        hold1: () => {
          if (exercise.duration.hold1 === 0) {
            setBreathingPhase("exhale");
            return;
          }
          timer = setTimeout(
            () => setBreathingPhase("exhale"),
            exercise.duration.hold1 * 1000
          );
        },
        exhale: () => {
          timer = setTimeout(() => {
            if (exercise.duration.hold2 === 0) {
              setBreathingCount((prev) => prev + 1);
              setBreathingPhase("inhale");
              return;
            }
            setBreathingPhase("hold2");
          }, exercise.duration.exhale * 1000);
        },
        hold2: () => {
          timer = setTimeout(() => {
            setBreathingCount((prev) => prev + 1);
            setBreathingPhase("inhale");
          }, exercise.duration.hold2 * 1000);
        },
      };

      cycle[breathingPhase]();
    }

    return () => clearTimeout(timer);
  }, [breathingPhase, isBreathingActive, selectedExercise]);

  const startBreathing = (exerciseId) => {
    setSelectedExercise(exerciseId);
    setBreathingPhase("inhale");
    setBreathingCount(0);
    setIsBreathingActive(true);
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setSelectedExercise(null);
    setBreathingPhase("inhale");
  };

  const moods = ["😊 Happy", "😌 Calm", "😐 Neutral", "😔 Sad", "😫 Stressed"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wellness Center</h2>
          <p className="text-muted-foreground">
            Tools and resources to support your mental health and well-being.
          </p>
        </div>

        {/* Daily Tip Card */}
        <Card>
          <CardHeader>
            <CardTitle>🌟 Daily Wellness Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{dailyTip}</p>
          </CardContent>
        </Card>

        {/* Mood Tracker Card */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {moods.map((mood) => (
                <Button
                  key={mood}
                  onClick={() => setCurrentMood(mood)}
                  variant={currentMood === mood ? "default" : "secondary"}
                >
                  {mood}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-4">
          <Button
            onClick={() => setSelectedTab("breathing")}
            variant={selectedTab === "breathing" ? "default" : "secondary"}
          >
            Breathing Exercises
          </Button>
          <Button
            onClick={() => setSelectedTab("videos")}
            variant={selectedTab === "videos" ? "default" : "secondary"}
          >
            Relaxation Videos
          </Button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTab === "breathing" ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Breathing Exercise Cards */}
                {breathingExercises.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <CardTitle>{exercise.name}</CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedExercise === exercise.id ? (
                        <div className="text-center">
                          <div className="mb-4">
                            <div className="text-2xl font-bold text-primary mb-2">
                              {breathingPhase.charAt(0).toUpperCase() +
                                breathingPhase.slice(1)}
                            </div>
                            <div className="text-muted-foreground">
                              Cycles completed: {breathingCount}
                            </div>
                          </div>
                          <Button onClick={stopBreathing} variant="destructive">
                            Stop
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => startBreathing(exercise.id)}
                          className="w-full"
                          disabled={isBreathingActive}
                        >
                          Start
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Relaxation Video Cards */}
                {relaxationVideos.map((video) => (
                  <Card key={video.id}>
                    <div className="aspect-video">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{video.title}</CardTitle>
                      <CardDescription>
                        Duration: {video.duration}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch Video
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Wellness;