import {Component} from "@angular/core";

/**
 * A property sheet component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'property-sheet',
    template: require('./propertysheet.html'),
    styles: [require('./propertysheet.scss')]
})
export default class PropertySheet {
    items = [
        {field: 'Name', derived: false, value: 'Population', hint: 'Name of the element'},
        {field: 'Equation', derived: false, hint: '', value: '1 + alpha * sin(x + y)'},
        {field: 'Units', derived: false, hint: 'Units of measure'},
        {field: 'Type', derived: true, value: 'Number'}
    ];
}
