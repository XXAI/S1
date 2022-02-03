import { TestBed } from '@angular/core/testing';

import { ConcentradosService } from './concentrados.service';

describe('ConcentradosService', () => {
  let service: ConcentradosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcentradosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
