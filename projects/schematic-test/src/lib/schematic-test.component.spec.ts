import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchematicTestComponent } from './schematic-test.component';

describe('SchematicTestComponent', () => {
  let component: SchematicTestComponent;
  let fixture: ComponentFixture<SchematicTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchematicTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchematicTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
