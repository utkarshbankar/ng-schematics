import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function mfFrame(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const installTaskId = _context.addTask(new NodePackageInstallTask({
      packageName: '@angular-architects/module-federation'
    }));

    const installTaskId1 = _context.addTask(new RunSchematicTask('aamf-ngadd-schm', _options), [installTaskId])
    
    const installTaskId2 = _context.addTask(new RunSchematicTask('lazy-module', _options), [installTaskId1]);

    _context.addTask(new RunSchematicTask('build-app', _options), [installTaskId2]);
   
    return _tree;
  };
}
