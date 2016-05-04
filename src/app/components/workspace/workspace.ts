import {Component} from "angular2/core";

/**
 * 
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    styles: [require('./workspace.scss)')]
})
export default class Workspace {
    slim: boolean = true;
}
    
    
@Component({
    selector: 'double-split',
    template: require('./doublesplit.html')
})
class DoubleSplit {
    
}

@Component({
    selector: 'triple-split',
    template: require('./triplesplit.html'),
    styles: [require('./splitpane.scss')]
})
class TripleSplit {
    
}
