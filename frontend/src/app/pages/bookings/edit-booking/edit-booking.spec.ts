import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBooking } from './edit-booking';

describe('EditBooking', () => {
  let component: EditBooking;
  let fixture: ComponentFixture<EditBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
