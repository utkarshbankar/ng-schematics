import { TestBed } from '@angular/core/testing';

import { SchematicTestService } from './schematic-test.service';

describe('SchematicTestService', () => {
  let service: SchematicTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchematicTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
