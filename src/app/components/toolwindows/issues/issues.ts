import {Component} from '@angular/core';
import {Constraint} from "../../../common/validation";
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow";
import {ModelService} from "../../../services/models";

/**
 * A problem viewer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'issues',
    template: require('./issues.html'),
    styles: [require('./issues.scss')]
})
export class Issues implements ToolWindow<Diagram> {
    title = "Issues";
    constraints: Array<{active: boolean, constraint: Constraint}> = [];
    scope: ViewGroup;

    initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateLevel(it));
    }

    private updateLevel(level: ViewGroup) {
        /* api.fetchIssues(level) */
    }

    constructor(api: ModelService) {
        api.watchIssues().subscribe(cs => {
            this.constraints = cs.map((c,i) => {
                return { active: i > 0 ? false : true, constraint: c } ;
            });
        });
        console.log(this.constraints);
    }
}
