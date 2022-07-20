import { BulletinData } from "../model/dataset";
import { InfoRecord } from "../model/InfoRecord";

export interface BulletinListComponentProps {
    data: BulletinData[];
}

export interface BulletinComponentProps {
    data: BulletinData;
}

export interface InfoComponentProps {
    data: InfoRecord;
}

export interface PaginatedComponentState {
    displayedCount: number;
}