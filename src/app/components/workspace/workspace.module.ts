import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolWindowModule } from '../toolwindows/toolwindows.module';
import { DiagramModule } from '../diagram/diagram.module';

import {Sidebar} from './sidebar/sidebar';
import DoubleSplit from "./splitpane/doublesplit";
import TripleSplit from "./splitpane/triplesplit";

import MenuBar from "./menubar/menubar";
import Navigation from "./navigation/navigation";
import Workspace from "./workspace";

import {Dialog} from '../dialog/dialog';
import {Playbar} from './playbar/playbar';
import {Iconbar} from './toolbars/iconbar';
import {Workflows} from '../workflows/workflows'

/**
 * Workspace module.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [
        CommonModule,
        ToolWindowModule,
        DiagramModule
    ],
    exports: [
        Workspace
    ],
    declarations: [
        Playbar,
        Dialog,
        Sidebar, 
        MenuBar, 
        Workspace,
        DoubleSplit,
        TripleSplit,
        Navigation,
        Workspace, 
        Iconbar, 
        Workflows
    ],
    providers: [
    ]
})
export class WorkspaceModule { }
