import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable} from 'rxjs/Observable';

const SERVER = "server/instances";

export interface Instance {
    name: string;
    id: string;
}

/**
 * A service bound to a specific instance.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export class InstanceService {

    /**
     * Watches all issues present in the currently running instance.
     * 
     * @endpoint server/instances/$id/issues
     */
    watchIssues(instance: string): Observable<Array<String>> {
        return Observable.of(['']);
    }

    /**
     * Watch a specific level of the viemodel hierarchy
     * 
     * @endpoint server/instances/id?path=PATH
     */
    watchLevel(path: string): Observable<any> {
        return null;
    }

    /**
     * 
     */
    openInstance(): Observable<Instance> {
        return null;
    }

    /**
     * @endpoint server/instances
     */
    initializeInstance() {

    }

    /**
     * 
     */
    closeInstance() {
        return this.http.delete(`${SERVER}/${this.id}`).map(res => {
            res.json()
        })
    }

    constructor(private id: string, private http: Http) { 

    }
}