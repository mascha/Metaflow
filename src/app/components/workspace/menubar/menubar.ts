import {Component, Input} from '@angular/core';

/**
 * Menu bar component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'menu-bar',
    template: require('./menubar.html'),
    styles: [require('./menubar.scss')]
})
export default class MenuBar {
    items: Array<any> = [
        {
            name: "Model",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "Edit",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "View",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "Simulation",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "Analysis",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "Settings",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
        {
            name: "Help",
            items: [
                { name: "Import" },
                { name: "Export" },
                { name: "Save" },
                { name: "Save As" }
            ]
        },
    ];
}