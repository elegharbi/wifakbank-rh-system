import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    const cloned = req.clone({
      withCredentials: true,
      headers: token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers
    });
    return next(cloned);
  }
  return next(req);
};
