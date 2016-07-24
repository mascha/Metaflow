import {Injectable} from "@angular/core";

/**
 * 
 */
export class DiagramConfig {
    textResolution: number = 1
    labelBackdrop: number = 0xf
}

/**
 * Configuration of the editor workspace.
 * @author Martin Schade
 * @since 1.0.0
 */
export class WorkspaceConfig {
    slimLayout : boolean
    fullscreen : boolean

    setDefaults() {
        this.slimLayout = false;
        this.fullscreen = true;
    }
    
    showFullscreen() {
        this.fullscreen = true;
    }

    constructor() {
        this.setDefaults();
    }
}

/**
 * A service for retrieving the application configuration settings
 * using the currently available user account data.
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()    
export default class ConfigService {

    private name = "Metaflow";
    private workspace : WorkspaceConfig;

    getName() {
        return this.name;
    }
    
    getWorkspaceConfig(): WorkspaceConfig {
        this.workspace = this.workspace || new WorkspaceConfig;
        return this.workspace;
    }
}
