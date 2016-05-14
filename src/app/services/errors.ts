import {Injectable} from '@angular/core'

/**
 * Represents the current validation state of the model,
 * including errors, warnings and suboptimal model patterns.
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class ValidationService {
    private errors = [
        'A', 'B', 'C', 'D', 'E'
    ];
    
    getErrors(): string[] {
        return this.errors;
    }
}
