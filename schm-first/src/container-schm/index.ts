import { normalize,strings } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree,  apply,  applyTemplates,  chain, mergeWith, move, url } from '@angular-devkit/schematics';
import { buildRelativePath, findModuleFromOptions} from '@schematics/angular/utility/find-module';
// import { addDeclarationToNgModule} from '@schematics/angular/utility/add-declaration-to-ng-module';
import * as ts from 'typescript';
import { addDeclarationToModule, addSymbolToNgModuleMetadata} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export function containerSchm(options: any): Rule {

  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json'); 

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
       
        const project = workspace.projects[projectName];
        const projectType = project.projectType === 'application' ? 'app' : 'lib';
        
        options.path = `${project.sourceRoot}/${projectType}`;
    }

    console.log("first path comp is there", options.path);
      
    if (options.path) { 
      console.log("when path id available import have error", options.path);
        
      // this will be used by the ng g command
       options.module  = findModuleFromOptions(tree, options);
      
        const templateSource = apply(url('./files'), [
            applyTemplates({
               ...options,
                classify: strings.classify, 
                dasherize: strings.dasherize,
               
            }),
            move(normalize(options.path as string))
        ]);
        
        return chain([

          addDeclarationToNgModule({
            type: 'component',
            ...options,
          }),
            mergeWith(templateSource)
        ]);
    } else {
        // this will be used by the schematics command
        const templateSource = apply(url('./files'), [
            applyTemplates({
              ...options,
                classify: strings.classify,
                dasherize: strings.dasherize,
                
            })
        ]);

        // here the import is not working properly we need to customize the same functoin 
        return chain([
          addDeclarationToNgModule({
            type: 'component',
            ...options,
          }),
          mergeWith(templateSource)
        ]);
    }
};
  
}

export interface DeclarationToNgModuleOptions {
  module?: string;
  path?: string;
  name: string;
  flat?: boolean;
  export?: boolean;
  type: string;
  skipImport?: boolean;
  standalone?: boolean;
}

export function addDeclarationToNgModule(options: DeclarationToNgModuleOptions): Rule {
  return (host: Tree) => {
    const modulePath = options.module;
    if (options.skipImport || options.standalone || !modulePath) {
      return host;
    }
    
    const sourceText = host.readText(modulePath);
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

      const filePath =
      `/${options.path}/` + strings.dasherize(options.name) +
        (options.type ? '.' : '') +
        strings.dasherize(options.type);
 
    const importPath = buildRelativePath(modulePath, filePath);
    const classifiedName = strings.classify(options.name) + strings.classify(options.type);
    const changes = addDeclarationToModule(source, modulePath, classifiedName, importPath);

    if (options.export) {
      changes.push(...addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName));
    }

    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);

    return host;
  };
}