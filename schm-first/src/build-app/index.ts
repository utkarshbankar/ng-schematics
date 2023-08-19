import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
// import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import path = require('path');


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function buildApp(_options: any): Rule {
  return getConfig(_options);
}

export function updateMain(main: string, options: any): Rule {

  console.log("buildApp options", options);
  /**
   * The above function is main function for the structural schematic that can be fired when we call schematics.
   * this should be main function which execute all rules for the schematics
   * so consider writing all related rules here
   * */
  return (tree: Tree, _context: SchematicContext) => {
    const mainPath = path.dirname(main);
    const bootstrapName = path.join(mainPath, 'bootstrap.ts');
    let newBootstrapContent: string = '';
    const optName = options.name.charAt(0).toUpperCase() + options.name.toLowerCase().slice(1);

    if (tree.exists(bootstrapName)) {
      console.info(`${bootstrapName} already exists.`);

      tree.delete(bootstrapName);

      newBootstrapContent = `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

       import { ${optName}Module } from './app/${options.name}.module';
      
       platformBrowserDynamic().bootstrapModule(${optName}Module).catch(err => console.error(err));
      `;

      tree.create(bootstrapName, newBootstrapContent);

      //tree.overwrite(bootstrapContent, newBootstrapContent);

      // to delet the bootstrap file as we do not want to read the content earlier
      // tree.delete(bootstrapName);
      // return;

    } else {
      // check the type here for time being used any.
      // const mainContent: any = tree.read(main);
      newBootstrapContent = `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

       import { ${optName}Module } from './app/${options.name}.module';
      
       platformBrowserDynamic().bootstrapModule(${optName}Module).catch(err => console.error(err));
      `;
      tree.create(bootstrapName, newBootstrapContent);

      let newMainContent = '';
      /**
       * this code is used when want to test the deletion of bootstrap.ts file
       */

      if (options?.type === 'dynamic-host') {
        newMainContent = `import { initFederation } from '@angular-architects/module-federation';

  initFederation('/assets/mf.manifest.json')
    .catch(err => console.error(err))
    .then(_ => import('./bootstrap'))
    .catch(err => console.error(err));
  `;
      } else {
        newMainContent =
          "import('./bootstrap')\n\t.catch(err => console.error(err));\n";
      }
      tree.overwrite(main, newMainContent);
    }

    return tree;
  };
}

// keep every finctions refrence to check later 
//function makeMainAsync(main: string, options: StructureSchema): Rule {
//   return async function (tree, context) {

//   };
// }

/**
 * @method getWorkspaceFileName
 * to get the current workspace file
*/
export function getWorkspaceFileName(tree: Tree): string {
  if (tree.exists('angular.json')) {
    return 'angular.json';
  }
  if (tree.exists('workspace.json')) {
    return 'workspace.json';
  }
  throw new Error(
    "angular.json or workspace.json expected! Did you call this in your project's root?"
  );
}

/**
 * @method getConfig()
 * This is a function to get the root project configs and operate on them as per our need
*/

export default function getConfig(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    let projectConfig: any;
    const workspaceConfig = tree.read('/angular.json');

    console.log("!options.path!options.path!options.path", options.path);

    // from now following along with angular docs with slight modifications. 
    // if (workspaceConfig && !options.path) { 
    // on this line we remove !options.path --> remember this is due to we are calling this schematic from our mf-app schematci if we call this from build-app then our commented code will work
    if (workspaceConfig && options.path) {
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

      console.log("projectNameprojectName", projectName);

      projectConfig = workspace.projects[projectName];
      const projectType = projectConfig.projectType === 'application' ? 'app' : 'lib';

      options.path = `${projectConfig.sourceRoot}/${projectType}`;
    }

    console.log("first path comp is there", options.path);

    if (!projectConfig) {
      throw new Error(`Project not found!`);
    }

    // const projectRoot: string = projectConfig.root?.replace(/\\/g, '/');
    // const projectSourceRoot: string = projectConfig.sourceRoot?.replace(
    //   /\\/g,
    //   '/'
    // );

    // const configPath = path
    //   .join(projectRoot, 'webpack.config.js')
    //   .replace(/\\/g, '/');
    // const configProdPath = path
    //   .join(projectRoot, 'webpack.prod.config.js')
    //   .replace(/\\/g, '/');
    // const manifestPath = path
    //   .join(projectRoot, 'src/assets/mf.manifest.json')
    //   .replace(/\\/g, '/');

    // const port = parseInt(options.port);
    const main = projectConfig.architect.build.options.main;
    const updatedTree = updateMain(main, options);
    // check here, is there any need to return the updated tree ? 
    return updatedTree;
  };
}