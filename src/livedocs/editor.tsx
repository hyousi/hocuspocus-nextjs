import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ToolbarPlugin from "@/livedocs/plugins/ToolbarPlugin";

function Placeholder() {
	return <div className="editor-placeholder">Enter some rich text...</div>;
}

export default function Editor() {
	return (
		<div className="editor-container">
			<ToolbarPlugin />
			<div className="editor-inner">
				<RichTextPlugin
					contentEditable={<ContentEditable className="editor-input" />}
					placeholder={<Placeholder />}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<AutoFocusPlugin />
			</div>
		</div>
	);
}
