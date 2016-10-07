import {Injectable} from '@angular/core';

/**
 * Injectable thread pool provider.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class WorkerService {

    private pool: any[];
    
    dispatchJob(job: (any) => any, params: any): Promise<any> {
        return Promise.resolve(job(params));
    }
}