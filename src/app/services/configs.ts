import {Injectable} from "@angular/core";

/**
 * Configuration of the editor workspace.
 * @author Martin Schade
 * @since 1.0.0
 */
export class WorkspaceConfig {
    slimLayout : boolean = false;
    fullscreen : boolean = false;

    setDefaults() {
        this.slimLayout = false;
        this.fullscreen = false;
    }
    
    showFullscreen() {
        this.fullscreen = true;
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

    private _name = "Metaflow";
    private _workspace : WorkspaceConfig;

    getName() {
        return this._name;
    }
    
    getWorkspaceConfig(): WorkspaceConfig {
        this._workspace = this._workspace || new WorkspaceConfig;
        return this._workspace;
    }
}
