/**
 * Project enumeration service.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ProjectService {
    
    private projects = [
        'Market Adoption',
        'Changeovers',
        'Stock Management',
        'Project Management',
        'Cost of Delay'
    ];
    
    public getProjects(): Promise<Array<string>> {
        return Promise.resolve(this.projects);
    }
}
