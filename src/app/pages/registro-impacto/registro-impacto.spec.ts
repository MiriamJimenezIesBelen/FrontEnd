import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroImpacto } from './registro-impacto';

describe('RegistroImpacto', () => {
  let component: RegistroImpacto;
  let fixture: ComponentFixture<RegistroImpacto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroImpacto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroImpacto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
