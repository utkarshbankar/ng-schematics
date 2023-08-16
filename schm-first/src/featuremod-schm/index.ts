import { Rule, SchematicContext, SchematicsException, Tree, chain, externalSchematic, strings } from '@angular-devkit/schematics';
import { ModuleOptions, buildRelativePath } from '@schematics/angular/utility/find-module';
import * as ts from 'typescript';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { normalize, } from '@angular-devkit/core';
// var fs = require('fs')Path, dirname, NormalizedRoot, join ;
import { existsSync, readdirSync,unlinkSync } from 'fs';
// import {dirname, join, resolve} from 'path';rmdir 
// import path = require('path');
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function featuremodSchm(_options: any): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
    // const moduleExt = '.module.ts';
    // const routingModuleExt = '-routing.module.ts';
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


    // readdirSync(_options.path).forEach(file => {
    //   console.log(file);
    // });
    // console.log("read dir",existsSync(_options.path));

    if (_options.path && existsSync(_options.path)) {

      console.log("main path of app", _options.path);

      readdirSync(_options.path).forEach(file => {
        if(file.includes('app')){
           unlinkSync(_options.path);
        } else{
          console.log("no file with app ");
          
        }
      });
      // console.log("read dir",existsSync(_options.path));
      // rm(_options.path, { recursive: true, force: true }, err => {
      //   if (err) {
      //     throw err
      //   }

      //   console.log(`${_options.path} is deleted!`)
      // })
      // rmdir(_options.path, (err) => {
      //     if (err) throw err //handle your error the way you want to;
      //     console.log(`${_options.path} was deleted`);//or else the file will be deleted
      //   });
      // rmSync(_options.path);
      // console.log("read dir",readdirSync(_options.path));
      // _options.path = `${_options.path}/container`;
    } else {
      true ?? addImportToNgModule(_options);
      //  _options.path = `${_options.path}/container`;
    }
    //  console.log("path to ceck outside existSync", _options.path);

    // if (_options.path) {
    //   let pathToCheck = _options.path;
    //   console.log("pathExsist", pathToCheck);

    //   const modulePath = normalize(`/${_options.path}/${_options.module}`);
    //   const moduleBaseName = normalize(modulePath).split('/').pop();
    //   let candidateSet = new Set<Path>([normalize(_options.path || '/')]);

    //   for (let dir = modulePath; dir != NormalizedRoot; dir = dirname(dir)) {
    //     candidateSet.add(dir);
    //   }

    //   console.log("pathExsist", [...candidateSet].filter(elm => !elm.includes('undefined')));

    //   candidateSet = [...candidateSet].filter(elm => !elm.includes('undefined')) as any;

    //   const candidatesDirs = [...candidateSet].sort((a, b) => b.length - a.length);
    //   for (const c of candidatesDirs) {
    //     const candidateFiles = ['', `${moduleBaseName}.ts`, `${moduleBaseName}${moduleExt}`].map(
    //       (x) => join(c, x),
    //     );
    //     for (const sc of candidateFiles) {

    //       if (_tree.exists(sc)) {
    //         console.log("sc", normalize(sc));

    //         if (existsSync(_options.module)) {
    //           console.log("source::source::source", _options.module + "" + _options.Path);
    //         }
    //         const modulePath1 = _options.module;

    //         const sourceText = _tree.readText(modulePath1);
    //         const source = ts.createSourceFile(modulePath1, sourceText, ts.ScriptTarget.Latest, true);
    //         console.log("source::source::source", source);

    //       }
    //     }
    //   }

    //   // const modulePath1 = _options.module;

    //   // const sourceText = _tree.readText(modulePath1);
    //   // const source = ts.createSourceFile(modulePath1, sourceText, ts.ScriptTarget.Latest, true);
    //   // console.log("source::source::source", source);

    //   //  const mainPath = path.dirname(_options.path);
    //   // console.log("mainPath::::::exsist", _tree.exists(projectName?.targets.get('build')?.options?.src as any));
    //   // const pathExsist =normalize(findModule(_tree, pathToCheck, moduleExt, routingModuleExt));

    //   // this will be used by the ng g command
    //   // _options.module = findModuleFromOptions(_tree, _options); 
    //   // console.log("when path is available findModuleFromOptions name is", _options.module);
    //   // let main: any = projectName?.targets.get('build')?.options?.main;

    //   // console.log("bootstrapName  proj name ",projectName?.targets.get('build'));


    //   // const bootstrapName = path.join(mainPath, 'app.module.ts');

    //   // if (_tree.exists(bootstrapName)) {
    //   //   console.info(`${bootstrapName} already exists.`);
    //   //   // to delet the bootstrap file as we do not want to read the content earlier
    //   // _tree.delete(bootstrapName);
    //   //   return;
    //   // }
    // } else {
    //   true ?? addImportToNgModule(_options);
    // }


    // write here for the default project selection if input is not provided 
    let moduelOpt = {
      name: _options.name,
      flat: true,
      routing: _options.routing,
      routingScope: 'Root',
      path: _options.path,
      project: _options.name,
      commonModule: false,
    }
    let compOpt = {
      style: "scss",
      module: _options.module,
      path: _options.path,
    };
    return chain([externalSchematic('@schematics/angular', 'module', moduelOpt),
    externalSchematic('@schematics/angular', 'component', compOpt)]);
  };
}

function addImportToNgModule(options: ModuleOptions): Rule {
  return (host: Tree) => {
    if (!options.module) {
      return host;
    }
    console.log("inside the add import to the module", options);
    const modulePath = options.module;

    const sourceText = host.readText(modulePath);
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const relativePath = buildRelativeModulePath(options, modulePath);
    const changes = addImportToModule(
      source,
      modulePath,
      strings.classify(`${options.name}Module`),
      relativePath,
    );

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

// function createDirectories(pathname) {
//   const __dirname = path.resolve();
//   pathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, ''); // Remove leading directory markers, and remove ending /file-name.extension
//   fs.mkdirSync(path.resolve(__dirname, pathname), { recursive: true }, e => {
//       if (e) {
//           console.error(e);
//       } else {
//           console.log('Success');
//       }
//    });
// }
function buildRelativeModulePath(options: ModuleOptions, modulePath: string): string {
  const importModulePath = normalize(
    `/${options.path}/` +
    (options.flat ? '' : strings.dasherize(options.name) + '/') +
    strings.dasherize(options.name) +
    '.module',
  );

  console.log("build Relative module path", importModulePath);

  const importModulePath1 = normalize(
    (options.flat ? '' : strings.dasherize(options.name) + '/') +
    strings.dasherize(options.name) +
    '.module',
  );

  console.log("build Relative module path", importModulePath1);

  return buildRelativePath(modulePath, importModulePath);
}
