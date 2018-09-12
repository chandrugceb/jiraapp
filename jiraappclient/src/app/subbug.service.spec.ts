import { TestBed, inject } from '@angular/core/testing';

import { SubbugService } from './subbug.service';

describe('SubbugService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubbugService]
    });
  });

  it('should be created', inject([SubbugService], (service: SubbugService) => {
    expect(service).toBeTruthy();
  }));
});
