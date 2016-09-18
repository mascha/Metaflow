import { NgModule } from '@angular/core';

import SideBar from './sidebar/sidebar';
import DoubleSplit from "./splitpane/doublesplit";
import TripleSplit from "./splitpane/triplesplit";

import MenuBar from "./menubar/menubar";
import Navigation from "./navigation/navigation";
import Workspace from "./workspace";
import Toolbar from "./toolbar/toolbar";

/**
 * Workspace module.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [SideBar,],
    providers: [],
})
export default class WorkspaceModule { }
