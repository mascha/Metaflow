import { Type } from '@angular/core';
import { HomeComponent } from './home/home';

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
    { path: '/', component: HomeComponent, title: "Project Overview", menuType: MenuType.BRAND },
    { path: '/projects', component: ProjectComponents, title: "Heroes", menuType: MenuType.LEFT },
    { path: '/about', component: AboutUsComponent, title: "About Us", menuType: MenuType.RIGHT },
    { path: '/contact', component: ContactComponent, title: "Contact", menuType: MenuType.RIGHT }
]
