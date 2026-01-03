/**
 * Mock Song Data
 *
 * Demo songs used for development and when the user has no songs yet.
 * These can be removed once the app is populated with real user data.
 */

import type { Song } from '@/types/song';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Neon Knights',
    artist: 'Black Sabbath',
    duration: '3:53',
    lastPracticed: '2 days ago',
    instrument: 'Guitar',
    genres: ['Metal', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/26/d6/fb/26d6fb50-5e33-baf7-98ec-13b167b06387/mzi.bxsjhsxe.jpg/600x600bb.jpg'
  },
  {
    id: '2',
    title: 'YYZ',
    artist: 'Rush',
    duration: '4:27',
    lastPracticed: 'Yesterday',
    instrument: 'Bass',
    genres: ['Prog', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/89/3d/1f/893d1f2b-7690-bc6d-6f0e-c7fc31acf7b4/06UMGIM04263.rgb.jpg/600x600bb.jpg'
  },
  {
    id: '3',
    title: 'Paranoid',
    artist: 'Black Sabbath',
    duration: '2:48',
    lastPracticed: '1 week ago',
    instrument: 'Bass',
    genres: ['Metal', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/600x600bb.jpg'
  },
  {
    id: '4',
    title: 'Master of Puppets',
    artist: 'Metallica',
    duration: '8:35',
    lastPracticed: '3 days ago',
    instrument: 'Guitar',
    genres: ['Metal'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/b8/5a/82/b85a8259-60d9-bfaa-770a-2baac8380e87/858978005196.png/600x600bb.jpg'
  },
  {
    id: '5',
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    duration: '6:21',
    lastPracticed: 'Just now',
    instrument: 'Guitar',
    genres: ['Prog', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/17/ec/3e17ec6d-f980-c64f-19e0-a6fd8bbf0c10/886445635850.jpg/600x600bb.jpg'
  },
];

/**
 * Mock song IDs for checking if a song is from demo data
 */
export const MOCK_SONG_IDS = new Set(['1', '2', '3', '4', '5']);

/**
 * Check if a song is from mock/demo data
 */
export function isMockSong(songId: string): boolean {
  return MOCK_SONG_IDS.has(songId);
}
