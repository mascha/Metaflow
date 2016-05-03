import {ViewGroup} from "../components/canvas/viewmodel";

/**
 * 
 */
export default class ModelService {
    
    requestFragment(path: string): Promise<ViewGroup> {
        return null;
    }
}

class Request {
    
    private status: boolean;
    
    run() {
        this.callback();
    }
    
    constructor(public id: string, public callback: () => void) {
        
    }
}
