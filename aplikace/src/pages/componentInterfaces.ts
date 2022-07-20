import { BulletinData } from "../model/dataset";

export interface VisualizationListComponentProps {
    data: BulletinData[];
}

export interface VisualizationComponentProps {
    data: BulletinData;
}

export interface PaginatedComponentState {
    displayedCount: number;
}