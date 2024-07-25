// /**
//  * Copyright (c) Meta Platforms, Inc. and affiliates.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  *
//  */
"use client";
import type { Provider } from "@lexical/yjs";

import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type * as Y from "yjs";

// import Editor from "./Editor";
// import ExampleTheme from "./ExampleTheme";
import {
	getRandomUserProfile,
	type UserProfile,
} from "@/lib/getRandomUserProfile";
import { createHocuspocusProvider } from "@/hocuspocus.client";
import Editor from "@/livedocs/editor";

interface ActiveUserProfile extends UserProfile {
	userId: number;
}

const editorConfig = {
	// NOTE: This is critical for collaboration plugin to set editor state to null. It
	// would indicate that the editor should not try to set any default state
	// (not even empty one), and let collaboration plugin do it instead
	editorState: null,
	namespace: "React.js Collab Demo",
	nodes: [],
	// Handling of errors during update
	onError(error: Error) {
		throw error;
	},
	// The editor theme
	// theme: ExampleTheme,
};

export default function Page() {
	const documentName = "document";
	const [userProfile, setUserProfile] = useState(() => getRandomUserProfile());
	const containerRef = useRef<HTMLDivElement | null>(null);
	// const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
	const yjsProviderRef = useRef<null | Provider>(null);

	const [connected, setConnected] = useState(false);
	const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);

	const handleAwarenessUpdate = useCallback(() => {
		const awareness = yjsProviderRef.current!.awareness!;
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

	const handleConnectionToggle = () => {
		if (yjsProviderRef.current == null) {
			return;
		}
		if (connected) {
			yjsProviderRef.current.disconnect();
		} else {
			yjsProviderRef.current.connect();
		}
		setConnected((prev) => !prev);
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

			provider.on("status", (event) => {
				setConnected(
					event.status === "connected" ||
						("connected" in event && event.connected === true),
				);
			});

			return provider;
		},

		[],
	);

	return (
		<div ref={containerRef}>
			<p>
				<b>Used provider: Websocket</b>{" "}
				<button type="button" onClick={handleConnectionToggle}>
					{connected ? "Disconnect" : "Connect"}
				</button>
			</p>
			<p>
				<b>My Name:</b>{" "}
				<input
					type="text"
					value={userProfile.name}
					onChange={(e) =>
						setUserProfile((profile) => ({ ...profile, name: e.target.value }))
					}
				/>{" "}
				<input
					type="color"
					value={userProfile.color}
					onChange={(e) =>
						setUserProfile((profile) => ({ ...profile, color: e.target.value }))
					}
				/>
			</p>
			<p>
				<b>Active users:</b>{" "}
				{activeUsers.map(({ name, color, userId }, idx) => (
					<Fragment key={userId}>
						<span style={{ color }}>{name}</span>
						{idx === activeUsers.length - 1 ? "" : ", "}
					</Fragment>
				))}
			</p>
			<LexicalComposer initialConfig={editorConfig}>
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
