import { Rule, SchematicContext, Tree, schematic } from '@angular-devkit/schematics';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function schmFirst(_options: any): Rule {
  
  console.log('Hello from your new first schematic!');
  
  return (_tree: Tree, _context: SchematicContext) => {
    const rule = schematic("child-schem", _options);
    return rule;
  };
}
