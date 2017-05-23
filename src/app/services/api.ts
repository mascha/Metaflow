import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";


/**
 * REST-api interface
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export class API {

    /**
     * 
     */
    fetchUsers(): Observable<Array<any>> {
        return Observable.of([]);
    }

    /**
     * 
     */
    fetchProjects(): Observable<Array<any>> {
        return Observable.of([]);
    }

    /**
     * 
     */
    fetchProjectsFor(user: any):  Observable<Array<any>> {
         return Observable.of([]);
    }

}

/**
 * Encapsulates all session statuses.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const SessionStatus = {

    /**
     * Indicated that this session is already closed 
     * and cannot be joined.
     */
    CLOSED : "closed",

    /**
     * The session is open but no users have joined.
     * Only availiable for cached sessions.
     */
    IDLE: "idle",

    /**
     * The session is open and at least one user has joined.
     */
    ACTIVE: "active",
}

export const enum ChangeType {
    ADD,
    UPDATE,
    REMOVE,
}

export interface CRUDChange<T> {

}

/**
 * The session api.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Session {

    private : boolean;
    
    /**
     * The socket connected 
     */
    socket: string;

    /**
     * Watch for session status updates.
     */
    watchStatus(): Observable<string> {
        return Observable.of(SessionStatus.ACTIVE);
    }

    watchView(path: string): Observable<any> {
        return Observable.of("");
    }

    watchConstraint(constraint: string): Observable<CRUDChange<any>> {
        return null;
    }

    watchViewers(): Observable<any> {
        return null;
    }

    constructor(private apiRoot: string) {

    }
}