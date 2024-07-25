// import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { Provider } from "@lexical/yjs";
import * as Y from "yjs";

function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
	let doc = yjsDocMap.get(id);

	if (doc === undefined) {
		doc = new Y.Doc();
		yjsDocMap.set(id, doc);
	} else {
		doc.load();
	}

	return doc;
}

export function createHocuspocusProvider(
	id: string,
	yjsDocMap: Map<string, Y.Doc>,
): Provider {
	const doc = getDocFromMap(id, yjsDocMap);

	// @ts-ignore
	return new HocuspocusProvider({
		document: doc,
		name: id, // room id
		onSynced: () => {
			console.log("synced");
		},
		url: "ws://localhost:1234",
	});
}
