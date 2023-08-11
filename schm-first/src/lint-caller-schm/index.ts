import { Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';
// import { RunSchematicTask } from "@angular-devkit/schematics/tasks";


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function lintCallerSchm(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const rule = externalSchematic(
      "@schematics/angular",
      "application",
      _options
    );
    // removing this code as it is showing the error that is we are not able to apply this command to the sub-app - o.w everything works fine
    // _context.addTask(new RunSchematicTask("lint-schm", _options));
    return rule;
  };
}
