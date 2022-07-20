import React from "react";
import { ProviderType } from "../model/Provider";

interface BulletinContainerProps {
    headerElement: any;
    bulletinListElement: any;
    checkedProviders: Set<ProviderType>;
    handleChecked: (check: ProviderType) => void;
}
export class BulletinContainer extends React.Component<BulletinContainerProps> {
    constructor(props: BulletinContainerProps) {
        super(props);
    }
    
}