import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function libUpdate(_options: any): Rule {
  return async (tree: Tree, _context: SchematicContext) => {

    const workspace: any = await getWorkspace(tree);
    let project_Name: any;
    if (!project_Name) {
      const keys = workspace.projects.keys();

      project_Name = [...keys].filter(elm => {
        if (elm.root === '') {
          return elm;
        } else {
          // console.log(elm);
          return elm.toString();
        }
      });
    }
    let projName = project_Name.toString();
    const angularJson = JSON.parse((tree.read('angular.json') as any).toString('utf-8'));
    const dataArch = angularJson.projects[`${projName}`]
    dataArch.architect.test = {};
    dataArch.architect.lint = {};

    tree.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  };
}
