import {Injectable} from "@angular/core";

/**
 * Configuration of the editor workspace.
 * @author Martin Schade
 * @since 1.0.0
 */
export class WorkspaceConfig {
    slimLayout : boolean = false;
    fullscreen : boolean = true;
}

/**
 * A service for retrieving the application configuration settings
 * using the currently availiable user account data.
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()    
export default class ConfigService {

    private _workspace : WorkspaceConfig;

    public getWorkspaceConfig(): WorkspaceConfig {
        this._workspace = this._workspace || new WorkspaceConfig;
        return this._workspace;
    }
}
