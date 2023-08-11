import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { execSync } from "child_process";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function lintSchm(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    _context.logger.info(`Executing: npm run lint -- --fix ${_options.name}`);
    execSync("npm run lint -- --fix " + _options.name);
  };
}
