import { ItemView, WorkspaceLeaf } from "obsidian";
import { CardLayout } from "../components/CardLayout";

export const VIEW_TYPE = "graph-navigation-view";

export class GraphNavigationView extends ItemView {
    private cardLayout: CardLayout;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.cardLayout = new CardLayout(this.containerEl, this.app);
    }

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Graph Navigation";
    }

    async onOpen() {
        // Clear the container
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass("graph-navigation-container");

        // Initialize the card layout
        await this.cardLayout.initialize();
    }

    async onClose() {
        // Cleanup
        this.cardLayout.destroy();
    }
}