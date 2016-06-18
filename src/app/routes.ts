import { Type } from '@angular/core';

export enum MenuType {
    BRAND,
    LEFT,
    RIGHT
}

interface RouteInfoMetadata {
    path: string;
    component: Type;
    title: string;
    menuType: MenuType;
}

export declare class RouteInfo implements RouteInfoMetadata {
    path: string;
    component: Type;
    title: string;
    menuType: MenuType;
    constructor({path, component, title}?: {
        path?: string;
        component?: Type;
        title?: string;
        menuType?: MenuType;
    });
}

export const ROUTES: RouteInfo[] = [
    // { path: '/', component: HomeComponent, title: "Project Overview", menuType: MenuType.BRAND },
    // { path: '/projectpage', component: HomeComponent, title: "Heroes", menuType: MenuType.LEFT },
];
