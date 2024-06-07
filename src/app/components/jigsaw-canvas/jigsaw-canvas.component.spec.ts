import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JigsawCanvasComponent } from './jigsaw-canvas.component';

describe('JigsawCanvasComponent', () => {
  let component: JigsawCanvasComponent;
  let fixture: ComponentFixture<JigsawCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JigsawCanvasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JigsawCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
