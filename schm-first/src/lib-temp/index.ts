import { Rule, SchematicContext, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';



// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function libTemp(_options: any): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {

    /**
     * The first rule you are trying to achieve is through the library. and ng-add
    */
    // const ruleWork = externalSchematic('@schematics/angular',
    //   "application",
    //   _options
    // );

    return chain([updateConfig(_options), config(_options)]);
  };
}


export function config(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (tree.exists('package.json')) {
      updatePackageJson(tree);
    }
    
    _context.addTask(new RunSchematicTask('lib-update', _options));
    return tree;
  };
}

export function updateConfig(_options: any): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    context.logger.info('Thanks for using schematics!');

    let ngJsonFileName: any = 'angular.json';
    if (_tree.exists(ngJsonFileName)) {
      let workspaceTxt = JSON.parse((_tree.read(ngJsonFileName) as any).toString('utf-8'));
      workspaceTxt.newProjectRoot = './'
      _tree.overwrite(ngJsonFileName, JSON.stringify(workspaceTxt, null, '\t'));
    }
    _options.projectRoot = './';
    if (_tree.exists('package.json') || _tree.exists('README.md')) {
      _tree.delete('package.json');
      _tree.delete('README.md');
    }

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
