import {ViewGroup} from "../common/viewmodel";

/**
 * A asynchronous viewmodel provider service.
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


class DebugModelServive {
    getDebugModel(): ViewGroup {
        
    }
}
