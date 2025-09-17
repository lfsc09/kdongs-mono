import { TestBed } from '@angular/core/testing';
import { AuthenticatedUser } from '../../gateways/login/login-gateway.model';
import { UserIdentity } from './identity.model';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  it('The service should be created with "_identity=null" and "_tokenExpLeft$=0" ', (done: DoneFn) => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    expect(service.identity()).toBeNull();
    service.tokenExpLeft$.subscribe((value) => {
      expect(value).toBe(0);
      done();
    });
  });

  it('[processIdentity(null)][_identity!=null][_isValid=false] Should clear all data and return "false" since User Identity is no longer valid', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    service['_identity'].set({
      userName: 'Master User',
      tokenExp: new Date().getTime() - 1000000,
    } as UserIdentity);
    spyOn(service, 'clearAll');
    expect(service.processIdentity(null)).toBeFalse();
    expect(service.clearAll).toHaveBeenCalled();
  });

  it('[processIdentity(null)][_identity!=null][_isValid=true] Should recalculate User Identity "tokenExp" and return "true"', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    service['_identity'].set({
      userName: 'Master User',
      tokenExp: new Date().getTime() + 1000000,
    } as UserIdentity);
    spyOn<any>(service, '_calculateTokenExpLeft');
    expect(service.processIdentity(null)).toBeTrue();
    expect(service['_calculateTokenExpLeft']).toHaveBeenCalled();
  });

  it('[processIdentity(null)][_identity=null][_isValid=false] Should clear all data and return "false" since User Identity recovered from localStorage is no longer valid', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn<any>(service, '_recoverUserIdentity').and.returnValue({
      userName: 'Master User',
      tokenExp: new Date().getTime() - 1000000,
    } as UserIdentity);
    spyOn(service, 'clearAll');
    expect(service.processIdentity(null)).toBeFalse();
    expect(service['_recoverUserIdentity']).toHaveBeenCalled();
    expect(service.clearAll).toHaveBeenCalled();
  });

  it('[processIdentity(null)][_identity=null][_isValid=true] Should populate "_identity" memory, calculate "tokenExp" and return "true"', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    const input = {
      userName: 'Master User',
      tokenExp: new Date().getTime() + 1000000,
    } as UserIdentity;
    spyOn<any>(service, '_recoverUserIdentity').and.returnValue(input);
    spyOn<any>(service, '_calculateTokenExpLeft');
    spyOn<any>(service, '_saveUserIdentity');
    expect(service.processIdentity(null)).toBeTrue();
    expect(service['_recoverUserIdentity']).toHaveBeenCalled();
    expect(service.identity()?.userName).toBe(input.userName);
    expect(service['_saveUserIdentity']).not.toHaveBeenCalled();
    expect(service['_calculateTokenExpLeft']).toHaveBeenCalled();
  });

  it('[processIdentity(NOT null)][_identity=null][_isValid=false] Should clear all data and return "false" since passed User Identity not valid', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn<any>(service, '_recoverUserIdentity');
    spyOn(service, 'clearAll');
    expect(
      service.processIdentity({
        userName: 'Master User',
        tokenExp: new Date().getTime() - 1000000,
        allowedIn: [] as string[],
      } as AuthenticatedUser),
    ).toBeFalse();
    expect(service['_recoverUserIdentity']).not.toHaveBeenCalled();
    expect(service.clearAll).toHaveBeenCalled();
  });

  it('[processIdentity(NOT null)][_identity=null][_isValid=true] Should opulate "_identity" memory, calculate "tokenExp" and return "true"', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn<any>(service, '_recoverUserIdentity');
    spyOn<any>(service, '_calculateTokenExpLeft');
    spyOn<any>(service, '_saveUserIdentity');
    const input = {
      userName: 'Master User',
      tokenExp: new Date().getTime() + 1000000,
      allowedIn: [] as string[],
    } as AuthenticatedUser;
    expect(service.processIdentity(input)).toBeTrue();
    expect(service['_recoverUserIdentity']).not.toHaveBeenCalled();
    expect(service.identity()?.userName).toBe(input.userName);
    expect(service['_saveUserIdentity']).toHaveBeenCalled();
    expect(service['_calculateTokenExpLeft']).toHaveBeenCalled();
  });

  it('[clearrAll()][identity!=null] Should clear User Identity', (done: DoneFn) => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    spyOn(localStorage, 'removeItem');
    const service = TestBed.inject(IdentityService);
    service['_identity'].set({ userName: 'Master User' } as UserIdentity);
    service['_tokenExpLeft$'].next(1000);
    service.clearAll();
    expect(service.identity()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalled();
    service.tokenExpLeft$.subscribe((value) => {
      expect(value).toBe(0);
      done();
    });
  });

  it('[clearrAll()][identity=null] Should do nothing when attempting to clear User Identity', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    spyOn(localStorage, 'removeItem');
    const service = TestBed.inject(IdentityService);
    service['_identity'].set(null);
    spyOn<any>(service['_identity'], 'set');
    spyOn<any>(service['_tokenExpLeft$'], 'next');
    service.clearAll();
    expect(service['_identity'].set).not.toHaveBeenCalled();
    expect(service['_tokenExpLeft$'].next).not.toHaveBeenCalled();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  it('[_isValid()] Should execute correctly given a "tokenExp" value', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    const input = new Date().getTime();
    expect(service['_isValid'](input - 1000000)).toBeFalse();
    expect(service['_isValid'](input + 1000000)).toBeTrue();
  });

  it('[_calculateTokenExpLeft()] Should return "0" if no User Identity', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    expect(service['_calculateTokenExpLeft']()).toBe(0);
  });

  it('[_calculateTokenExpLeft()] Should return the time left for the User Identity to expire', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    service['_identity'].set({ tokenExp: new Date().getTime() + 1000000 } as UserIdentity);
    let output = service['_calculateTokenExpLeft']();
    expect(output).toBeGreaterThan(0);
    service['_identity'].set({ tokenExp: new Date().getTime() - 1000000 } as UserIdentity);
    output = service['_calculateTokenExpLeft']();
    expect(output).toBe(0);
  });

  it('[_recoverUserIdentity()] Should return "null" if no User Identity is on localStorage', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const output = service['_recoverUserIdentity']();
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(output).toBeNull();
  });

  it('[_recoverUserIdentity()] Should return "null" because of invalid data on localStorage', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn(localStorage, 'getItem').and.returnValue('{ "userName": "Master User", }');
    const output = service['_recoverUserIdentity']();
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(output).toBeNull();
  });

  it('[_recoverUserIdentity()] Should return a User Identity', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    const input = { userName: 'Master User' } as UserIdentity;
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(input));
    const output = service['_recoverUserIdentity']();
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(output?.userName).toBe(input.userName);
  });

  it('[_saveUserIdentity()] Should do nothing if there is no User Identity', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    spyOn(localStorage, 'setItem');
    service['_saveUserIdentity']();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('[_saveUserIdentity()] Should save the User Identity', () => {
    TestBed.configureTestingModule({
      providers: [IdentityService],
    });
    const service = TestBed.inject(IdentityService);
    const input = { userName: 'Master User' } as UserIdentity;
    spyOn(localStorage, 'setItem');
    service['_identity'].set(input);
    service['_saveUserIdentity']();
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
