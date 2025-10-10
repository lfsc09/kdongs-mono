import { Component, inject, signal } from '@angular/core';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ZardProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { LoginGatewayService } from 'src/app/infra/gateways/login/login-gateway.service';
import { toast } from 'ngx-sonner';
import { GatewayError } from 'src/app/infra/gateways/shared/default-gateway.model';

@Component({
  selector: 'app-landing',
  imports: [
    ReactiveFormsModule,
    ZardDividerComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
    ZardProgressBarComponent,
  ],
  providers: [LoginGatewayService],
  templateUrl: './landing.html',
})
export class Landing {
  /**
   * SERVICES
   */
  private readonly _routerService = inject(Router);
  private readonly _formBuilderService = inject(NonNullableFormBuilder);
  private readonly _loginService = inject(LoginGatewayService);
  // private readonly _messageService = inject(MessageService);

  /**
   * SIGNALS
   */
  protected loading = signal<boolean>(false);

  /**
   * VARS
   */
  protected formGroup = this._formBuilderService.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  private _authenticationSubscription: Subscription | undefined;

  ngOnDestroy(): void {
    this._authenticationSubscription?.unsubscribe();
  }

  /**
   * FUNCTIONS
   */
  protected handleFormSubmit(submittedForm: any): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this._authenticationSubscription = this._loginService
      .authenticate({ email: this.formGroup.value.email, password: this.formGroup.value.password })
      .subscribe({
        next: (response: boolean) => {
          if (!response) {
            throw new Error("Something doesn't feel right");
          }
          this._routerService.navigate(['/r!/home'], { replaceUrl: true });
        },
        error: (error: Error | GatewayError) => {
          this.formGroup.reset();
          submittedForm.resetForm();
          if (error instanceof GatewayError) {
            console.error(`[Authentication](${error.status}): ${error.message}`, error.description);
            toast.error(error.name, {
              description: error.description,
              position: 'bottom-center',
            });
          } else {
            console.error('[Authentication]:', error.message);
            toast.error('Something went wrong!', {
              description: 'Please try again later.',
              position: 'bottom-center',
            });
          }
          this.loading.set(false);
        },
      });
  }
}
