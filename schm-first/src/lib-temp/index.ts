import { Rule, SchematicContext,  Tree, chain, externalSchematic } from '@angular-devkit/schematics';
// import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getWorkspace } from '@schematics/angular/utility/workspace';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function libTemp(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {

    /**
     * The first rule you are trying to achieve is through the library. and ng-add
    */
    // const ruleWork = externalSchematic('@schematics/angular',
    //   "application",
    //   _options
    // );

    return chain([updateConfig(_options),config(_options) ]);
  };
}


export function config(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    if(tree.exists('package.json')){
      updatePackageJson(tree);
    }
    return tree;
  };
}

export function updateConfig(_options: any): Rule {
  return async(_tree: Tree, context: SchematicContext) => {
    context.logger.info('Thanks for using schematics!');
    
    let ngJsonFileName :any = 'angular.json';
    const workspace = await getWorkspace(_tree);
    if(_tree.exists(ngJsonFileName)){
        let workspaceTxt = JSON.parse((_tree.read(ngJsonFileName) as any).toString('utf-8'));
        workspaceTxt.newProjectRoot = './'
        _tree.overwrite(ngJsonFileName,  JSON.stringify(workspaceTxt, null, '\t'));
    }
    _options.projectRoot = `${'./'}`;
    if(_tree.exists('package.json') || _tree.exists('README.md')){
      _tree.delete('package.json');
      _tree.delete('README.md');
    }
    // let project_Name:any;
    if (!_options.project) {
      const keys = workspace.projects.keys();
      const defaultProj = [...keys].filter((elm: string) => { 
        
       if(workspace.projects.get(elm)?.root == ''){
        return elm;
       } else if(workspace.projects.get(elm)?.root !== '' && workspace.projects.get(elm)){
        return elm;
       }
      }); 
       defaultProj.toString();
    }

    // let project = workspace.projects.get(_options.project);

    // if (!project) {
    //   throw new SchematicsException(`Project "${_options.project}" does not exist.`);
    // }

    // const projectName = workspace.projects.get(project_Name);
    
    // const projectType = projectName?.extensions?.projectType === 'application' ? 'app' : 'lib';

    // _options.path = `${project.sourceRoot}`;

    const rule =
      externalSchematic('@schematics/angular',
        "lib",
        _options
      );

    return rule;

  };
}

interface PackageJson {
  scripts?: { [key: string]: string };
}

function updatePackageJson(tree: Tree): void {
  const packageJson: PackageJson = JSON.parse((tree.read('package.json') as any).toString('utf-8')
  );

  if (!packageJson.scripts) {
    packageJson.scripts = {
      "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
    };
  }
  
  if (!packageJson.scripts['run:all']) {
    
    packageJson.scripts['run:all'] =
      'node node_modules/@angular-architects/module-federation/src/server/mf-dev-server.js';
  }

  tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
}
