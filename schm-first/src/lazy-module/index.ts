import { normalize, strings, } from '@angular-devkit/core';
import { MergeStrategy, Rule, SchematicContext, SchematicsException, Tree, apply, applyTemplates, chain, externalSchematic, mergeWith, move, url } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { existsSync, readdirSync, unlinkSync } from 'fs';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function lazyModule(_options: any): Rule {
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
    const projectType = projectName?.extensions?.projectType === 'application' ? 'app' : 'lib';

    _options.path = `${project.sourceRoot}/${projectType}`;

    project = _options.project;

    /**
     * The code that I am writing here will delete existing files from app folder and add the new module and lazy module in the app folder
    */

    if (_options.path && existsSync(_options.path.toString())) {
      readdirSync(_options.path.toString()).forEach(file => {
        if (file.includes('app')) {
          //  console.log(`./${_options.path}/${file}`);
          //  rmSync(file);
          unlinkSync(`${_options.path}/${file}`);
        } else {
          console.error("no file with app substring");
        }
      });

    }
    /**
     * above code is common in every schematic file this is just to find the type of app and
     * path  from here onwards we have basic checks
    */

    if (_options.path) {
      // const templateSourceModule = apply(url('./files'), [
      //   applyTemplates({
      //     ..._options,
      //     classify: strings.classify,
      //     dasherize: strings.dasherize,
      //   }),
      //   move(normalize(_options.path as string))
      // ]);

      return chain([
        rootModuleRule(_options),
        lazyModuleRule(_options)
        // externalSchematic('@schematics/angular', 'module', {
        //   name: _options.name,
        //   flat: true,
        //   path: _options.path,
        //   project: _options.name,
        // }),
        // externalSchematic('@schematics/angular', 'component', {
        //   name: _options.name,
        //   path: _options.path,
        //   flat: true
        // }),
        // externalSchematic('@schematics/angular', 'module', {
        //   name: _options.lazyModuleName,
        //   flat: true,
        //   commonModule: true,
        //   path: `${_options.path}/${_options.lazyModuleName}`,
        //   module: `${_options.path}/${_options.name}.module`
        // }),
        // externalSchematic('@schematics/angular', 'component', {
        //   name: _options.lazyModuleName,
        //   path: `${_options.path}/${_options.lazyModuleName}`,
        //   flat: true
        // }),
        // mergeWith(templateSourceModule, MergeStrategy.Overwrite),
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

      // here the import is not working properly we need to customize the same function 
      return chain([
        mergeWith(templateSource)
      ]);
    }
  };
}

export function rootModuleRule(_options: any): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {

    if (_options.path) {
      const templateSourceRootModule = apply(url('./files/root'), [
        applyTemplates({
          ..._options,
          classify: strings.classify,
          dasherize: strings.dasherize,
        }),
        move(normalize(_options.path as string))
      ]);

      return chain([
        externalSchematic('@schematics/angular', 'module', {
          name: _options.name,
          flat: true,
          path: _options.path
        }),
        externalSchematic('@schematics/angular', 'component', {
          name: _options.name,
          path: _options.path,
          flat: true
        }),
        mergeWith(templateSourceRootModule, MergeStrategy.Overwrite)
      ])
    }
  }
}

export function lazyModuleRule(_options: any): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
      
    if (_options.path) {
      console.log("..._options", _options);
      
      const templateSourceLazyModule = apply(url('./files/lazy'), [
        applyTemplates({
          ..._options,
          classify: strings.classify,
          dasherize: strings.dasherize,
        }),
        move(`${_options.path}/${_options.lazyModuleName}` as string)
      ]);

      return chain([
        externalSchematic('@schematics/angular', 'module', {
          name: _options.lazyModuleName,
          flat: true,
          commonModule: true,
          path: `${_options.path}/${_options.lazyModuleName}`
        }),
        externalSchematic('@schematics/angular', 'component', {
          name: _options.lazyModuleName,
          path: `${_options.path}/${_options.lazyModuleName}`,
          flat: true
        }),
        mergeWith(templateSourceLazyModule, MergeStrategy.Overwrite)
      ])
    }
  }
}