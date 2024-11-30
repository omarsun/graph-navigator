import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView, View } from 'obsidian';

// View type for our graph navigation
const VIEW_TYPE_GRAPH_NAVIGATION = "graph-navigation-view";

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

class GraphNavigationView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_GRAPH_NAVIGATION;
    }

    getDisplayText(): string {
        return "Graph Navigation";
    }

    getIcon(): string {
        return "map";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        const contentContainer = container.createDiv({
            cls: "graph-navigation-container"
        });
        
        contentContainer.createDiv({
            text: "Graph Navigation",
            cls: "graph-navigation-title"
        });
    }
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_GRAPH_NAVIGATION,
			(leaf) => new GraphNavigationView(leaf)
		);

		// Add ribbon icon
		this.addRibbonIcon('map', 'Graph Navigation', (evt: MouseEvent) => {
			this.activateView();
		});

		// Register event handler for layout change
		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.handleEmptyLeaves();
			})
		);

		// Initial check for empty leaves
		this.handleEmptyLeaves();

		// Add settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		// Deregister the view type
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_GRAPH_NAVIGATION);
	}

	private async activateView() {
		const { workspace } = this.app;
		
		let leaf = workspace.getLeavesOfType(VIEW_TYPE_GRAPH_NAVIGATION)[0];
		
		if (!leaf) {
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({
				type: VIEW_TYPE_GRAPH_NAVIGATION,
				active: true,
			});
		}
		
		workspace.revealLeaf(leaf);
	}

	private handleEmptyLeaves() {
		this.app.workspace.iterateAllLeaves(leaf => {
			if (leaf.getViewState().type === "empty") {
				// Replace empty leaf with our custom view
				leaf.setViewState({
					type: VIEW_TYPE_GRAPH_NAVIGATION,
					active: true
				});
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
