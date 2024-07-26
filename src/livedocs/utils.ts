import { MarkNode } from "@lexical/mark";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";

const livedocsConfig = (config: InitialConfigType): InitialConfigType => {
  return {
    ...config,
    nodes: [...(config?.nodes ?? []), MarkNode],
  };
};

export { livedocsConfig };
