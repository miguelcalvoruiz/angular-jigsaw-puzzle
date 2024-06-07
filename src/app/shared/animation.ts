import { trigger, style, transition, animate } from '@angular/animations';

export const fadeEnterAnimation = trigger('fadeEnterAnimation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('0.75s', style({ opacity: 1 })),
    ])
]);

export const fadeLeaveAnimation = trigger('fadeLeaveAnimation', [
    transition(':leave', [
        style({ opacity: 1 }),
        animate('0.25s', style({ opacity: 0 })),
    ])
]);