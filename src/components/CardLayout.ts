import { App, TFile } from "obsidian";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class CardLayout {
    private container: HTMLElement;
    private cards: Map<string, HTMLElement> = new Map();
    private centerCard: HTMLElement | null = null;
    private app: App;
    private readonly CARD_WIDTH = 200;
    private readonly CARD_HEIGHT = 120;
    private readonly MIN_GAP = 20;
    private readonly BOUNDARY_PADDING = 40;

    constructor(containerEl: HTMLElement, app: App) {
        this.container = containerEl;
        this.app = app;
    }

    private getCardBox(element: HTMLElement): Box {
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    private isBoxCollision(box1: Box, box2: Box): boolean {
        return !(
            box1.x + box1.width + this.MIN_GAP < box2.x ||
            box1.x > box2.x + box2.width + this.MIN_GAP ||
            box1.y + box1.height + this.MIN_GAP < box2.y ||
            box1.y > box2.y + box2.height + this.MIN_GAP
        );
    }

    private isWithinBoundary(box: Box): boolean {
        const containerRect = this.container.getBoundingClientRect();
        return (
            box.x >= this.BOUNDARY_PADDING &&
            box.y >= this.BOUNDARY_PADDING &&
            box.x + box.width <= containerRect.width - this.BOUNDARY_PADDING &&
            box.y + box.height <= containerRect.height - this.BOUNDARY_PADDING
        );
    }

    private findValidPosition(index: number, totalCards: number): { x: number; y: number } {
        const containerRect = this.container.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        // Start with positions in a circle
        let radius = 200;
        let angle = (index / totalCards) * Math.PI * 2;
        let position = { x: 0, y: 0 };
        let attempts = 0;
        const MAX_ATTEMPTS = 50;

        while (attempts < MAX_ATTEMPTS) {
            position = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };

            // Create a test box at this position
            const testBox: Box = {
                x: position.x - this.CARD_WIDTH / 2,
                y: position.y - this.CARD_HEIGHT / 2,
                width: this.CARD_WIDTH,
                height: this.CARD_HEIGHT
            };

            // Check collision with existing cards
            let hasCollision = false;
            this.cards.forEach((card) => {
                if (this.isBoxCollision(testBox, this.getCardBox(card))) {
                    hasCollision = true;
                }
            });

            // Check collision with center card
            if (this.centerCard && this.isBoxCollision(testBox, this.getCardBox(this.centerCard))) {
                hasCollision = true;
            }

            // If position is valid, return it
            if (!hasCollision && this.isWithinBoundary(testBox)) {
                return position;
            }

            // Adjust search pattern: increase radius and slightly modify angle
            radius += 20;
            angle += 0.1;
            attempts++;
        }

        // Fallback position if no valid position found
        return position;
    }

    private positionCard(card: HTMLElement, x: number, y: number) {
        card.style.position = "absolute";
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.transform = "translate(-50%, -50%)";
    }

    async initialize() {
        const canvasContainer = this.container.createDiv({
            cls: "graph-navigation-canvas"
        });

        // Create and position the center card
        this.centerCard = this.createCard("Center");
        this.positionCenterCard();

        await this.loadVaultFiles();
    }

    private createCard(title: string): HTMLElement {
        const card = this.container.createDiv({
            cls: "graph-navigation-card"
        });

        card.createDiv({
            cls: "card-title",
            text: title
        });

        return card;
    }

    private positionCenterCard() {
        if (!this.centerCard) return;
        const containerRect = this.container.getBoundingClientRect();
        this.positionCard(
            this.centerCard,
            containerRect.width / 2,
            containerRect.height / 2
        );
    }

    private async loadVaultFiles() {
        const files = this.app.vault.getMarkdownFiles();
        const filesToShow = files.slice(0, 5);
        
        filesToShow.forEach((file: TFile, index: number) => {
            const card = this.createCard(file.basename);
            this.cards.set(file.path, card);
            
            const position = this.findValidPosition(index, filesToShow.length);
            this.positionCard(card, position.x, position.y);
        });
    }

    destroy() {
        this.cards.clear();
        this.centerCard = null;
    }
}