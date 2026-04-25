import { useEffect, useRef } from "react";
import { type ICameraVideoTrack, type IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  track: ICameraVideoTrack | IRemoteVideoTrack;
  className?: string;
  mirror?: boolean;
}

export default function VideoPlayer({ track, className = "", mirror = false }: VideoPlayerProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      track.play(divRef.current);
    }
    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <div
      ref={divRef}
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    />
  );
}
