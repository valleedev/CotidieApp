import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const achievementSource = require('../../assets/sounds/achievement.wav');

let player: AudioPlayer | null = null;

export function playAchievementSound(): void {
  try {
    player?.remove();
    player = createAudioPlayer(achievementSource);
    player.play();
  } catch {
    // El sonido es un extra — nunca debe romper el flujo de completar un hábito.
  }
}
