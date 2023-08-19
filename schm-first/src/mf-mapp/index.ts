import { Rule, SchematicContext, SchematicsException, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { existsSync, readdirSync, unlinkSync } from 'fs';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mfMapp(_options: any): Rule {
  return async(tree: Tree, _context: SchematicContext) => {
    //return tree;
    const workspace = await getWorkspace(tree);

    if (!_options.project) {
      const keys = workspace.projects.keys();
      const defaultProj = [...keys].filter((elm: string) => { return workspace.projects.get(elm)?.root == '' });
      _options.project = defaultProj.toString();
    }

    let project = workspace.projects.get(_options.project);

    if (!project) {
      throw new SchematicsException(`Project "${_options.project}" does not exist.`);
    }

    const projectName = workspace.projects.get(_options.project);
    console.log("projectName", projectName?.extensions?.projectType);

    const projectType = projectName?.extensions?.projectType === 'application' ? 'app' : 'lib';

    _options.path = `${project.sourceRoot}/${projectType}`;

    project = _options.project;

    if (_options.path && existsSync(_options.path)) {

      console.log("main path of app", _options.path);

      readdirSync(_options.path).forEach(file => {
        if(file.includes('app')){
           unlinkSync(_options.path);
        } else{
          console.log("no file with app ");
          
        }
      });
    } else {
      console.log("else log stmt");
      
      //  _options.path = `${_options.path}/container`;
    }

    let moduelOpt = {
      name: _options.name,
      flat: true,
      routing: _options.routing,
      routingScope: 'Root',
      path: _options.path,
      project: _options.name,
      commonModule: false
    }
    let compOpt = {
      style: "scss",
      module: _options.module,
      path: 'src/app',
      flat:true
    };
    let exportModOpt ={
      name:'expose',
      commonModule: true,
      path:'src/app/expose',
      flat:true,
      route:'expose',
      module:'src/app/container.module',
      routing:true,
      routingScope:'Child'
    }
    let exposeCompOpt ={
      path: 'src/app/expose',
      flat:true
    }
    return chain([externalSchematic('@schematics/angular', 'module', moduelOpt),
    externalSchematic('@schematics/angular', 'component', compOpt),
    externalSchematic('@schematics/angular', 'module', exportModOpt),
    externalSchematic('@schematics/angular', 'component', exposeCompOpt)
  ]);
  };
}
