import { normalize, strings, } from '@angular-devkit/core';
import { MergeStrategy, Rule, SchematicContext, SchematicsException, Tree, apply, applyTemplates, chain, externalSchematic, mergeWith, move, url } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
// import { existsSync } from 'fs';
// import ts = require('typescript');
// import path = require('path');

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
/***
 * problem stmt: that we are creating our own module from template due to we do not have the proper template
 * for module that is there is not decelerations and no bootstraping component, we may add new child module
 * and it import in the root module but some missing imports are there so we are creating owr own template 
 *  
*/

export function mfApp(_options: any): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {

    const workspace = await getWorkspace(_tree);

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

    /**
     * above code is common in evey schematic file this is just to find the type of app and path
     * from here onwords we have basic checks
    */

    if (_options.path) {
      console.log("when path is not available import have error", _options.path);
      const templateSource = apply(url('./files'), [
        applyTemplates({
          ..._options,
          classify: strings.classify,
          dasherize: strings.dasherize,
        }),
        move(normalize(_options.path as string))
      ]);
      console.log("when path- before chain");
      return chain([
        externalSchematic('@schematics/angular', 'module', {
          name: _options.name,
          flat: true,
          routing: _options.routing,
          routingScope: 'Root',
          path: _options.path,
          project: _options.name,
        }),
        externalSchematic('@schematics/angular', 'component', {
          name: _options.name,
          path: _options.path,
          flat: true
        }),
        externalSchematic('@schematics/angular', 'module', {
          name: _options.lazyModuleName,
          flat: true,
          commonModule: true,
          path: `${_options.path}/${_options.lazyModuleName}`,
          route:'make_this_string_empty',
          module: `${_options.path}/${_options.name}.module`,
          routing: _options.routing,
          routingScope: 'Child',
        }),
        externalSchematic('@schematics/angular', 'component', {
          name: _options.lazyModuleName,
          path: `${_options.path}/${_options.lazyModuleName}`,
          flat: true
        }),

        mergeWith(templateSource, MergeStrategy.Overwrite)
      ]);
    } else {
      // this will be used by the schematics command
      const templateSource = apply(url('./files'), [
        applyTemplates({
          ..._options,
          classify: strings.classify,
          dasherize: strings.dasherize,
        })
      ]);
      // here the import is not working properly we need to customize the same functoin 
      return chain([
        mergeWith(templateSource)
      ]);
    }
  };
}
