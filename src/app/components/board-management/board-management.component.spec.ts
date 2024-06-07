import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardManagementComponent } from './board-management.component';

describe('BoardManagementComponent', () => {
  let component: BoardManagementComponent;
  let fixture: ComponentFixture<BoardManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
