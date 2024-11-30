import { Plugin, WorkspaceLeaf } from "obsidian";
import { GraphNavigationView, VIEW_TYPE } from "./views/GraphNavigationView";

export default class GraphNavigationPlugin extends Plugin {
    async onload() {
        this.registerView(
            VIEW_TYPE,
            (leaf) => new GraphNavigationView(leaf)
        );

        // Add ribbon icon to activate view
        this.addRibbonIcon("graph", "Open Graph Navigation", () => {
            this.activateView();
        });
    }

    async onunload() {
        // Cleanup
    }

    async activateView() {
        const { workspace } = this.app;

        // Check if view already exists
        let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];

        if (!leaf) {
            // Create new leaf in right sidebar
            const newLeaf = workspace.getRightLeaf(false);
            if (newLeaf) {
                leaf = newLeaf;
                await leaf.setViewState({ type: VIEW_TYPE, active: true });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }
}
