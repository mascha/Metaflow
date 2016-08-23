/**
 * Helper class for handling html elements.
 * @author Martin Schade.
 * @since 1.0.0
 */
export default class HTMLUtil {

    static PIXEL_STEP = 10;
    static LINE_HEIGHT = 40;
    static PAGE_HEIGHT = 800;

    /**
     * Normalize wheel values across browsers.
     */
    static normalizeWheel(event: any): number {

        let sX = 0, sY = 0;

        if ('detail' in event) {
            sY = event.detail;
        }
        if ('wheelDelta' in event) {
            sY = -event.wheelDelta / 120;
        }
        if ('wheelDeltaY' in event) {
            sY = -event.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in event) {
            sX = -event.wheelDeltaX / 120;
        }

        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
            sX = sY;
            sY = 0;
        }

        let pX = sX * this.PIXEL_STEP;
        let pY = sY * this.PIXEL_STEP;

        if ('deltaY' in event) {
            pY = event.deltaY;
        }
        if ('deltaX' in event) {
            pX = event.deltaX;
        }

        if ((pX || pY) && event.deltaMode) {
            if (event.deltaMode === 1.0) {
                pX *= this.LINE_HEIGHT;
                pY *= this.LINE_HEIGHT;
            } else {
                pX *= this.PAGE_HEIGHT;
                pY *= this.PAGE_HEIGHT;
            }
        }

        if (pY && !sY) {
            sY = (pY < 1) ? -1 : 1;
        }

        return sY;
    }

    /**
     * Determines the relative position of the element.
     */
    static elementPosition(element: HTMLElement) {
        let x = 0, y = 0;
        let inner = true;
        let e = element;
        do {
            x += e.offsetLeft;
            y += e.offsetTop;
            let style = getComputedStyle(e, null);
            let borderTop = HTMLUtil.parseStyle(style, 'border-top-width');
            let borderLeft = HTMLUtil.parseStyle(style, 'border-left-width');
            y += borderTop;
            x += borderLeft;
            if (inner) {
                let paddingTop = HTMLUtil.parseStyle(style, 'padding-top');
                let paddingLeft = HTMLUtil.parseStyle(style, 'padding-left');
                y += paddingTop;
                x += paddingLeft;
            }
            inner = false;
            e = e.offsetParent as HTMLElement;
        } while (e);
        return {
            x: x,
            y: y
        };
    }

    /**
     * Adds an expanding dot to the given position.
     * 
     * @param element {HTMLElement}
     * @param off {{x: number, y: number}}
     */
    static playClickEffect(element: HTMLElement, off: any, color?: string) {
        let container = document.createElement('div');
        container.style.top = off.y + "px";
        container.style.left = off.x + "px";
        container.style.position = "absolute";
        let object = document.createElement('div');
        object.style.width = "5px";
        object.style.height = "5px";
        object.style.backgroundColor = color || 'rgba(0,0,0, 0.2)';
        object.style.animation = "grow .3s linear forwards";
        object.style.borderRadius = "50%";
        object.style.transform = "translate(-50%, -50%)";
        container.appendChild(object);
        element.appendChild(container);
        setTimeout(() => container.remove(), 1000);
    }

    /**
     * Retrieves the relative offset for the given html element.
     * @param element
     * @param event
     * @returns {{x: number, y: number}}
     */
    static getOffset(element: HTMLElement, event: MouseEvent): any {
        let offset = HTMLUtil.elementPosition(element);
        return {
            x: event.pageX - offset.x,
            y: event.pageY - offset.y
        };
    }

    /**
     * Parses a numeric style property.
     */
    static parseStyle(style: any, prop: string): number {
        return parseInt(style.getPropertyValue(prop), 10);
    }

    /**
     * Stop propagation and prevent default action.
     * @param event
     */
    static block(event: any) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Force the document window to dispatch a resize event.
     */
    static dispatchResizeEvent() {
        let evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt);
    }
}

export class Text {
    static approximateWidth(text: string): number {
        let len = text.length;
        let res = 0;
        for (let i = 0; i < len; i++) {
            switch (text[i]) {
                case 'M', 'W': res += 12; break;
                case 't', 'l', 'i': res += 8;
                default: res += 10; break;
            }
        }
        return res;
    }
}