import {Component, ViewChild, Inject, AfterViewInit} from "@angular/core";
import {Diagram} from '../../common/layer';
import {Iconbar} from './toolbars/iconbar';
import {ToolWindow} from '../toolwindows/toolwindow';
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

    @ViewChild('leftBar') left: Sidebar;
    @ViewChild('rightBar') right: Sidebar;
    @ViewChild('bottomBar') bottom: Sidebar;

    @ViewChild('explorer') explorer: ToolWindow<Diagram>;
    @ViewChild('inspector') inspector: ToolWindow<Diagram>;
    @ViewChild('palette') palette: ToolWindow<Diagram>;
    @ViewChild('dataview') dataview: ToolWindow<Diagram>;
    @ViewChild('issues') issues: ToolWindow<Diagram>;
    @ViewChild('formalism') formalism: ToolWindow<Diagram>;

    @ViewChild('diagram') diagram: Diagram;

    threeColumLayout = true;
    slimColumns = true;

    ngAfterViewInit() {
        setTimeout(() => {
            this.toolsLeft.selectedItem = this.explorer;
            this.toolsRight.selectedItem = this.inspector;
            this.toolsRight.items = [this.inspector, this.palette]; 
            this.toolsLeft.items = [this.explorer, this.issues, this.formalism];

            if (this.dataview) {
                this.toolsBottom.selectedItem = this.dataview;
                this.toolsBottom.items = [this.dataview];
            }
        })

        if (this.diagram) {
            this.explorer.initialize(this.diagram);
            this.inspector.initialize(this.diagram);
            this.palette.initialize(this.diagram);
            this.issues.initialize(this.diagram);
            this.formalism.initialize(this.diagram);
        }
    }
}
