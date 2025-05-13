import React, { useState, useEffect } from 'react';
import { BackgroundChanger } from './BackgroundChanger';

interface PreJoinSetupProps {
  onJoinMeeting: (processedStream: MediaStream) => void;
}

export const PreJoinSetup: React.FC<PreJoinSetupProps> = ({ onJoinMeeting }) => {
  const [processedVideoStream, setProcessedVideoStream] = useState<MediaStream | null>(null);
  const [userName, setUserName] = useState(''); // Example: get user's name

  const handleStreamReady = (stream: MediaStream) => {
    console.log("PreJoin: Processed stream received in parent.", stream);
    setProcessedVideoStream(stream);
  };

  const handleJoin = () => {
    if (processedVideoStream && userName.trim()) {
      // Here, you would also get an audio stream if needed for the meeting
      // For simplicity, we're only passing the processed video stream.
      // You might combine it with an audio track:
      // navigator.mediaDevices.getUserMedia({ audio: true }).then(audioStream => {
      //   const finalStream = new MediaStream([...processedVideoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
      //   onJoinMeeting(finalStream);
      // }).catch(err => console.error("Failed to get audio stream", err));
      onJoinMeeting(processedVideoStream);
    } else if (!userName.trim()){
      alert("Please enter your name.");
    } else {
      alert("Video stream not ready. Please check camera and background settings.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Meeting Setup</h2>

      <div className="mb-4">
        <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your name"
        />
      </div>

      <BackgroundChanger onStreamReady={handleStreamReady} width={480} height={360} />

      <button
        onClick={handleJoin}
        disabled={!processedVideoStream || !userName.trim()}
        className="mt-6 w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        Join Meeting
      </button>
    </div>
  );
};