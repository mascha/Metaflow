import {Component, ViewChild, Inject, AfterViewInit} from "@angular/core";
import {Diagram} from '../../common/layer';
import {Iconbar} from './toolbars/iconbar';
import {Explorer} from '../toolwindows/explorer/explorer';
import {Inspector} from '../toolwindows/inspector/inspector';
import {Sidebar} from './sidebar/sidebar';

/**
 * Workspace component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    styles: [require('./workspace.scss')]
})
export default class Workspace implements AfterViewInit {
    @ViewChild('toolsLeft') toolsLeft: Iconbar;
    @ViewChild('toolsRight') toolsRight: Iconbar;
    @ViewChild('toolsBottom') toolsBottom: Iconbar;

    @ViewChild('left') left: Sidebar;
    @ViewChild('right') right: Sidebar;
    @ViewChild('bottom') bottom: Sidebar;

    @ViewChild('explorer') explorer: Explorer;
    @ViewChild('inspector') inspector: Inspector;
    @ViewChild('palette') palette: Inspector;
    slimLayout = true;

    ngAfterViewInit() {
        setTimeout(() => {
            this.toolsRight.items = [this.inspector, this.palette]; 
            this.toolsLeft.items = [this.explorer];
            this.toolsBottom.items = [];
        })
    }
}
