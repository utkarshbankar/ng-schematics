import { Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function aamfNgaddSchm(_options: any): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
 
    const rule = externalSchematic(
      "@angular-architects/module-federation",
      "ng-add",
      _options
    );
    
    return rule;
  };
}
