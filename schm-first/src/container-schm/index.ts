import { normalize,strings } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree,  apply,  applyTemplates,  chain, mergeWith, move, url } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function containerSchm(options: any): Rule {

  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json'); 
    // will return null when using schematics command but will work when using ng g
    console.log('workspaceConfig::', workspaceConfig);
    console.log('path:', options.path); 
    // will be undefined when using schematics command but will work when using ng g
    

    // from now following along with angular docs with slight modifications. 
    if (workspaceConfig && !options.path) {
        const workspaceContent = workspaceConfig.toString('utf-8');
        const workspace: any = JSON.parse(workspaceContent); 
        /**
         * Here we do not have any key as default project so this value is undefined
         * we added code to find the default project using root prop
        */
        // options.project = workspace.defaultProject;
        
        if (!options.project) {
          const keys = Object.keys(workspace.projects);
          const defaultProj = keys.filter((elm: string) => { return workspace.projects[elm].root === '' });
           options.project = defaultProj.toString();
        }
  
        const projectName = options.project as string;
        // console.log("project name", projectName);
        
        const project = workspace.projects[projectName];
        const projectType = project.projectType === 'application' ? 'app' : 'lib';
        console.log('projectType::', projectType);
        
        options.path = `${project.sourceRoot}/${projectType}`;
    }

    
    if (options.path) { 
       // this will be used by the ng g command
       console.log('if path availbale we will print this template', options.name, options.path);
       console.log("url files", url('./files'));
       
        const templateSource = apply(url('./files'), [
            applyTemplates({
               ...options,
                classify: strings.classify,
                dasherize: strings.dasherize,
               
            }),
            move(normalize(options.path as string))
        ]);
        console.log("template soure is", templateSource);
        
        return chain([
            mergeWith(templateSource)
        ]);
    } else {
      console.log('if path availbale we will print this template', options.name, options.path);
        // this will be used by the schematics command
        const templateSource = apply(url('./files'), [
            applyTemplates({
              ...options,
                classify: strings.classify,
                dasherize: strings.dasherize,
                
            })
        ]);
        return chain([
          mergeWith(templateSource)
        ]);
    }
};
  
}

