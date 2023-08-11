import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { StructureSchema } from './strSchema';
import path = require('path');
// import {readFileSync, statSync} from 'fs';
// import {dirname, join, resolve} from 'path';
// import * as ts from 'typescript';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function structuralSchm( options: StructureSchema): Rule {
  return getConfig(options);
}

export function updateMain(main: string, options: StructureSchema): Rule {

  /**
   * The above function is main function for the structural schematic that can be fired when we call schematics.
   * this should be main function which execute all rules for the schematics
   * so consider writing all related rules here
   * */
  console.log("from structural schematics", main);

  return (tree: Tree, _context: SchematicContext) => {
    const mainPath = path.dirname(main);
    const bootstrapName = path.join(mainPath, 'bootstrap.ts');

    if (tree.exists(bootstrapName)) {
      console.info(`${bootstrapName} already exists.`);
      // to delet the bootstrap file as we do not want to read the content earlier
      // tree.delete(bootstrapName);
      return;
    }

    // check the type here for time being used any.
    const mainContent: any = tree.read(main);
    tree.create(bootstrapName, mainContent);

    let newMainContent = '';
    /**
     * this code is used when want to test the deletion of bootstrap.ts file
     */
    // if (options.project) {
    //   newMainContent = `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

    //   import { AppModule } from './app/app.module';
      
    //   platformBrowserDynamic().bootstrapModule(AppModule)
    //     .catch(err => console.error(err));
    //   `;
    // }
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

export default function getConfig(options:StructureSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    
    const workspaceFileName = getWorkspaceFileName(tree);
    // this converions is for resolving the type error
    const parsedData:any = tree?.read(workspaceFileName);
    const workspace = JSON.parse(parsedData?.toString('utf8'));

    // assign the default project
    if (!options.project) {
      options.project = workspace.defaultProject;
    }

    if (!options.project) {
      throw new Error(
        `No default project found. Please specifiy a project name!`
      );
    }

    const projectName = options.project;
    const projectConfig = workspace.projects[projectName];

    if (!projectConfig) {
      throw new Error(`Project ${projectName} not found!`);
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