"use client";

import type { Provider } from "@lexical/yjs";

import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type * as Y from "yjs";

import { createHocuspocusProvider } from "@/hocuspocus.client";
import {
  type UserProfile,
  getRandomUserProfile,
} from "@/lib/getRandomUserProfile";
import Editor from "@/livedocs/editor";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { livedocsConfig } from "@/livedocs/utils";
import theme from "@/livedocs/themes/PlaygroundEditorTheme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wifi, WifiOff } from "lucide-react";
import type { HocuspocusProvider } from "@hocuspocus/provider";

interface ActiveUserProfile extends UserProfile {
  userId: number;
}

const initialConfig = livedocsConfig({
  editorState: null,
  namespace: "React.js Collab Demo",
  nodes: [],
  onError: console.error,
  theme: theme,
});

export default function Page() {
  const documentName = "document";
  const [userProfile, setUserProfile] = useState(() => getRandomUserProfile());
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
  const yjsProviderRef = useRef<Provider | null>(null);

  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);

  const handleAwarenessUpdate = useCallback(() => {
    const awareness = yjsProviderRef.current?.awareness;
    if (!awareness) return;

    setActiveUsers(
      Array.from(awareness.getStates().entries()).map(
        ([userId, { color, name }]) => ({
          color,
          name,
          userId,
        }),
      ),
    );
  }, []);

  const handleConnectionToggle = async (checked: boolean) => {
    if (yjsProviderRef.current == null) {
      return;
    }
    if (connected) {
      yjsProviderRef.current.disconnect();
    } else {
      await (yjsProviderRef.current as unknown as HocuspocusProvider).connect();
    }
    setConnected(checked);
  };

  useEffect(() => {
    if (yjsProviderRef.current == null) {
      return;
    }

    yjsProviderRef.current.awareness.on("update", handleAwarenessUpdate);

    return () =>
      yjsProviderRef.current?.awareness.off("update", handleAwarenessUpdate);
  }, [handleAwarenessUpdate]);

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider = createHocuspocusProvider(id, yjsDocMap);
      yjsProviderRef.current = provider;

      (provider as unknown as HocuspocusProvider).on("connect", () => {
        setConnected(true);
      });

      (provider as unknown as HocuspocusProvider).on("disconnect", () => {
        setConnected(true);
      });

      return provider;
    },

    [],
  );

  return (
    <div ref={containerRef}>
      <section className="space-y-4">
        <div className="flex justify-between">
          <p>
            Used provider: <b>Websocket</b>
          </p>
          <div className="flex items-center gap-3">
            <Label htmlFor="connection" className="text-foreground/70">
              {connected ? <Wifi /> : <WifiOff />}
            </Label>
            <Switch
              checked={connected}
              onCheckedChange={handleConnectionToggle}
              id="connection"
            />
          </div>
        </div>

        <div>
          <b>My Name:</b>{" "}
          <input
            type="text"
            value={userProfile.name}
            onChange={(e) =>
              setUserProfile((profile) => ({
                ...profile,
                name: e.target.value,
              }))
            }
          />{" "}
          <input
            type="color"
            value={userProfile.color}
            onChange={(e) =>
              setUserProfile((profile) => ({
                ...profile,
                color: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <b>Active users:</b>{" "}
          {activeUsers.map(({ name, color, userId }, idx) => (
            <Fragment key={userId}>
              <span style={{ color }}>{name}</span>
              {idx === activeUsers.length - 1 ? "" : ", "}
            </Fragment>
          ))}
        </div>
      </section>

      <LexicalComposer initialConfig={initialConfig}>
        <CollaborationPlugin
          // This is the document name
          id={documentName}
          providerFactory={providerFactory}
          // Unless you have a way to avoid race condition between 2+ users trying to do bootstrap simultaneously
          // you should never try to bootstrap on client. It's better to perform bootstrap within Yjs server.
          shouldBootstrap={false}
          username={userProfile.name}
          cursorColor={userProfile.color}
          cursorsContainerRef={containerRef}
        />
        <Editor />
      </LexicalComposer>
    </div>
  );
}
