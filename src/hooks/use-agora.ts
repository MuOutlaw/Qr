import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IRemoteVideoTrack,
  type IRemoteAudioTrack,
  type ClientRole,
} from "agora-rtc-sdk-ng";

export type AgoraRole = "publisher" | "subscriber";

export type ConnectionState = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface UseAgoraOptions {
  appId: string;
  channel: string;
  token: string;
  uid: number;
  role: AgoraRole;
}

interface RemoteUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

export function useAgora({ appId, channel, token, uid, role }: UseAgoraOptions) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const join = useCallback(async () => {
    if (!appId || !channel || !token) return;
    setConnectionState("connecting");

    try {
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;

      await client.setClientRole(role as ClientRole);

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => {
            const existing = prev.find((u) => u.uid === user.uid);
            if (existing) {
              return prev.map((u) =>
                u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u
              );
            }
            return [...prev, { uid: user.uid, videoTrack: user.videoTrack }];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setRemoteUsers((prev) => {
            const existing = prev.find((u) => u.uid === user.uid);
            if (existing) {
              return prev.map((u) =>
                u.uid === user.uid ? { ...u, audioTrack: user.audioTrack } : u
              );
            }
            return [...prev, { uid: user.uid, audioTrack: user.audioTrack }];
          });
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) =>
            prev.map((u) => (u.uid === user.uid ? { ...u, videoTrack: undefined } : u))
          );
        }
        if (mediaType === "audio") {
          setRemoteUsers((prev) =>
            prev.map((u) => (u.uid === user.uid ? { ...u, audioTrack: undefined } : u))
          );
        }
      });

      client.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(appId, channel, token, uid);

      if (role === "publisher") {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        await client.publish([audioTrack, videoTrack]);
      }

      setConnectionState("connected");
    } catch {
      setConnectionState("error");
    }
  }, [appId, channel, token, uid, role]);

  const leave = useCallback(async () => {
    localAudioTrack?.close();
    localVideoTrack?.close();
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
    }
    setConnectionState("disconnected");
  }, [localAudioTrack, localVideoTrack]);

  const toggleMute = useCallback(async () => {
    if (!localAudioTrack) return;
    await localAudioTrack.setMuted(!isMuted);
    setIsMuted((v) => !v);
  }, [localAudioTrack, isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localVideoTrack) return;
    await localVideoTrack.setMuted(!isCameraOff);
    setIsCameraOff((v) => !v);
  }, [localVideoTrack, isCameraOff]);

  // Auto-join on mount
  useEffect(() => {
    if (appId && channel && token) {
      join();
    }
    return () => {
      leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connectionState,
    localVideoTrack,
    remoteUsers,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    leave,
  };
}
