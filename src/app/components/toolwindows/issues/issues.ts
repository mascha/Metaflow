import {Component} from '@angular/core';
import {Constraint} from "../../../common/validation";
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow";
import {API} from "../../../services/models";

interface Wrapper {
    state: string;
    constraint: Constraint;
}

const State = {
    HIDE: "hidden",
    FETCH: "fetching",
    ACTIVE: "active"
};

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
    constraints: Array<Wrapper> = [];
    scope: ViewGroup;

    initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateLevel(it));
    }

    onConstraintSelected(wrapper: Wrapper) {
        console.log(wrapper);
        switch (wrapper.state) {
            case State.HIDE:
                wrapper.state = State.ACTIVE;
                break;
        
            default:
                wrapper.state = State.HIDE;
                break;
        }
    }

    private updateLevel(level: ViewGroup) {
        /* api.fetchIssues(level) */
    }

    constructor(private api: API) {
        api.watchIssues().subscribe(cs => {
            this.constraints = cs.map((c,i) => {
            return { state: State.HIDE, count: 2000 * Math.log(1 - Math.random()) /(-2) | 0, constraint: c } ;
            });
        });
    }
}
