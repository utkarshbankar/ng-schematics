import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addLib(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    
    const taskId = _context.addTask(new RunSchematicTask('lib-temp', _options));

    _context.addTask(new RunSchematicTask('lib-update', _options), [taskId]);
  
    return _tree;
  };
}

// interface PackageJson {
//   scripts?: { [key: string]: string };
// }

// function updatePackageJson(tree: Tree): void {
//   const packageJson: PackageJson = JSON.parse((tree.read('package.json') as any).toString('utf-8')
//   );

//   if (!packageJson.scripts) {
//     packageJson.scripts = {
//       "ng": "ng",
//       "start": "ng serve",
//       "build": "ng build",
//       "watch": "ng build --watch --configuration development",
//       "test": "ng test"
//     };
//   }

//   if (!packageJson.scripts['run:all']) {

//     packageJson.scripts['run:all'] =
//       'node node_modules/@angular-architects/module-federation/src/server/mf-dev-server.js';
//   }

//   tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
//}
